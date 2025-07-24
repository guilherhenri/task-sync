import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { UsersRepository } from '@/domain/auth/application/repositories/users-repository'

import { EnvModule } from '../env/env.module'
import { EnvService } from '../env/env.service'
import { TypeOrmUsersRepository } from './typeorm/repositories/typeorm-users-repository'
import typeOrmConfig from './typeorm/typeorm.config'
import { TypeOrmService } from './typeorm/typeorm.service'

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [EnvModule],
      useFactory: typeOrmConfig,
      inject: [EnvService],
    }),
  ],
  providers: [
    TypeOrmService,
    {
      provide: UsersRepository,
      useClass: TypeOrmUsersRepository,
    },
  ],
  exports: [TypeOrmService, UsersRepository],
})
export class DatabaseModule {}
