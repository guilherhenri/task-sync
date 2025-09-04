import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import { Observable, throwError } from 'rxjs'
import { catchError } from 'rxjs/operators'

import { EnvService } from '@/infra/env/env.service'

import { ErrorContext, RequestWithUser } from '../logging.types'
import { WinstonService } from '../winston.service'

@Injectable()
export class ErrorLoggingInterceptor implements NestInterceptor {
  private readonly ERROR_CLASSIFICATIONS = {
    security: [401, 403, 422],
    critical: {
      statusCodes: [401, 403, 429, 500],
      errorTypes: [
        'DatabaseError',
        'ExternalServiceError',
        'TimeoutError',
        'ConnectionError',
      ],
    },
    clientErrors: [429],
  }

  constructor(
    private readonly logger: WinstonService,
    private readonly config: EnvService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      catchError((error: Error) => {
        this.logError(error, context)
        return throwError(() => error)
      }),
    )
  }

  private logError(error: Error, context: ExecutionContext): void {
    const errorContext = this.buildErrorContext(error, context)
    const errorInfo = this.analyzeError(error)

    this.performLogging(error, errorInfo, errorContext)
    this.handleSpecialCases(error, errorInfo, errorContext)
  }

  private analyzeError(error: Error): {
    isHttpError: boolean
    statusCode: number
    logLevel: 'error' | 'warn' | 'info'
  } {
    const isHttpError = error instanceof HttpException
    const statusCode = isHttpError ? error.getStatus() : 500
    const logLevel = this.determineLogLevel(statusCode)

    return { isHttpError, statusCode, logLevel }
  }

  private performLogging(
    error: Error,
    errorInfo: { statusCode: number; logLevel: string },
    errorContext: ErrorContext,
  ): void {
    const errorMessage = this.formatErrorMessage(error, errorContext)

    if (errorInfo.logLevel === 'error') {
      this.logger.error(errorMessage, error, {
        type: 'application_error',
        statusCode: errorInfo.statusCode,
        errorType: error.constructor.name,
        ...errorContext,
      })
    } else if (errorInfo.logLevel === 'warn') {
      this.logger.warn(errorMessage, {
        type: 'client_error',
        statusCode: errorInfo.statusCode,
        errorType: error.constructor.name,
        ...errorContext,
      })
    }
  }

  private handleSpecialCases(
    error: Error,
    errorInfo: { statusCode: number },
    errorContext: ErrorContext,
  ): void {
    if (this.isSecurityError(errorInfo.statusCode)) {
      this.logger.logSecurity({
        event: this.getSecurityEventType(errorInfo.statusCode),
        userId: errorContext.userId,
        ip: errorContext.ip,
        userAgent: errorContext.userAgent,
        success: false,
        reason: error.message,
        metadata: {
          statusCode: errorInfo.statusCode,
          method: errorContext.method,
          url: errorContext.url,
        },
      })
    }

    if (this.isCriticalError(errorInfo.statusCode, error)) {
      this.logger.logBusinessEvent({
        action: 'error_occurred',
        resource: 'application',
        userId: errorContext.userId,
        metadata: {
          errorType: error.constructor.name,
          statusCode: errorInfo.statusCode,
          url: errorContext.url,
          correlationId: errorContext.correlationId,
        },
      })
    }
  }

  private buildErrorContext(_: Error, context: ExecutionContext): ErrorContext {
    const errorContext: ErrorContext = {
      correlationId: this.logger.getCorrelationId(),
    }

    if (context.getType() === 'http') {
      const ctx = context.switchToHttp()
      const request = ctx.getRequest<RequestWithUser>()

      errorContext.userId = request.user?.id
      errorContext.userEmail = request.user?.email
      errorContext.method = request.method
      errorContext.url = request.url
      errorContext.ip = request.ip
      errorContext.userAgent = request.headers['user-agent']

      if (this.config.get('NODE_ENV') !== 'production') {
        const sanitizedBody = this.sanitizeRequestData(request.body)

        if (
          sanitizedBody &&
          typeof sanitizedBody === 'object' &&
          !Array.isArray(sanitizedBody)
        ) {
          errorContext.requestBody = sanitizedBody as Record<string, unknown>
        }

        errorContext.requestQuery = request.query
        errorContext.requestParams = request.params
      }
    }

    return errorContext
  }

  private determineLogLevel(statusCode: number): 'error' | 'warn' | 'info' {
    if (statusCode >= 500) {
      return 'error'
    }

    if (statusCode >= 400) {
      if (
        this.ERROR_CLASSIFICATIONS.critical.statusCodes.includes(statusCode)
      ) {
        return 'error'
      }
      return 'warn'
    }

    return 'info'
  }

  private isSecurityError(statusCode: number): boolean {
    return this.ERROR_CLASSIFICATIONS.security.includes(statusCode)
  }

  private isCriticalError(statusCode: number, error: Error): boolean {
    if (statusCode >= 500) {
      return true
    }

    if (this.ERROR_CLASSIFICATIONS.critical.statusCodes.includes(statusCode)) {
      return true
    }

    return this.ERROR_CLASSIFICATIONS.critical.errorTypes.some((type) =>
      error.constructor.name.includes(type),
    )
  }

  private formatErrorMessage(error: Error, context: ErrorContext): string {
    const baseMessage = `${error.constructor.name}: ${error.message}`

    if (context.method && context.url) {
      return `${baseMessage} [${context.method} ${context.url}]`
    }

    return baseMessage
  }

  private getSecurityEventType(statusCode: number): string {
    switch (statusCode) {
      case 401:
        return 'authentication_failed'
      case 403:
        return 'authorization_failed'
      case 422:
        return 'validation_failed'
      default:
        return 'security_event'
    }
  }

  private sanitizeRequestData(data: unknown): unknown {
    if (!data || typeof data !== 'object') {
      return data
    }

    const sanitized = JSON.parse(JSON.stringify(data))

    const sensitiveFields = [
      'password',
      'newPassword',
      'token',
      'authorization',
      'secret',
      'key',
      'credential',
      'auth',
    ]

    const sanitizeObject = (obj: unknown): unknown => {
      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject)
      }

      if (obj && typeof obj === 'object') {
        const result: Record<string, unknown> = {}
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const lowerKey = key.toLowerCase()
            const isSensitive = sensitiveFields.some((field) =>
              lowerKey.includes(field),
            )
            result[key] = isSensitive
              ? '[REDACTED]'
              : sanitizeObject((obj as Record<string, unknown>)[key])
          }
        }
        return result
      }

      return obj
    }

    return sanitizeObject(sanitized)
  }
}
