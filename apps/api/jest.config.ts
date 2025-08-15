import type { Config } from 'jest'
import { createDefaultPreset } from 'ts-jest'

const tsJestTransformCfg = createDefaultPreset().transform

export default async (): Promise<Config> => ({
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@test/(.*)$': '<rootDir>/test/$1',
    '^@task-sync/email-templates$':
      '<rootDir>/test/mocks/@task-sync/email-templates.ts',
  },
  coveragePathIgnorePatterns: [
    'redis.service.ts',
    'redis-auth-token-mapper.ts',
    'redis-auth-token-mapper.ts',
    'redis-verification-token-mapper.ts',
    'typeorm.service.ts',
    'typeorm-user-mapper.ts',
    'user.entity.ts',
  ],
  transform: {
    ...tsJestTransformCfg,
  },
})
