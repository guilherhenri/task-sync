import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { TypeOrmModule } from '@nestjs/typeorm'

import { UsersRepository } from '@/domain/auth/application/repositories/users-repository'
import { EmailRequestsRepository } from '@/domain/email/application/repositories/email-requests-repository'

import { EnvModule } from '../env/env.module'
import { EnvService } from '../env/env.service'
import { MetricsModule } from '../metrics/metrics.module'
import { mongooseConfig } from './mongoose/mongoose.config'
import { MongooseService } from './mongoose/mongoose.service'
import { MongooseEmailRequestsRepository } from './mongoose/repositories/mongoose-email-requests-repository'
import { TypeOrmUsersRepository } from './typeorm/repositories/typeorm-users-repository'
import typeOrmConfig from './typeorm/typeorm.config'
import { TypeOrmService } from './typeorm/typeorm.service'

@Module({
  imports: [
    MetricsModule,
    TypeOrmModule.forRootAsync({
      imports: [EnvModule],
      useFactory: typeOrmConfig,
      inject: [EnvService],
    }),
    MongooseModule.forRootAsync({
      imports: [EnvModule],
      useFactory: mongooseConfig,
      inject: [EnvService],
    }),
  ],
  providers: [
    TypeOrmService,
    MongooseService,
    {
      provide: UsersRepository,
      useClass: TypeOrmUsersRepository,
    },
    {
      provide: EmailRequestsRepository,
      useClass: MongooseEmailRequestsRepository,
    },
  ],
  exports: [
    TypeOrmService,
    MongooseService,
    UsersRepository,
    EmailRequestsRepository,
  ],
})
export class DatabaseModule {}
