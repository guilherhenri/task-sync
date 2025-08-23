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
    '^chalk$': '<rootDir>/test/mocks/chalk.ts',
  },
  transform: {
    ...tsJestTransformCfg,
  },
  testMatch: ['**/*.e2e-spec.ts'],
  setupFilesAfterEnv: ['<rootDir>/test/setup-e2e.ts'],
})
