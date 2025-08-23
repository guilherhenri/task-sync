import {
  BusinessLogData,
  LogContext,
  PerformanceLogData,
  SecurityLogData,
} from './logger.types'

export abstract class LoggerPort {
  abstract debug(message: string, context?: LogContext): void
  abstract info(message: string, context?: LogContext): void
  abstract warn(message: string, context?: LogContext): void
  abstract error(message: string, error?: Error, context?: LogContext): void

  abstract logBusinessEvent(data: BusinessLogData): void
  abstract logPerformance(data: PerformanceLogData): void
  abstract logSecurity(data: SecurityLogData): void
}
