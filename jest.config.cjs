/** @type {import('jest').Config} */
module.exports = {
  // Use 'node' environment for database/API tests
  // Use 'jsdom' for React component tests (can override per test file)
  testEnvironment: 'node',

  // Setup files run before each test suite
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],

  // Path aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },

  // TypeScript transformation
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        moduleResolution: 'node',
        resolveJsonModule: true,
      },
    }],
  },

  // File extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Test file patterns - supports both old and new structure
  testMatch: [
    '<rootDir>/src/tests/**/*.test.ts',
    '<rootDir>/src/tests/**/*.test.tsx',
    '<rootDir>/src/**/__tests__/**/*.(ts|tsx)',
    '<rootDir>/src/**/*.(test|spec).(ts|tsx)',
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.(ts|tsx)',
    '!src/**/*.d.ts',
    '!src/tests/**/*',
    '!src/**/__tests__/**/*',
  ],

  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],

  // Test timeout: 10 seconds
  testTimeout: 10000,

  // Verbose output
  verbose: true,

  // Coverage thresholds for critical code
  coverageThreshold: {
    './src/lib/**/*.ts': {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};