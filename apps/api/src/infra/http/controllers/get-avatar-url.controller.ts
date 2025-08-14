import { Controller, Get, HttpCode, Param } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { z } from 'zod/v4'

import { FileAccessController } from '@/domain/auth/application/storage/file-access-controller'

import {
  ApiZodParam,
  ApiZodResponse,
  ApiZodValidationFailedResponse,
} from '../decorators/zod-openapi'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe'
import { JwtUnauthorizedResponse } from '../responses/jwt-unauthorized'

const getAvatarUrlParamSchema = z.object({
  key: z
    .string('O nome do arquivo é obrigatório.')
    .min(1, 'O nome do arquivo é obrigatório.')
    .regex(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-[0-9]+.(jpeg|jpg|png|gif)$/i,
      'O nome do arquivo deve seguir o formato: UUID-timestamp.ext (ex.: 1b25c2e2-9ba2-4fd7-b2a0-28e3bae7d527-1755190078399.jpeg).',
    ),
})

const paramValidationPipe = new ZodValidationPipe(getAvatarUrlParamSchema)

type GetAvatarUrlParamSchema = z.infer<typeof getAvatarUrlParamSchema>

const getAvatarUrlResponseSchema = z.object({
  url: z.url(),
  expires_at: z.date(),
})

@ApiTags('auth')
@Controller('/avatar/url/:key')
export class GetAvatarUrlController {
  constructor(private readonly fileAccessController: FileAccessController) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Get avatar url',
    description: 'Get a signed url from key.',
  })
  @ApiZodParam({
    name: 'key',
    schema: getAvatarUrlParamSchema,
    examples: {
      key: '1b25c2e2-9ba2-4fd7-b2a0-28e3bae7d527-1755190078399.jpeg',
    },
  })
  @ApiZodResponse({
    status: 200,
    description: 'Signed url',
    schema: getAvatarUrlResponseSchema,
    examples: {
      url: 'https://ikymydawqkfwfaydz.supabase.co/storage/v1/object/sign/user-avatars/1b25...6pw',
      expires_at: '2025-08-15T22:00:38.068Z',
    },
  })
  @ApiZodValidationFailedResponse({
    description: 'Validation failed',
    custom: { field: 'key', message: 'O nome do arquivo é obrigatório.' },
  })
  @JwtUnauthorizedResponse()
  async handle(@Param(paramValidationPipe) query: GetAvatarUrlParamSchema) {
    const { key } = query
    const expiresIn = 24 * 60 * 60 // 24h in seconds

    const signedUrl = await this.fileAccessController.getSignedUrl(
      key,
      expiresIn,
    )

    return {
      url: signedUrl,
      expires_at: new Date(Date.now() + expiresIn * 1000), // 24h in milliseconds
    }
  }
}
