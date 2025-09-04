export interface UseCaseMetrics {
  name: string
  status: 'success' | 'error'
  duration: number
}

export abstract class MetricsPort {
  abstract recordUseCaseExecution(metrics: UseCaseMetrics): void
}
