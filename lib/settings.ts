import { db } from '@/lib/db';
import { cache } from 'react';

export interface SocialLink {
    platform: string;
    url: string;
}

export interface SiteSettingsData {
    id: string;
    logoUrl: string | null;
    siteName: string;
    socialLinks: SocialLink[] | null;
    copyrightText: string;
    footerContent: string | null;
}

/**
 * Fetch the singleton SiteSettings row.
 * Uses React cache() to deduplicate across generateMetadata + page render.
 */
export const getSiteSettings = cache(async (): Promise<SiteSettingsData> => {
    try {
        let settings = await db.siteSettings.findUnique({
            where: { id: 'singleton' },
        });

        if (!settings) {
            settings = await db.siteSettings.create({
                data: {
                    id: 'singleton',
                    siteName: 'Econiya',
                    copyrightText: `© ${new Date().getFullYear()} Econiya Digital Platforms Pvt. Ltd. All rights reserved.`,
                },
            });
        }

        return {
            id: settings.id,
            logoUrl: settings.logoUrl,
            siteName: settings.siteName,
            socialLinks: settings.socialLinks as SocialLink[] | null,
            copyrightText: settings.copyrightText,
            footerContent: settings.footerContent,
        };
    } catch {
        return {
            id: 'singleton',
            logoUrl: null,
            siteName: 'Econiya',
            socialLinks: null,
            copyrightText: `© ${new Date().getFullYear()} All rights reserved.`,
            footerContent: null,
        };
    }
});
