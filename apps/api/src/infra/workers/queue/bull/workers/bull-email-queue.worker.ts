import { Process, Processor } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'
import { render } from '@task-sync/email-templates'

import { GetEmailRequestByIdUseCase } from '@/domain/email/application/use-cases/get-email-request-by-id'
import { UpdateEmailRequestStatusUseCase } from '@/domain/email/application/use-cases/update-email-request-status'
import { EmailService } from '@/infra/email/contracts/email-service'
import { KeyValuesRepository } from '@/infra/key-value/key-values-repository'

import {
  EmailQueueWorker,
  type EmailQueueWorkerJob,
} from '../../contracts/email-queue-worker'

@Processor('email-queue')
@Injectable()
export class BullEmailQueueWorker implements EmailQueueWorker {
  constructor(
    private readonly keyValueRepository: KeyValuesRepository,
    private readonly emailService: EmailService,
    private readonly getEmailRequestByIdUseCase: GetEmailRequestByIdUseCase,
    private readonly updateEmailRequestStatusUseCase: UpdateEmailRequestStatusUseCase,
  ) {}

  @Process('send-email')
  async handle(job: EmailQueueWorkerJob): Promise<void> {
    const { emailRequestId } = job.data

    const result = await this.getEmailRequestByIdUseCase.execute({
      emailRequestId,
    })

    if (!result.isRight()) {
      console.log(`EmailRequest ${emailRequestId} não encontrado`)
      return
    }

    let emailRequest = result.value.emailRequest

    const updateResult = await this.updateEmailRequestStatusUseCase.execute({
      emailRequestId,
      statusTransition: 'progress',
    })

    if (!updateResult.isRight()) {
      console.log(`Erro ao atualizar status do email ${emailRequestId}`)
      return
    }

    emailRequest = result.value.emailRequest

    const html = await render(emailRequest.templateName, emailRequest.data)

    try {
      await this.emailService.sendEmail({
        to: emailRequest.recipientEmail,
        subject: emailRequest.subject,
        html,
      })

      const result = await this.updateEmailRequestStatusUseCase.execute({
        emailRequestId,
        statusTransition: 'progress',
      })

      if (!result.isRight()) {
        console.log(`Erro ao atualizar status do email ${emailRequestId}`)
        return
      }

      emailRequest = result.value.emailRequest
    } catch {
      const result = await this.updateEmailRequestStatusUseCase.execute({
        emailRequestId,
        statusTransition: 'setFailed',
      })

      if (!result.isRight()) {
        console.log(`Erro ao atualizar status do email ${emailRequestId}`)
        return
      }

      emailRequest = result.value.emailRequest

      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))

          await this.emailService.sendEmail({
            to: emailRequest.recipientEmail,
            subject: emailRequest.subject,
            html,
          })

          const result = await this.updateEmailRequestStatusUseCase.execute({
            emailRequestId,
            statusTransition: 'setSent',
          })

          if (!result.isRight()) {
            console.log(`Erro ao atualizar status do email ${emailRequestId}`)
            return
          }

          emailRequest = result.value.emailRequest

          break
        } catch {
          if (attempt === 3) {
            await this.keyValueRepository.lpush('email:dlq', emailRequestId)
          }
        }
      }
    }

    await this.keyValueRepository.publish(
      'email:status',
      JSON.stringify({
        event:
          emailRequest.status.value === 'sent' ? 'email_sent' : 'email_failed',
        emailRequestId,
      }),
    )

    console.log(
      `Enviado: ${emailRequestId} (Prioridade: ${emailRequest.priority})`,
    )
  }
}
