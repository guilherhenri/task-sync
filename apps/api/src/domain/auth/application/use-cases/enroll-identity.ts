import { createHash, randomUUID } from 'node:crypto'

import { type Either, left, right } from '@/core/either'

import { User } from '../../enterprise/entities/user'
import type { UsersRepository } from '../repositories/users-repository'
import type { TokenService } from '../services/token-service'

interface EnrollIdentityUseCaseRequest {
  name: string
  email: string
  password: string
  avatarUrl?: string
}

type EnrollIdentityUseCaseResponse = Either<Error, { user: User }>

export class EnrollIdentityUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private tokenService: TokenService,
  ) {}

  async execute({
    name,
    email,
    password,
    avatarUrl,
  }: EnrollIdentityUseCaseRequest): Promise<EnrollIdentityUseCaseResponse> {
    const emailAlreadyInUse = await this.usersRepository.findByEmail(email)

    if (emailAlreadyInUse) {
      return left(new Error('Este e-mail já está em uso.'))
    }

    const user = await User.create({
      name,
      email,
      password,
      avatarUrl,
    })

    await this.usersRepository.create(user)

    const token = randomUUID()
    const tokenHash = createHash('sha256').update(token).digest('hex')
    const key = `email:verify:${tokenHash}`

    const twentyFourHoursInSeconds = 24 * 60 * 60

    const value = JSON.stringify({
      userId: user.id.toString(),
      expiresAt: new Date(
        Date.now() + twentyFourHoursInSeconds * 1000,
      ).toISOString(),
    })

    await this.tokenService.save(key, value, twentyFourHoursInSeconds)

    return right({ user })
  }
}
