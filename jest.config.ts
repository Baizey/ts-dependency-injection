type JestConfig = import('@jest/types').Config.InitialOptions

const config: JestConfig = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	modulePathIgnorePatterns: ['<rootDir>/lib/', '<rootDir>/coverage/'],
	collectCoverageFrom: ['src/**/*.ts'],
}

module.exports = config