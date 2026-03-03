import { cache } from 'react';
import { db } from '@/lib/db';

/**
 * Compatibility wrapper that mirrors the ui-demo getGlobalSettings() shape.
 * Returns { footer: { copyrightText, socialLinks }, contactInfo: { email, phone, address } }
 */
export const getGlobalSettings = cache(async () => {
    try {
        const settings = await db.siteSettings.findFirst();
        if (!settings) {
            return {
                footer: { copyrightText: '© 2026 Econiya Technologies. All rights reserved.', socialLinks: [] },
                contactInfo: { email: 'contact@econiya.com', phone: '+91-000-000-0000', address: 'India' },
            };
        }

        let socialLinks: any[] = [];
        if (settings.socialLinks) {
            socialLinks = typeof settings.socialLinks === 'string'
                ? JSON.parse(settings.socialLinks)
                : settings.socialLinks as any[];
        }

        let footerLinks: any[] = [];
        if (settings.footerLinks) {
            footerLinks = typeof settings.footerLinks === 'string'
                ? JSON.parse(settings.footerLinks)
                : settings.footerLinks as any[];
        }

        return {
            footer: {
                copyrightText: settings.copyrightText || '© 2026 Econiya Technologies. All rights reserved.',
                socialLinks,
                footerLinks,
                footerContent: settings.footerContent || null,
            },
            contactInfo: {
                email: settings.footerContent || 'contact@econiya.com',
                phone: '',
                address: '',
            },
        };
    } catch {
        return {
            footer: { copyrightText: '© 2026 Econiya Technologies. All rights reserved.', socialLinks: [], footerLinks: [], footerContent: null },
            contactInfo: { email: 'contact@econiya.com', phone: '', address: '' },
        };
    }
});

export async function getPageBySlug(slug: string) {
    // For now, return null — the landing page components have their own defaults
    return null;
}
