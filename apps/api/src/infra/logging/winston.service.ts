import * as http from 'node:http'
import * as https from 'node:https'

import { Inject, Injectable, type OnModuleDestroy } from '@nestjs/common'
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
import { EnvService } from '@/infra/env/env.service'

import type { LogLevel } from './logging.types'

export type HealthStatusType = 'healthy' | 'degraded' | 'unhealthy'

export interface HealthStatus {
  transports: Array<{
    name: string
    status: HealthStatusType
    lastError?: string
  }>
}

@Injectable()
export class WinstonService implements LoggerPort, OnModuleDestroy {
  private readonly asyncLocalStorage = new AsyncLocalStorage<
    Map<string, unknown>
  >()

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly config: EnvService,
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

  logSystemMetrics(): void {
    const usage = process.memoryUsage()

    this.info('System metrics', {
      type: 'system_metrics',
      memory: {
        heapUsed: usage.heapUsed,
        heapTotal: usage.heapTotal,
        rss: usage.rss,
        external: usage.external,
      },
      uptime: process.uptime(),
    })
  }

  async healthCheck(): Promise<HealthStatus> {
    const transports = []

    transports.push({
      name: 'console',
      status: 'healthy' as const,
    })

    try {
      const fs = await import('fs')
      await fs.promises.access('./logs', fs.constants.W_OK)
      transports.push({
        name: 'file',
        status: 'healthy' as const,
      })
    } catch (error) {
      transports.push({
        name: 'file',
        status: 'unhealthy' as const,
        lastError: (error as Error).message,
      })
    }

    try {
      await this.pingVectorEndpoint()
      transports.push({ name: 'vector', status: 'healthy' as const })
    } catch (error) {
      transports.push({
        name: 'vector',
        status: 'unhealthy' as const,
        lastError: (error as Error).message,
      })
    }

    return { transports }
  }

  private async pingVectorEndpoint(): Promise<void> {
    const url = new URL(this.config.get('VECTOR_ENDPOINT'))
    const isHttps = url.protocol === 'https:'
    const client = isHttps ? https : http

    return new Promise<void>((resolve, reject) => {
      const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: '/health',
        method: 'GET',
        timeout: 5000,
      }

      const req = client.request(options, (res) => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 400) {
          resolve()
        } else {
          reject(new Error(`Vector health check failed: ${res.statusCode}`))
        }
      })

      req.on('error', reject)
      req.on('timeout', () => {
        req.destroy()
        reject(new Error('Vector health check timeout'))
      })

      req.end()
    })
  }

  async onModuleDestroy(): Promise<void> {
    await this.flushPendingLogs()
    await this.closeTransports()
  }

  private async flushPendingLogs(): Promise<void> {
    const transports = this.logger.transports
    await Promise.allSettled(
      transports.map((transport) =>
        transport.close ? transport.close() : Promise.resolve(),
      ),
    )
  }

  private async closeTransports(): Promise<void> {
    this.logger.close()
  }
}
