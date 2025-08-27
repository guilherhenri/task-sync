import { Injectable } from '@nestjs/common'

import { WinstonService } from '@/infra/logging/winston.service'
import { MetricsService } from '@/infra/metrics/metrics.service'

import { KeyValuesRepository } from '../../key-values-repository'
import { RedisService } from '../redis.service'

@Injectable()
export class RedisKeyValueRepository implements KeyValuesRepository {
  constructor(
    private readonly redis: RedisService,
    private readonly winston: WinstonService,
    private readonly metrics: MetricsService,
  ) {}

  async lpush(queue: string, value: string): Promise<void> {
    const startTime = Date.now()

    try {
      await this.redis.lpush(queue, value)

      this.winston.logDatabaseQuery({
        query: 'LPUSH to queue',
        duration: Date.now() - startTime,
        success: true,
        table: queue,
        operation: 'LPUSH',
      })
      this.metrics.recordDbMetrics('LPUSH', queue, Date.now() - startTime, true)
    } catch (error) {
      this.winston.logDatabaseQuery({
        query: 'LPUSH to queue',
        duration: Date.now() - startTime,
        success: false,
        table: queue,
        operation: 'LPUSH',
        error: (error as Error).message,
      })
      this.metrics.recordDbMetrics(
        'LPUSH',
        queue,
        Date.now() - startTime,
        false,
      )

      throw error
    }
  }

  async publish(channel: string, message: string): Promise<void> {
    const startTime = Date.now()

    try {
      await this.redis.publish(channel, message)

      this.winston.logDatabaseQuery({
        query: 'PUBLISH to channel',
        duration: Date.now() - startTime,
        success: true,
        table: channel,
        operation: 'PUBLISH',
      })
      this.metrics.recordDbMetrics(
        'PUBLISH',
        channel,
        Date.now() - startTime,
        true,
      )
    } catch (error) {
      this.winston.logDatabaseQuery({
        query: 'PUBLISH to channel',
        duration: Date.now() - startTime,
        success: false,
        table: channel,
        operation: 'PUBLISH',
        error: (error as Error).message,
      })
      this.metrics.recordDbMetrics(
        'PUBLISH',
        channel,
        Date.now() - startTime,
        false,
      )

      throw error
    }
  }
}
