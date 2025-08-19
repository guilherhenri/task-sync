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
    const isHttpError = error instanceof HttpException
    const statusCode = isHttpError ? error.getStatus() : 500

    const logLevel = this.determineLogLevel(statusCode)

    const errorMessage = this.formatErrorMessage(error, errorContext)

    if (logLevel === 'error') {
      this.logger.error(errorMessage, error, {
        type: 'application_error',
        statusCode,
        errorType: error.constructor.name,
        ...errorContext,
      })

      if (this.isSecurityError(statusCode)) {
        this.logger.logSecurity({
          event: this.getSecurityEventType(statusCode),
          userId: errorContext.userId,
          ip: errorContext.ip,
          userAgent: errorContext.userAgent,
          success: false,
          reason: error.message,
          metadata: {
            statusCode,
            method: errorContext.method,
            url: errorContext.url,
          },
        })
      }
    } else if (logLevel === 'warn') {
      this.logger.warn(errorMessage, {
        type: 'client_error',
        statusCode,
        errorType: error.constructor.name,
        ...errorContext,
      })
    }

    if (this.isCriticalError(statusCode, error)) {
      this.logger.logBusinessEvent({
        action: 'error_occurred',
        resource: 'application',
        userId: errorContext.userId,
        metadata: {
          errorType: error.constructor.name,
          statusCode,
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
      const criticalClientErrors = [401, 403, 429] // Unauthorized, Forbidden, Rate Limit

      if (criticalClientErrors.includes(statusCode)) {
        return 'error'
      }

      return 'warn'
    }

    return 'info'
  }

  private formatErrorMessage(error: Error, context: ErrorContext): string {
    const baseMessage = `${error.constructor.name}: ${error.message}`

    if (context.method && context.url) {
      return `${baseMessage} [${context.method} ${context.url}]`
    }

    return baseMessage
  }

  private isSecurityError(statusCode: number): boolean {
    return [401, 403, 422].includes(statusCode)
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

  private isCriticalError(statusCode: number, error: Error): boolean {
    if (statusCode >= 500) {
      return true
    }

    const criticalClientErrors = [401, 403, 429]
    if (criticalClientErrors.includes(statusCode)) {
      return true
    }

    const criticalErrorTypes = [
      'DatabaseError',
      'ExternalServiceError',
      'TimeoutError',
      'ConnectionError',
    ]

    return criticalErrorTypes.some((type) =>
      error.constructor.name.includes(type),
    )
  }

  private sanitizeRequestData(data: unknown): unknown {
    if (!data || typeof data !== 'object') {
      return data
    }

    const sanitized = JSON.parse(JSON.stringify(data))

    const sensitiveFields = [
      'password',
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
