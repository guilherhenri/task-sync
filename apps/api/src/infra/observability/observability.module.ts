import { Module } from '@nestjs/common'

import { LoggingModule } from '../logging/logging.module'
import { MetricsModule } from '../metrics/metrics.module'

@Module({
  imports: [LoggingModule, MetricsModule],
  exports: [LoggingModule, MetricsModule],
})
export class ObservabilityModule {}
