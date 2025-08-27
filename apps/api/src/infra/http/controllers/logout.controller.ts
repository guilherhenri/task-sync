import { Controller, Delete, HttpCode, Res } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import type { Response } from 'express'

import { LoggerPort } from '@/core/ports/logger'
import { TerminateSessionUseCase } from '@/domain/auth/application/use-cases/terminate-session'
import { CurrentUser } from '@/infra/auth/decorators/current-user'
import type { UserPayload } from '@/infra/auth/types/jwt-payload'
import { EnvService } from '@/infra/env/env.service'
import { MetricsService } from '@/infra/metrics/metrics.service'

import { JwtUnauthorizedResponse } from '../responses/jwt-unauthorized'

@ApiTags('auth')
@ApiBearerAuth()
@Controller('/sessions')
export class LogoutController {
  constructor(
    private readonly terminateSession: TerminateSessionUseCase,
    private readonly config: EnvService,
    private readonly logger: LoggerPort,
    private readonly metrics: MetricsService,
  ) {}

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
    this.logger.logBusinessEvent({
      action: 'session_end_attempt',
      resource: 'authentication',
      userId: user.sub,
    })
    this.metrics.businessEvents.labels('session_end', 'auth', 'attempt').inc()

    await this.terminateSession.execute({
      userId: user.sub,
    })

    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: this.config.get('NODE_ENV') === 'production',
      path: '/',
    })

    this.logger.logBusinessEvent({
      action: 'session_end_success',
      resource: 'authentication',
      userId: user.sub,
    })
    this.metrics.businessEvents.labels('session_end', 'auth', 'success').inc()

    return res.status(200).send()
  }
}
