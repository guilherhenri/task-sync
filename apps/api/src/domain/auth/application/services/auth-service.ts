import type { Either } from '@/core/either'

export interface AuthService {
  generateAccessToken(userId: string): string
  generateRefreshToken(userId: string): string
  verifyToken(token: string, type: 'access' | 'refresh'): Either<Error, unknown>
}
