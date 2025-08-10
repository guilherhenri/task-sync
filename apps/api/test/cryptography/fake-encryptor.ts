import type { Encryptor } from '@/domain/auth/application/cryptography/encryptor'

export class FakeEncryptor implements Encryptor {
  async encrypt(payload: Record<string, unknown>): Promise<string> {
    return JSON.stringify(payload)
  }
}
