import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { listComments, createComment } from '@/lib/services/blog.service';
import { CreateCommentSchema } from '@/lib/validators/blog.validator';
import { DomainError } from '@/lib/errors';

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/blogs/[id]/comments
 * Public: returns approved comments only.
 * Admin (X-Admin: 1 header): returns all statuses.
 */
export async function GET(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        const isAdmin = request.headers.get('x-admin') === '1';
        const comments = await listComments(db, id, isAdmin ? 'all' : 'approved');
        return NextResponse.json(comments);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }
}

/**
 * POST /api/blogs/[id]/comments
 * Guest comment submission. Honeypot check + Zod validation.
 */
export async function POST(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        const body = await request.json();

        const parsed = CreateCommentSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
        }

        // Honeypot: if `website` field is filled, silently discard
        if (parsed.data.website) {
            return NextResponse.json({ success: true }); // fake success to fool bots
        }

        await createComment(db, id, parsed.data);
        return NextResponse.json({ success: true, message: 'Your comment is awaiting moderation.' }, { status: 201 });
    } catch (error) {
        if (error instanceof DomainError) {
            return NextResponse.json({ error: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ error: 'Failed to submit comment' }, { status: 500 });
    }
}
