import { randomUUID } from 'node:crypto'

import { env } from '@task-sync/env'
import { Redis } from 'ioredis'
import mongoose from 'mongoose'

import { DomainEvents } from '@/core/events/domain-events'
import dataSource from '@/infra/database/typeorm/data-source'

jest.mock('@task-sync/env', () => ({
  env: {
    ...process.env,
    NODE_ENV: 'test',
    REDIS_DB: 1,
    MONGO_DB: randomUUID(),
    POSTGRES_SCHEMA: randomUUID(),
  },
}))

const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  db: env.REDIS_DB,
})

beforeAll(async () => {
  await dataSource.initialize()
  await dataSource.query(`CREATE SCHEMA IF NOT EXISTS "${env.POSTGRES_SCHEMA}"`)
  await dataSource.query(
    `CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA "${env.POSTGRES_SCHEMA}"`,
  )
  await dataSource.query(`SET search_path TO "${env.POSTGRES_SCHEMA}", public`)
  await dataSource.runMigrations()

  DomainEvents.shouldRun = false

  await redis.flushdb()
})

afterAll(async () => {
  await dataSource.query(
    `DROP SCHEMA IF EXISTS "${env.POSTGRES_SCHEMA}" CASCADE`,
  )
  await dataSource.destroy()

  await redis.flushdb()
  await redis.quit()

  const mongo = await mongoose.connect(env.MONGO_URI, {
    dbName: env.MONGO_DB,
    auth: {
      username: env.MONGO_USERNAME,
      password: env.MONGO_PASSWORD,
    },
  })
  await mongo.connection.db?.dropDatabase()
  await mongo.disconnect()
})
