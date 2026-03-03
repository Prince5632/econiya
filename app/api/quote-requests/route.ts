import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/quote-requests — List all quote requests (admin)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        const where = status ? { status } : {};
        const requests = await db.quoteRequest.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(requests);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch quote requests' }, { status: 500 });
    }
}

// POST /api/quote-requests — Public submission
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.name || !body.email || !body.category) {
            return NextResponse.json(
                { error: 'Name, email, and category are required' },
                { status: 400 }
            );
        }

        const quoteRequest = await db.quoteRequest.create({
            data: {
                name: body.name,
                email: body.email,
                phone: body.phone || null,
                company: body.company || null,
                category: body.category,
                productName: body.productName || null,
                message: body.message || null,
                status: 'new',
            },
        });
        return NextResponse.json(quoteRequest, { status: 201 });
    } catch (error) {
        console.error('Quote request submission error:', error);
        return NextResponse.json({ error: 'Failed to submit quote request' }, { status: 500 });
    }
}
