import { Injectable } from '@nestjs/common'

import { KeyValuesRepository } from '../../key-values-repository'
import { RedisService } from '../redis.service'

@Injectable()
export class RedisKeyValueRepository implements KeyValuesRepository {
  constructor(private readonly redis: RedisService) {}

  async lpush(queue: string, value: string): Promise<void> {
    await this.redis.lpush(queue, value)
  }

  async publish(channel: string, message: string): Promise<void> {
    await this.redis.publish(channel, message)
  }
}
