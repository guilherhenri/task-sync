import { Controller, Delete, HttpCode, Res } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import type { Response } from 'express'

import { TerminateSessionUseCase } from '@/domain/auth/application/use-cases/terminate-session'
import { CurrentUser } from '@/infra/auth/decorators/current-user'
import type { UserPayload } from '@/infra/auth/types/jwt-payload'
import { EnvService } from '@/infra/env/env.service'
import { ObservableController } from '@/infra/observability/observable-controller'

import { JwtUnauthorizedResponse } from '../responses/jwt-unauthorized'

@ApiTags('auth')
@ApiBearerAuth()
@Controller('/sessions')
export class LogoutController extends ObservableController {
  constructor(
    private readonly terminateSession: TerminateSessionUseCase,
    private readonly config: EnvService,
  ) {
    super()
  }

  @Delete()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Terminate session',
    description: 'Delete refresh token and terminate session.',
  })
  @ApiResponse({
    status: 200,
    description: 'Session ended successfully.',
  })
  @JwtUnauthorizedResponse()
  async handle(@CurrentUser() user: UserPayload, @Res() res: Response) {
    return this.trackOperation(
      async () => {
        await this.terminateSession.execute({
          userId: user.sub,
        })

        res.clearCookie('accessToken', {
          httpOnly: true,
          secure: this.config.get('NODE_ENV') === 'production',
          path: '/',
        })

        return res.status(200).send()
      },
      { action: 'session_end', resource: 'auth', userIdentifier: user.sub },
    )
  }
}
