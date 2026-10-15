import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json(
                { error: 'No file uploaded' },
                { status: 400 }
            );
        }

        // Validate File Type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { error: 'Only image files are allowed' },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate unique filename
        const uniqueId = uuidv4();
        // Sanitize original name to prevent path traversal
        const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '');
        const filename = `${uniqueId}-${originalName}`;

        // Save to public/uploads
        const path = join(process.cwd(), 'public/uploads', filename);
        await writeFile(path, buffer);

        // Return the public URL
        const imageUrl = `/uploads/${filename}`;

        return NextResponse.json({ success: true, url: imageUrl });

    } catch (error) {
        console.error('Upload failed:', error);
        return NextResponse.json(
            { error: 'Upload failed' },
            { status: 500 }
        );
    }
}
