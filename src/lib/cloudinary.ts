import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'du6no35fj',
    api_key: process.env.CLOUDINARY_API_KEY || '473628735676585',
    api_secret: process.env.CLOUDINARY_API_SECRET || 's9qVQxSK45B6jlMxota5v9HMq4c',
});

export interface CloudinaryUploadResult {
    public_id: string;
    secure_url: string;
    url: string;
    width: number;
    height: number;
    format: string;
    resource_type: string;
    created_at: string;
    bytes: number;
}

/**
 * Upload image to Cloudinary
 * @param file - File buffer or base64 string
 * @param folder - Cloudinary folder (optional)
 * @param publicId - Custom public ID (optional)
 * @returns Promise<CloudinaryUploadResult>
 */
export async function uploadToCloudinary(
    file: Buffer | string,
    folder?: string,
    publicId?: string
): Promise<CloudinaryUploadResult> {
    try {
        console.log('📤 Uploading to Cloudinary...');
        
        const uploadOptions: any = {
            resource_type: 'auto',
            quality: 'auto:good',
            fetch_format: 'auto',
        };

        if (folder) {
            uploadOptions.folder = folder;
        }

        if (publicId) {
            uploadOptions.public_id = publicId;
            uploadOptions.overwrite = true;
        }

        const result = await cloudinary.uploader.upload(
            Buffer.isBuffer(file) ? `data:image/jpeg;base64,${file.toString('base64')}` : file,
            uploadOptions
        );

        console.log('✅ Cloudinary upload successful:', result.public_id);
        
        return {
            public_id: result.public_id,
            secure_url: result.secure_url,
            url: result.url,
            width: result.width,
            height: result.height,
            format: result.format,
            resource_type: result.resource_type,
            created_at: result.created_at,
            bytes: result.bytes,
        };
    } catch (error: any) {
        console.error('❌ Cloudinary upload failed:', error);
        throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
}

/**
 * Delete image from Cloudinary
 * @param publicId - Cloudinary public ID
 * @returns Promise<boolean>
 */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
    try {
        console.log('🗑️ Deleting from Cloudinary:', publicId);
        
        const result = await cloudinary.uploader.destroy(publicId);
        
        if (result.result === 'ok') {
            console.log('✅ Cloudinary delete successful');
            return true;
        } else {
            console.warn('⚠️ Cloudinary delete failed:', result);
            return false;
        }
    } catch (error: any) {
        console.error('❌ Cloudinary delete error:', error);
        return false;
    }
}

/**
 * Generate optimized Cloudinary URL
 * @param publicId - Cloudinary public ID
 * @param transformations - Cloudinary transformations
 * @returns string - Optimized URL
 */
export function getOptimizedImageUrl(
    publicId: string,
    transformations?: {
        width?: number;
        height?: number;
        crop?: string;
        quality?: string | number;
        format?: string;
    }
): string {
    try {
        const url = cloudinary.url(publicId, {
            secure: true,
            quality: transformations?.quality || 'auto:good',
            fetch_format: transformations?.format || 'auto',
            width: transformations?.width,
            height: transformations?.height,
            crop: transformations?.crop || 'fill',
        });

        return url;
    } catch (error) {
        console.error('❌ Error generating Cloudinary URL:', error);
        return '';
    }
}

/**
 * Extract public ID from Cloudinary URL
 * @param url - Cloudinary URL
 * @returns string - Public ID
 */
export function extractPublicIdFromUrl(url: string): string {
    try {
        // Extract public ID from Cloudinary URL
        // Example: https://res.cloudinary.com/du6no35fj/image/upload/v1234567890/folder/image.jpg
        const matches = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/);
        return matches ? matches[1] : '';
    } catch (error) {
        console.error('❌ Error extracting public ID:', error);
        return '';
    }
}

export default cloudinary;