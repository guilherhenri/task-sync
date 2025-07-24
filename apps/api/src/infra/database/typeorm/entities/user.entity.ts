import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({
    type: 'varchar',
    name: 'name',
  })
  name: string

  @Column({
    type: 'varchar',
    name: 'email',
    unique: true,
  })
  email: string

  @Column({
    type: 'varchar',
    name: 'password_hash',
  })
  passwordHash: string

  @Column({
    type: 'varchar',
    name: 'avatar_url',
    nullable: true,
  })
  avatarUrl: string | null

  @Column({
    type: 'boolean',
    name: 'email_verified',
    default: false,
  })
  emailVerified: boolean

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date
}
