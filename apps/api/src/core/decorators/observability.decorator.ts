import type { LoggerPort } from '../ports/logger'
import type { MetricsPort } from '../ports/metrics'

export interface ObservabilityDependencies {
  logger: LoggerPort
  metrics: MetricsPort
}

export interface ObservabilityOptions {
  operation: string
  className: string
  identifier: string
}

export function WithObservability(options: ObservabilityOptions) {
  return function (
    target: unknown,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (
      this: {
        logger: ObservabilityDependencies['logger']
        metrics: ObservabilityDependencies['metrics']
      },
      ...args: Array<{ [key: string]: unknown }>
    ) {
      const startTime = Date.now()
      const deps: ObservabilityDependencies = {
        logger: this.logger,
        metrics: this.metrics,
      }
      const userIdentifier =
        args.length > 0 ? args[0][options.identifier] : undefined

      try {
        const result = await originalMethod.apply(this, args)

        if (result && typeof result.isLeft === 'function' && result.isLeft()) {
          const error = result.value

          deps.logger.logPerformance({
            operation: options.operation,
            duration: Date.now() - startTime,
            success: false,
            metadata: { userId: userIdentifier, error: error.message },
          })

          deps.metrics.recordUseCaseExecution({
            name: options.className,
            status: 'error',
            duration: Date.now() - startTime,
          })

          return result
        }

        deps.logger.logPerformance({
          operation: options.operation,
          duration: Date.now() - startTime,
          success: true,
          metadata: { userId: userIdentifier },
        })

        deps.metrics.recordUseCaseExecution({
          name: options.className,
          status: 'success',
          duration: Date.now() - startTime,
        })

        return result
      } catch (error) {
        deps.logger.logPerformance({
          operation: options.operation,
          duration: Date.now() - startTime,
          success: false,
          metadata: { userId: userIdentifier, error: (error as Error).message },
        })

        deps.metrics.recordUseCaseExecution({
          name: options.className,
          status: 'error',
          duration: Date.now() - startTime,
        })

        throw error
      }
    }
  }
}
