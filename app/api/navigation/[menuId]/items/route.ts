import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/navigation/[menuId]/items - List items for a menu
export async function GET(request: NextRequest, { params }: { params: Promise<{ menuId: string }> }) {
    try {
        const { menuId } = await params;
        const items = await db.navigationItem.findMany({
            where: { menuId, parentId: null },
            orderBy: { order: 'asc' },
            include: {
                children: {
                    orderBy: { order: 'asc' },
                },
            },
        });
        return NextResponse.json(items);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
    }
}

// POST /api/navigation/[menuId]/items - Add item to menu
export async function POST(request: NextRequest, { params }: { params: Promise<{ menuId: string }> }) {
    try {
        const { menuId } = await params;
        const body = await request.json();

        const item = await db.navigationItem.create({
            data: {
                menuId,
                label: body.label,
                url: body.url || '#',
                order: body.order ?? 0,
                target: body.target || '_self',
                parentId: body.parentId || null,
            },
        });
        return NextResponse.json(item, { status: 201 });
    } catch (error) {
        console.error('Failed to create nav item:', error);
        return NextResponse.json({ error: 'Failed to create navigation item' }, { status: 500 });
    }
}

// PUT /api/navigation/[menuId]/items - Bulk update items (reorder)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ menuId: string }> }) {
    try {
        const { menuId } = await params;
        const body = await request.json();

        // body.items: Array<{ id, label, url, order, target, parentId }>
        const updates = (body.items || []).map((item: any) =>
            db.navigationItem.update({
                where: { id: item.id },
                data: {
                    label: item.label,
                    url: item.url,
                    order: item.order,
                    target: item.target || '_self',
                    parentId: item.parentId || null,
                },
            })
        );
        await Promise.all(updates);

        // Return refreshed items
        const items = await db.navigationItem.findMany({
            where: { menuId, parentId: null },
            orderBy: { order: 'asc' },
            include: { children: { orderBy: { order: 'asc' } } },
        });
        return NextResponse.json(items);
    } catch (error) {
        console.error('Failed to update nav items:', error);
        return NextResponse.json({ error: 'Failed to update navigation items' }, { status: 500 });
    }
}
