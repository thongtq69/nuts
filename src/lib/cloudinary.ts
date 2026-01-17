import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// Helper function to generate optimized banner URL
export function getOptimizedBannerUrl(publicId: string, options?: {
    width?: number;
    height?: number;
    quality?: string;
}) {
    const { width = 3000, height = 1000, quality = 'auto:best' } = options || {};

    return cloudinary.url(publicId, {
        transformation: [
            {
                width,
                height,
                crop: 'fill',
                gravity: 'center',
                quality,
                fetch_format: 'auto',
            }
        ],
        secure: true,
    });
}

// Helper function to upload image to Cloudinary
export async function uploadToCloudinary(
    file: Buffer | string,
    options?: {
        folder?: string;
        publicId?: string;
        resourceType?: 'image' | 'video' | 'raw' | 'auto';
    }
) {
    const { folder = 'banners', publicId, resourceType = 'image' } = options || {};

    return new Promise((resolve, reject) => {
        const uploadOptions: any = {
            folder,
            resource_type: resourceType,
            // Maximum quality settings
            quality: 'auto:best',
            fetch_format: 'auto',
            // Don't limit file size - keep original resolution
            flags: 'preserve_transparency',
        };

        if (publicId) {
            uploadOptions.public_id = publicId;
        }

        if (typeof file === 'string' && file.startsWith('data:')) {
            // Base64 data URL
            cloudinary.uploader.upload(file, uploadOptions, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        } else if (typeof file === 'string') {
            // URL
            cloudinary.uploader.upload(file, uploadOptions, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        } else {
            // Buffer
            cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }).end(file);
        }
    });
}

// Helper function to delete image from Cloudinary
export async function deleteFromCloudinary(publicId: string) {
    return cloudinary.uploader.destroy(publicId);
}
