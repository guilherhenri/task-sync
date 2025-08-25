import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { z } from 'zod/v4'

import { LoggerPort } from '@/core/ports/logger'
import { EnrollIdentityUseCase } from '@/domain/auth/application/use-cases/enroll-identity'
import { EmailAlreadyInUseError } from '@/domain/auth/application/use-cases/errors/email-already-in-use'
import { Public } from '@/infra/auth/decorators/public'

import {
  ApiZodBody,
  ApiZodConflictResponse,
  ApiZodResponse,
  ApiZodValidationFailedResponse,
} from '../decorators/zod-openapi'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe'

const registerBodySchema = z.object({
  name: z.string('O nome é obrigatório.').min(1, 'O nome é obrigatório.'),
  email: z.email({
    error: (iss) =>
      iss.input === undefined
        ? 'O e-mail é obrigatório.'
        : 'O e-mail deve ser válido.',
  }),
  password: z
    .string('A senha é obrigatória.')
    .min(8, 'A senha deve ter no mínimo 8 caracteres.')
    .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula.')
    .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula.')
    .regex(/[0-9]/, 'A senha deve conter pelo menos um número.')
    .regex(
      /[^A-Za-z0-9]/,
      'A senha deve conter pelo menos um caractere especial.',
    ),
})

const registerResponseSchema = z.object({
  message: z.string().optional(),
})

const bodyValidationPipe = new ZodValidationPipe(registerBodySchema)

type RegisterBodySchema = z.infer<typeof registerBodySchema>
const registerBodyExample: RegisterBodySchema = {
  name: 'John Doe',
  email: 'johndoe@email.com',
  password: '12345Ab@',
}
const registerBodyDescription: Record<
  keyof Omit<RegisterBodySchema, 'name' | 'email'>,
  string
> = {
  password:
    'Senha deve ter no mínimo 8 caracteres, com maiúscula, minúscula, número e caractere especial.',
}

@ApiTags('auth')
@Controller('/sign-up')
@Public()
export class RegisterController {
  constructor(
    private readonly enrollIdentity: EnrollIdentityUseCase,
    private readonly logger: LoggerPort,
  ) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Create a new enroll identity for a user with name, email and password.',
  })
  @ApiZodBody({
    schema: registerBodySchema,
    examples: registerBodyExample,
    description: registerBodyDescription,
  })
  @ApiZodResponse({
    status: 201,
    description: 'Usuário registrado com sucesso',
    schema: registerResponseSchema,
    examples: { message: 'Usuário registrado com sucesso.' },
  })
  @ApiZodConflictResponse({
    description: 'Email already in use',
    custom: { message: 'O e-mail "email@example.com" já está em uso.' },
  })
  @ApiZodValidationFailedResponse({
    description: 'Validation Failed',
    custom: { field: 'email', message: 'O e-mail deve ser válido.' },
  })
  async handle(@Body(bodyValidationPipe) body: RegisterBodySchema) {
    this.logger.logBusinessEvent({
      action: 'register_attempt',
      resource: 'user',
      userId: body.email,
    })

    const { name, email, password } = body

    const result = await this.enrollIdentity.execute({
      name,
      email,
      password,
    })

    if (result.isLeft()) {
      const error = result.value

      this.logger.logBusinessEvent({
        action: 'register_failed',
        resource: 'user',
        userId: body.email,
        metadata: { reason: error.constructor.name },
      })

      switch (error.constructor) {
        case EmailAlreadyInUseError:
          throw new ConflictException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    this.logger.logBusinessEvent({
      action: 'register_success',
      resource: 'user',
      userId: email,
    })

    return { message: 'Usuário registrado com sucesso.' }
  }
}
