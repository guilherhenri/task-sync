import { PasswordHash } from './password-hash'

it('should be able to create a valid password hash', async () => {
  const plaintext = '123456'

  const passwordHash = await PasswordHash.create(plaintext)

  expect(passwordHash.value).not.toBeNaN()
  expect(passwordHash.value).not.toEqual(plaintext)
  expect(await passwordHash.verify(plaintext)).toBeTruthy()
  expect(await passwordHash.verify(`other-${plaintext}`)).toBeFalsy()
})
