import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { uploadToS3, generateS3Key } from '@/lib/s3';

export async function GET() {
    try {
        const media = await db.media.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(media);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const folder = (formData.get('folder') as string) || 'general';
        const altText = (formData.get('altText') as string) || '';
        const displayName = (formData.get('displayName') as string) || file.name;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const s3Key = generateS3Key(folder, file.name);
        const url = await uploadToS3(buffer, s3Key, file.type);

        const media = await db.media.create({
            data: {
                s3Key,
                url,
                originalFilename: file.name,
                displayName,
                mimeType: file.type,
                size: file.size,
                altText,
                folder,
            },
        });

        return NextResponse.json(media, { status: 201 });
    } catch (error) {
        console.error('Media upload error:', error);
        return NextResponse.json({ error: 'Failed to upload media' }, { status: 500 });
    }
}
