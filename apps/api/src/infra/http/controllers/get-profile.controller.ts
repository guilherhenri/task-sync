import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { z } from 'zod/v4'

import { ResourceNotFoundError } from '@/domain/auth/application/use-cases/errors/resource-not-found'
import { RetrieveProfileUseCase } from '@/domain/auth/application/use-cases/retrieve-profile'
import { CurrentUser } from '@/infra/auth/decorators/current-user'
import type { UserPayload } from '@/infra/auth/types/jwt-payload'
import { ObservableController } from '@/infra/observability/observable-controller'

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
export class GetProfileController extends ObservableController {
  constructor(private readonly retrieveProfile: RetrieveProfileUseCase) {
    super()
  }

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
    return this.trackOperation(
      async () => {
        const result = await this.retrieveProfile.execute({
          userId: user.sub,
        })

        if (result.isLeft()) {
          const error = result.value

          switch (error.constructor) {
            case ResourceNotFoundError:
              throw new NotFoundException(error.message)
            default:
              throw new BadRequestException(error.message)
          }
        }

        const profile = result.value.user

        return { profile: UserPresenter.toHTTP(profile) }
      },
      { action: 'get_profile', resource: 'profile', userIdentifier: user.sub },
    )
  }
}
