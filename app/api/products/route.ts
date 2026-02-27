import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const categoryId = searchParams.get('categoryId');

        const where = categoryId ? { categoryId } : {};
        const products = await db.product.findMany({
            where,
            orderBy: { updatedAt: 'desc' },
            include: { category: { select: { name: true } } },
        });
        return NextResponse.json(products);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const product = await db.product.create({
            data: {
                name: body.name,
                slug: body.slug,
                description: body.description || null,
                content: body.content || '',
                images: body.images || null,
                specs: body.specs || null,
                sortOrder: body.sortOrder || 0,
                isPublished: body.isPublished || false,
                categoryId: body.categoryId,
                rfqFormId: body.rfqFormId || null,
                metaTitle: body.metaTitle || null,
                metaDescription: body.metaDescription || null,
                metaKeywords: body.metaKeywords || null,
                ogImage: body.ogImage || null,
            },
        });
        return NextResponse.json(product, { status: 201 });
    } catch (error: any) {
        if (error?.code === 'P2002') {
            return NextResponse.json({ error: 'A product with this slug already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}
