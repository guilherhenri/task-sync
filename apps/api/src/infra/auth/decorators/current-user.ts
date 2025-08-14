import { createParamDecorator, type ExecutionContext } from '@nestjs/common'

import type { UserPayload } from '../types/jwt-payload'

export const CurrentUser = createParamDecorator(
  (_: never, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest()

    return request.user as UserPayload
  },
)
