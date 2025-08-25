import { Injectable } from '@nestjs/common'

import { type Either, left, right } from '@/core/either'
import { LoggerPort } from '@/core/ports/logger'

import { UsersRepository } from '../repositories/users-repository'
import { FileStorage } from '../storage/file-storage'
import { InvalidAvatarTypeError } from './errors/invalid-avatar-type'
import { ResourceNotFoundError } from './errors/resource-not-found'

interface UploadAndUpdateAvatarUseCaseRequest {
  userId: string
  fileName: string
  fileType: string
  body: Buffer
}

type UploadAndUpdateAvatarUseCaseResponse = Either<
  ResourceNotFoundError | InvalidAvatarTypeError,
  { avatarUrl: string }
>

@Injectable()
export class UploadAndUpdateAvatarUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private uploader: FileStorage,
    private logger: LoggerPort,
  ) {}

  async execute({
    userId,
    fileName,
    fileType,
    body,
  }: UploadAndUpdateAvatarUseCaseRequest): Promise<UploadAndUpdateAvatarUseCaseResponse> {
    const startTime = Date.now()

    const user = await this.usersRepository.findById(userId)

    if (!user) {
      const error = new ResourceNotFoundError('Usuário não encontrado.')

      this.logger.logPerformance({
        operation: 'upload_and_update_avatar',
        duration: Date.now() - startTime,
        success: false,
        metadata: {
          userId,
          error: error.message,
        },
      })

      return left(error)
    }

    const validFileType = /^image\/(png|jpg|jpeg|webp)$/

    if (!validFileType.test(fileType)) {
      const error = new InvalidAvatarTypeError(fileType)

      this.logger.logPerformance({
        operation: 'upload_and_update_avatar',
        duration: Date.now() - startTime,
        success: false,
        metadata: {
          userId,
          error: error.message,
        },
      })

      return left(error)
    }

    if (user.avatarUrl) {
      await this.uploader.delete(user.avatarUrl)
    }

    const { url } = await this.uploader.upload({ fileName, fileType, body })

    user.avatarUrl = url

    await this.usersRepository.save(user)

    this.logger.logPerformance({
      operation: 'upload_and_update_avatar',
      duration: Date.now() - startTime,
      success: true,
      metadata: { userId },
    })

    return right({ avatarUrl: url })
  }
}
