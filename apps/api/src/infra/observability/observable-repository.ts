import { Inject } from '@nestjs/common'

import { WinstonService } from '../logging/winston.service'
import { MetricsService } from '../metrics/metrics.service'

type ObservableOptions = {
  operation: string
  table: string
  query: string
}

export abstract class ObservableRepository {
  @Inject(WinstonService) private readonly logger: WinstonService
  @Inject(MetricsService) private readonly metrics: MetricsService

  protected async trackOperation<T>(
    operation: () => Promise<T>,
    options: ObservableOptions,
  ): Promise<T> {
    const { operation: operationName, table, query } = options
    const startTime = Date.now()

    try {
      const result = await operation()

      const duration = Date.now() - startTime

      this.logger.logDatabaseQuery({
        query,
        duration,
        success: true,
        table,
        operation: operationName,
      })

      this.metrics.recordDbMetrics({
        operation: operationName,
        table,
        duration,
        success: true,
      })

      return result
    } catch (error) {
      const duration = Date.now() - startTime

      this.logger.logDatabaseQuery({
        query,
        duration,
        success: false,
        table,
        operation: operationName,
        error: (error as Error).message,
      })

      this.metrics.recordDbMetrics({
        operation: operationName,
        table,
        duration,
        success: false,
      })

      throw error
    }
  }
}
