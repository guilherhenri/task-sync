import {
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JsonWebTokenError, TokenExpiredError } from '@nestjs/jwt'
import { AuthGuard } from '@nestjs/passport'

import { JwtAuthException } from '@/infra/http/exceptions/jwt-auth'

import { IS_PUBLIC_KEY } from '../decorators/public'
import type { UserPayload } from '../types/jwt-payload'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super()
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (isPublic) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const isRefreshRoute = request.url.includes('/auth/refresh')

    if (isRefreshRoute) {
      return true
    }

    return super.canActivate(context)
  }

  handleRequest<TUser = UserPayload>(
    err: Error | null,
    user: TUser | false,
    info: Error | null,
  ): TUser {
    if (err || !user) {
      switch (info?.constructor) {
        case TokenExpiredError:
          throw new JwtAuthException('token.expired', 'Token expirado.')
        case JsonWebTokenError:
          throw new JwtAuthException('token.invalid', 'Token inválido.')
        default:
          throw new UnauthorizedException({
            message: 'O token de acesso não foi informado.',
            error: 'Unauthorized',
            statusCode: 401,
          })
      }
    }

    return user
  }
}
