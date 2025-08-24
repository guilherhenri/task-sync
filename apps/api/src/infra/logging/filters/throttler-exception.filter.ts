import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common'
import { ThrottlerException } from '@nestjs/throttler'
import type { Response } from 'express'

import { LoggerPort } from '@/core/ports/logger'

@Catch(ThrottlerException)
export class ThrottlerExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerPort) {}

  catch(exception: ThrottlerException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest()

    this.logger.logSecurity({
      event: 'rate_limit_exceeded',
      userId: request.user?.sub || undefined,
      ip: request.ip,
      userAgent: request.get('user-agent'),
      success: false,
      reason: 'Too many requests',
      metadata: {
        endpoint: `${request.method} ${request.url}`,
        limit: exception.message,
      },
    })

    response.status(HttpStatus.TOO_MANY_REQUESTS).json({
      message: 'Muitas requisições. Tente novamente em alguns instantes.',
      error: 'Too Many Requests',
      statusCode: 429,
    })
  }
}
