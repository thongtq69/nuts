import { NextResponse } from 'next/server';
import cloudinary, { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(req: Request) {
    try {
        // Check if Cloudinary is configured
        if (!process.env.CLOUDINARY_CLOUD_NAME ||
            !process.env.CLOUDINARY_API_KEY ||
            !process.env.CLOUDINARY_API_SECRET) {
            return NextResponse.json(
                { error: 'Cloudinary is not configured. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your .env.local file.' },
                { status: 500 }
            );
        }

        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const imageUrl = formData.get('imageUrl') as string | null;
        const folder = formData.get('folder') as string || 'banners';

        let uploadResult: any;

        if (file) {
            // Upload file
            const buffer = Buffer.from(await file.arrayBuffer());

            // Convert buffer to base64 data URL for Cloudinary
            const base64 = buffer.toString('base64');
            const mimeType = file.type || 'image/png';
            const dataUrl = `data:${mimeType};base64,${base64}`;

            uploadResult = await uploadToCloudinary(dataUrl, {
                folder,
                resourceType: 'image',
            });
        } else if (imageUrl) {
            // Upload from URL or base64
            uploadResult = await uploadToCloudinary(imageUrl, {
                folder,
                resourceType: 'image',
            });
        } else {
            return NextResponse.json(
                { error: 'No file or imageUrl provided' },
                { status: 400 }
            );
        }

        // Return the optimized URL with best quality
        const optimizedUrl = cloudinary.url(uploadResult.public_id, {
            transformation: [
                {
                    quality: 'auto:best',
                    fetch_format: 'auto',
                    flags: 'preserve_transparency',
                }
            ],
            secure: true,
        });

        return NextResponse.json({
            success: true,
            url: optimizedUrl,
            originalUrl: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            width: uploadResult.width,
            height: uploadResult.height,
            format: uploadResult.format,
            bytes: uploadResult.bytes,
        });
    } catch (error: any) {
        console.error('Cloudinary upload error:', error);
        return NextResponse.json(
            { error: error.message || 'Upload failed' },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request) {
    try {
        const { publicId } = await req.json();

        if (!publicId) {
            return NextResponse.json(
                { error: 'Public ID is required' },
                { status: 400 }
            );
        }

        const result = await cloudinary.uploader.destroy(publicId);

        return NextResponse.json({
            success: result.result === 'ok',
            result: result.result,
        });
    } catch (error: any) {
        console.error('Cloudinary delete error:', error);
        return NextResponse.json(
            { error: error.message || 'Delete failed' },
            { status: 500 }
        );
    }
}
