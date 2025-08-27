import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  Res,
  UnauthorizedException,
} from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import type { Response } from 'express'
import { z } from 'zod/v4'

import { LoggerPort } from '@/core/ports/logger'
import { AuthenticateSessionUseCase } from '@/domain/auth/application/use-cases/authenticate-session'
import { InvalidCredentialsError } from '@/domain/auth/application/use-cases/errors/invalid-credentials'
import { Public } from '@/infra/auth/decorators/public'
import { EnvService } from '@/infra/env/env.service'
import { MetricsService } from '@/infra/metrics/metrics.service'

import {
  ApiZodBody,
  ApiZodUnauthorizedResponse,
  ApiZodValidationFailedResponse,
} from '../decorators/zod-openapi'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe'

const authenticateBodySchema = z.object({
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

const bodyValidationPipe = new ZodValidationPipe(authenticateBodySchema)

type AuthenticateBodySchema = z.infer<typeof authenticateBodySchema>
const authenticateBodyExample: AuthenticateBodySchema = {
  email: 'johndoe@email.com',
  password: '12345Ab@',
}
const authenticateBodyDescription: Record<
  keyof Omit<AuthenticateBodySchema, 'email'>,
  string
> = {
  password:
    'Senha deve ter no mínimo 8 caracteres, com maiúscula, minúscula, número e caractere especial.',
}

@ApiTags('auth')
@Controller('/sessions')
@Public()
export class AuthenticateController {
  constructor(
    private readonly authenticateSession: AuthenticateSessionUseCase,
    private readonly config: EnvService,
    private readonly logger: LoggerPort,
    private readonly metrics: MetricsService,
  ) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Authenticate session',
    description:
      'Authenticate session for a user with valid email and password.',
  })
  @ApiZodBody({
    schema: authenticateBodySchema,
    examples: authenticateBodyExample,
    description: authenticateBodyDescription,
  })
  @ApiResponse({
    status: 200,
    description: 'Session authenticated successfully.',
  })
  @ApiZodUnauthorizedResponse({
    description: 'Invalid credentials',
    custom: { message: 'E-mail ou senha inválidos.' },
  })
  @ApiZodValidationFailedResponse({
    description: 'Validation Failed',
    custom: { field: 'email', message: 'O e-mail deve ser válido.' },
  })
  async handle(
    @Body(bodyValidationPipe) body: AuthenticateBodySchema,
    @Res() res: Response,
  ) {
    this.logger.logBusinessEvent({
      action: 'login_attempt',
      resource: 'authentication',
      userId: body.email,
    })
    this.metrics.businessEvents.labels('login', 'auth', 'attempt').inc()

    const { email, password } = body

    const result = await this.authenticateSession.execute({
      email,
      password,
    })

    if (result.isLeft()) {
      const error = result.value

      this.logger.logBusinessEvent({
        action: 'login_failed',
        resource: 'authentication',
        userId: body.email,
        metadata: { reason: error.constructor.name },
      })
      this.metrics.businessEvents.labels('login', 'auth', 'failed').inc()

      switch (error.constructor) {
        case InvalidCredentialsError:
          throw new UnauthorizedException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    const { accessToken } = result.value

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: this.config.get('NODE_ENV') === 'production',
      path: '/',
      maxAge: 10 * 60 * 1000, // 10 minutes
      signed: true,
    })

    this.logger.logBusinessEvent({
      action: 'login_success',
      resource: 'authentication',
      userId: email,
    })
    this.metrics.businessEvents.labels('login', 'auth', 'success').inc()

    return res.status(200).send()
  }
}
