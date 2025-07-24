import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { EnvModule } from '../env/env.module'
import { EnvService } from '../env/env.service'
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
  providers: [TypeOrmService],
  exports: [TypeOrmService],
})
export class DatabaseModule {}
