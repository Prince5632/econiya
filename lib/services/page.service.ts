/**
 * Page Service — all business logic for CMS pages.
 *
 * Routes are thin HTTP adapters that call these functions and map
 * DomainErrors to HTTP status codes.
 *
 * The `db` parameter is explicitly injected so tests can pass a mock.
 */

import { Prisma } from '@prisma/client';
import type { PrismaClient } from '@prisma/client';
import { toDomainError, NotFoundError } from '@/lib/errors';
import { normalizeSlug, deriveIsPublished } from '@/lib/validators/page.validator';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CreatePageData {
    title: string;
    slug: string;
    content?: string;
    htmlContent?: string | null;
    cssContent?: string | null;
    jsContent?: string | null;
    pageType?: string;
    status?: 'DRAFT' | 'PUBLISHED';
    template?: unknown;
    metaTitle?: string | null;
    metaDescription?: string | null;
    metaKeywords?: string | null;
    ogImage?: string | null;
}

export type UpdatePageData = Partial<CreatePageData>;

// ── Service functions ─────────────────────────────────────────────────────────

/**
 * List all pages (lightweight projection for the dashboard listing).
 */
export async function listPages(db: PrismaClient) {
    return db.page.findMany({
        select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            isPublished: true,
            pageType: true,
            updatedAt: true,
        },
        orderBy: { updatedAt: 'desc' },
    });
}

/**
 * Fetch a single page by id. Throws NotFoundError when missing.
 */
export async function getPage(db: PrismaClient, id: string) {
    const page = await db.page.findUnique({ where: { id } });
    if (!page) throw new NotFoundError('Page not found');
    return page;
}

/**
 * Create a new page.
 * - Normalises slug (strips leading slashes)
 * - Derives isPublished from status
 * - Converts Prisma P2002 → ConflictError
 */
export async function createPage(db: PrismaClient, data: CreatePageData) {
    try {
        const status = data.status ?? 'DRAFT';
        const slug = normalizeSlug(data.slug);

        return await db.page.create({
            data: {
                title: data.title,
                slug,
                content: data.content ?? '',
                htmlContent: data.htmlContent ?? null,
                cssContent: data.cssContent ?? null,
                jsContent: data.jsContent ?? null,
                pageType: data.pageType ?? 'custom_code',
                status,
                isPublished: deriveIsPublished(status),
                template: data.template ?? Prisma.JsonNull,
                metaTitle: data.metaTitle ?? null,
                metaDescription: data.metaDescription ?? null,
                metaKeywords: data.metaKeywords ?? null,
                ogImage: data.ogImage ?? null,
            },
        });
    } catch (err) {
        throw toDomainError(err, 'page');
    }
}

/**
 * Update an existing page by id.
 * - Normalises slug when provided
 * - Re-derives isPublished from new status (or keeps existing)
 * - Converts P2002 → ConflictError, P2025 → NotFoundError
 */
export async function updatePage(db: PrismaClient, id: string, data: UpdatePageData) {
    try {
        const hasStatus = data.status !== undefined;
        const status = data.status;
        const isPublished = hasStatus ? deriveIsPublished(status!) : undefined;

        return await db.page.update({
            where: { id },
            data: {
                ...(data.title !== undefined && { title: data.title }),
                ...(data.slug !== undefined && { slug: normalizeSlug(data.slug) }),
                ...(data.content !== undefined && { content: data.content }),
                ...(data.htmlContent !== undefined && { htmlContent: data.htmlContent }),
                ...(data.cssContent !== undefined && { cssContent: data.cssContent }),
                ...(data.jsContent !== undefined && { jsContent: data.jsContent }),
                ...(data.pageType !== undefined && { pageType: data.pageType }),
                ...(hasStatus && { status, isPublished }),
                ...(data.template !== undefined && { template: data.template ?? Prisma.JsonNull }),
                ...(data.metaTitle !== undefined && { metaTitle: data.metaTitle }),
                ...(data.metaDescription !== undefined && { metaDescription: data.metaDescription }),
                ...(data.metaKeywords !== undefined && { metaKeywords: data.metaKeywords }),
                ...(data.ogImage !== undefined && { ogImage: data.ogImage }),
            },
        });
    } catch (err) {
        throw toDomainError(err, 'page');
    }
}

/**
 * Delete a page by id.
 * Returns the deleted page record (slug used by caller for ISR revalidation).
 */
export async function deletePage(db: PrismaClient, id: string) {
    try {
        return await db.page.delete({ where: { id } });
    } catch (err) {
        throw toDomainError(err, 'page');
    }
}
