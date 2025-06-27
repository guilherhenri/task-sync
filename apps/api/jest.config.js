import { createDefaultPreset } from 'ts-jest'

const tsJestTransformCfg = createDefaultPreset().transform

export default {
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@test/(.*)$': '<rootDir>/test/$1',
  },
  transform: {
    ...tsJestTransformCfg,
  },
}
