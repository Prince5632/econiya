import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// DELETE /api/navigation/items/[itemId] - Delete a navigation item
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
    try {
        const { itemId } = await params;
        await db.navigationItem.delete({ where: { id: itemId } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete navigation item' }, { status: 500 });
    }
}

// PUT /api/navigation/items/[itemId] - Update a single navigation item
export async function PUT(request: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
    try {
        const { itemId } = await params;
        const body = await request.json();
        const item = await db.navigationItem.update({
            where: { id: itemId },
            data: {
                label: body.label,
                url: body.url,
                order: body.order,
                target: body.target,
                parentId: body.parentId || null,
            },
        });
        return NextResponse.json(item);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update navigation item' }, { status: 500 });
    }
}
