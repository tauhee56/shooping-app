/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  setupFiles: ['<rootDir>/tests/jest-env.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  testTimeout: 30000,
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json',
      isolatedModules: true,
      diagnostics: false,
    },
  },
};
