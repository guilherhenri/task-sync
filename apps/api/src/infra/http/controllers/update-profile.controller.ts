import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  NotFoundException,
  Put,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { z } from 'zod/v4'

import { LoggerPort } from '@/core/ports/logger'
import { EmailAlreadyInUseError } from '@/domain/auth/application/use-cases/errors/email-already-in-use'
import { ResourceNotFoundError } from '@/domain/auth/application/use-cases/errors/resource-not-found'
import { RefineProfileUseCase } from '@/domain/auth/application/use-cases/refine-profile'
import { CurrentUser } from '@/infra/auth/decorators/current-user'
import type { UserPayload } from '@/infra/auth/types/jwt-payload'

import {
  ApiZodBody,
  ApiZodConflictResponse,
  ApiZodResponse,
  ApiZodValidationFailedResponse,
} from '../decorators/zod-openapi'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe'
import { JwtUnauthorizedResponse } from '../responses/jwt-unauthorized'

const updateProfileBodySchema = z.object({
  name: z.string('O nome é obrigatório.').min(1, 'O nome é obrigatório.'),
  email: z.email({
    error: (iss) =>
      iss.input === undefined
        ? 'O e-mail é obrigatório.'
        : 'O e-mail deve ser válido.',
  }),
  newPassword: z
    .string('A senha é obrigatória.')
    .min(8, 'A senha deve ter no mínimo 8 caracteres.')
    .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula.')
    .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula.')
    .regex(/[0-9]/, 'A senha deve conter pelo menos um número.')
    .regex(
      /[^A-Za-z0-9]/,
      'A senha deve conter pelo menos um caractere especial.',
    )
    .optional(),
})

const updateProfileResponseSchema = z.object({
  message: z.string(),
})

const bodyValidationPipe = new ZodValidationPipe(updateProfileBodySchema)

type UpdateProfileBodySchema = z.infer<typeof updateProfileBodySchema>
const registerBodyExample: UpdateProfileBodySchema = {
  name: 'John Doe',
  email: 'johndoe@email.com',
  newPassword: '12345Ab@',
}
const updateProfileBodyDescription: Record<
  keyof Omit<UpdateProfileBodySchema, 'name' | 'email'>,
  string
> = {
  newPassword:
    'Senha deve ter no mínimo 8 caracteres, com maiúscula, minúscula, número e caractere especial.',
}

@ApiTags('auth')
@Controller('/me')
export class UpdateProfileController {
  constructor(
    private readonly refineProfile: RefineProfileUseCase,
    private readonly logger: LoggerPort,
  ) {}

  @Put()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Update profile',
    description: 'Update user profile with valid data.',
  })
  @ApiZodBody({
    schema: updateProfileBodySchema,
    examples: registerBodyExample,
    description: updateProfileBodyDescription,
  })
  @ApiZodResponse({
    status: 200,
    description: 'Profile updated',
    schema: updateProfileResponseSchema,
    examples: { message: 'Perfil atualizado com sucesso.' },
  })
  @ApiZodConflictResponse({
    description: 'Email already in use',
    custom: { message: 'O e-mail "email@example.com" já está em uso.' },
  })
  @ApiZodValidationFailedResponse({
    description: 'Validation Failed',
    custom: { field: 'email', message: 'O e-mail deve ser válido.' },
  })
  @JwtUnauthorizedResponse()
  async handle(
    @CurrentUser() user: UserPayload,
    @Body(bodyValidationPipe) body: UpdateProfileBodySchema,
  ) {
    this.logger.logBusinessEvent({
      action: 'profile_update_attempt',
      resource: 'profile',
      userId: user.sub,
      metadata: { fields: Object.keys(body) },
    })

    const { name, email, newPassword } = body

    const result = await this.refineProfile.execute({
      userId: user.sub,
      name,
      email,
      newPassword,
    })

    if (result.isLeft()) {
      const error = result.value

      this.logger.logBusinessEvent({
        action: 'profile_update_failed',
        resource: 'profile',
        userId: user.sub,
        metadata: { reason: error.constructor.name },
      })

      switch (error.constructor) {
        case EmailAlreadyInUseError:
          throw new ConflictException(error.message)
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    this.logger.logBusinessEvent({
      action: 'profile_update_success',
      resource: 'profile',
      userId: user.sub,
    })

    return { message: 'Perfil atualizado com sucesso.' }
  }
}
