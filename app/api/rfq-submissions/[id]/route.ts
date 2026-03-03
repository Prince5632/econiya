import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PATCH /api/rfq-submissions/[id] — Update status
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const updated = await db.rfqSubmission.update({
            where: { id },
            data: { status: body.status },
        });
        return NextResponse.json(updated);
    } catch (error) {
        console.error('Failed to update RFQ submission:', error);
        return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 });
    }
}
