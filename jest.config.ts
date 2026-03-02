import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
    dir: './',
});

/**
 * Next/jest wraps our config asynchronously. The `projects` key is
 * NOT supported inside createJestConfig — so we use a flat config
 * that covers both unit and editor tests with jsdom.
 *
 * Integration tests (node env) are run via a separate jest config:
 *   npx jest --config jest.integration.config.ts
 */
const config: Config = {
    coverageProvider: 'v8',
    testEnvironment: 'jest-environment-jsdom',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },

    // ─── Test discovery ──────────────────────────────────────────────────────
    testMatch: [
        '<rootDir>/__tests__/unit/**/*.(test|spec).[jt]s?(x)',
        '<rootDir>/__tests__/unit/editor/**/*.(test|spec).[jt]s?(x)',
    ],

    // ─── Exclude generated / infra / E2E ─────────────────────────────────────
    testPathIgnorePatterns: [
        '/node_modules/',
        '/.next/',
        '/__tests__/integration/',
        '/__tests__/e2e/',
    ],

    // ─── Coverage — scoped to meaningful logic only ───────────────────────────
    collectCoverageFrom: [
        'lib/services/**/*.{ts,tsx}',
        'lib/validators/**/*.{ts,tsx}',
        'lib/errors.ts',
        'app/dashboard/pages/editor/utils.ts',
        'lib/products.ts',
        'lib/password.ts',

        // Explicit exclusions
        '!lib/db.ts',
        '!lib/navigation.ts',
        '!lib/settings.ts',
        '!lib/landing-db.ts',
        '!lib/s3.ts',
        '!lib/templates.ts',
        '!**/node_modules/**',
        '!**/.next/**',
        '!**/prisma/**',
        '!**/public/**',
        '!**/templates/**',
        '!**/*.d.ts',
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

export default createJestConfig(config);
