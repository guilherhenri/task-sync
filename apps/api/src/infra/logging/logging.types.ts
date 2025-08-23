import type { Request } from 'express'
import type * as winston from 'winston'

export type NodeEnvironment = 'development' | 'production' | 'test'
export type LogLevel =
  | 'error'
  | 'warn'
  | 'info'
  | 'http'
  | 'verbose'
  | 'debug'
  | 'silly'
type Format = winston.Logform.Format

export interface LoggingConfig {
  level: LogLevel
  environment: NodeEnvironment
  service: string
  version: string
  enableConsole: boolean
  enableFile: boolean
  enableExternal: boolean
  fileConfig?: FileConfig
  externalConfig?: ExternalConfig
}

interface FileConfig {
  logDir: string
  maxSize: string
  maxFiles: string
}

interface ExternalConfig {
  vectorEndpoint: string
  vectorTimeout: number
}

export interface LogInfo extends winston.Logform.TransformableInfo {
  level: LogLevel
  timestamp: string
  service: string
  version: string
  environment: NodeEnvironment
  correlationId?: string
  type?: string
  stack?: string
  error?: Error & { stack?: string }
  metadata: Record<string, unknown>
  [key: string]: unknown
}

export interface LogContext {
  correlationId?: string
  userId?: string
  email?: string
  ip?: string
  userAgent?: string
  method?: string
  url?: string
  statusCode?: number
  duration?: number
  [key: string]: unknown
}

export interface RequestWithUser extends Request {
  user?: {
    id: string
    email: string
  }
}

export interface ErrorContext {
  correlationId?: string
  userId?: string
  userEmail?: string
  method?: string
  url?: string
  ip?: string
  userAgent?: string
  requestBody?: Record<string, unknown>
  requestQuery?: Record<string, unknown>
  requestParams?: Record<string, unknown>
}

export interface ConsoleTransportConfig {
  level: LogLevel
  format: Format
  silent?: boolean
}

export interface FileTransportConfig {
  level: LogLevel
  format: Format
  logDir?: string
  maxSize?: string
  maxFiles?: string
}

export interface ExternalTransportConfig {
  level: LogLevel
  format: Format
  vectorEndpoint: string
  vectorTimeout: number
  batchSize?: number
  batchTimeout?: number
}
