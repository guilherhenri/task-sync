import { DomainEvents } from '@/core/events/domain-events'
import type { EventHandler } from '@/core/events/event-handler'
import type { AuthUserService } from '@/domain/auth/application/services/auth-user-service'
import { UserRegisteredEvent } from '@/domain/auth/enterprise/events/user-registered-event'

import type { CreateEmailRequestUseCase } from '../use-cases/create-email-request'

export class OnUserRegistered implements EventHandler {
  constructor(
    private authUserService: AuthUserService,
    private createEmailRequestUseCase: CreateEmailRequestUseCase,
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendNewUserEmail.bind(this),
      UserRegisteredEvent.name,
    )
  }

  private async sendNewUserEmail({ user }: UserRegisteredEvent) {
    const recipient = await this.authUserService.getUserForEmailDelivery(
      user.id.toString(),
    )

    if (!recipient) {
      throw new Error('Usuário não encontrado.')
    }

    await this.createEmailRequestUseCase.execute({
      eventType: 'user_registered',
      recipientId: recipient.id,
      recipientEmail: recipient.email,
      templateName: 'welcome',
      data: { name: recipient.name },
    })
  }
}
