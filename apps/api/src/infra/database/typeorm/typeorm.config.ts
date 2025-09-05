import path from 'node:path'

import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import type { SeederOptions } from 'typeorm-extension'

import type { EnvService } from '../../env/env.service'
import { User } from './entities/user.entity'

export const migrationsDir = path.resolve(__dirname, 'migrations')

export const typeOrmConfig = (
  config: EnvService,
): TypeOrmModuleOptions & SeederOptions => ({
  type: 'postgres',
  host: config.get('POSTGRES_HOST'),
  port: config.get('POSTGRES_PORT'),
  username: config.get('POSTGRES_USER'),
  password: config.get('POSTGRES_PASSWORD'),
  database: config.get('POSTGRES_DB'),
  schema: config.get('POSTGRES_SCHEMA'),
  entities: [User],
  migrations: [`${migrationsDir}/*{.ts,.js}`],
  seeds: [path.resolve(__dirname, 'seeds', '*.seeder{.ts,.js}')],
  seedTracking: false,
  factories: [path.resolve(__dirname, 'factories', '*.factory{.ts,.js}')],
  synchronize: config.get('NODE_ENV') === 'development',
  migrationsRun: config.get('NODE_ENV') === 'development',
  logging: config.get('NODE_ENV') === 'development' ? ['error', 'warn'] : false,
  extra: {
    family: 4,
  },
})

export default typeOrmConfig
