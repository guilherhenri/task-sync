import type { MetricsPort, UseCaseMetrics } from '@/core/ports/metrics'

export class FakeMetrics implements MetricsPort {
  public metrics: Array<UseCaseMetrics> = []

  recordUseCaseExecution(metrics: UseCaseMetrics): void {
    this.metrics.push(metrics)
  }
}
