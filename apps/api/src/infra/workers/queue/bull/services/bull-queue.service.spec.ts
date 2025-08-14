import { Test, TestingModule } from '@nestjs/testing'
import { Queue } from 'bull'

import { BullQueueService } from './bull-queue.service'

describe('BullQueueService', () => {
  let bullQueueService: BullQueueService
  let mockQueue: Queue

  beforeEach(async () => {
    mockQueue = {} as Queue

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BullQueueService,
        {
          provide: 'BullQueue_email-queue',
          useValue: mockQueue,
        },
      ],
    }).compile()

    bullQueueService = module.get<BullQueueService>(BullQueueService)
  })

  it('should return the injected email queue', () => {
    expect(bullQueueService.getEmailQueue()).toBe(mockQueue)
  })
})
