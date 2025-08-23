import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Res,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import type { Response } from 'express'

import { RefreshTokenExpiredError } from '@/domain/auth/application/use-cases/errors/refresh-token-expired'
import { ResourceNotFoundError } from '@/domain/auth/application/use-cases/errors/resource-not-found'
import { RenewTokenUseCase } from '@/domain/auth/application/use-cases/renew-token'
import { CurrentUser } from '@/infra/auth/decorators/current-user'
import { JwtRefreshAuthGuard } from '@/infra/auth/guards/jwt-refresh-auth.guard'
import type { UserPayload } from '@/infra/auth/types/jwt-payload'
import { EnvService } from '@/infra/env/env.service'
import { JwtUnauthorizedResponse } from '@/infra/http/responses/jwt-unauthorized'

import { ApiZodNotFoundResponse } from '../decorators/zod-openapi'
import { JwtAuthException } from '../exceptions/jwt-auth'

@ApiTags('auth')
@ApiBearerAuth()
@Controller('/auth/refresh')
@UseGuards(JwtRefreshAuthGuard)
export class RefreshTokenController {
  constructor(
    private readonly renewToken: RenewTokenUseCase,
    private readonly config: EnvService,
  ) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Get a new access token from refresh token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Session renewed successfully.',
  })
  @ApiZodNotFoundResponse({
    description: 'Resource not found',
    custom: { message: 'Token não encontrado.' },
  })
  @JwtUnauthorizedResponse()
  async handle(@CurrentUser() user: UserPayload, @Res() res: Response) {
    const result = await this.renewToken.execute({
      userId: user.sub,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        case RefreshTokenExpiredError:
          throw new JwtAuthException('refresh.expired', error.message)
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

    return res.status(200).send()
  }
}
