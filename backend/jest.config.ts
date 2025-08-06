import type { Config } from 'jest';

const config: Config = {
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testEnvironment: 'node',
  moduleNameMapper: {
    '^layer-config$': '<rootDir>/layer-config/src/index.ts',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json', 'node'],
  setupFiles: ['<rootDir>/jest.setup.ts'],
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"], 
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}", 
    "!src/**/*.test.{ts,tsx}" // ignore test files
  ],
};

export default config;