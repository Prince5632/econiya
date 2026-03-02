/**
 * Blog Service — all business logic for blog posts and comments.
 *
 * Routes are thin HTTP adapters; all logic lives here.
 * The `db` parameter is injected so unit tests can pass a mock.
 */

import type { PrismaClient } from '@prisma/client';
import { toDomainError, NotFoundError, ValidationError } from '@/lib/errors';
import {
    deriveIsPublished,
    normalizeBlogSlug,
    calcReadTime,
    CreateBlogInput,
    UpdateBlogInput,
    CreateCommentInput,
} from '@/lib/validators/blog.validator';

// ── Public listing filters ─────────────────────────────────────────────────────

export interface ListBlogsOptions {
    publishedOnly?: boolean;
    tag?: string;
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
}

// ── Blog CRUD ─────────────────────────────────────────────────────────────────

/** List blogs — lightweight projection. Supports filters + pagination. */
export async function listBlogs(db: PrismaClient, options: ListBlogsOptions = {}) {
    const { publishedOnly = false, tag, category, search, page = 1, limit = 9 } = options;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (publishedOnly) where.isPublished = true;
    if (category) where.category = { equals: category, mode: 'insensitive' };
    if (tag) where.tags = { has: tag };
    if (search) {
        where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { excerpt: { contains: search, mode: 'insensitive' } },
        ];
    }

    const [blogs, total] = await Promise.all([
        db.blog.findMany({
            where: where as Parameters<typeof db.blog.findMany>[0]['where'],
            select: {
                id: true,
                title: true,
                slug: true,
                excerpt: true,
                thumbnail: true,
                featuredImage: true,
                tags: true,
                category: true,
                authorName: true,
                authorAvatar: true,
                readTime: true,
                isPublished: true,
                status: true,
                publishedAt: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: { publishedAt: 'desc' },
            skip,
            take: limit,
        }),
        db.blog.count({ where: where as Parameters<typeof db.blog.count>[0]['where'] }),
    ]);

    return { blogs, total, page, limit, totalPages: Math.ceil(total / limit) };
}

/** Fetch a single blog by id or slug. Throws NotFoundError when missing. */
export async function getBlog(db: PrismaClient, idOrSlug: string) {
    // Try as ID first (cuid is ~25 chars, slugs are typically shorter)
    const blog = await db.blog.findFirst({
        where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
        include: { _count: { select: { comments: { where: { status: 'approved' } } } } },
    });
    if (!blog) throw new NotFoundError('Blog post not found');
    return blog;
}

/** Create a new blog post. */
export async function createBlog(db: PrismaClient, data: CreateBlogInput) {
    try {
        const status = data.status ?? 'DRAFT';
        const slug = normalizeBlogSlug(data.slug);
        const readTime = data.readTime ?? (data.content ? calcReadTime(data.content) : 1);

        return await db.blog.create({
            data: {
                title: data.title,
                slug,
                excerpt: data.excerpt ?? null,
                content: data.content ?? '',
                thumbnail: data.thumbnail ?? null,
                featuredImage: data.featuredImage ?? null,
                tags: data.tags ?? [],
                category: data.category ?? null,
                authorName: data.authorName ?? 'Admin',
                authorAvatar: data.authorAvatar ?? null,
                readTime,
                status,
                isPublished: deriveIsPublished(status),
                publishedAt: status === 'PUBLISHED' ? new Date() : null,
                metaTitle: data.metaTitle ?? null,
                metaDescription: data.metaDescription ?? null,
                metaKeywords: data.metaKeywords ?? null,
                ogImage: data.ogImage ?? null,
            },
        });
    } catch (err) {
        throw toDomainError(err, 'blog post');
    }
}

/** Update an existing blog post. */
export async function updateBlog(db: PrismaClient, id: string, data: UpdateBlogInput) {
    try {
        const hasStatus = data.status !== undefined;
        const status = data.status;
        const isPublished = hasStatus ? deriveIsPublished(status!) : undefined;

        return await db.blog.update({
            where: { id },
            data: {
                ...(data.title !== undefined && { title: data.title }),
                ...(data.slug !== undefined && { slug: normalizeBlogSlug(data.slug) }),
                ...(data.excerpt !== undefined && { excerpt: data.excerpt }),
                ...(data.content !== undefined && {
                    content: data.content,
                    readTime: data.readTime ?? calcReadTime(data.content),
                }),
                ...(data.thumbnail !== undefined && { thumbnail: data.thumbnail }),
                ...(data.featuredImage !== undefined && { featuredImage: data.featuredImage }),
                ...(data.tags !== undefined && { tags: data.tags }),
                ...(data.category !== undefined && { category: data.category }),
                ...(data.authorName !== undefined && { authorName: data.authorName }),
                ...(data.authorAvatar !== undefined && { authorAvatar: data.authorAvatar }),
                ...(data.readTime !== undefined && { readTime: data.readTime }),
                ...(hasStatus && {
                    status,
                    isPublished,
                    publishedAt: isPublished ? new Date() : null,
                }),
                ...(data.metaTitle !== undefined && { metaTitle: data.metaTitle }),
                ...(data.metaDescription !== undefined && { metaDescription: data.metaDescription }),
                ...(data.metaKeywords !== undefined && { metaKeywords: data.metaKeywords }),
                ...(data.ogImage !== undefined && { ogImage: data.ogImage }),
            },
        });
    } catch (err) {
        throw toDomainError(err, 'blog post');
    }
}

/** Delete a blog post by id. */
export async function deleteBlog(db: PrismaClient, id: string) {
    try {
        return await db.blog.delete({ where: { id } });
    } catch (err) {
        throw toDomainError(err, 'blog post');
    }
}

// ── Comments ──────────────────────────────────────────────────────────────────

type CommentStatus = 'pending' | 'approved' | 'rejected';

/** List comments for a blog. Public callers get approved only. */
export async function listComments(
    db: PrismaClient,
    blogId: string,
    statusFilter: CommentStatus | 'all' = 'approved'
) {
    const where: Record<string, unknown> = { blogId };
    if (statusFilter !== 'all') where.status = statusFilter;

    return db.blogComment.findMany({
        where: where as Parameters<typeof db.blogComment.findMany>[0]['where'],
        select: { id: true, name: true, body: true, status: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
    });
}

/** Create a new pending comment (honeypot already validated in the route). */
export async function createComment(
    db: PrismaClient,
    blogId: string,
    data: CreateCommentInput
) {
    // Ensure blog exists
    const blog = await db.blog.findUnique({ where: { id: blogId }, select: { id: true } });
    if (!blog) throw new NotFoundError('Blog post not found');

    return db.blogComment.create({
        data: { blogId, name: data.name, email: data.email, body: data.body, status: 'pending' },
    });
}

/** Admin: change comment status (approve/reject). */
export async function moderateComment(
    db: PrismaClient,
    commentId: string,
    status: 'approved' | 'rejected'
) {
    try {
        return await db.blogComment.update({ where: { id: commentId }, data: { status } });
    } catch (err) {
        throw toDomainError(err, 'comment');
    }
}

/** Admin: delete a comment. */
export async function deleteComment(db: PrismaClient, commentId: string) {
    try {
        return await db.blogComment.delete({ where: { id: commentId } });
    } catch (err) {
        throw toDomainError(err, 'comment');
    }
}

/** Count pending comments for a blog (for dashboard badges). */
export async function pendingCommentCount(db: PrismaClient, blogId: string): Promise<number> {
    return db.blogComment.count({ where: { blogId, status: 'pending' } });
}
