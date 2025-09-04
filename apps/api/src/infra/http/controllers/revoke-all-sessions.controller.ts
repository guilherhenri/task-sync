import { Controller, HttpCode, Post, Res } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import type { Response } from 'express'
import { z } from 'zod/v4'

import { RevokeTokensUseCase } from '@/domain/auth/application/use-cases/revoke-tokens'
import { CurrentUser } from '@/infra/auth/decorators/current-user'
import type { UserPayload } from '@/infra/auth/types/jwt-payload'
import { EnvService } from '@/infra/env/env.service'
import { ObservableController } from '@/infra/observability/observable-controller'

import { ApiZodResponse } from '../decorators/zod-openapi'
import { JwtUnauthorizedResponse } from '../responses/jwt-unauthorized'

const revokeAllSessionsResponseSchema = z.object({
  message: z.string(),
})

@ApiTags('auth')
@ApiBearerAuth()
@Controller('/sessions/revoke-all')
export class RevokeAllSessionsController extends ObservableController {
  constructor(
    private readonly revokeTokens: RevokeTokensUseCase,
    private readonly config: EnvService,
  ) {
    super()
  }

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
    return this.trackOperation(
      async () => {
        await this.revokeTokens.execute({
          userId: user.sub,
        })

        res.clearCookie('accessToken', {
          httpOnly: true,
          secure: this.config.get('NODE_ENV') === 'production',
          path: '/',
        })

        return res
          .status(200)
          .send({ message: 'Todos os dispositivos foram desconectados.' })
      },
      { action: 'mass_logout', resource: 'auth', userIdentifier: user.sub },
    )
  }
}
