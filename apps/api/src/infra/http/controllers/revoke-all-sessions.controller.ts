import { Controller, HttpCode, Post, Res } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import type { Response } from 'express'
import { z } from 'zod/v4'

import type { LoggerPort } from '@/core/ports/logger'
import { RevokeTokensUseCase } from '@/domain/auth/application/use-cases/revoke-tokens'
import { CurrentUser } from '@/infra/auth/decorators/current-user'
import type { UserPayload } from '@/infra/auth/types/jwt-payload'
import { EnvService } from '@/infra/env/env.service'

import { ApiZodResponse } from '../decorators/zod-openapi'
import { JwtUnauthorizedResponse } from '../responses/jwt-unauthorized'

const revokeAllSessionsResponseSchema = z.object({
  message: z.string(),
})

@ApiTags('auth')
@ApiBearerAuth()
@Controller('/sessions/revoke-all')
export class RevokeAllSessionsController {
  constructor(
    private readonly revokeTokens: RevokeTokensUseCase,
    private readonly config: EnvService,
    private readonly logger: LoggerPort,
  ) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Revoke all sessions',
    description: 'Revoke all token sessions from user.',
  })
  @ApiZodResponse({
    status: 200,
    schema: revokeAllSessionsResponseSchema,
    examples: { message: 'Todos os dispositivos foram desconectados.' },
  })
  @JwtUnauthorizedResponse()
  async handle(@CurrentUser() user: UserPayload, @Res() res: Response) {
    this.logger.logBusinessEvent({
      action: 'mass_logout_attempt',
      resource: 'authentication',
      userId: user.sub,
    })

    await this.revokeTokens.execute({
      userId: user.sub,
    })

    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: this.config.get('NODE_ENV') === 'production',
      path: '/',
    })

    this.logger.logBusinessEvent({
      action: 'mass_logout_success',
      resource: 'authentication',
      userId: user.sub,
    })

    return res
      .status(200)
      .send({ message: 'Todos os dispositivos foram desconectados.' })
  }
}
