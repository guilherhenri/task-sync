import {
  BadRequestException,
  Body,
  Controller,
  GoneException,
  HttpCode,
  NotFoundException,
  Post,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { z } from 'zod/v4'

import { LoggerPort } from '@/core/ports/logger'
import { ResourceGoneError } from '@/domain/auth/application/use-cases/errors/resource-gone'
import { ResourceNotFoundError } from '@/domain/auth/application/use-cases/errors/resource-not-found'
import { ResetPasswordUseCase } from '@/domain/auth/application/use-cases/reset-password'
import { Public } from '@/infra/auth/decorators/public'

import {
  ApiZodBody,
  ApiZodGoneResponse,
  ApiZodNotFoundResponse,
  ApiZodResponse,
  ApiZodValidationFailedResponse,
} from '../decorators/zod-openapi'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe'

const resetPasswordBodySchema = z.object({
  token: z.string('O token é obrigatório.').min(1, 'O token é obrigatório.'),
  newPassword: z
    .string('A nova senha é obrigatória.')
    .min(8, 'A nova senha deve ter no mínimo 8 caracteres.')
    .regex(/[A-Z]/, 'A nova senha deve conter pelo menos uma letra maiúscula.')
    .regex(/[a-z]/, 'A nova senha deve conter pelo menos uma letra minúscula.')
    .regex(/[0-9]/, 'A nova senha deve conter pelo menos um número.')
    .regex(
      /[^A-Za-z0-9]/,
      'A nova senha deve conter pelo menos um caractere especial.',
    ),
})

const resetPasswordResponseSchema = z.object({
  message: z.string(),
})

const bodyValidationPipe = new ZodValidationPipe(resetPasswordBodySchema)

type ResetPasswordBodySchema = z.infer<typeof resetPasswordBodySchema>

const resetPasswordBodyDescription: Record<
  keyof ResetPasswordBodySchema,
  string
> = {
  token:
    'Um token único enviado ao e-mail do usuário no momento da solicitação da recuperação da senha.',
  newPassword:
    'A nova senha deve ter no mínimo 8 caracteres, com maiúscula, minúscula, número e caractere especial.',
}

@ApiTags('auth')
@Controller('/reset-password')
@Public()
export class ResetPasswordController {
  constructor(
    private readonly resetPassword: ResetPasswordUseCase,
    private readonly logger: LoggerPort,
  ) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({
    summary: "Reset user's password",
    description:
      "Reset the user's password with a valid token sent to their email.",
  })
  @ApiZodBody({
    schema: resetPasswordBodySchema,
    examples: { token: 'string', newPassword: '12345Ab@' },
    description: resetPasswordBodyDescription,
  })
  @ApiZodResponse({
    status: 200,
    schema: resetPasswordResponseSchema,
    examples: { message: 'Sua senha foi redefinida com sucesso.' },
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
    custom: {
      field: 'newPassword',
      message: 'A nova senha token é obrigatória.',
    },
  })
  async handle(@Body(bodyValidationPipe) body: ResetPasswordBodySchema) {
    this.logger.logBusinessEvent({
      action: 'password_reset_attempt',
      resource: 'password',
      userId: body.token,
    })

    const { token, newPassword } = body

    const result = await this.resetPassword.execute({
      token,
      newPassword,
    })

    if (result.isLeft()) {
      const error = result.value

      this.logger.logBusinessEvent({
        action: 'password_reset_failed',
        resource: 'password',
        userId: body.token,
        metadata: { reason: error.constructor.name },
      })

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
      action: 'password_reset_success',
      resource: 'password',
      userId: body.token,
    })

    return { message: 'Sua senha foi redefinida com sucesso.' }
  }
}
