import {
  BadRequestException,
  Controller,
  Get,
  GoneException,
  HttpCode,
  NotFoundException,
  Query,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { z } from 'zod/v4'

import { LoggerPort } from '@/core/ports/logger'
import { ConfirmEmailUseCase } from '@/domain/auth/application/use-cases/confirm-email'
import { ResourceGoneError } from '@/domain/auth/application/use-cases/errors/resource-gone'
import { ResourceNotFoundError } from '@/domain/auth/application/use-cases/errors/resource-not-found'
import { Public } from '@/infra/auth/decorators/public'
import { MetricsService } from '@/infra/metrics/metrics.service'

import {
  ApiZodGoneResponse,
  ApiZodNotFoundResponse,
  ApiZodQuery,
  ApiZodResponse,
  ApiZodValidationFailedResponse,
} from '../decorators/zod-openapi'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe'

const confirmEmailQuerySchema = z.object({
  token: z.string('O token é obrigatório.').min(1, 'O token é obrigatório.'),
})

const confirmEmailResponseSchema = z.object({
  message: z.string().optional(),
})

const queryValidationPipe = new ZodValidationPipe(confirmEmailQuerySchema)

type ConfirmEmailQuerySchema = z.infer<typeof confirmEmailQuerySchema>

const confirmEmailQueryDescription: Record<
  keyof ConfirmEmailQuerySchema,
  string
> = {
  token:
    'Um token único enviado ao e-mail do usuário no momento da criação da conta.',
}

@ApiTags('auth')
@Controller('/confirm-email')
@Public()
export class ConfirmEmailController {
  constructor(
    private readonly confirmEmail: ConfirmEmailUseCase,
    private readonly logger: LoggerPort,
    private readonly metrics: MetricsService,
  ) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({
    summary: "Confirm user's email",
    description:
      "Confirm the user's email with a valid token sent to their email.",
  })
  @ApiZodQuery({
    name: 'token',
    schema: confirmEmailQuerySchema,
    description: confirmEmailQueryDescription,
  })
  @ApiZodResponse({
    status: 200,
    schema: confirmEmailResponseSchema,
    examples: { message: 'Seu e-mail foi confirmado com sucesso.' },
  })
  @ApiZodNotFoundResponse({
    description: 'Resource not found',
    custom: { message: 'Token não encontrado.' },
  })
  @ApiZodGoneResponse({
    description: 'Token expired',
    custom: { message: 'Token expirado.' },
  })
  @ApiZodValidationFailedResponse({
    description: 'Validation Failed',
    custom: { field: 'token', message: 'O token é obrigatório.' },
  })
  async handle(@Query(queryValidationPipe) query: ConfirmEmailQuerySchema) {
    this.logger.logBusinessEvent({
      action: 'confirm_email_attempt',
      resource: 'user',
      userId: query.token,
    })
    this.metrics.businessEvents.labels('confirm_email', 'user', 'attempt').inc()

    const { token } = query

    const result = await this.confirmEmail.execute({
      token,
    })

    if (result.isLeft()) {
      const error = result.value

      this.logger.logBusinessEvent({
        action: 'confirm_email_failed',
        resource: 'user',
        userId: query.token,
        metadata: { reason: error.constructor.name },
      })
      this.metrics.businessEvents
        .labels('confirm_email', 'user', 'failed')
        .inc()

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        case ResourceGoneError:
          throw new GoneException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    this.logger.logBusinessEvent({
      action: 'confirm_email_success',
      resource: 'user',
      userId: query.token,
    })
    this.metrics.businessEvents.labels('confirm_email', 'user', 'success').inc()

    return { message: 'Seu e-mail foi confirmado com sucesso.' }
  }
}
