/**
 * Unit tests for lib/errors.ts
 *
 * Tests error class hierarchy, statusCode values, instanceof checks,
 * and toDomainError() Prisma error conversion.
 */

import { DomainError, NotFoundError, ConflictError, ValidationError, toDomainError } from '@/lib/errors';

// ── DomainError base class ────────────────────────────────────────────────────
describe('DomainError', () => {
    it('carries the provided message', () => {
        const err = new DomainError('something went wrong', 500);
        expect(err.message).toBe('something went wrong');
    });

    it('carries the provided statusCode', () => {
        const err = new DomainError('oops', 503);
        expect(err.statusCode).toBe(503);
    });

    it('is an instance of Error', () => {
        expect(new DomainError('x')).toBeInstanceOf(Error);
    });

    it('name matches class name', () => {
        expect(new DomainError('x').name).toBe('DomainError');
    });
});

// ── NotFoundError ─────────────────────────────────────────────────────────────
describe('NotFoundError', () => {
    it('has statusCode 404', () => {
        expect(new NotFoundError().statusCode).toBe(404);
    });

    it('is instanceof DomainError', () => {
        expect(new NotFoundError()).toBeInstanceOf(DomainError);
    });

    it('is instanceof NotFoundError', () => {
        expect(new NotFoundError()).toBeInstanceOf(NotFoundError);
    });

    it('has a sensible default message', () => {
        expect(new NotFoundError().message).toMatch(/not found/i);
    });

    it('accepts a custom message', () => {
        expect(new NotFoundError('Page not found').message).toBe('Page not found');
    });

    it('name is NotFoundError', () => {
        expect(new NotFoundError().name).toBe('NotFoundError');
    });
});

// ── ConflictError ─────────────────────────────────────────────────────────────
describe('ConflictError', () => {
    it('has statusCode 409', () => {
        expect(new ConflictError().statusCode).toBe(409);
    });

    it('is instanceof DomainError', () => {
        expect(new ConflictError()).toBeInstanceOf(DomainError);
    });

    it('has a sensible default message', () => {
        expect(new ConflictError().message).toMatch(/already exists/i);
    });

    it('accepts a custom message', () => {
        const err = new ConflictError('Slug taken');
        expect(err.message).toBe('Slug taken');
    });

    it('name is ConflictError', () => {
        expect(new ConflictError().name).toBe('ConflictError');
    });
});

// ── ValidationError ───────────────────────────────────────────────────────────
describe('ValidationError', () => {
    it('has statusCode 422', () => {
        expect(new ValidationError().statusCode).toBe(422);
    });

    it('is instanceof DomainError', () => {
        expect(new ValidationError()).toBeInstanceOf(DomainError);
    });
});

// ── toDomainError() ───────────────────────────────────────────────────────────
describe('toDomainError()', () => {
    it('passes through an existing DomainError unchanged', () => {
        const original = new NotFoundError('already typed');
        const result = toDomainError(original);
        expect(result).toBe(original);
    });

    it('converts Prisma P2002 → ConflictError', () => {
        const prismaError = Object.assign(new Error('Unique constraint'), { code: 'P2002' });
        const result = toDomainError(prismaError, 'page');

        expect(result).toBeInstanceOf(ConflictError);
        expect(result.statusCode).toBe(409);
        expect(result.message).toContain('page');
    });

    it('converts Prisma P2025 → NotFoundError', () => {
        const prismaError = Object.assign(new Error('Record not found'), { code: 'P2025' });
        const result = toDomainError(prismaError, 'page');

        expect(result).toBeInstanceOf(NotFoundError);
        expect(result.statusCode).toBe(404);
    });

    it('wraps unknown errors as DomainError with 500', () => {
        const unknown = new Error('DB connection failed');
        const result = toDomainError(unknown);

        expect(result).toBeInstanceOf(DomainError);
        expect(result.statusCode).toBe(500);
    });

    it('wraps a non-Error value (e.g. string throw) gracefully', () => {
        const result = toDomainError('unexpected string error');
        expect(result).toBeInstanceOf(DomainError);
        expect(result.statusCode).toBe(500);
    });

    it('uses the entityName in the conflict message', () => {
        const prismaError = Object.assign(new Error(), { code: 'P2002' });
        const result = toDomainError(prismaError, 'product');

        expect(result.message).toContain('product');
    });
});
