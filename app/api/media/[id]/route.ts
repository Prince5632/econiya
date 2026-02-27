import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { deleteFromS3 } from '@/lib/s3';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const media = await db.media.findUnique({ where: { id } });
        if (!media) return NextResponse.json({ error: 'Media not found' }, { status: 404 });
        return NextResponse.json(media);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const media = await db.media.findUnique({ where: { id } });
        if (!media) return NextResponse.json({ error: 'Media not found' }, { status: 404 });

        // Delete from S3
        await deleteFromS3(media.s3Key);

        // Delete from database
        await db.media.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 });
    }
}
