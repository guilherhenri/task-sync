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

import { ConfirmEmailUseCase } from '@/domain/auth/application/use-cases/confirm-email'
import { ResourceGoneUseError } from '@/domain/auth/application/use-cases/errors/resource-gone'
import { ResourceNotFoundUseError } from '@/domain/auth/application/use-cases/errors/resource-not-found'

import {
  ApiZodBadResponse,
  ApiZodGoneResponse,
  ApiZodNotFoundResponse,
  ApiZodQuery,
  ApiZodResponse,
} from '../decorators/zod-openapi'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe'

const confirmEmailQuerySchema = z.object({
  token: z
    .string('O token é obrigatório.')
    .min(1, 'O token é obrigatório.')
    .describe('teste'),
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
export class ConfirmEmailController {
  constructor(private readonly confirmEmail: ConfirmEmailUseCase) {}

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
    examples: { token: 'string' },
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
  @ApiZodBadResponse({
    description: 'Validation Failed',
    custom: { field: 'token', message: 'O token é obrigatório.' },
  })
  async handle(@Query(queryValidationPipe) query: ConfirmEmailQuerySchema) {
    const { token } = query

    const result = await this.confirmEmail.execute({
      token,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundUseError:
          throw new NotFoundException(error.message)
        case ResourceGoneUseError:
          throw new GoneException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    return { message: 'Seu e-mail foi confirmado com sucesso.' }
  }
}
