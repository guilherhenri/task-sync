import { Injectable } from '@nestjs/common'

import type { MetricsPort, UseCaseMetrics } from '@/core/ports/metrics'

import { MetricsService } from './metrics.service'

@Injectable()
export class InfraMetricsService implements MetricsPort {
  constructor(private metricsService: MetricsService) {}

  recordUseCaseExecution({ name, status, duration }: UseCaseMetrics): void {
    this.metricsService.useCaseExecutions.labels(name, status).inc()
    const durationSeconds = duration / 1000
    this.metricsService.useCaseDuration
      .labels(name, status)
      .observe(durationSeconds)
  }
}
