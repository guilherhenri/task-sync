import * as jwt from 'jsonwebtoken'

import { type Either, left, right } from '@/core/either'
import type { AuthService } from '@/domain/auth/application/services/auth-service'

export class InMemoryAuthService implements AuthService {
  private readonly accessSecret = 'test-access-secret'
  private readonly refreshSecret = 'test-refresh-secret'

  generateAccessToken(
    userId: string,
    expiresIn: jwt.SignOptions['expiresIn'] = '15m',
  ): string {
    return jwt.sign({ sub: userId, type: 'access' }, this.accessSecret, {
      expiresIn,
    })
  }

  generateRefreshToken(
    userId: string,
    expiresIn: jwt.SignOptions['expiresIn'] = '7d',
  ): string {
    return jwt.sign({ sub: userId, type: 'refresh' }, this.refreshSecret, {
      expiresIn,
    })
  }

  verifyToken(
    token: string,
    type: 'access' | 'refresh',
  ): Either<Error, unknown> {
    const secret = type === 'access' ? this.accessSecret : this.refreshSecret

    try {
      jwt.verify(token, secret)
    } catch {
      return left(Error('Token inválido.'))
    }

    return right({})
  }
}
