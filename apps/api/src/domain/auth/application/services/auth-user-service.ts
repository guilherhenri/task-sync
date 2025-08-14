import type { UniqueEntityID } from '@/core/entities/unique-entity-id'

export interface AuthUser {
  id: UniqueEntityID
  name: string
  email: string
}

export abstract class AuthUserService {
  abstract getUserForEmailDelivery(id: string): Promise<AuthUser | null>
}
