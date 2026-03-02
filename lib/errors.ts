/**
 * Domain error hierarchy.
 *
 * Routes catch these and map them to HTTP status codes — no business
 * logic lives in the route handler itself.
 */

export class DomainError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number = 500,
    ) {
        super(message);
        this.name = this.constructor.name;
        // Maintain proper prototype chain in compiled ES5
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

/** Resource not found — maps to HTTP 404. */
export class NotFoundError extends DomainError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}

/** Unique constraint violation (e.g. duplicate slug) — maps to HTTP 409. */
export class ConflictError extends DomainError {
    constructor(message = 'Resource already exists') {
        super(message, 409);
    }
}

/** Validation failure — maps to HTTP 422. */
export class ValidationError extends DomainError {
    constructor(message = 'Validation failed') {
        super(message, 422);
    }
}

// ── Prisma error code constants ──────────────────────────────────────────────

export const PRISMA_NOT_FOUND_CODE = 'P2025';   // Record not found
export const PRISMA_UNIQUE_CODE = 'P2002';   // Unique constraint violation

/**
 * Converts a raw Prisma/unknown error into a typed DomainError.
 * If it is already a DomainError, it is returned unchanged.
 */
export function toDomainError(error: unknown, entityName = 'Resource'): DomainError {
    if (error instanceof DomainError) return error;

    const prismaError = error as { code?: string; message?: string };

    if (prismaError?.code === PRISMA_UNIQUE_CODE) {
        return new ConflictError(`A ${entityName} with this slug already exists`);
    }

    if (prismaError?.code === PRISMA_NOT_FOUND_CODE) {
        return new NotFoundError(`${entityName} not found`);
    }

    const message = prismaError?.message ?? `Failed to process ${entityName}`;
    return new DomainError(message, 500);
}
