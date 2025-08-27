import { Injectable } from '@nestjs/common'
import { env } from '@task-sync/env'

import { WithObservability } from '@/core/decorators/observability.decorator'
import { DomainEvents } from '@/core/events/domain-events'
import type { EventHandler } from '@/core/events/event-handler'
import { LoggerPort } from '@/core/ports/logger'
import { MetricsPort } from '@/core/ports/metrics'
import { AuthUserService } from '@/domain/auth/application/services/auth-user-service'
import { PasswordRecoveryRequestedEvent } from '@/domain/auth/enterprise/events/password-recovery-requested-event'

import { CreateEmailRequestUseCase } from '../use-cases/create-email-request'

@Injectable()
export class OnPasswordRecoveryRequested implements EventHandler {
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
      PasswordRecoveryRequestedEvent.name,
    )
  }

  @WithObservability({
    operation: 'send_password_recovery_email',
    identifier: 'verificationToken',
    subIdentifier: 'userId',
  })
  private async sendEmailVerification({
    verificationToken,
  }: PasswordRecoveryRequestedEvent) {
    const recipient = await this.authUserService.getUserForEmailDelivery(
      verificationToken.userId.toString(),
    )

    if (!recipient) {
      throw new Error('Usuário não encontrado.')
    }

    const resetLink = new URL(`${env.APP_URL}/verify-email`)
    resetLink.searchParams.set('token', verificationToken.token)

    await this.createEmailRequestUseCase.execute({
      eventType: 'password_recovery',
      recipientId: recipient.id,
      recipientEmail: recipient.email,
      templateName: 'password-recovery',
      data: {
        name: recipient.name,
        resetLink: resetLink.toString(),
      },
    })
  }
}
