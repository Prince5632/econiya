import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    try {
        const blogs = await db.blog.findMany({
            orderBy: { updatedAt: 'desc' },
        });
        return NextResponse.json(blogs);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const blog = await db.blog.create({
            data: {
                title: body.title,
                slug: body.slug,
                excerpt: body.excerpt || null,
                content: body.content || '',
                thumbnail: body.thumbnail || null,
                featuredImage: body.featuredImage || null,
                tags: body.tags || [],
                isPublished: body.isPublished || false,
                publishedAt: body.isPublished ? new Date() : null,
                metaTitle: body.metaTitle || null,
                metaDescription: body.metaDescription || null,
                metaKeywords: body.metaKeywords || null,
                ogImage: body.ogImage || null,
            },
        });
        return NextResponse.json(blog, { status: 201 });
    } catch (error: any) {
        if (error?.code === 'P2002') {
            return NextResponse.json({ error: 'A blog with this slug already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to create blog' }, { status: 500 });
    }
}
