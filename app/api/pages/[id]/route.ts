import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/pages/[id]
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const page = await db.page.findUnique({ where: { id } });
        if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 });
        return NextResponse.json(page);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch page' }, { status: 500 });
    }
}

// PUT /api/pages/[id]
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const page = await db.page.update({
            where: { id },
            data: {
                title: body.title,
                slug: body.slug.replace(/^\/+/, ''),
                content: body.content,
                template: body.template,
                isPublished: body.isPublished,
                metaTitle: body.metaTitle || null,
                metaDescription: body.metaDescription || null,
                metaKeywords: body.metaKeywords || null,
                ogImage: body.ogImage || null,
            },
        });
        return NextResponse.json(page);
    } catch (error: any) {
        if (error?.code === 'P2002') {
            return NextResponse.json({ error: 'A page with this slug already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to update page' }, { status: 500 });
    }
}

// DELETE /api/pages/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await db.page.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 });
    }
}
