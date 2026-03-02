import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
    // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
    dir: './',
});

// Add any custom config to be passed to Jest
const config: Config = {
    coverageProvider: 'v8',
    testEnvironment: 'jest-environment-jsdom',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },

    // ─── Test discovery ──────────────────────────────────────────────────────
    // Picks up both:
    //   • __tests__/**/*.test.ts(x)   ← centralized test directory
    //   • **/*.test.ts(x)             ← co-located test files (legacy / future)
    testMatch: [
        '<rootDir>/__tests__/**/*.(test|spec).[jt]s?(x)',
        '<rootDir>/**/*.(test|spec).[jt]s?(x)',
    ],

    // ─── Coverage ────────────────────────────────────────────────────────────
    collectCoverageFrom: [
        'app/**/*.{ts,tsx}',
        'lib/**/*.{ts,tsx}',
        '!app/**/*.d.ts',
        '!app/**/layout.tsx',        // Next.js layouts – no logic to test
        '!app/**/page.tsx',          // Exclude pure page shells
        '!**/node_modules/**',
    ],
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 80,
            lines: 80,
            statements: 80,
        },
    },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config);

