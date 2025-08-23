import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { Encryptor } from '@/domain/auth/application/cryptography/encryptor'

@Injectable()
export class JwtEncryptor implements Encryptor {
  constructor(private jwtService: JwtService) {}

  encrypt(payload: Record<string, unknown>): Promise<string> {
    return this.jwtService.signAsync(payload)
  }
}
