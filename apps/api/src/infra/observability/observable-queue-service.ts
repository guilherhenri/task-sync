import { Inject } from '@nestjs/common'

import { WinstonService } from '../logging/winston.service'
import { MetricsService } from '../metrics/metrics.service'

type ObservableQueueOptions = {
  service: string
  endpoint: string
  method: string
  queue: string
  operation: string
}

interface ServiceError extends Error {
  response?: { status: number }
  responseCode?: number
}

export abstract class ObservableQueueService {
  @Inject(WinstonService) private readonly logger: WinstonService
  @Inject(MetricsService) private readonly metrics: MetricsService

  protected queueSize: number = 0

  protected async trackOperation<T>(
    operation: () => Promise<T>,
    options: ObservableQueueOptions,
  ): Promise<T> {
    const {
      service,
      endpoint,
      method,
      queue,
      operation: operationName,
    } = options
    const startTime = Date.now()

    try {
      const result = await operation()

      const duration = Date.now() - startTime

      this.logger.logExternalApiCall({
        service,
        endpoint,
        method,
        statusCode: 200,
        duration: Date.now() - startTime,
        success: true,
      })
      this.metrics.recordQueueMetrics({
        queue,
        operation: operationName,
        status: 'success',
        duration,
        size: this.queueSize,
      })

      return result
    } catch (error) {
      const duration = Date.now() - startTime
      const statusCode = (error as ServiceError)?.response?.status ?? 500

      this.logger.logExternalApiCall({
        service,
        endpoint,
        method,
        statusCode,
        duration,
        success: false,
        error: (error as ServiceError)?.message,
      })
      this.metrics.recordQueueMetrics({
        queue,
        operation: operationName,
        status: 'error',
        duration,
        size: this.queueSize,
      })

      throw error
    }
  }
}
