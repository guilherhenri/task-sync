import { Injectable } from '@nestjs/common'
import type { EmailTemplateType } from '@task-sync/api-types'

import { type Either, left, right } from '@/core/either'

import type { EmailRequest } from '../../enterprise/entities/email-request'
import { EmailRequestsRepository } from '../repositories/email-requests-repository'

interface UpdateEmailRequestStatusUseCaseRequest {
  emailRequestId: string
  statusTransition: 'progress' | 'setSent' | 'setFailed'
}

type UpdateEmailRequestStatusUseCaseResponse = Either<
  Error,
  { emailRequest: EmailRequest<EmailTemplateType> }
>

@Injectable()
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

    switch (statusTransition) {
      case 'progress':
        emailRequest.advanceStatus()
        break
      case 'setSent':
        emailRequest.markAsSent()
        break
      case 'setFailed':
        emailRequest.markAsFailed()
    }

    await this.emailRequestsRepository.save(emailRequest)

    return right({ emailRequest })
  }
}
