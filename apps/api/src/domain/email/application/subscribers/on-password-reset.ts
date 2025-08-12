import { Injectable } from '@nestjs/common'

import { DomainEvents } from '@/core/events/domain-events'
import type { EventHandler } from '@/core/events/event-handler'
import { AuthUserService } from '@/domain/auth/application/services/auth-user-service'
import { PasswordResetEvent } from '@/domain/auth/enterprise/events/password-reset-event'

import { CreateEmailRequestUseCase } from '../use-cases/create-email-request'

@Injectable()
export class OnPasswordRest implements EventHandler {
  constructor(
    private authUserService: AuthUserService,
    private createEmailRequestUseCase: CreateEmailRequestUseCase,
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendWarnEmail.bind(this),
      PasswordResetEvent.name,
    )
  }

  private async sendWarnEmail({ user }: PasswordResetEvent) {
    const recipient = await this.authUserService.getUserForEmailDelivery(
      user.id.toString(),
    )

    if (!recipient) {
      throw new Error('Usuário não encontrado.')
    }

    await this.createEmailRequestUseCase.execute({
      eventType: 'password_reset',
      recipientId: recipient.id,
      recipientEmail: recipient.email,
      templateName: 'password-reset',
      data: {
        name: recipient.name,
      },
    })
  }
}
