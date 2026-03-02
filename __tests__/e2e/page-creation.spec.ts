/**
 * E2E Tests — Page Creation, Editing, Publishing, and Public View
 *
 * Tests the complete page flow in a real browser.
 * All selectors match the actual DOM produced by PageEditor.tsx and login/page.tsx.
 *
 * Run with:
 *   npx playwright test
 *
 * Ensure TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD env vars are set,
 * or defaults below are used.
 */

import { test, expect, Page } from '@playwright/test';

// ── Config ────────────────────────────────────────────────────────────────────

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@econiya.com';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'Admin@123';

/** Unique slug per test run to prevent conflicts. */
function uniqueSlug(prefix = 'e2e') {
    return `${prefix}-${Date.now()}`;
}

// ── Auth helper ───────────────────────────────────────────────────────────────

async function loginAsAdmin(page: Page) {
    await page.goto(`${BASE_URL}/login`);

    // id="email" and id="password" are on the login form
    await page.locator('#email').fill(ADMIN_EMAIL);
    await page.locator('#password').fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Wait for dashboard redirect after successful login
    try {
        await page.waitForURL(/\/dashboard/, { timeout: 10_000 });
    } catch (e) {
        const currentUrl = page.url();
        const html = await page.content();
        console.error(`Login failed! Did not redirect. Current URL: ${currentUrl}`);
        if (html.includes('Invalid credentials')) {
            console.error('SERVER RETURNED: Invalid credentials.');
        } else if (html.includes('Something went wrong')) {
            console.error('SERVER RETURNED: Something went wrong.');
        }
        await page.screenshot({ path: 'playwright-login-failed.png', fullPage: true });
        throw e;
    }
}

// ── Page editor navigation helper ─────────────────────────────────────────────

async function gotoNewPage(page: Page) {
    await page.goto(`${BASE_URL}/dashboard/pages/new`);
    // Wait for the title input to be visible
    await page.locator('input[placeholder*="About Us"]').waitFor({ state: 'visible' });
}

// ─────────────────────────────────────────────────────────────────────────────
// Page creation flow
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Page creation flow', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
    });

    test('creates a new draft custom_code page', async ({ page }) => {
        const slug = uniqueSlug('draft');
        const title = `Draft Page ${Date.now()}`;

        await gotoNewPage(page);

        // Title input (placeholder: "e.g. About Us, Contact, Privacy Policy")
        await page.locator('input[placeholder*="About Us"]').fill(title);

        // Slug input (placeholder: "auto-generated-from-title")
        await page.locator('input[placeholder="auto-generated-from-title"]').fill(slug);

        // HTML code textarea (placeholder: "Paste your HTML code here…")
        await page.locator('textarea[placeholder*="Paste your HTML code"]').fill('<h1>Draft Test</h1>');

        // Default status is Draft — do NOT toggle
        await expect(page.getByRole('button', { name: 'Draft' })).toBeVisible();

        // Submit
        const apiRes = page.waitForResponse(r =>
            r.url().includes('/api/pages') && r.request().method() === 'POST'
        );
        await page.getByRole('button', { name: 'Create Page' }).click();
        expect((await apiRes).status()).toBe(201);

        // Should redirect back to pages list or show success
        await page.waitForURL(/\/dashboard\/pages/, { timeout: 10_000 });
    });

    test('publishes a page and verifies public URL renders the content', async ({ page }) => {
        const slug = uniqueSlug('pub');
        const title = `Published Page ${Date.now()}`;
        const HTML = '<h1 id="e2e-heading">Hello from E2E</h1>';

        await gotoNewPage(page);

        await page.locator('input[placeholder*="About Us"]').fill(title);
        await page.locator('input[placeholder="auto-generated-from-title"]').fill(slug);
        await page.locator('textarea[placeholder*="Paste your HTML code"]').fill(HTML);

        // Toggle status to Published
        await page.getByRole('button', { name: 'Draft' }).click();
        await expect(page.getByRole('button', { name: 'Published' })).toBeVisible();

        const apiRes = page.waitForResponse(r =>
            r.url().includes('/api/pages') && r.request().method() === 'POST'
        );
        await page.getByRole('button', { name: 'Create Page' }).click();
        await apiRes;

        // Navigate to public URL
        await page.goto(`${BASE_URL}/${slug}`);
        await expect(page.locator('#e2e-heading')).toBeVisible({ timeout: 10_000 });
        await expect(page.locator('#e2e-heading')).toHaveText('Hello from E2E');
    });

    test('shows Draft Mode banner when visiting a draft page as admin', async ({ page }) => {
        const slug = uniqueSlug('banner');
        const title = `Banner Test ${Date.now()}`;

        await gotoNewPage(page);

        await page.locator('input[placeholder*="About Us"]').fill(title);
        await page.locator('input[placeholder="auto-generated-from-title"]').fill(slug);
        await page.locator('textarea[placeholder*="Paste your HTML code"]').fill('<p>Draft</p>');

        // Leave as Draft, submit
        const apiRes = page.waitForResponse(r =>
            r.url().includes('/api/pages') && r.request().method() === 'POST'
        );
        await page.getByRole('button', { name: 'Create Page' }).click();
        await apiRes;

        // Visit the draft page while still logged in as admin
        await page.goto(`${BASE_URL}/${slug}`);

        // The [slug]/page.tsx renders a "Draft Mode" banner for logged-in users
        await expect(page.getByText(/draft mode/i)).toBeVisible({ timeout: 8_000 });
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Unauthenticated access
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Draft access restriction', () => {
    test('404s for unauthenticated visitor on a nonexistent draft slug', async ({ browser }) => {
        const context = await browser.newContext();   // fresh — no auth cookies
        const page = await context.newPage();

        await page.goto(`${BASE_URL}/e2e-nonexistent-${Date.now()}`);
        await expect(page).toHaveTitle(/404|not found/i);

        await context.close();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Page editing flow
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Page editing flow', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
    });

    test('edits an existing page title and saves successfully', async ({ page }) => {
        const slug = uniqueSlug('edit');

        // Create a page via API (quicker than UI for setup)
        await page.request.post(`${BASE_URL}/api/pages`, {
            data: { title: 'Original Title', slug, htmlContent: '<p>Original</p>', status: 'DRAFT' },
        });

        // Go to pages list and find the edit link for our page
        await page.goto(`${BASE_URL}/dashboard/pages`);
        await expect(page.getByText('Original Title')).toBeVisible({ timeout: 8_000 });

        // Click the pencil icon which links to /dashboard/pages/[id]/edit
        const row = page.locator('tr', { has: page.getByText('Original Title') });
        await row.getByRole('link').first().click();   // edit link (pencil icon)
        await page.waitForURL(/\/dashboard\/pages\/.+\/edit/, { timeout: 10_000 });

        // Update title
        const titleInput = page.locator('input[placeholder*="About Us"]');
        await titleInput.clear();
        await titleInput.fill('Updated Title');

        // Save
        const apiRes = page.waitForResponse(r =>
            r.url().includes('/api/pages/') && r.request().method() === 'PUT'
        );
        await page.getByRole('button', { name: 'Update Page' }).click();
        expect((await apiRes).status()).toBe(200);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Page editor UI features
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Page editor features', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
        await gotoNewPage(page);
    });

    test('live preview iframe appears after entering HTML', async ({ page }) => {
        await page.locator('textarea[placeholder*="Paste your HTML code"]').fill('<h2>Live Preview Test</h2>');

        // iframe title="Page Preview"
        const iframe = page.frameLocator('iframe[title="Page Preview"]');
        await expect(iframe.locator('h2')).toBeVisible({ timeout: 8_000 });
    });

    test('can switch between HTML, CSS, and JS tabs', async ({ page }) => {
        // HTML tab is active by default
        await expect(page.locator('textarea[placeholder*="Paste your HTML code"]')).toBeVisible();

        // Click CSS tab (button contains "CSS" text)
        await page.getByRole('button', { name: /CSS/i }).click();
        await expect(page.locator('textarea[placeholder*="Paste your CSS code"]')).toBeVisible();

        // Click JS tab
        await page.getByRole('button', { name: /\bJS\b/i }).click();
        await expect(page.locator('textarea[placeholder*="Paste your JS code"]')).toBeVisible();
    });

    test('status toggle switches between Draft and Published', async ({ page }) => {
        // Default is Draft
        const draftBtn = page.getByRole('button', { name: 'Draft' });
        await expect(draftBtn).toBeVisible();

        // Click to toggle to Published
        await draftBtn.click();
        await expect(page.getByRole('button', { name: 'Published' })).toBeVisible();

        // Toggle back to Draft
        await page.getByRole('button', { name: 'Published' }).click();
        await expect(page.getByRole('button', { name: 'Draft' })).toBeVisible();
    });

    test('Create Page button is disabled when title is empty', async ({ page }) => {
        // Title is empty on new page — submit button should be disabled
        const submitBtn = page.getByRole('button', { name: 'Create Page' });
        await expect(submitBtn).toBeDisabled();

        // Fill title → button becomes enabled
        await page.locator('input[placeholder*="About Us"]').fill('My Page');
        await expect(submitBtn).toBeEnabled();
    });
});
