/**
 * @jest-environment node
 *
 * Unit tests for lib/services/page.service.ts
 *
 * Strategy:
 *  - Prisma is fully mocked — no real DB
 *  - Test business logic: slug normalisation, isPublished derivation,
 *    error conversion, not-found behaviour, conflict detection.
 *  - Nothing imports NextRequest or NextResponse here.
 */

// Must mock lib/db before any imports so Prisma never initialises
jest.mock('@/lib/db', () => ({ db: {} }));

import {
    listPages,
    getPage,
    createPage,
    updatePage,
    deletePage,
} from '@/lib/services/page.service';
import { NotFoundError, ConflictError } from '@/lib/errors';

// ── Prisma mock ───────────────────────────────────────────────────────────────

const mockDb = {
    page: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
} as any;

// ── Fixtures ─────────────────────────────────────────────────────────────────

const fakePage = {
    id: 'clpage001',
    title: 'Test Page',
    slug: 'test-page',
    content: '',
    htmlContent: '<h1>Hello</h1>',
    cssContent: 'h1{color:red}',
    jsContent: null,
    pageType: 'custom_code',
    status: 'DRAFT',
    isPublished: false,
    template: null,
    metaTitle: null,
    metaDescription: null,
    metaKeywords: null,
    ogImage: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function makePrismaError(code: string, message = 'Prisma error') {
    const err: any = new Error(message);
    err.code = code;
    return err;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('listPages()', () => {
    it('delegates to prisma and returns result', async () => {
        const rows = [fakePage];
        mockDb.page.findMany.mockResolvedValueOnce(rows);

        const result = await listPages(mockDb);

        expect(mockDb.page.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ orderBy: { updatedAt: 'desc' } }),
        );
        expect(result).toBe(rows);
    });

    it('selects only the lightweight projection fields', async () => {
        mockDb.page.findMany.mockResolvedValueOnce([]);
        await listPages(mockDb);

        const [call] = mockDb.page.findMany.mock.calls;
        const select = call[0].select;
        expect(select).toHaveProperty('id', true);
        expect(select).toHaveProperty('isPublished', true);
        // sensitive / heavy fields are NOT included
        expect(select).not.toHaveProperty('htmlContent');
        expect(select).not.toHaveProperty('cssContent');
    });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('getPage()', () => {
    it('returns the page when found', async () => {
        mockDb.page.findUnique.mockResolvedValueOnce(fakePage);

        const result = await getPage(mockDb, 'clpage001');

        expect(result).toBe(fakePage);
        expect(mockDb.page.findUnique).toHaveBeenCalledWith({ where: { id: 'clpage001' } });
    });

    it('throws NotFoundError when page does not exist', async () => {
        mockDb.page.findUnique.mockResolvedValueOnce(null);

        await expect(getPage(mockDb, 'nonexistent')).rejects.toBeInstanceOf(NotFoundError);
    });

    it('NotFoundError has statusCode 404', async () => {
        mockDb.page.findUnique.mockResolvedValueOnce(null);

        const error = await getPage(mockDb, 'x').catch((e) => e);
        expect(error.statusCode).toBe(404);
    });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('createPage()', () => {
    const baseInput = {
        title: 'My Page',
        slug: 'my-page',
    };

    it('creates a page and returns the created record', async () => {
        mockDb.page.create.mockResolvedValueOnce({ ...fakePage, ...baseInput });

        const result = await createPage(mockDb, baseInput);

        expect(result).toMatchObject({ title: 'My Page' });
        expect(mockDb.page.create).toHaveBeenCalledTimes(1);
    });

    describe('slug normalisation', () => {
        it('strips a single leading slash', async () => {
            mockDb.page.create.mockResolvedValueOnce(fakePage);
            await createPage(mockDb, { ...baseInput, slug: '/my-page' });

            const data = mockDb.page.create.mock.calls[0][0].data;
            expect(data.slug).toBe('my-page');
        });

        it('strips multiple leading slashes', async () => {
            mockDb.page.create.mockResolvedValueOnce(fakePage);
            await createPage(mockDb, { ...baseInput, slug: '///about-us' });

            const data = mockDb.page.create.mock.calls[0][0].data;
            expect(data.slug).toBe('about-us');
        });

        it('leaves a slug without leading slash unchanged', async () => {
            mockDb.page.create.mockResolvedValueOnce(fakePage);
            await createPage(mockDb, { ...baseInput, slug: 'about-us' });

            const data = mockDb.page.create.mock.calls[0][0].data;
            expect(data.slug).toBe('about-us');
        });
    });

    describe('isPublished derivation', () => {
        it('sets isPublished=false for DRAFT status', async () => {
            mockDb.page.create.mockResolvedValueOnce(fakePage);
            await createPage(mockDb, { ...baseInput, status: 'DRAFT' });

            const data = mockDb.page.create.mock.calls[0][0].data;
            expect(data.isPublished).toBe(false);
            expect(data.status).toBe('DRAFT');
        });

        it('sets isPublished=true for PUBLISHED status', async () => {
            mockDb.page.create.mockResolvedValueOnce(fakePage);
            await createPage(mockDb, { ...baseInput, status: 'PUBLISHED' });

            const data = mockDb.page.create.mock.calls[0][0].data;
            expect(data.isPublished).toBe(true);
            expect(data.status).toBe('PUBLISHED');
        });

        it('defaults to DRAFT when status is omitted', async () => {
            mockDb.page.create.mockResolvedValueOnce(fakePage);
            await createPage(mockDb, baseInput);

            const data = mockDb.page.create.mock.calls[0][0].data;
            expect(data.isPublished).toBe(false);
            expect(data.status).toBe('DRAFT');
        });
    });

    describe('defaults', () => {
        it('defaults content to empty string when omitted', async () => {
            mockDb.page.create.mockResolvedValueOnce(fakePage);
            await createPage(mockDb, baseInput);

            const data = mockDb.page.create.mock.calls[0][0].data;
            expect(data.content).toBe('');
        });

        it('defaults pageType to custom_code when omitted', async () => {
            mockDb.page.create.mockResolvedValueOnce(fakePage);
            await createPage(mockDb, baseInput);

            const data = mockDb.page.create.mock.calls[0][0].data;
            expect(data.pageType).toBe('custom_code');
        });

        it('stores null for optional SEO fields when omitted', async () => {
            mockDb.page.create.mockResolvedValueOnce(fakePage);
            await createPage(mockDb, baseInput);

            const data = mockDb.page.create.mock.calls[0][0].data;
            expect(data.metaTitle).toBeNull();
            expect(data.metaDescription).toBeNull();
            expect(data.ogImage).toBeNull();
        });
    });

    describe('error handling', () => {
        it('throws ConflictError on Prisma P2002 (duplicate slug)', async () => {
            mockDb.page.create.mockRejectedValueOnce(makePrismaError('P2002'));

            await expect(createPage(mockDb, baseInput)).rejects.toBeInstanceOf(ConflictError);
        });

        it('ConflictError mentions "page" and has statusCode 409', async () => {
            mockDb.page.create.mockRejectedValueOnce(makePrismaError('P2002'));

            const error = await createPage(mockDb, baseInput).catch((e) => e);
            expect(error.statusCode).toBe(409);
            expect(error.message).toContain('page');
        });

        it('wraps unknown errors as DomainError with statusCode 500', async () => {
            mockDb.page.create.mockRejectedValueOnce(new Error('unexpected DB error'));

            const error = await createPage(mockDb, baseInput).catch((e) => e);
            expect(error.statusCode).toBe(500);
        });
    });

    afterEach(() => jest.clearAllMocks());
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('updatePage()', () => {
    it('calls prisma.page.update with the correct id', async () => {
        mockDb.page.update.mockResolvedValueOnce(fakePage);
        await updatePage(mockDb, 'clpage001', { title: 'New Title' });

        expect(mockDb.page.update).toHaveBeenCalledWith(
            expect.objectContaining({ where: { id: 'clpage001' } }),
        );
    });

    it('normalises the slug when updating', async () => {
        mockDb.page.update.mockResolvedValueOnce(fakePage);
        await updatePage(mockDb, 'clpage001', { slug: '/new-slug' });

        const data = mockDb.page.update.mock.calls[0][0].data;
        expect(data.slug).toBe('new-slug');
    });

    it('re-derives isPublished when status changes to PUBLISHED', async () => {
        mockDb.page.update.mockResolvedValueOnce(fakePage);
        await updatePage(mockDb, 'clpage001', { status: 'PUBLISHED' });

        const data = mockDb.page.update.mock.calls[0][0].data;
        expect(data.isPublished).toBe(true);
    });

    it('re-derives isPublished when status changes back to DRAFT', async () => {
        mockDb.page.update.mockResolvedValueOnce(fakePage);
        await updatePage(mockDb, 'clpage001', { status: 'DRAFT' });

        const data = mockDb.page.update.mock.calls[0][0].data;
        expect(data.isPublished).toBe(false);
    });

    it('does not include isPublished when status is not in the update', async () => {
        mockDb.page.update.mockResolvedValueOnce(fakePage);
        await updatePage(mockDb, 'clpage001', { title: 'Only Title' });

        const data = mockDb.page.update.mock.calls[0][0].data;
        expect(data.isPublished).toBeUndefined();
    });

    it('throws ConflictError on P2002', async () => {
        mockDb.page.update.mockRejectedValueOnce(makePrismaError('P2002'));

        await expect(updatePage(mockDb, 'clpage001', { slug: 'taken' })).rejects.toBeInstanceOf(ConflictError);
    });

    it('throws NotFoundError on P2025 (record not found)', async () => {
        mockDb.page.update.mockRejectedValueOnce(makePrismaError('P2025'));

        await expect(updatePage(mockDb, 'ghost-id', {})).rejects.toBeInstanceOf(NotFoundError);
    });

    afterEach(() => jest.clearAllMocks());
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('deletePage()', () => {
    it('calls prisma.page.delete with the correct id', async () => {
        mockDb.page.delete.mockResolvedValueOnce(fakePage);

        const result = await deletePage(mockDb, 'clpage001');

        expect(mockDb.page.delete).toHaveBeenCalledWith({ where: { id: 'clpage001' } });
        expect(result).toBe(fakePage);  // caller uses returned record for ISR revalidation
    });

    it('throws NotFoundError when deleting non-existent page', async () => {
        mockDb.page.delete.mockRejectedValueOnce(makePrismaError('P2025'));

        await expect(deletePage(mockDb, 'ghost')).rejects.toBeInstanceOf(NotFoundError);
    });

    afterEach(() => jest.clearAllMocks());
});
