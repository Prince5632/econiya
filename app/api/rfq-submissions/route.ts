import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/rfq-submissions?formId=xxx - List submissions (admin)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const formId = searchParams.get('formId');

        const where = formId ? { formId } : {};
        const submissions = await db.rfqSubmission.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: { form: { select: { name: true } } },
        });
        return NextResponse.json(submissions);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
    }
}

// POST /api/rfq-submissions - Public submission
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required contact fields
        if (!body.name || !body.email || !body.formId) {
            return NextResponse.json(
                { error: 'Name, email, and formId are required' },
                { status: 400 }
            );
        }

        const submission = await db.rfqSubmission.create({
            data: {
                formId: body.formId,
                name: body.name,
                email: body.email,
                phone: body.phone || null,
                company: body.company || null,
                formData: body.formData || {},
                status: 'new',
            },
        });
        return NextResponse.json(submission, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to submit quote request' }, { status: 500 });
    }
}
