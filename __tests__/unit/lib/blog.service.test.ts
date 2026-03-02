/**
 * @jest-environment node
 *
 * Unit tests for lib/services/blog.service.ts
 *
 * Strategy:
 *  - Prisma fully mocked via injected `db` parameter — no real DB
 *  - Tests cover business logic: slug normalisation, isPublished derivation,
 *    readTime calculation, error mapping, comment moderation
 */

jest.mock('@/lib/db', () => ({ db: {} }));

import {
    listBlogs,
    getBlog,
    createBlog,
    updateBlog,
    deleteBlog,
    listComments,
    createComment,
    moderateComment,
    deleteComment,
} from '@/lib/services/blog.service';
import { NotFoundError, ConflictError } from '@/lib/errors';

// ── Prisma Mock ────────────────────────────────────────────────────────────────

const mockDb = {
    blog: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
    },
    blogComment: {
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
    },
} as any;

// ── Fixtures ──────────────────────────────────────────────────────────────────

const fakeBlog = {
    id: 'clblog001',
    title: 'Wireless Automation Explained',
    slug: 'wireless-automation-explained',
    excerpt: 'A deep dive into wireless automation.',
    content: '<p>Hello world. This is a test blog post.</p>',
    thumbnail: null,
    featuredImage: null,
    tags: ['automation', 'wireless'],
    category: 'Industry News',
    authorName: 'Admin',
    authorAvatar: null,
    readTime: 1,
    status: 'DRAFT',
    isPublished: false,
    publishedAt: null,
    metaTitle: null,
    metaDescription: null,
    metaKeywords: null,
    ogImage: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    _count: { comments: 0 },
};

const fakeComment = {
    id: 'clcmt001',
    blogId: 'clblog001',
    name: 'Alice',
    email: 'alice@example.com',
    body: 'Great article!',
    status: 'pending',
    createdAt: new Date('2026-01-02T00:00:00Z'),
    updatedAt: new Date('2026-01-02T00:00:00Z'),
};

function makePrismaError(code: string, message = 'Prisma error') {
    const err: any = new Error(message);
    err.code = code;
    return err;
}

afterEach(() => jest.clearAllMocks());

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('listBlogs()', () => {
    it('returns blogs and count', async () => {
        mockDb.blog.findMany.mockResolvedValueOnce([fakeBlog]);
        mockDb.blog.count.mockResolvedValueOnce(1);

        const result = await listBlogs(mockDb);

        expect(result.blogs).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(result.totalPages).toBe(1);
    });

    it('applies publishedOnly filter', async () => {
        mockDb.blog.findMany.mockResolvedValueOnce([]);
        mockDb.blog.count.mockResolvedValueOnce(0);

        await listBlogs(mockDb, { publishedOnly: true });

        const [call] = mockDb.blog.findMany.mock.calls;
        expect(call[0].where).toMatchObject({ isPublished: true });
    });

    it('applies tag filter', async () => {
        mockDb.blog.findMany.mockResolvedValueOnce([]);
        mockDb.blog.count.mockResolvedValueOnce(0);

        await listBlogs(mockDb, { tag: 'automation' });

        const [call] = mockDb.blog.findMany.mock.calls;
        expect(call[0].where).toMatchObject({ tags: { has: 'automation' } });
    });

    it('paginates correctly', async () => {
        mockDb.blog.findMany.mockResolvedValueOnce([]);
        mockDb.blog.count.mockResolvedValueOnce(20);

        const result = await listBlogs(mockDb, { page: 2, limit: 9 });

        const [call] = mockDb.blog.findMany.mock.calls;
        expect(call[0].skip).toBe(9);
        expect(call[0].take).toBe(9);
        expect(result.totalPages).toBe(3); // 20 / 9 = 2.22 → ceil = 3
    });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('getBlog()', () => {
    it('returns blog when found by id', async () => {
        mockDb.blog.findFirst.mockResolvedValueOnce(fakeBlog);
        const result = await getBlog(mockDb, 'clblog001');
        expect(result).toBe(fakeBlog);
    });

    it('returns blog when found by slug', async () => {
        mockDb.blog.findFirst.mockResolvedValueOnce(fakeBlog);
        const result = await getBlog(mockDb, 'wireless-automation-explained');
        expect(result).toBe(fakeBlog);
    });

    it('throws NotFoundError when blog missing', async () => {
        mockDb.blog.findFirst.mockResolvedValueOnce(null);
        await expect(getBlog(mockDb, 'nonexistent')).rejects.toBeInstanceOf(NotFoundError);
    });

    it('NotFoundError has statusCode 404', async () => {
        mockDb.blog.findFirst.mockResolvedValueOnce(null);
        const error = await getBlog(mockDb, 'x').catch(e => e);
        expect(error.statusCode).toBe(404);
    });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('createBlog()', () => {
    const baseInput = {
        title: 'My Blog Post',
        slug: 'my-blog-post',
        content: '<p>Hello world. This is test content for the blog post.</p>',
        tags: [] as string[],
        status: 'DRAFT' as const,
    };

    it('creates and returns the blog', async () => {
        mockDb.blog.create.mockResolvedValueOnce(fakeBlog);
        const result = await createBlog(mockDb, baseInput);
        expect(result).toBe(fakeBlog);
        expect(mockDb.blog.create).toHaveBeenCalledTimes(1);
    });

    it('normalises slug by stripping leading slashes', async () => {
        mockDb.blog.create.mockResolvedValueOnce(fakeBlog);
        await createBlog(mockDb, { ...baseInput, slug: '/my-blog-post' });
        const data = mockDb.blog.create.mock.calls[0][0].data;
        expect(data.slug).toBe('my-blog-post');
    });

    it('sets isPublished=false for DRAFT status', async () => {
        mockDb.blog.create.mockResolvedValueOnce(fakeBlog);
        await createBlog(mockDb, { ...baseInput, status: 'DRAFT' });
        const data = mockDb.blog.create.mock.calls[0][0].data;
        expect(data.isPublished).toBe(false);
        expect(data.publishedAt).toBeNull();
    });

    it('sets isPublished=true and publishedAt for PUBLISHED status', async () => {
        mockDb.blog.create.mockResolvedValueOnce(fakeBlog);
        await createBlog(mockDb, { ...baseInput, status: 'PUBLISHED' });
        const data = mockDb.blog.create.mock.calls[0][0].data;
        expect(data.isPublished).toBe(true);
        expect(data.publishedAt).toBeInstanceOf(Date);
    });

    it('auto-calculates readTime from content when not provided', async () => {
        mockDb.blog.create.mockResolvedValueOnce(fakeBlog);
        // ~5 words → min readTime = 1
        await createBlog(mockDb, { ...baseInput, content: '<p>Hello world.</p>' });
        const data = mockDb.blog.create.mock.calls[0][0].data;
        expect(data.readTime).toBeGreaterThanOrEqual(1);
    });

    it('uses provided readTime when given explicitly', async () => {
        mockDb.blog.create.mockResolvedValueOnce(fakeBlog);
        await createBlog(mockDb, { ...baseInput, readTime: 7 });
        const data = mockDb.blog.create.mock.calls[0][0].data;
        expect(data.readTime).toBe(7);
    });

    it('throws ConflictError on P2002 (duplicate slug)', async () => {
        mockDb.blog.create.mockRejectedValueOnce(makePrismaError('P2002'));
        await expect(createBlog(mockDb, baseInput)).rejects.toBeInstanceOf(ConflictError);
    });

    it('ConflictError has statusCode 409', async () => {
        mockDb.blog.create.mockRejectedValueOnce(makePrismaError('P2002'));
        const error = await createBlog(mockDb, baseInput).catch(e => e);
        expect(error.statusCode).toBe(409);
    });

    it('wraps unknown errors as DomainError 500', async () => {
        mockDb.blog.create.mockRejectedValueOnce(new Error('Unknown DB error'));
        const error = await createBlog(mockDb, baseInput).catch(e => e);
        expect(error.statusCode).toBe(500);
    });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('updateBlog()', () => {
    it('calls prisma.blog.update with correct id', async () => {
        mockDb.blog.update.mockResolvedValueOnce(fakeBlog);
        await updateBlog(mockDb, 'clblog001', { title: 'New Title' });
        expect(mockDb.blog.update).toHaveBeenCalledWith(
            expect.objectContaining({ where: { id: 'clblog001' } }),
        );
    });

    it('normalises slug on update', async () => {
        mockDb.blog.update.mockResolvedValueOnce(fakeBlog);
        await updateBlog(mockDb, 'clblog001', { slug: '/new-slug' });
        const data = mockDb.blog.update.mock.calls[0][0].data;
        expect(data.slug).toBe('new-slug');
    });

    it('re-derives isPublished when status → PUBLISHED', async () => {
        mockDb.blog.update.mockResolvedValueOnce(fakeBlog);
        await updateBlog(mockDb, 'clblog001', { status: 'PUBLISHED' });
        const data = mockDb.blog.update.mock.calls[0][0].data;
        expect(data.isPublished).toBe(true);
        expect(data.publishedAt).toBeInstanceOf(Date);
    });

    it('re-derives isPublished when status → DRAFT', async () => {
        mockDb.blog.update.mockResolvedValueOnce(fakeBlog);
        await updateBlog(mockDb, 'clblog001', { status: 'DRAFT' });
        const data = mockDb.blog.update.mock.calls[0][0].data;
        expect(data.isPublished).toBe(false);
        expect(data.publishedAt).toBeNull();
    });

    it('does not include isPublished when status is not in the update', async () => {
        mockDb.blog.update.mockResolvedValueOnce(fakeBlog);
        await updateBlog(mockDb, 'clblog001', { title: 'Only Title' });
        const data = mockDb.blog.update.mock.calls[0][0].data;
        expect(data.isPublished).toBeUndefined();
    });

    it('throws ConflictError on P2002', async () => {
        mockDb.blog.update.mockRejectedValueOnce(makePrismaError('P2002'));
        await expect(updateBlog(mockDb, 'clblog001', { slug: 'taken' })).rejects.toBeInstanceOf(ConflictError);
    });

    it('throws NotFoundError on P2025', async () => {
        mockDb.blog.update.mockRejectedValueOnce(makePrismaError('P2025'));
        await expect(updateBlog(mockDb, 'ghost', {})).rejects.toBeInstanceOf(NotFoundError);
    });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('deleteBlog()', () => {
    it('calls prisma.blog.delete with correct id', async () => {
        mockDb.blog.delete.mockResolvedValueOnce(fakeBlog);
        await deleteBlog(mockDb, 'clblog001');
        expect(mockDb.blog.delete).toHaveBeenCalledWith({ where: { id: 'clblog001' } });
    });

    it('throws NotFoundError on P2025', async () => {
        mockDb.blog.delete.mockRejectedValueOnce(makePrismaError('P2025'));
        await expect(deleteBlog(mockDb, 'ghost')).rejects.toBeInstanceOf(NotFoundError);
    });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('listComments()', () => {
    it('returns only approved comments by default', async () => {
        mockDb.blogComment.findMany.mockResolvedValueOnce([]);
        await listComments(mockDb, 'clblog001');
        const [call] = mockDb.blogComment.findMany.mock.calls;
        expect(call[0].where).toMatchObject({ status: 'approved' });
    });

    it('returns all statuses when "all" is passed', async () => {
        mockDb.blogComment.findMany.mockResolvedValueOnce([]);
        await listComments(mockDb, 'clblog001', 'all');
        const [call] = mockDb.blogComment.findMany.mock.calls;
        expect(call[0].where.status).toBeUndefined();
    });

    it('filters by specific status when passed', async () => {
        mockDb.blogComment.findMany.mockResolvedValueOnce([]);
        await listComments(mockDb, 'clblog001', 'pending');
        const [call] = mockDb.blogComment.findMany.mock.calls;
        expect(call[0].where).toMatchObject({ status: 'pending' });
    });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('createComment()', () => {
    const commentInput = { name: 'Alice', email: 'alice@example.com', body: 'Great post!' };

    it('creates a pending comment when blog exists', async () => {
        mockDb.blog.findUnique.mockResolvedValueOnce({ id: 'clblog001' });
        mockDb.blogComment.create.mockResolvedValueOnce(fakeComment);

        await createComment(mockDb, 'clblog001', commentInput);

        const data = mockDb.blogComment.create.mock.calls[0][0].data;
        expect(data.status).toBe('pending');
        expect(data.name).toBe('Alice');
        expect(data.email).toBe('alice@example.com');
    });

    it('throws NotFoundError when blog does not exist', async () => {
        mockDb.blog.findUnique.mockResolvedValueOnce(null);
        await expect(createComment(mockDb, 'ghost', commentInput)).rejects.toBeInstanceOf(NotFoundError);
    });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('moderateComment()', () => {
    it('sets status to approved on approve', async () => {
        mockDb.blogComment.update.mockResolvedValueOnce({ ...fakeComment, status: 'approved' });
        const result = await moderateComment(mockDb, 'clcmt001', 'approved');
        expect(mockDb.blogComment.update).toHaveBeenCalledWith(
            expect.objectContaining({ where: { id: 'clcmt001' }, data: { status: 'approved' } }),
        );
        expect(result.status).toBe('approved');
    });

    it('sets status to rejected on reject', async () => {
        mockDb.blogComment.update.mockResolvedValueOnce({ ...fakeComment, status: 'rejected' });
        await moderateComment(mockDb, 'clcmt001', 'rejected');
        const call = mockDb.blogComment.update.mock.calls[0][0];
        expect(call.data.status).toBe('rejected');
    });

    it('throws NotFoundError when comment missing (P2025)', async () => {
        mockDb.blogComment.update.mockRejectedValueOnce(makePrismaError('P2025'));
        await expect(moderateComment(mockDb, 'ghost', 'approved')).rejects.toBeInstanceOf(NotFoundError);
    });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('deleteComment()', () => {
    it('calls prisma.blogComment.delete with correct id', async () => {
        mockDb.blogComment.delete.mockResolvedValueOnce(fakeComment);
        await deleteComment(mockDb, 'clcmt001');
        expect(mockDb.blogComment.delete).toHaveBeenCalledWith({ where: { id: 'clcmt001' } });
    });

    it('throws NotFoundError on P2025', async () => {
        mockDb.blogComment.delete.mockRejectedValueOnce(makePrismaError('P2025'));
        await expect(deleteComment(mockDb, 'ghost')).rejects.toBeInstanceOf(NotFoundError);
    });
});
