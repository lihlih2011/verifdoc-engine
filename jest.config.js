/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Optional: if you have specific test file patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.ts',
  ],
  // Optional: if you need to ignore specific files
  testPathIgnorePatterns: [
    '/node_modules/',
  ],
  // Optional: if you need to setup anything before tests run
  setupFilesAfterEnv: [],
};