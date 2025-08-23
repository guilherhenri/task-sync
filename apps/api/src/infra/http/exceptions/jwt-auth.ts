import { UnauthorizedException } from '@nestjs/common'

import type { JwtUnauthorizedResponseSchema } from '../responses/jwt-unauthorized'

type JwtAuthExceptionCode = Exclude<
  JwtUnauthorizedResponseSchema['code'],
  undefined
>

export class JwtAuthException extends UnauthorizedException {
  constructor(code: JwtAuthExceptionCode, message: string) {
    super({
      code,
      message,
      error: 'Unauthorized',
      statusCode: 401,
    })
  }
}
