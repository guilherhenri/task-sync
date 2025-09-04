import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { z } from 'zod/v4'

import { InitiatePasswordRecoveryUseCase } from '@/domain/auth/application/use-cases/initiate-password-recovery'
import { Public } from '@/infra/auth/decorators/public'
import { ObservableController } from '@/infra/observability/observable-controller'

import { ApiUnionResponse } from '../decorators/api-union-response'
import {
  ApiZodBody,
  ApiZodResponse,
  createApiZodBadResponseConfig,
  createApiZodValidationFailedResponseConfig,
} from '../decorators/zod-openapi'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe'

const forgotPasswordBodySchema = z.object({
  email: z.email({
    error: (iss) =>
      iss.input === undefined
        ? 'O e-mail é obrigatório.'
        : 'O e-mail deve ser válido.',
  }),
})

const forgotPasswordResponseSchema = z.object({
  message: z.string(),
})

const bodyValidationPipe = new ZodValidationPipe(forgotPasswordBodySchema)

type ForgotPasswordBodySchema = z.infer<typeof forgotPasswordBodySchema>

@ApiTags('auth')
@Controller('/forgot-password')
@Public()
export class ForgotPasswordController extends ObservableController {
  constructor(
    private readonly initiatePasswordRecovery: InitiatePasswordRecoveryUseCase,
  ) {
    super()
  }

  @Post()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Forgot password',
    description: 'Initiate process to recovery password.',
  })
  @ApiZodBody({
    schema: forgotPasswordBodySchema,
    examples: { email: 'johndoe@email.com' },
  })
  @ApiZodResponse({
    status: 200,
    description: 'A recovery email was sended to you.',
    schema: forgotPasswordResponseSchema,
    examples: { message: 'Um e-mail de recuperação foi enviado para você.' },
  })
  @ApiUnionResponse(400, [
    createApiZodBadResponseConfig({
      description: 'Email not verified.',
      custom: {
        message:
          'Este endereço de e-mail ainda não foi verificado, por favor cheque seu e-mail.',
      },
    }),
    createApiZodValidationFailedResponseConfig({
      description: 'Email invalid.',
      custom: { field: 'email', message: 'O e-mail deve ser válido.' },
    }),
  ])
  async handle(@Body(bodyValidationPipe) body: ForgotPasswordBodySchema) {
    const { email } = body

    return this.trackOperation(
      async () => {
        const result = await this.initiatePasswordRecovery.execute({
          email,
        })

        if (result.isLeft()) {
          const error = result.value

          throw new BadRequestException(error.message)
        }

        return { message: 'Um e-mail de recuperação foi enviado para você.' }
      },
      {
        action: 'request_recovery_password',
        resource: 'auth',
        userIdentifier: email,
      },
    )
  }
}
