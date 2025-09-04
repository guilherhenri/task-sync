import { Process, Processor } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'
import { render } from '@task-sync/email-templates'

import { GetEmailRequestByIdUseCase } from '@/domain/email/application/use-cases/get-email-request-by-id'
import { UpdateEmailRequestStatusUseCase } from '@/domain/email/application/use-cases/update-email-request-status'
import { EmailService } from '@/infra/email/contracts/email-service'
import { KeyValuesRepository } from '@/infra/key-value/key-values-repository'
import { WinstonService } from '@/infra/logging/winston.service'
import { MetricsService } from '@/infra/metrics/metrics.service'

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
    private readonly winston: WinstonService,
    private readonly metrics: MetricsService,
  ) {}

  @Process('send-email')
  async handle(job: EmailQueueWorkerJob): Promise<void> {
    const startTime = Date.now()
    const { emailRequestId } = job.data

    this.winston.logQueueJob({
      jobName: 'email_worker',
      jobId: job.id.toString(),
      status: 'started',
      metadata: { emailRequestId },
    })
    this.metrics.recordWorkerJobMetrics({
      worker: 'email_worker',
      status: 'started',
    })

    const result = await this.getEmailRequestByIdUseCase.execute({
      emailRequestId,
    })

    if (!result.isRight()) {
      const duration = Date.now() - startTime

      this.winston.logQueueJob({
        jobName: 'email_worker',
        jobId: job.id.toString(),
        status: 'failed',
        error: 'EmailRequest not found',
        metadata: { emailRequestId },
      })
      this.metrics.recordWorkerJobMetrics({
        worker: 'email_worker',
        status: 'failed',
      })
      this.metrics.recordWorkerJobDuration({
        worker: 'email_worker',
        result: 'failed',
        duration,
      })

      return
    }

    let emailRequest = result.value.emailRequest

    const updateResult = await this.updateEmailRequestStatusUseCase.execute({
      emailRequestId,
      statusTransition: 'progress',
    })

    if (!updateResult.isRight()) {
      this.winston.error(
        'Failed to update email status to progress',
        undefined,
        {
          emailRequestId,
        },
      )

      await this.keyValueRepository.lpush(
        'status:update:queue',
        JSON.stringify({
          emailRequestId,
          statusTransition: 'progress',
          attempts: 0,
        }),
      )

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
        this.winston.error('Failed to update email status to sent', undefined, {
          emailRequestId,
        })

        await this.keyValueRepository.lpush(
          'status:update:queue',
          JSON.stringify({
            emailRequestId,
            statusTransition: 'progress',
            attempts: 0,
          }),
        )
        return
      }

      emailRequest = result.value.emailRequest

      const duration = Date.now() - startTime

      this.metrics.recordWorkerJobMetrics({
        worker: 'email_worker',
        status: 'completed',
      })
      this.metrics.recordWorkerJobDuration({
        worker: 'email_worker',
        result: 'completed',
        duration,
      })

      this.winston.logQueueJob({
        jobName: 'email_worker',
        jobId: job.id.toString(),
        status: 'completed',
        metadata: { emailRequestId, finalStatus: 'sent' },
      })
    } catch (error) {
      this.winston.warn('Email send failed, starting retry process', {
        emailRequestId,
        error: (error as Error).message,
      })

      this.metrics.recordWorkerJobMetrics({
        worker: 'email_worker',
        status: 'retry_started',
      })

      const result = await this.updateEmailRequestStatusUseCase.execute({
        emailRequestId,
        statusTransition: 'setFailed',
      })

      if (!result.isRight()) {
        this.winston.error(
          'Failed to update email status to failed',
          undefined,
          {
            emailRequestId,
          },
        )

        await this.keyValueRepository.lpush(
          'status:update:queue',
          JSON.stringify({
            emailRequestId,
            statusTransition: 'setFailed',
            attempts: 0,
          }),
        )

        return
      }

      emailRequest = result.value.emailRequest

      for (let attempt = 1; attempt <= 3; attempt++) {
        this.winston.logQueueJob({
          jobName: 'email_worker',
          jobId: job.id.toString(),
          status: 'retry',
          attempt,
          metadata: { emailRequestId },
        })

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
            this.winston.error(
              'Failed to update email status to sent after retry',
              undefined,
              {
                emailRequestId,
                attempt,
              },
            )

            await this.keyValueRepository.lpush(
              'status:update:queue',
              JSON.stringify({
                emailRequestId,
                statusTransition: 'setSent',
                attempts: 0,
              }),
            )

            return
          }

          emailRequest = result.value.emailRequest

          const duration = Date.now() - startTime
          this.metrics.recordWorkerJobMetrics({
            worker: 'email_worker',
            status: 'retry_succeeded',
          })
          this.metrics.recordWorkerJobDuration({
            worker: 'email_worker',
            result: 'completed',
            duration,
          })

          this.winston.logQueueJob({
            jobName: 'email_worker',
            jobId: job.id.toString(),
            status: 'completed',
            attempt,
            metadata: { emailRequestId, finalStatus: 'sent' },
          })

          break
        } catch {
          if (attempt === 3) {
            await this.keyValueRepository.lpush('email:dlq', emailRequestId)

            const duration = Date.now() - startTime
            this.metrics.recordWorkerJobMetrics({
              worker: 'email_worker',
              status: 'dlq',
            })
            this.metrics.recordWorkerJobDuration({
              worker: 'email_worker',
              result: 'failed',
              duration,
            })

            this.winston.logQueueJob({
              jobName: 'email_worker',
              jobId: job.id.toString(),
              status: 'failed',
              attempt,
              error: 'Max retries exceeded, moved to DLQ',
              metadata: { emailRequestId },
            })
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

    this.winston.info('Email job completed', {
      emailRequestId,
      priority: emailRequest.priority,
      finalStatus: emailRequest.status.value,
    })
  }
}
