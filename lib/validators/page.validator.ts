import { z } from 'zod';

// ── Shared sub-schemas ────────────────────────────────────────────────────────

const SlugSchema = z
    .string()
    .min(1, 'Slug is required')
    .transform((val) => val.replace(/^\/+/, ''))        // strip leading slashes
    .refine((val) => /^[a-z0-9]+(?:[-/][a-z0-9]+)*$/.test(val), {
        message: 'Slug must be lowercase alphanumeric with hyphens only',
    });

const StatusSchema = z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT');

const PageTypeSchema = z.enum(['custom_code', 'richtext', 'template']).default('custom_code');

// ── Create Page ───────────────────────────────────────────────────────────────

export const CreatePageSchema = z.object({
    title: z.string().min(1, 'Title is required').max(255),
    slug: SlugSchema,
    content: z.string().default(''),
    htmlContent: z.string().nullish(),
    cssContent: z.string().nullish(),
    jsContent: z.string().nullish(),
    pageType: PageTypeSchema,
    status: StatusSchema,
    template: z.unknown().nullish(),
    metaTitle: z.string().max(255).nullish(),
    metaDescription: z.string().max(500).nullish(),
    metaKeywords: z.string().max(255).nullish(),
    ogImage: z.string().url('ogImage must be a valid URL').nullish().or(z.literal('')),
});

export type CreatePageInput = z.infer<typeof CreatePageSchema>;

// ── Update Page ───────────────────────────────────────────────────────────────

export const UpdatePageSchema = CreatePageSchema.partial().extend({
    // slug is optional on update; strip leading slashes if provided
    slug: z.string().min(1).transform((val) => val.replace(/^\/+/, '')).optional(),
});

export type UpdatePageInput = z.infer<typeof UpdatePageSchema>;

// ── Helper — derive isPublished from status ──────────────────────────────────

/** Pure function — the single source of truth for isPublished logic. */
export function deriveIsPublished(status: 'DRAFT' | 'PUBLISHED'): boolean {
    return status === 'PUBLISHED';
}

/** Pure slug normaliser — strips leading slashes. */
export function normalizeSlug(slug: string): string {
    return slug.replace(/^\/+/, '');
}
