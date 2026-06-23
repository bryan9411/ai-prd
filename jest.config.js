/** @type {import('jest').Config} */
const config = {
	preset: 'ts-jest',
	verbose: true,
	testEnvironment: 'jsdom',
	roots: ['<rootDir>'],
	testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/$1',
	},
	setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
	transform: {
		'^.+\\.tsx?$': [
			'ts-jest',
			{
				tsconfig: 'tsconfig.json',
			},
		],
	},
}

module.exports = config
