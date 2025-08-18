import { LoggerPort } from '@/core/ports/logger'
import {
  BusinessLogData,
  LogContext,
  PerformanceLogData,
  SecurityLogData,
} from '@/core/ports/logger.types'

export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  context?: LogContext
  error?: Error
  data?: BusinessLogData | PerformanceLogData | SecurityLogData
}

export class FakeLogger implements LoggerPort {
  public logs: LogEntry[] = []

  debug(message: string, context?: LogContext): void {
    this.logs.push({ level: 'debug', message, context })
  }

  info(message: string, context?: LogContext): void {
    this.logs.push({ level: 'info', message, context })
  }

  warn(message: string, context?: LogContext): void {
    this.logs.push({ level: 'warn', message, context })
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.logs.push({ level: 'error', message, error, context })
  }

  logBusinessEvent(data: BusinessLogData): void {
    this.logs.push({
      level: 'info',
      message: `Business event: ${data.action}`,
      data,
    })
  }

  logPerformance(data: PerformanceLogData): void {
    const level = data.success ? 'info' : 'warn'
    this.logs.push({ level, message: `Performance: ${data.operation}`, data })
  }

  logSecurity(data: SecurityLogData): void {
    const level = data.success ? 'info' : 'warn'
    this.logs.push({ level, message: `Security event: ${data.event}`, data })
  }
}
