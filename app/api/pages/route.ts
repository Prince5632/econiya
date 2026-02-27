import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/pages - List all pages
export async function GET() {
    try {
        const pages = await db.page.findMany({
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
        return NextResponse.json(pages);
    } catch (error) {
        console.error('Failed to fetch pages:', error);
        return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 });
    }
}

// POST /api/pages - Create a new page
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const isPublished = body.status === 'PUBLISHED';

        const page = await db.page.create({
            data: {
                title: body.title,
                slug: body.slug.replace(/^\/+/, ''),
                content: body.content || '',
                htmlContent: body.htmlContent || null,
                cssContent: body.cssContent || null,
                jsContent: body.jsContent || null,
                pageType: body.pageType || 'custom_code',
                status: body.status || 'DRAFT',
                isPublished,
                template: body.template || null,
                metaTitle: body.metaTitle || null,
                metaDescription: body.metaDescription || null,
                metaKeywords: body.metaKeywords || null,
                ogImage: body.ogImage || null,
            },
        });
        return NextResponse.json(page, { status: 201 });
    } catch (error: any) {
        if (error?.code === 'P2002') {
            return NextResponse.json({ error: 'A page with this slug already exists' }, { status: 409 });
        }
        console.error('Failed to create page:', error);
        const message = error?.message || 'Failed to create page';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
