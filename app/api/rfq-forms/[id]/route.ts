import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const form = await db.rfqFormConfig.findUnique({
            where: { id },
            include: { products: { select: { id: true, name: true } } },
        });
        if (!form) return NextResponse.json({ error: 'RFQ form not found' }, { status: 404 });
        return NextResponse.json(form);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch RFQ form' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const form = await db.rfqFormConfig.update({
            where: { id },
            data: {
                name: body.name,
                description: body.description,
                fields: body.fields,
            },
        });
        return NextResponse.json(form);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update RFQ form' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await db.rfqFormConfig.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete RFQ form' }, { status: 500 });
    }
}
