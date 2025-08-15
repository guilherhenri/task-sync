import { Injectable } from '@nestjs/common'
import type { EmailTemplateType } from '@task-sync/api-types'

import { type Either, left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/domain/auth/application/use-cases/errors/resource-not-found'

import type { EmailRequest } from '../../enterprise/entities/email-request'
import { EmailRequestsRepository } from '../repositories/email-requests-repository'

interface GetEmailRequestByIdUseCaseRequest {
  emailRequestId: string
}

type GetEmailRequestByIdUseCaseResponse = Either<
  ResourceNotFoundError,
  { emailRequest: EmailRequest<EmailTemplateType> }
>

@Injectable()
export class GetEmailRequestByIdUseCase {
  constructor(
    private readonly emailRequestsRepository: EmailRequestsRepository,
  ) {}

  async execute({
    emailRequestId,
  }: GetEmailRequestByIdUseCaseRequest): Promise<GetEmailRequestByIdUseCaseResponse> {
    const emailRequest =
      await this.emailRequestsRepository.findById(emailRequestId)

    if (!emailRequest) {
      return left(
        new ResourceNotFoundError('Solicitação de e-mail não encontrada.'),
      )
    }

    return right({ emailRequest })
  }
}
