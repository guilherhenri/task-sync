import { Injectable } from '@nestjs/common'
import type { EmailTemplateType } from '@task-sync/api-types'

import { WithObservability } from '@/core/decorators/observability.decorator'
import { type Either, left, right } from '@/core/either'
import { LoggerPort } from '@/core/ports/logger'
import { MetricsPort } from '@/core/ports/metrics'
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
    private readonly logger: LoggerPort,
    private readonly metrics: MetricsPort,
  ) {}

  @WithObservability({
    operation: 'get_email_request',
    identifier: 'emailRequestId',
  })
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
