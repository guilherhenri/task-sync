import { Inject } from '@nestjs/common'

import { WinstonService } from '../logging/winston.service'
import { MetricsService } from '../metrics/metrics.service'

type ObservableOptions = {
  service: string
  endpoint: string
  method: string
}

interface ServiceError extends Error {
  response?: { status: number }
  responseCode?: number
}

export abstract class ObservableService {
  @Inject(WinstonService) private readonly logger: WinstonService
  @Inject(MetricsService) private readonly metrics: MetricsService

  protected async trackOperation<T>(
    operation: () => Promise<T>,
    options: ObservableOptions,
  ): Promise<T> {
    const { service, endpoint, method } = options
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
      this.metrics.recordExternalApiMetrics({
        service: 'nodemailer',
        endpoint: 'smtp',
        method: 'POST',
        statusCode: 200,
        duration,
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
      this.metrics.recordExternalApiMetrics({
        service: 'nodemailer',
        endpoint: 'smtp',
        method: 'POST',
        statusCode,
        duration,
      })

      throw error
    }
  }
}
