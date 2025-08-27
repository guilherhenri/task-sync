import {
  BadRequestException,
  Controller,
  HttpCode,
  NotFoundException,
  ParseFilePipe,
  Post,
  UnsupportedMediaTypeException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger'
import { z } from 'zod/v4'

import { LoggerPort } from '@/core/ports/logger'
import { InvalidAvatarTypeError } from '@/domain/auth/application/use-cases/errors/invalid-avatar-type'
import { ResourceNotFoundError } from '@/domain/auth/application/use-cases/errors/resource-not-found'
import { UploadAndUpdateAvatarUseCase } from '@/domain/auth/application/use-cases/upload-and-update-avatar'
import { CurrentUser } from '@/infra/auth/decorators/current-user'
import type { UserPayload } from '@/infra/auth/types/jwt-payload'
import { EnvService } from '@/infra/env/env.service'
import { MetricsService } from '@/infra/metrics/metrics.service'

import {
  ApiZodBody,
  ApiZodNotFoundResponse,
  ApiZodResponse,
  ApiZodUnsupportedMediaTypeResponse,
  ApiZodValidationFailedResponse,
} from '../decorators/zod-openapi'
import { JwtUnauthorizedResponse } from '../responses/jwt-unauthorized'
import {
  FormattedFileTypeValidator,
  ReadableMaxFileSizeValidator,
} from '../validators/file-upload-validators'

const uploadAvatarBodySchema = z.object({
  file: z.instanceof(File).refine((file) => {
    const validTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp']
    return validTypes.includes(file.type)
  }),
})

const uploadAvatarResponseSchema = z.object({
  avatar_url: z.string(),
})

const uploadAvatarBodyDescription: Record<
  keyof z.infer<typeof uploadAvatarBodySchema>,
  string
> = {
  file: 'Uma imagem de até 2MB nos tipos png, jpg, jpeg ou webp',
}

@ApiTags('auth')
@Controller('/upload-avatar')
export class UploadAvatarController {
  constructor(
    private readonly uploadAndUpdateAvatar: UploadAndUpdateAvatarUseCase,
    private readonly config: EnvService,
    private readonly logger: LoggerPort,
    private readonly metrics: MetricsService,
  ) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Upload avatar',
    description: "Upload am image for user's avatar.",
  })
  @ApiConsumes('multipart/form-data')
  @ApiZodBody({
    schema: uploadAvatarBodySchema,
    description: uploadAvatarBodyDescription,
  })
  @ApiZodResponse({
    status: 200,
    description: 'Avatar uploaded',
    schema: uploadAvatarResponseSchema,
    examples: {
      avatar_url: '1b25c2e2-9ba2-4fd7-b2a0-28e3bae7d527-1755190078399.jpeg',
    },
  })
  @ApiZodNotFoundResponse({
    description: 'Resource not found',
    custom: { message: 'Usuário não encontrado.' },
  })
  @ApiZodUnsupportedMediaTypeResponse({ description: 'Invalid media type' })
  @ApiZodValidationFailedResponse({
    description: 'Validation Failed',
    custom: {
      field: 'file',
      message: 'O arquivo excede o tamanho máximo permitido de 2MB.',
    },
  })
  @JwtUnauthorizedResponse()
  @UseInterceptors(FileInterceptor('file'))
  async handle(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: UserPayload,
  ) {
    const parsePipe = new ParseFilePipe({
      validators: [
        new ReadableMaxFileSizeValidator({
          maxSize: 1024 * 1024 * 2, // 2MB
        }),
        new FormattedFileTypeValidator({
          fileType: '.(png|jpg|jpeg|webp)',
          skipMagicNumbersValidation: this.config.get('NODE_ENV') === 'test',
        }),
      ],
      exceptionFactory: (error) => {
        const isFileMissing = error.includes('File is required')

        const message = isFileMissing
          ? 'Nenhum arquivo foi enviado. Por favor, envie um arquivo.'
          : error

        return new BadRequestException({
          message,
          statusCode: 400,
          errors: {
            type: 'validation',
            details: [
              {
                filed: 'file',
                message: isFileMissing ? 'Arquivo é obrigatório.' : message,
              },
            ],
          },
        })
      },
    })

    file = await parsePipe.transform(file)

    this.logger.logBusinessEvent({
      action: 'avatar_upload_attempt',
      resource: 'profile',
      userId: user.sub,
      metadata: { fileSize: file.size },
    })
    this.metrics.businessEvents
      .labels('avatar_upload', 'profile', 'attempt')
      .inc()

    const result = await this.uploadAndUpdateAvatar.execute({
      userId: user.sub,
      fileName: file.originalname,
      fileType: file.mimetype,
      body: file.buffer,
    })

    if (result.isLeft()) {
      const error = result.value

      this.logger.logBusinessEvent({
        action: 'avatar_upload_failed',
        resource: 'profile',
        userId: user.sub,
        metadata: { reason: error.constructor.name },
      })
      this.metrics.businessEvents
        .labels('avatar_upload', 'profile', 'failed')
        .inc()

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        case InvalidAvatarTypeError:
          throw new UnsupportedMediaTypeException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    const { avatarUrl } = result.value

    this.logger.logBusinessEvent({
      action: 'avatar_upload_success',
      resource: 'profile',
      userId: user.sub,
    })
    this.metrics.businessEvents
      .labels('avatar_upload', 'profile', 'success')
      .inc()

    return { avatar_url: avatarUrl }
  }
}
