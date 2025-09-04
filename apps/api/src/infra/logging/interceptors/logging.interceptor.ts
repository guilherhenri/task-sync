import { randomUUID } from 'node:crypto'
import type { IncomingHttpHeaders } from 'node:http'

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import { Response } from 'express'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

import { EnvService } from '@/infra/env/env.service'
import { MetricsService } from '@/infra/metrics/metrics.service'

import { RequestWithUser } from '../logging.types'
import { WinstonService } from '../winston.service'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly logger: WinstonService,
    private readonly config: EnvService,
    private readonly metrics: MetricsService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle()
    }

    const ctx = context.switchToHttp()
    const request = ctx.getRequest<RequestWithUser>()
    const response = ctx.getResponse<Response>()

    const correlationId = this.getCorrelationId(request)

    this.logger.setCorrelationId(correlationId)

    response.setHeader('X-Correlation-ID', correlationId)

    const startTime = Date.now()
    const { method, url, ip, headers } = request
    const userAgent = headers['user-agent'] ?? 'Unknown'
    const userId = request.user?.id
    const userEmail = request.user?.email
    const route = request.route?.path ?? url

    this.logger.debug('Incoming HTTP request', {
      method,
      url,
      ip,
      userAgent,
      userId,
      userEmail,
      correlationId,
      headers: this.sanitizeHeaders(headers),
    })

    return this.logger.runWithContext(() => {
      return next.handle().pipe(
        tap({
          next: (data) => {
            const duration = Date.now() - startTime
            const { statusCode } = response

            this.logger.logHttpRequest({
              method,
              url,
              statusCode,
              duration,
              userId,
              ip,
              userAgent,
            })

            this.recordHttpMetrics(method, route, statusCode, duration)

            if (this.config.get('NODE_ENV') === 'development') {
              this.logger.debug('HTTP response sent', {
                statusCode,
                duration,
                responseSize: this.getResponseSize(data),
                correlationId,
              })
            }
          },
          error: (error) => {
            const duration = Date.now() - startTime
            const statusCode = error.status || response.statusCode || 500

            this.logger.logHttpRequest({
              method,
              url,
              statusCode,
              duration,
              userId,
              ip,
              userAgent,
            })

            this.recordHttpMetrics(method, route, statusCode, duration)
          },
        }),
      )
    })
  }

  private recordHttpMetrics(
    method: string,
    route: string,
    statusCode: number,
    duration: number,
  ) {
    const statusCodeStr = statusCode.toString()
    const durationSeconds = duration / 1000

    this.metrics.httpRequestsTotal.labels(method, route, statusCodeStr).inc()

    this.metrics.httpRequestDuration
      .labels(method, route, statusCodeStr)
      .observe(durationSeconds)
  }

  private getCorrelationId(request: RequestWithUser): string {
    const existingId = request.headers['x-correlation-id'] as string
    if (existingId) {
      return existingId
    }

    return randomUUID()
  }

  private sanitizeHeaders(
    headers: IncomingHttpHeaders,
  ): Record<string, string | string[] | undefined> {
    const sanitized = { ...headers }
    const sensitiveHeaders = [
      'authorization',
      'cookie',
      'x-api-key',
      'x-auth-token',
    ]
    sensitiveHeaders.forEach((header) => {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]'
      }
    })
    return sanitized
  }

  private getResponseSize(data: unknown): number {
    if (!data) return 0
    try {
      if (typeof data === 'string') {
        return Buffer.byteLength(data, 'utf8')
      }

      if (typeof data === 'object') {
        return Buffer.byteLength(JSON.stringify(data), 'utf8')
      }
    } catch {
      return 0
    }
    return 0
  }
}
