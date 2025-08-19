import { makeEmailRequest } from '@test/factories/make-email-request'
import { InMemoryEmailRequestsRepository } from '@test/repositories/in-memory-email-requests-repository'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { UpdateEmailRequestStatusUseCase } from './update-email-request-status'

let inMemoryEmailRequestsRepository: InMemoryEmailRequestsRepository
let sut: UpdateEmailRequestStatusUseCase

describe('Update Email Request Status Use-case', () => {
  beforeEach(() => {
    inMemoryEmailRequestsRepository = new InMemoryEmailRequestsRepository()
    sut = new UpdateEmailRequestStatusUseCase(inMemoryEmailRequestsRepository)
  })

  it('should be able to move the email request to the next status', async () => {
    const emailRequest = makeEmailRequest(
      {},
      new UniqueEntityID('email-request-id'),
    )
    inMemoryEmailRequestsRepository.items.push(emailRequest)

    const response = await sut.execute({
      emailRequestId: 'email-request-id',
      statusTransition: 'progress',
    })

    expect(response.isRight()).toBeTruthy()
    expect(inMemoryEmailRequestsRepository.items[0].status.value).toEqual(
      'processing',
    )
  })

  it('should be able to mark the email request as sent', async () => {
    const emailRequest = makeEmailRequest(
      {},
      new UniqueEntityID('email-request-id'),
    )
    inMemoryEmailRequestsRepository.items.push(emailRequest)

    const response = await sut.execute({
      emailRequestId: 'email-request-id',
      statusTransition: 'setSent',
    })

    expect(response.isRight()).toBeTruthy()
    expect(inMemoryEmailRequestsRepository.items[0].status.value).toEqual(
      'sent',
    )
  })

  it('should be able to mark the email request as failed', async () => {
    const emailRequest = makeEmailRequest(
      {},
      new UniqueEntityID('email-request-id'),
    )
    inMemoryEmailRequestsRepository.items.push(emailRequest)

    const response = await sut.execute({
      emailRequestId: 'email-request-id',
      statusTransition: 'setFailed',
    })

    expect(response.isRight()).toBeTruthy()
    expect(inMemoryEmailRequestsRepository.items[0].status.value).toEqual(
      'failed',
    )
  })

  it('should not be able to update the status from an email request that does not exist', async () => {
    const emailRequest = makeEmailRequest(
      {},
      new UniqueEntityID('email-request-id'),
    )
    inMemoryEmailRequestsRepository.items.push(emailRequest)

    const response = await sut.execute({
      emailRequestId: 'invalid-email-request-id',
      statusTransition: 'progress',
    })

    expect(response.isLeft()).toBeTruthy()
    expect(response.value).toHaveProperty(
      'message',
      'Requisição de e-mail não encontrada.',
    )
    expect(inMemoryEmailRequestsRepository.items[0].status.value).toEqual(
      'pending',
    )
  })
})
