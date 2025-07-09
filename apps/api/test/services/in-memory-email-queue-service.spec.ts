import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { EmailPriority } from '@/domain/email/enterprise/entities/email-request'

import { InMemoryEmailQueueService } from './in-memory-email-queue-service'

let sut: InMemoryEmailQueueService

describe('In Memory Email Queue Service', () => {
  beforeEach(() => {
    sut = new InMemoryEmailQueueService()
  })

  describe('enqueueEmailRequest', () => {
    it('should enqueue an email request ID with default medium priority', async () => {
      const emailRequestId = new UniqueEntityID('request-1')

      await sut.enqueueEmailRequest(emailRequestId, 'medium')

      const queue = sut.getQueue('medium')
      expect(queue).toHaveLength(1)
      expect(queue[0]).toEqual(emailRequestId)
    })

    it('should enqueue an email request ID with specified priority', async () => {
      const emailRequestId = new UniqueEntityID('request-1')

      await sut.enqueueEmailRequest(emailRequestId, 'high')

      const queue = sut.getQueue('high')
      expect(queue).toHaveLength(1)
      expect(queue[0]).toEqual(emailRequestId)
      expect(sut.getQueue('medium')).toHaveLength(0)
    })

    it('should throw an error for invalid priority', async () => {
      const emailRequestId = new UniqueEntityID('request-1')

      await expect(
        sut.enqueueEmailRequest(emailRequestId, 'invalid' as EmailPriority),
      ).rejects.toThrow('Invalid priority: invalid')
    })

    it('should enqueue multiple email request IDs in the same priority queue', async () => {
      const emailRequestId1 = new UniqueEntityID('request-1')
      const emailRequestId2 = new UniqueEntityID('request-2')

      await sut.enqueueEmailRequest(emailRequestId1, 'urgent')
      await sut.enqueueEmailRequest(emailRequestId2, 'urgent')

      const queue = sut.getQueue('urgent')
      expect(queue).toHaveLength(2)
      expect(queue).toEqual([emailRequestId1, emailRequestId2])
    })
  })

  describe('getQueue', () => {
    it('should return an empty array for an empty queue', () => {
      const queue = sut.getQueue('low')
      expect(queue).toEqual([])
    })

    it('should return a copy of the queue to prevent external mutations', async () => {
      const emailRequestId = new UniqueEntityID('request-1')
      await sut.enqueueEmailRequest(emailRequestId, 'medium')

      const queue = sut.getQueue('medium')
      queue.push(new UniqueEntityID('request-2')) // Tenta modificar a cópia

      const originalQueue = sut.getQueue('medium')
      expect(originalQueue).toHaveLength(1)
      expect(originalQueue[0]).toEqual(emailRequestId)
    })
  })

  describe('clearQueue', () => {
    it('should clear the specified priority queue', async () => {
      const emailRequestId = new UniqueEntityID('request-1')
      await sut.enqueueEmailRequest(emailRequestId, 'high')

      sut.clearQueue('high')

      const queue = sut.getQueue('high')
      expect(queue).toHaveLength(0)
    })

    it('should not affect other priority queues when clearing one', async () => {
      const emailRequestId1 = new UniqueEntityID('request-1')
      const emailRequestId2 = new UniqueEntityID('request-2')
      await sut.enqueueEmailRequest(emailRequestId1, 'medium')
      await sut.enqueueEmailRequest(emailRequestId2, 'urgent')

      sut.clearQueue('medium')

      expect(sut.getQueue('medium')).toHaveLength(0)
      expect(sut.getQueue('urgent')).toHaveLength(1)
      expect(sut.getQueue('urgent')[0]).toEqual(emailRequestId2)
    })

    it('should handle clearing an already empty queue', () => {
      sut.clearQueue('low')
      expect(sut.getQueue('low')).toHaveLength(0)
    })
  })
})
