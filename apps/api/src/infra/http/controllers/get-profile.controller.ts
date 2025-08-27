import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { z } from 'zod/v4'

import { LoggerPort } from '@/core/ports/logger'
import { ResourceNotFoundError } from '@/domain/auth/application/use-cases/errors/resource-not-found'
import { RetrieveProfileUseCase } from '@/domain/auth/application/use-cases/retrieve-profile'
import { CurrentUser } from '@/infra/auth/decorators/current-user'
import type { UserPayload } from '@/infra/auth/types/jwt-payload'
import { MetricsService } from '@/infra/metrics/metrics.service'

import {
  ApiZodNotFoundResponse,
  ApiZodResponse,
} from '../decorators/zod-openapi'
import { UserPresenter } from '../presenters/user-presenter'
import { JwtUnauthorizedResponse } from '../responses/jwt-unauthorized'

const getProfileResponseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.email(),
  avatar_url: z.url().nullable(),
  created_at: z.date(),
})

const getProfileResponseExample: z.infer<typeof getProfileResponseSchema> = {
  id: '81c92405-6e1e-4cf3-94a6-169a04e959ef',
  name: 'John Doe',
  email: 'johndoe@email.com',
  avatar_url: null,
  created_at: new Date(),
}

@ApiTags('auth')
@ApiBearerAuth()
@Controller('/me')
export class GetProfileController {
  constructor(
    private readonly retrieveProfile: RetrieveProfileUseCase,
    private readonly logger: LoggerPort,
    private readonly metrics: MetricsService,
  ) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Get profile',
    description: 'Retrieve the authenticate user profile.',
  })
  @ApiZodResponse({
    status: 200,
    schema: getProfileResponseSchema,
    examples: getProfileResponseExample,
  })
  @ApiZodNotFoundResponse({
    description: 'User not found.',
    custom: { message: 'Usuário não encontrado.' },
  })
  @JwtUnauthorizedResponse()
  async handle(@CurrentUser() user: UserPayload) {
    this.logger.logBusinessEvent({
      action: 'get_profile_attempt',
      resource: 'profile',
      userId: user.sub,
    })
    this.metrics.businessEvents
      .labels('get_profile', 'profile', 'attempt')
      .inc()

    const result = await this.retrieveProfile.execute({
      userId: user.sub,
    })

    if (result.isLeft()) {
      const error = result.value

      this.logger.logBusinessEvent({
        action: 'get_profile_failed',
        resource: 'profile',
        userId: user.sub,
        metadata: { reason: error.constructor.name },
      })
      this.metrics.businessEvents
        .labels('get_profile', 'profile', 'failed')
        .inc()

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    const profile = result.value.user

    this.logger.logBusinessEvent({
      action: 'get_profile_success',
      resource: 'profile',
      userId: user.sub,
    })
    this.metrics.businessEvents
      .labels('get_profile', 'profile', 'success')
      .inc()

    return { profile: UserPresenter.toHTTP(profile) }
  }
}
