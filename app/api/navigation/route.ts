import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/navigation - List all menus with items
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const name = searchParams.get('name'); // e.g. ?name=header

        if (name) {
            const menu = await db.navigationMenu.findUnique({
                where: { name },
                include: {
                    items: {
                        orderBy: { order: 'asc' },
                        include: {
                            children: {
                                orderBy: { order: 'asc' },
                            },
                        },
                    },
                },
            });
            if (!menu) return NextResponse.json({ error: 'Menu not found' }, { status: 404 });
            return NextResponse.json(menu);
        }

        const menus = await db.navigationMenu.findMany({
            include: {
                items: {
                    where: { parentId: null },
                    orderBy: { order: 'asc' },
                    include: {
                        children: {
                            orderBy: { order: 'asc' },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'asc' },
        });
        return NextResponse.json(menus);
    } catch (error) {
        console.error('Failed to fetch navigation:', error);
        return NextResponse.json({ error: 'Failed to fetch navigation' }, { status: 500 });
    }
}

// POST /api/navigation - Create a new menu
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const menu = await db.navigationMenu.create({
            data: { name: body.name },
        });
        return NextResponse.json(menu, { status: 201 });
    } catch (error: any) {
        if (error?.code === 'P2002') {
            return NextResponse.json({ error: 'A menu with this name already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to create menu' }, { status: 500 });
    }
}
