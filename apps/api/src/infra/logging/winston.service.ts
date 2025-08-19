import { Inject, Injectable } from '@nestjs/common'
import { AsyncLocalStorage } from 'async_hooks'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'

import type { LoggerPort } from '@/core/ports/logger'
import {
  BusinessLogData,
  LogContext,
  PerformanceLogData,
  SecurityLogData,
} from '@/core/ports/logger.types'

import type { LogLevel } from './logging.types'

@Injectable()
export class WinstonService implements LoggerPort {
  private readonly asyncLocalStorage = new AsyncLocalStorage<
    Map<string, unknown>
  >()

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  setContext(key: string, value: unknown): void {
    const store = this.asyncLocalStorage.getStore()

    if (store) {
      store.set(key, value)
    }
  }

  getContext<T>(key: string): T | undefined {
    const store = this.asyncLocalStorage.getStore()

    return store?.get(key) as T | undefined
  }

  getCorrelationId(): string | undefined {
    return this.getContext('correlationId')
  }

  setCorrelationId(correlationId: string): void {
    this.setContext('correlationId', correlationId)
  }

  runWithContext<T>(callback: () => T): T {
    return this.asyncLocalStorage.run(new Map(), callback)
  }

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context)
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context)
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context)
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.log('error', message, {
      ...context,
      error,
    })
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    const enrichedContext: LogContext = {
      ...context,
      correlationId: context?.correlationId || this.getCorrelationId(),
    }

    this.logger.log(level, message, enrichedContext)
  }

  logHttpRequest(data: {
    method: string
    url: string
    statusCode: number
    duration: number
    userId?: string
    ip?: string
    userAgent?: string
  }): void {
    this.info('HTTP request processed', {
      type: 'http_request',
      ...data,
    })
  }

  logBusinessEvent(data: BusinessLogData): void {
    this.info(`Business event: ${data.action}`, {
      type: 'business_event',
      ...data,
    })
  }

  logPerformance(data: PerformanceLogData): void {
    const level = data.success ? 'info' : 'warn'
    this.log(level, `Performance: ${data.operation}`, {
      type: 'performance',
      ...data,
    })
  }

  logSecurity(data: SecurityLogData): void {
    const level = data.success ? 'info' : 'warn'
    this.log(level, `Security event: ${data.event}`, {
      type: 'security_event',
      ...data,
    })
  }

  logDatabaseQuery(data: {
    query: string
    duration: number
    success: boolean
    table?: string
    operation?: string
    error?: string
  }): void {
    const level = data.success ? 'debug' : 'error'
    this.log(level, 'Database query executed', {
      type: 'database_query',
      ...data,
    })
  }

  logExternalApiCall(data: {
    service: string
    endpoint: string
    method: string
    statusCode?: number
    duration: number
    success: boolean
    error?: string
  }): void {
    const level = data.success ? 'info' : 'error'
    this.log(level, `External API call: ${data.service}`, {
      type: 'external_api_call',
      ...data,
    })
  }

  logQueueJob(data: {
    jobName: string
    jobId: string
    status: 'started' | 'completed' | 'failed' | 'retry'
    duration?: number
    attempt?: number
    error?: string
    metadata?: Record<string, unknown>
  }): void {
    const level = data.status === 'failed' ? 'error' : 'info'
    this.log(level, `Queue job ${data.status}: ${data.jobName}`, {
      type: 'queue_job',
      ...data,
    })
  }
}
