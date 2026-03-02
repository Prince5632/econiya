import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { listPages, createPage } from '@/lib/services/page.service';
import { DomainError } from '@/lib/errors';

// GET /api/pages - List all pages
export async function GET() {
    try {
        const pages = await listPages(db);
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
        const page = await createPage(db, body);
        return NextResponse.json(page, { status: 201 });
    } catch (error: unknown) {
        if (error instanceof DomainError) {
            return NextResponse.json({ error: error.message }, { status: error.statusCode });
        }
        console.error('Failed to create page:', error);
        return NextResponse.json({ error: 'Failed to create page' }, { status: 500 });
    }
}
