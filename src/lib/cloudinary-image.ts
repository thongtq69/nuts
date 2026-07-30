export function getOptimizedCloudinaryUrl(
    url: string,
    transformations: string,
): string {
    if (
        !url ||
        !url.includes('res.cloudinary.com') ||
        !url.includes('/image/upload/')
    ) {
        return url;
    }

    return url.replace(
        '/image/upload/',
        `/image/upload/${transformations}/`,
    );
}
