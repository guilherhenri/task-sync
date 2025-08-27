import { Injectable } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { EnvModule } from '@/infra/env/env.module'
import { RedisService } from '@/infra/key-value/redis/redis.service'
import { ObservabilityModule } from '@/infra/observability/observability.module'
import { QueueService } from '@/infra/workers/queue/contracts/queue-service'

import { RedisEmailQueueService } from './redis-email-queue.service'

@Injectable()
class MockQueueService {
  private queue: {
    add: (
      jobName: string,
      data: Record<string, unknown>,
      opts: { priority: number },
    ) => Promise<void>
    getWaiting: () => Promise<Array<unknown>>
  } = {
    add: async (jobName, data, opts) => {
      await this.redis.zadd(
        'email-queue-test',
        opts.priority,
        JSON.stringify({ jobName, data }),
      )
    },
    getWaiting: async () => ['1'],
  }

  constructor(private readonly redis: RedisService) {}

  getEmailQueue() {
    return this.queue
  }
}

describe('Redis Email Queue Service', () => {
  let module: TestingModule
  let redisService: RedisService
  let redisEmailQueueService: RedisEmailQueueService

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [EnvModule, ObservabilityModule],
      providers: [
        RedisService,
        RedisEmailQueueService,
        { provide: QueueService, useClass: MockQueueService },
      ],
    }).compile()

    redisService = module.get(RedisService)
    redisEmailQueueService = module.get(RedisEmailQueueService)
  })

  afterAll(async () => {
    await redisService.quit()
  })

  it('should be able to add email request to queue with correct priority', async () => {
    const emailRequestId = new UniqueEntityID('test-email-id')
    const priority = 'high'

    await redisEmailQueueService.enqueueEmailRequest(emailRequestId, priority)

    const queueItems = await redisService.zrange('email-queue-test', 0, -1)
    expect(queueItems).toHaveLength(1)

    const item = JSON.parse(queueItems[0])
    expect(item.jobName).toBe('send-email')
    expect(item.data.emailRequestId).toBe(emailRequestId.toString())

    const score = await redisService.zscore(
      'email-queue-test',
      JSON.stringify(item),
    )
    expect(Number(score)).toBe(3)
  })
})
