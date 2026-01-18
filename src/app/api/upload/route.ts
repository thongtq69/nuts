import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        console.log('📤 Upload API: Starting upload process...');
        
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const folder = formData.get('folder') as string || 'gonuts';
        const type = formData.get('type') as string || 'general';

        if (!file) {
            return NextResponse.json({ 
                error: 'No file provided',
                message: 'Please select a file to upload'
            }, { status: 400 });
        }

        console.log('📁 File details:', {
            name: file.name,
            size: file.size,
            type: file.type,
            folder: folder
        });

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate public ID based on type and timestamp
        const timestamp = Date.now();
        const publicId = `${type}_${timestamp}`;

        // Upload to Cloudinary
        const result = await uploadToCloudinary(
            buffer,
            folder,
            publicId
        );

        console.log('✅ Upload successful:', result.secure_url);

        return NextResponse.json({
            success: true,
            message: 'File uploaded successfully',
            url: result.secure_url,
            data: {
                url: result.secure_url,
                publicId: result.public_id,
                width: result.width,
                height: result.height,
                format: result.format,
                bytes: result.bytes,
                cloudinary: true
            }
        });

    } catch (error: any) {
        console.error('❌ Upload API Error:', error);
        return NextResponse.json({ 
            error: 'Upload failed',
            message: error.message,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}

// Handle base64 uploads (for cropped images)
export async function PUT(request: NextRequest) {
    try {
        console.log('📤 Upload API: Starting base64 upload...');
        
        const body = await request.json();
        const { imageData, folder = 'gonuts', type = 'cropped', filename } = body;

        if (!imageData) {
            return NextResponse.json({ 
                error: 'No image data provided',
                message: 'Please provide base64 image data'
            }, { status: 400 });
        }

        // Generate public ID
        const timestamp = Date.now();
        const publicId = filename ? `${type}_${filename}_${timestamp}` : `${type}_${timestamp}`;

        // Upload to Cloudinary
        const result = await uploadToCloudinary(
            imageData,
            folder,
            publicId
        );

        console.log('✅ Base64 upload successful:', result.secure_url);

        return NextResponse.json({
            success: true,
            message: 'Image uploaded successfully',
            url: result.secure_url,
            data: {
                url: result.secure_url,
                publicId: result.public_id,
                width: result.width,
                height: result.height,
                format: result.format,
                bytes: result.bytes,
                cloudinary: true
            }
        });

    } catch (error: any) {
        console.error('❌ Base64 Upload API Error:', error);
        return NextResponse.json({ 
            error: 'Upload failed',
            message: error.message,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
