import { Injectable } from '@nestjs/common'

import { WithObservability } from '@/core/decorators/observability.decorator'
import { DomainEvents } from '@/core/events/domain-events'
import type { EventHandler } from '@/core/events/event-handler'
import { LoggerPort } from '@/core/ports/logger'
import { MetricsPort } from '@/core/ports/metrics'
import { AuthUserService } from '@/domain/auth/application/services/auth-user-service'
import { UserRegisteredEvent } from '@/domain/auth/enterprise/events/user-registered-event'

import { CreateEmailRequestUseCase } from '../use-cases/create-email-request'

@Injectable()
export class OnUserRegistered implements EventHandler {
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
      this.sendNewUserEmail.bind(this),
      UserRegisteredEvent.name,
    )
  }

  @WithObservability({
    operation: 'send_new_user_email',
    identifier: 'user',
    subIdentifier: 'id',
  })
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
