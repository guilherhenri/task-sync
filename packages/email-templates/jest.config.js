export default {
  testEnvironment: 'jsdom',
  modulePathIgnorePatterns: ['<rootDir>/.react-email/', '<rootDir>/dist/'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
        useESM: true,
      },
    ],
  },
}
