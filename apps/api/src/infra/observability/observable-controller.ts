import { Inject } from '@nestjs/common'

import { WinstonService } from '../logging/winston.service'
import { MetricsService } from '../metrics/metrics.service'

type ObservableOptions = {
  action: string
  resource: string
  userIdentifier?: string
  metadata?: Record<string, unknown>
}

export abstract class ObservableController {
  @Inject(WinstonService) private readonly logger: WinstonService
  @Inject(MetricsService) private readonly metrics: MetricsService

  protected async trackOperation<T>(
    operation: () => Promise<T>,
    options: ObservableOptions,
  ): Promise<T> {
    const { action, resource, userIdentifier, metadata } = options

    try {
      this.logger.logBusinessEvent({
        action: `${action}_attempt`,
        resource,
        userId: userIdentifier,
        metadata,
      })
      this.metrics.recordBusinessEvents({
        action,
        resource,
        status: 'attempt',
      })

      const result = await operation()

      this.logger.logBusinessEvent({
        action: `${action}_success`,
        resource,
        userId: userIdentifier,
      })
      this.metrics.recordBusinessEvents({
        action,
        resource,
        status: 'success',
      })

      return result
    } catch (error) {
      this.logger.logBusinessEvent({
        action: `${action}_failed`,
        resource,
        userId: userIdentifier,
        metadata: { reason: (error as Error).message },
      })
      this.metrics.recordBusinessEvents({ action, resource, status: 'failed' })

      throw error
    }
  }
}
