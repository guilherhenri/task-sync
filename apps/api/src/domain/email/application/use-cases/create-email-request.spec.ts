import { FakeLogger } from '@test/logging/fake-logger'
import { FakeMetrics } from '@test/metrics/fake-metrics'
import { InMemoryEmailRequestsRepository } from '@test/repositories/in-memory-email-requests-repository'
import { InMemoryEmailQueueService } from '@test/services/in-memory-email-queue-service'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { CreateEmailRequestUseCase } from './create-email-request'

let inMemoryEmailRequestsRepository: InMemoryEmailRequestsRepository
let inMemoryEmailQueueService: InMemoryEmailQueueService
let fakeLogger: FakeLogger
let fakeMetrics: FakeMetrics
let sut: CreateEmailRequestUseCase

describe('Create Email Request Use-case', () => {
  beforeEach(() => {
    inMemoryEmailRequestsRepository = new InMemoryEmailRequestsRepository()
    inMemoryEmailQueueService = new InMemoryEmailQueueService()
    fakeLogger = new FakeLogger()
    fakeMetrics = new FakeMetrics()
    sut = new CreateEmailRequestUseCase(
      inMemoryEmailRequestsRepository,
      inMemoryEmailQueueService,
      fakeLogger,
      fakeMetrics,
    )
  })

  it('should be able to create an email request', async () => {
    await sut.execute({
      eventType: 'email_update_verification',
      recipientId: new UniqueEntityID('recipient-id'),
      recipientEmail: 'example@email.com',
      subject: 'Email Test',
      templateName: 'update-email-verify',
      data: {
        name: 'User Test',
        verificationLink: 'https://tasksync.com?token=token',
      },
      priority: 'high',
    })

    expect(inMemoryEmailRequestsRepository.items).toHaveLength(1)
    expect(
      inMemoryEmailRequestsRepository.items[0].recipientId.toString(),
    ).toEqual('recipient-id')

    expect(inMemoryEmailQueueService.queues.get('high')).toHaveLength(1)
  })
})
