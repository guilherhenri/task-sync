import { Injectable } from '@nestjs/common'
import type { EmailTemplateType } from '@task-sync/api-types'

import { type Either, left, right } from '@/core/either'

import type { EmailRequest } from '../../enterprise/entities/email-request'
import { EmailRequestsRepository } from '../repositories/email-requests-repository'

interface GetEmailRequestByIdUseCaseRequest {
  emailRequestId: string
}

type GetEmailRequestByIdUseCaseResponse = Either<
  Error,
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
      return left(new Error('Email request not found'))
    }

    return right({ emailRequest })
  }
}
