import { Injectable } from '@nestjs/common'

import { type Either, left, right } from '@/core/either'

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
  ) {}

  async execute({
    userId,
    fileName,
    fileType,
    body,
  }: UploadAndUpdateAvatarUseCaseRequest): Promise<UploadAndUpdateAvatarUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      return left(new ResourceNotFoundError('Usuário não encontrado.'))
    }

    const validFileType = /^image\/(png|jpg|jpeg|webp)$/

    if (!validFileType.test(fileType)) {
      return left(new InvalidAvatarTypeError(fileType))
    }

    if (user.avatarUrl) {
      await this.uploader.delete(user.avatarUrl)
    }

    const { url } = await this.uploader.upload({ fileName, fileType, body })

    user.avatarUrl = url

    await this.usersRepository.save(user)

    return right({ avatarUrl: url })
  }
}
