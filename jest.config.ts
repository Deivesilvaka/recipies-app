import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.json';

module.exports = {
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/src/',
  }),
  coverageDirectory: './coverage/unit',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  modulePathIgnorePatterns: ['node_modules'],
  testTimeout: 10000,
  collectCoverageFrom: ['<rootDir>/src/**/*.service.(ts|js)'],
  testMatch: ['<rootDir>/test/**/*unit.spec.(ts|js)'],
};
