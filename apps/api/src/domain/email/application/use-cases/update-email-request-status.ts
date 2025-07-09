import { type Either, left, right } from '@/core/either'

import type { EmailRequestsRepository } from '../repositories/email-requests-repository'

interface UpdateEmailRequestStatusUseCaseRequest {
  emailRequestId: string
  statusTransition: 'progress' | 'setFailed'
}

type UpdateEmailRequestStatusUseCaseResponse = Either<Error, unknown>

export class UpdateEmailRequestStatusUseCase {
  constructor(private emailRequestsRepository: EmailRequestsRepository) {}

  async execute({
    emailRequestId,
    statusTransition,
  }: UpdateEmailRequestStatusUseCaseRequest): Promise<UpdateEmailRequestStatusUseCaseResponse> {
    const emailRequest =
      await this.emailRequestsRepository.findById(emailRequestId)

    if (!emailRequest) {
      return left(new Error('Requisição de e-mail não encontrada.'))
    }

    if (statusTransition === 'progress') {
      emailRequest.advanceStatus()
    }

    if (statusTransition === 'setFailed') {
      emailRequest.markAsFailed()
    }

    await this.emailRequestsRepository.save(emailRequest)

    return right({})
  }
}
