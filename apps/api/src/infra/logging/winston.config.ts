import { WinstonModuleOptions } from 'nest-winston'
import * as winston from 'winston'

import { developmentFormatter } from './formatters/development.formatter'
import { jsonFormatter } from './formatters/json.formatter'
import { LoggingConfig, LogInfo } from './logging.types'
import { createConsoleTransport } from './transports/console.transport'
import { createExternalTransport } from './transports/external.transport'
import { createFileTransport } from './transports/file.transport'

export const createWinstonConfig = (
  config: LoggingConfig,
): WinstonModuleOptions => {
  const isDevelopment = config.environment === 'development'
  const isTest = config.environment === 'test'

  const baseFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    winston.format.errors({ stack: true }),
    winston.format.metadata({
      key: 'metadata',
      fillExcept: ['message', 'level', 'timestamp', 'stack'],
    }),
    winston.format((info: winston.Logform.TransformableInfo): LogInfo => {
      const logInfo = info as LogInfo
      logInfo.service = config.service
      logInfo.version = config.version
      logInfo.environment = config.environment

      const correlationId =
        logInfo.correlationId ??
        (logInfo.metadata as { correlationId?: string })?.correlationId

      if (correlationId) {
        logInfo.correlationId = correlationId as string
      }

      return logInfo
    })(),
  )

  const winstonTransports: winston.transport[] = []

  if (config.enableConsole && !isTest) {
    winstonTransports.push(
      createConsoleTransport({
        level: config.level,
        format: isDevelopment ? developmentFormatter : jsonFormatter,
      }),
    )
  }

  if (config.enableFile && config.fileConfig) {
    const fileTransports = createFileTransport({
      level: config.level,
      format: winston.format.combine(baseFormat, jsonFormatter),
      ...config.fileConfig,
    })
    winstonTransports.push(...fileTransports)
  }

  if (config.enableExternal && config.externalConfig) {
    winstonTransports.push(
      createExternalTransport({
        level: config.level,
        format: winston.format.combine(baseFormat, jsonFormatter),
        ...config.externalConfig,
      }),
    )
  }

  return {
    level: config.level,
    format: baseFormat,
    transports: winstonTransports,
    exitOnError: false,
    silent: isTest,
  }
}
