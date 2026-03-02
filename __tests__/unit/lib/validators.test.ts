/**
 * Unit tests for lib/validators/page.validator.ts
 *
 * Tests the pure functions and Zod schemas independently.
 * No React, no Next.js, no Prisma.
 */

import { z } from 'zod';
import {
    CreatePageSchema,
    UpdatePageSchema,
    deriveIsPublished,
    normalizeSlug,
} from '@/lib/validators/page.validator';

// ── normalizeSlug ─────────────────────────────────────────────────────────────
describe('normalizeSlug()', () => {
    it('leaves a clean slug unchanged', () => {
        expect(normalizeSlug('about-us')).toBe('about-us');
    });

    it('strips a single leading slash', () => {
        expect(normalizeSlug('/about-us')).toBe('about-us');
    });

    it('strips multiple leading slashes', () => {
        expect(normalizeSlug('///about-us')).toBe('about-us');
    });

    it('does not strip trailing slashes', () => {
        expect(normalizeSlug('about-us/')).toBe('about-us/');
    });

    it('handles nested path segments', () => {
        expect(normalizeSlug('/products/gas-detectors')).toBe('products/gas-detectors');
    });

    it('returns empty string from empty string', () => {
        expect(normalizeSlug('')).toBe('');
    });
});

// ── deriveIsPublished ─────────────────────────────────────────────────────────
describe('deriveIsPublished()', () => {
    it('returns true for PUBLISHED', () => {
        expect(deriveIsPublished('PUBLISHED')).toBe(true);
    });

    it('returns false for DRAFT', () => {
        expect(deriveIsPublished('DRAFT')).toBe(false);
    });
});

// ── CreatePageSchema ──────────────────────────────────────────────────────────
describe('CreatePageSchema', () => {
    const validInput = {
        title: 'About Us',
        slug: 'about-us',
    };

    it('accepts a minimal valid input', () => {
        const result = CreatePageSchema.safeParse(validInput);
        expect(result.success).toBe(true);
    });

    it('strips leading slash from slug during parse', () => {
        const result = CreatePageSchema.safeParse({ ...validInput, slug: '/about-us' });
        expect(result.success).toBe(true);
        if (result.success) expect(result.data.slug).toBe('about-us');
    });

    it('defaults status to DRAFT', () => {
        const result = CreatePageSchema.safeParse(validInput);
        expect(result.success).toBe(true);
        if (result.success) expect(result.data.status).toBe('DRAFT');
    });

    it('defaults pageType to custom_code', () => {
        const result = CreatePageSchema.safeParse(validInput);
        if (result.success) expect(result.data.pageType).toBe('custom_code');
    });

    it('accepts PUBLISHED status', () => {
        const result = CreatePageSchema.safeParse({ ...validInput, status: 'PUBLISHED' });
        expect(result.success).toBe(true);
        if (result.success) expect(result.data.status).toBe('PUBLISHED');
    });

    it('rejects an empty title', () => {
        const result = CreatePageSchema.safeParse({ ...validInput, title: '' });
        expect(result.success).toBe(false);
    });

    it('rejects a missing title', () => {
        const result = CreatePageSchema.safeParse({ slug: 'about-us' });
        expect(result.success).toBe(false);
    });

    it('rejects an empty slug', () => {
        const result = CreatePageSchema.safeParse({ ...validInput, slug: '' });
        expect(result.success).toBe(false);
    });

    it('rejects an invalid status value', () => {
        const result = CreatePageSchema.safeParse({ ...validInput, status: 'ARCHIVED' });
        expect(result.success).toBe(false);
    });

    it('rejects an invalid pageType', () => {
        const result = CreatePageSchema.safeParse({ ...validInput, pageType: 'blog' });
        expect(result.success).toBe(false);
    });

    it('rejects a non-URL ogImage', () => {
        const result = CreatePageSchema.safeParse({ ...validInput, ogImage: 'not-a-url' });
        expect(result.success).toBe(false);
    });

    it('accepts empty string ogImage (treated as no image)', () => {
        const result = CreatePageSchema.safeParse({ ...validInput, ogImage: '' });
        expect(result.success).toBe(true);
    });

    it('accepts a valid HTTPS ogImage URL', () => {
        const result = CreatePageSchema.safeParse({
            ...validInput,
            ogImage: 'https://cdn.example.com/og.jpg',
        });
        expect(result.success).toBe(true);
    });

    it('rejects a title longer than 255 characters', () => {
        const result = CreatePageSchema.safeParse({ ...validInput, title: 'a'.repeat(256) });
        expect(result.success).toBe(false);
    });
});

// ── UpdatePageSchema ──────────────────────────────────────────────────────────
describe('UpdatePageSchema', () => {
    it('accepts an empty update object (all fields optional)', () => {
        const result = UpdatePageSchema.safeParse({});
        expect(result.success).toBe(true);
    });

    it('accepts partial update with only status', () => {
        const result = UpdatePageSchema.safeParse({ status: 'PUBLISHED' });
        expect(result.success).toBe(true);
    });

    it('strips leading slash from slug on partial update', () => {
        const result = UpdatePageSchema.safeParse({ slug: '/new-slug' });
        expect(result.success).toBe(true);
        if (result.success) expect(result.data.slug).toBe('new-slug');
    });

    it('rejects an invalid status on partial update', () => {
        const result = UpdatePageSchema.safeParse({ status: 'PUBLISHED_DRAFT' });
        expect(result.success).toBe(false);
    });
});
