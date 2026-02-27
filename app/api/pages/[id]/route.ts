import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

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

        const isPublished = body.status === 'PUBLISHED';

        const page = await db.page.update({
            where: { id },
            data: {
                title: body.title,
                slug: body.slug?.replace(/^\/+/, ''),
                content: body.content,
                htmlContent: body.htmlContent ?? undefined,
                cssContent: body.cssContent ?? undefined,
                jsContent: body.jsContent ?? undefined,
                pageType: body.pageType ?? undefined,
                status: body.status ?? undefined,
                isPublished,
                template: body.template,
                metaTitle: body.metaTitle || null,
                metaDescription: body.metaDescription || null,
                metaKeywords: body.metaKeywords || null,
                ogImage: body.ogImage || null,
            },
        });

        // Revalidate the public page path for ISR
        try {
            revalidatePath(`/${page.slug}`);
        } catch {
            // Revalidation may fail in API routes; that's okay
        }

        return NextResponse.json(page);
    } catch (error: any) {
        if (error?.code === 'P2002') {
            return NextResponse.json({ error: 'A page with this slug already exists' }, { status: 409 });
        }
        console.error('Failed to update page:', error);
        return NextResponse.json({ error: 'Failed to update page' }, { status: 500 });
    }
}

// DELETE /api/pages/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const page = await db.page.delete({ where: { id } });

        // Revalidate deleted path
        try {
            revalidatePath(`/${page.slug}`);
        } catch {
            // ignore
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 });
    }
}
