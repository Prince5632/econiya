import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getPage, updatePage, deletePage } from '@/lib/services/page.service';
import { DomainError } from '@/lib/errors';
import { revalidatePath } from 'next/cache';

// GET /api/pages/[id]
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        const page = await getPage(db, id);
        return NextResponse.json(page);
    } catch (error: unknown) {
        if (error instanceof DomainError) {
            return NextResponse.json({ error: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ error: 'Failed to fetch page' }, { status: 500 });
    }
}

// PUT /api/pages/[id]
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const page = await updatePage(db, id, body);

        // Revalidate the public page path for ISR
        try { revalidatePath(`/${page.slug}`); } catch { /* ignore */ }

        return NextResponse.json(page);
    } catch (error: unknown) {
        if (error instanceof DomainError) {
            return NextResponse.json({ error: error.message }, { status: error.statusCode });
        }
        console.error('Failed to update page:', error);
        return NextResponse.json({ error: 'Failed to update page' }, { status: 500 });
    }
}

// DELETE /api/pages/[id]
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        const page = await deletePage(db, id);

        // Revalidate deleted path
        try { revalidatePath(`/${page.slug}`); } catch { /* ignore */ }

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        if (error instanceof DomainError) {
            return NextResponse.json({ error: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 });
    }
}
