import { Module } from '@nestjs/common'

import { Hasher } from '@/domain/auth/application/cryptography/hasher'

import { BcryptHasher } from './bcrypt-hasher'

@Module({
  providers: [{ provide: Hasher, useClass: BcryptHasher }],
  exports: [Hasher],
})
export class CryptographyModule {}
