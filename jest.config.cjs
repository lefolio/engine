/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/lib/**/*.test.ts', '<rootDir>/scripts/**/*.test.mjs'],
  clearMocks: true,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '\\.tsx?$': '<rootDir>/scripts/jest-transform.cjs',
  },
};
