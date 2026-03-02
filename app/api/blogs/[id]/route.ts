import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getBlog, updateBlog, deleteBlog } from '@/lib/services/blog.service';
import { UpdateBlogSchema } from '@/lib/validators/blog.validator';
import { DomainError } from '@/lib/errors';

type Params = { params: Promise<{ id: string }> };

/** GET /api/blogs/[id] — fetch by id or slug */
export async function GET(_req: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        const blog = await getBlog(db, id);
        return NextResponse.json(blog);
    } catch (error) {
        if (error instanceof DomainError) {
            return NextResponse.json({ error: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ error: 'Failed to fetch blog' }, { status: 500 });
    }
}

/** PUT /api/blogs/[id] — update a blog post */
export async function PUT(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        const body = await request.json();
        const parsed = UpdateBlogSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
        }
        const blog = await updateBlog(db, id, parsed.data);
        return NextResponse.json(blog);
    } catch (error) {
        if (error instanceof DomainError) {
            return NextResponse.json({ error: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ error: 'Failed to update blog' }, { status: 500 });
    }
}

/** DELETE /api/blogs/[id] — delete a blog post */
export async function DELETE(_req: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        await deleteBlog(db, id);
        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof DomainError) {
            return NextResponse.json({ error: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ error: 'Failed to delete blog' }, { status: 500 });
    }
}
