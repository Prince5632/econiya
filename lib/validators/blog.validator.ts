import { z } from 'zod';

// ── Blog Status ───────────────────────────────────────────────────────────────

const BlogStatusSchema = z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT');

// ── Create Blog ───────────────────────────────────────────────────────────────

export const CreateBlogSchema = z.object({
    title: z.string().min(1, 'Title is required').max(255),
    slug: z
        .string()
        .min(1, 'Slug is required')
        .transform((val) => val.replace(/^\/+/, ''))
        .refine((val) => /^[a-z0-9]+(?:[-][a-z0-9]+)*$/.test(val), {
            message: 'Slug must be lowercase alphanumeric with hyphens only',
        }),
    excerpt: z.string().max(10000).nullish(),
    content: z.string().default(''),
    thumbnail: z.string().nullish(),
    featuredImage: z.string().nullish(),
    tags: z.array(z.string()).default([]),
    category: z.string().max(100).nullish(),
    authorName: z.string().max(100).nullish().default('Admin'),
    authorAvatar: z.string().nullish(),
    readTime: z.number().int().positive().nullish(),
    status: BlogStatusSchema,
    metaTitle: z.string().max(255).nullish(),
    metaDescription: z.string().max(1000).nullish(),
    metaKeywords: z.string().max(255).nullish(),
    ogImage: z.string().nullish(),
});

export type CreateBlogInput = z.infer<typeof CreateBlogSchema>;

// ── Update Blog ───────────────────────────────────────────────────────────────

export const UpdateBlogSchema = CreateBlogSchema.partial().extend({
    slug: z
        .string()
        .min(1)
        .transform((val) => val.replace(/^\/+/, ''))
        .optional(),
});

export type UpdateBlogInput = z.infer<typeof UpdateBlogSchema>;

// ── Comment ───────────────────────────────────────────────────────────────────

export const CreateCommentSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100),
    email: z.string().email('Valid email required').max(255),
    body: z.string().min(1, 'Comment cannot be empty').max(2000),
    // Honeypot — bots fill this; real users leave it blank
    website: z.string().max(0).optional(),
});

export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Derive isPublished from status string. */
export function deriveIsPublished(status: 'DRAFT' | 'PUBLISHED'): boolean {
    return status === 'PUBLISHED';
}

/** Strip leading slashes from a slug. */
export function normalizeBlogSlug(slug: string): string {
    return slug.replace(/^\/+/, '');
}

/** Auto-calculate read time: ~200 wpm, minimum 1 min. */
export function calcReadTime(html: string): number {
    const words = html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
}
