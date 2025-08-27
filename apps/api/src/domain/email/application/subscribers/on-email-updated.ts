import { Injectable } from '@nestjs/common'
import { env } from '@task-sync/env'

import { WithObservability } from '@/core/decorators/observability.decorator'
import { DomainEvents } from '@/core/events/domain-events'
import type { EventHandler } from '@/core/events/event-handler'
import { LoggerPort } from '@/core/ports/logger'
import { MetricsPort } from '@/core/ports/metrics'
import { AuthUserService } from '@/domain/auth/application/services/auth-user-service'
import { EmailUpdateVerificationRequestedEvent } from '@/domain/auth/enterprise/events/email-update-verification-requested-event'

import { CreateEmailRequestUseCase } from '../use-cases/create-email-request'

@Injectable()
export class OnEmailUpdated implements EventHandler {
  constructor(
    private authUserService: AuthUserService,
    private createEmailRequestUseCase: CreateEmailRequestUseCase,
    private logger: LoggerPort,
    private metrics: MetricsPort,
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendEmailVerification.bind(this),
      EmailUpdateVerificationRequestedEvent.name,
    )
  }

  @WithObservability({
    operation: 'send_email_verification',
    identifier: 'verificationToken',
    subIdentifier: 'userId',
  })
  private async sendEmailVerification({
    verificationToken,
  }: EmailUpdateVerificationRequestedEvent) {
    const recipient = await this.authUserService.getUserForEmailDelivery(
      verificationToken.userId.toString(),
    )

    if (!recipient) {
      throw new Error('Usuário não encontrado.')
    }

    const verificationLink = new URL(`${env.APP_URL}/verify-email`)
    verificationLink.searchParams.set('token', verificationToken.token)

    await this.createEmailRequestUseCase.execute({
      eventType: 'email_update_verification',
      recipientId: recipient.id,
      recipientEmail: recipient.email,
      templateName: 'update-email-verify',
      data: {
        name: recipient.name,
        verificationLink: verificationLink.toString(),
      },
    })
  }
}
