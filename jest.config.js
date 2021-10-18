module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir>/lib/', '<rootDir>/coverage/'],
  collectCoverageFrom: ['src/**/*.{ts,js}'],
};
