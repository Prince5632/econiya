import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    try {
        const forms = await db.rfqFormConfig.findMany({
            orderBy: { createdAt: 'desc' },
            include: { _count: { select: { submissions: true, products: true } } },
        });
        return NextResponse.json(forms);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch RFQ forms' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const form = await db.rfqFormConfig.create({
            data: {
                name: body.name,
                description: body.description || null,
                fields: body.fields || [],
            },
        });
        return NextResponse.json(form, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create RFQ form' }, { status: 500 });
    }
}
