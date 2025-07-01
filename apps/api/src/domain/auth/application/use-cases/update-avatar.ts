import { type Either, left, right } from '@/core/either'

import type { UsersRepository } from '../repositories/users-repository'

interface UpdateAvatarUseCaseRequest {
  userId: string
  avatarUrl: string
}

type UpdateAvatarUseCaseResponse = Either<Error, unknown>

export class UpdateAvatarUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    userId,
    avatarUrl,
  }: UpdateAvatarUseCaseRequest): Promise<UpdateAvatarUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      return left(new Error('Usuário não encontrado.'))
    }

    const validURL =
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/

    if (!validURL.test(avatarUrl)) {
      return left(new Error('URL inválida.'))
    }

    user.avatarUrl = avatarUrl

    await this.usersRepository.save(user)

    return right({})
  }
}
