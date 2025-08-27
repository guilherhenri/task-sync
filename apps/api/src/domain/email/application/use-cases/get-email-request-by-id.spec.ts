import { makeEmailRequest } from '@test/factories/make-email-request'
import { FakeLogger } from '@test/logging/fake-logger'
import { FakeMetrics } from '@test/metrics/fake-metrics'
import { InMemoryEmailRequestsRepository } from '@test/repositories/in-memory-email-requests-repository'

import { ResourceNotFoundError } from '@/domain/auth/application/use-cases/errors/resource-not-found'

import { GetEmailRequestByIdUseCase } from './get-email-request-by-id'

let inMemoryEmailRequestsRepository: InMemoryEmailRequestsRepository
let fakeLogger: FakeLogger
let fakeMetrics: FakeMetrics
let sut: GetEmailRequestByIdUseCase

describe('Get Email Request By Id Use-case', () => {
  beforeEach(() => {
    inMemoryEmailRequestsRepository = new InMemoryEmailRequestsRepository()
    fakeLogger = new FakeLogger()
    fakeMetrics = new FakeMetrics()
    sut = new GetEmailRequestByIdUseCase(
      inMemoryEmailRequestsRepository,
      fakeLogger,
      fakeMetrics,
    )
  })

  it('should be able to get email request from id', async () => {
    const emailRequest = makeEmailRequest()
    inMemoryEmailRequestsRepository.items.push(emailRequest)

    const result = await sut.execute({
      emailRequestId: emailRequest.id.toString(),
    })

    expect(result.isRight()).toBeTruthy()

    if (result.isRight()) {
      const { emailRequest } = result.value

      expect(emailRequest).toEqual(
        expect.objectContaining({
          recipientEmail: emailRequest.recipientEmail,
        }),
      )
    }
  })

  it('should throw an error when email request not found', async () => {
    const result = await sut.execute({
      emailRequestId: 'non-existent-email-request',
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
    expect(result.value).toHaveProperty(
      'message',
      'Solicitação de e-mail não encontrada.',
    )
  })
})
