export interface LogContext {
  correlationId?: string
  userId?: string
  [key: string]: unknown
}

export interface BusinessLogData {
  action: string
  resource: string
  resourceId?: string
  userId?: string
  metadata?: Record<string, unknown>
}

export interface PerformanceLogData {
  operation: string
  duration: number
  success: boolean
  metadata?: Record<string, unknown>
}

export interface SecurityLogData {
  event: string
  userId?: string
  ip?: string
  userAgent?: string
  success: boolean
  reason?: string
  metadata?: Record<string, unknown>
}
