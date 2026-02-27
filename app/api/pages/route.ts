import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/pages - List all pages
export async function GET() {
    try {
        const pages = await db.page.findMany({
            orderBy: { updatedAt: 'desc' },
        });
        return NextResponse.json(pages);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 });
    }
}

// POST /api/pages - Create a new page
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const page = await db.page.create({
            data: {
                title: body.title,
                slug: body.slug.replace(/^\/+/, ''),
                content: body.content || '',
                template: body.template || null,
                isPublished: body.isPublished || false,
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
        return NextResponse.json({ error: 'Failed to create page' }, { status: 500 });
    }
}
