import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { moderateComment, deleteComment } from '@/lib/services/blog.service';
import { DomainError } from '@/lib/errors';

type Params = { params: Promise<{ id: string; commentId: string }> };

/**
 * PATCH /api/blogs/[id]/comments/[commentId]
 * Admin: approve or reject a comment.
 * Body: { status: "approved" | "rejected" }
 */
export async function PATCH(request: NextRequest, { params }: Params) {
    try {
        const { commentId } = await params;
        const { status } = await request.json();

        if (status !== 'approved' && status !== 'rejected') {
            return NextResponse.json({ error: 'Status must be "approved" or "rejected"' }, { status: 422 });
        }

        const comment = await moderateComment(db, commentId, status);
        return NextResponse.json(comment);
    } catch (error) {
        if (error instanceof DomainError) {
            return NextResponse.json({ error: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 });
    }
}

/**
 * DELETE /api/blogs/[id]/comments/[commentId]
 * Admin: permanently delete a comment.
 */
export async function DELETE(_req: NextRequest, { params }: Params) {
    try {
        const { commentId } = await params;
        await deleteComment(db, commentId);
        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof DomainError) {
            return NextResponse.json({ error: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
    }
}
