import { makeUser } from '@test/factories/make-user'
import { InMemoryUsersRepository } from '@test/repositories/in-memory-users-repository'
import { InMemoryTokenService } from '@test/services/in-memory-token-service'

import { InitiatePasswordRecoveryUseCase } from './initiate-password-recovery'

let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryTokenService: InMemoryTokenService
let sut: InitiatePasswordRecoveryUseCase

describe('Initiate Password Recovery Use-case', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryTokenService = new InMemoryTokenService()
    sut = new InitiatePasswordRecoveryUseCase(
      inMemoryUsersRepository,
      inMemoryTokenService,
    )
  })

  it('should be able to initialize password recovery for a valid email', async () => {
    const user = await makeUser({ email: 'example@email.com' })
    user.verifyEmail()
    inMemoryUsersRepository.items.push(user)

    const response = await sut.execute({ email: 'example@email.com' })

    expect(response.isRight()).toBeTruthy()
    expect(inMemoryTokenService.items.size).toEqual(1)
  })

  it('should not be able to initialize password recovery for an unverified email', async () => {
    const user = await makeUser({ email: 'example@email.com' })
    inMemoryUsersRepository.items.push(user)

    const response = await sut.execute({ email: 'example@email.com' })

    expect(response.isLeft()).toBeTruthy()
    expect(response.value).toHaveProperty(
      'message',
      'Este endereço de e-mail ainda não foi verificado, por favor cheque seu e-mail.',
    )
    expect(inMemoryTokenService.items.size).toEqual(0)
  })

  it('should not be able to initialize password recovery for an invalid email and not return an error', async () => {
    const response = await sut.execute({ email: 'example@email.com' })

    expect(response.isRight()).toBeTruthy()
    expect(inMemoryTokenService.items.size).toEqual(0)
  })
})
