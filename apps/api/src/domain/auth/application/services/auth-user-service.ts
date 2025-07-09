import type { UniqueEntityID } from '@/core/entities/unique-entity-id'

export interface AuthUser {
  id: UniqueEntityID
  name: string
  email: string
}

export interface AuthUserService {
  getUserForEmailDelivery(id: string): Promise<AuthUser | null>
}
