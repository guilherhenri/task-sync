import { Module } from '@nestjs/common'

import { MetricsPort } from '@/core/ports/metrics'

import { InfraMetricsService } from './infra-metrics.service'
import { MetricsService } from './metrics.service'

@Module({
  providers: [
    MetricsService,
    { provide: MetricsPort, useClass: InfraMetricsService },
  ],
  exports: [MetricsPort, MetricsService],
})
export class MetricsModule {}
