import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { listBlogs, createBlog } from '@/lib/services/blog.service';
import { CreateBlogSchema } from '@/lib/validators/blog.validator';
import { DomainError } from '@/lib/errors';

/** GET /api/blogs — list blogs with optional filters & pagination */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl;
        const result = await listBlogs(db, {
            publishedOnly: searchParams.get('published') === 'true',
            tag: searchParams.get('tag') ?? undefined,
            category: searchParams.get('category') ?? undefined,
            search: searchParams.get('search') ?? undefined,
            page: Number(searchParams.get('page') ?? 1),
            limit: Number(searchParams.get('limit') ?? 9),
        });
        return NextResponse.json(result);
    } catch (error) {
        if (error instanceof DomainError) {
            return NextResponse.json({ error: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
    }
}

/** POST /api/blogs — create a new blog post */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = CreateBlogSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
        }
        const blog = await createBlog(db, parsed.data);
        return NextResponse.json(blog, { status: 201 });
    } catch (error) {
        if (error instanceof DomainError) {
            return NextResponse.json({ error: error.message }, { status: error.statusCode });
        }
        return NextResponse.json({ error: 'Failed to create blog' }, { status: 500 });
    }
}
