import * as winston from 'winston'

import { LogInfo } from '../logging.types'

type JsonLogEntry = {
  '@timestamp': string
  'log.level': string
  message: string
  service: {
    name?: string
    version?: string
    environment?: string
  }
  trace?: { id?: string }
  event?: { category?: string; duration?: number }
  error?: { type?: string; message?: string; stack_trace?: string }
  http?: {
    request?: { method?: string }
    response?: { status_code?: number }
  }
  url?: { path?: string }
  metadata?: Record<string, unknown>
  [key: string]: unknown
}

export const jsonFormatter = winston.format.combine(
  winston.format.errors({ stack: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
  winston.format.printf((info: winston.Logform.TransformableInfo) => {
    const {
      timestamp,
      level,
      message,
      service,
      version,
      environment,
      correlationId,
      type,
      stack,
      error,
      metadata,
      ...rest
    } = info as LogInfo

    const logEntry: JsonLogEntry = {
      '@timestamp': timestamp,
      'log.level': level.toUpperCase(),
      message: String(message),
      service: { name: service, version, environment },
    }

    if (correlationId) logEntry.trace = { id: correlationId }
    if (type) logEntry.event = { category: type }

    if (error?.name) {
      logEntry.error = {
        type: error.name,
        message: error.message,
        stack_trace: error.stack,
      }
    } else if (stack) {
      logEntry.error = { stack_trace: stack }
    }

    if (metadata && Object.keys(metadata).length > 0) {
      logEntry.metadata = metadata
    }

    if (type === 'http_request') {
      logEntry.http = {
        request: {
          method: typeof rest.method === 'string' ? rest.method : undefined,
        },
        response: {
          status_code:
            typeof rest.statusCode === 'number' ? rest.statusCode : undefined,
        },
      }
      logEntry.url = {
        path: typeof rest.url === 'string' ? rest.url : undefined,
      }
      if (typeof rest.duration === 'number') {
        logEntry.event = { ...logEntry.event, duration: rest.duration * 1e6 }
      }
    }

    Object.assign(logEntry, rest)

    return JSON.stringify(logEntry)
  }),
)
