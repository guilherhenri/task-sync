import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JsonWebTokenError } from '@nestjs/jwt'
import { AuthGuard } from '@nestjs/passport'

import { JwtAuthException } from '@/infra/http/exceptions/jwt-auth'

import type { UserPayload } from '../types/jwt-payload'

@Injectable()
export class JwtRefreshAuthGuard extends AuthGuard('jwt-refresh') {
  handleRequest<TUser = UserPayload>(
    err: Error | null,
    user: TUser | false,
    info: Error | null,
  ): TUser {
    if (err || !user) {
      switch (info?.constructor) {
        case JsonWebTokenError:
          throw new JwtAuthException('token.invalid', 'Token inválido.')
        default:
          throw new UnauthorizedException()
      }
    }

    return user
  }
}
