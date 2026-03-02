/**
 * @jest-environment node
 *
 * API Contract Tests — /api/pages
 *
 * Strategy:
 *  - Mock the service layer (not Prisma)
 *  - Test HTTP contract: status codes + JSON shape
 *  - Do NOT test implementation details (DB arguments, etc.)
 *  - Routes are imported and called directly as functions
 *
 * What we DON'T test here:
 *  - Business logic (covered by page.service.test.ts)
 *  - Database calls (covered by integration tests)
 */

import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/pages/route';
import { DomainError, NotFoundError, ConflictError } from '@/lib/errors';

// ── Mock the service layer ────────────────────────────────────────────────────
jest.mock('@/lib/services/page.service', () => ({
    listPages: jest.fn(),
    createPage: jest.fn(),
}));

// ── Mock db (so the module loads without a real DB URL) ───────────────────────
jest.mock('@/lib/db', () => ({ db: {} }));

import * as PageService from '@/lib/services/page.service';

const mockListPages = PageService.listPages as jest.MockedFunction<typeof PageService.listPages>;
const mockCreatePage = PageService.createPage as jest.MockedFunction<typeof PageService.createPage>;

// ── Helpers ───────────────────────────────────────────────────────────────────
function makeRequest(body?: object): NextRequest {
    return new NextRequest('http://localhost/api/pages', {
        method: body ? 'POST' : 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
    });
}

const fakePage = {
    id: 'cl1', title: 'Test', slug: 'test', status: 'DRAFT', isPublished: false,
    pageType: 'custom_code', updatedAt: new Date().toISOString(),
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('GET /api/pages', () => {
    it('returns 200 with page array', async () => {
        mockListPages.mockResolvedValueOnce([fakePage] as any);
        const res = await GET();

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(Array.isArray(body)).toBe(true);
        expect(body[0]).toMatchObject({ id: 'cl1', slug: 'test' });
    });

    it('returns 200 with an empty array when no pages exist', async () => {
        mockListPages.mockResolvedValueOnce([]);
        const res = await GET();

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body).toEqual([]);
    });

    it('returns 500 JSON on service error', async () => {
        mockListPages.mockRejectedValueOnce(new Error('DB down'));
        const res = await GET();

        expect(res.status).toBe(500);
        const body = await res.json();
        expect(body).toHaveProperty('error');
    });

    afterEach(() => jest.clearAllMocks());
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('POST /api/pages', () => {
    const validBody = { title: 'New Page', slug: 'new-page', status: 'DRAFT' };

    it('returns 201 with created page on success', async () => {
        mockCreatePage.mockResolvedValueOnce({ ...fakePage, ...validBody } as any);
        const req = makeRequest(validBody);
        const res = await POST(req);

        expect(res.status).toBe(201);
        const body = await res.json();
        expect(body).toMatchObject({ slug: 'new-page' });
    });

    it('returns 409 when the service throws ConflictError', async () => {
        mockCreatePage.mockRejectedValueOnce(new ConflictError('A page with this slug already exists'));
        const req = makeRequest(validBody);
        const res = await POST(req);

        expect(res.status).toBe(409);
        const body = await res.json();
        expect(body).toHaveProperty('error');
        expect(body.error).toMatch(/slug already exists/i);
    });

    it('returns 500 when the service throws a generic DomainError', async () => {
        mockCreatePage.mockRejectedValueOnce(new DomainError('Unexpected', 500));
        const req = makeRequest(validBody);
        const res = await POST(req);

        expect(res.status).toBe(500);
        const body = await res.json();
        expect(body).toHaveProperty('error');
    });

    it('response body has an "error" string field on failure', async () => {
        mockCreatePage.mockRejectedValueOnce(new ConflictError('slug taken'));
        const req = makeRequest(validBody);
        const res = await POST(req);
        const body = await res.json();

        expect(typeof body.error).toBe('string');
    });

    afterEach(() => jest.clearAllMocks());
});
