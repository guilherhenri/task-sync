import { env } from '@task-sync/env'

import { DomainEvents } from '@/core/events/domain-events'
import type { EventHandler } from '@/core/events/event-handler'
import type { AuthUserService } from '@/domain/auth/application/services/auth-user-service'
import { PasswordRecoveryRequestedEvent } from '@/domain/auth/enterprise/events/password-recovery-requested-event'

import type { CreateEmailRequestUseCase } from '../use-cases/create-email-request'

export class OnPasswordRecoveryRequested implements EventHandler {
  constructor(
    private authUserService: AuthUserService,
    private createEmailRequestUseCase: CreateEmailRequestUseCase,
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendEmailVerification.bind(this),
      PasswordRecoveryRequestedEvent.name,
    )
  }

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
