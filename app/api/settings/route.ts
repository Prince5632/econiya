import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const SINGLETON_ID = 'singleton';

// GET /api/settings
export async function GET() {
    try {
        let settings = await db.siteSettings.findUnique({ where: { id: SINGLETON_ID } });

        // Auto-create default settings if not found
        if (!settings) {
            settings = await db.siteSettings.create({
                data: {
                    id: SINGLETON_ID,
                    siteName: 'My Site',
                    copyrightText: '© 2026 All rights reserved.',
                },
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

// PUT /api/settings
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const settings = await db.siteSettings.upsert({
            where: { id: SINGLETON_ID },
            update: {
                logoUrl: body.logoUrl,
                siteName: body.siteName,
                headerLinks: body.headerLinks,
                footerLinks: body.footerLinks,
                socialLinks: body.socialLinks,
                copyrightText: body.copyrightText,
                footerContent: body.footerContent,
            },
            create: {
                id: SINGLETON_ID,
                logoUrl: body.logoUrl,
                siteName: body.siteName || 'My Site',
                headerLinks: body.headerLinks,
                footerLinks: body.footerLinks,
                socialLinks: body.socialLinks,
                copyrightText: body.copyrightText || '© 2026 All rights reserved.',
                footerContent: body.footerContent,
            },
        });
        return NextResponse.json(settings);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
