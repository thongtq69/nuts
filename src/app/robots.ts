import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://gonuts.vn';

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/admin/',
                    '/api/',
                    '/staff/',
                    '/agent/',
                    '/collaborator/',
                    '/login',
                    '/register',
                    '/forgot-password',
                    '/reset-password',
                    '/setup-admin',
                    '/debug-auth',
                    '/test-token',
                    '/clear-token',
                    '/checkout/',
                    '/account/',
                ],
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: [
                    '/admin/',
                    '/api/',
                    '/staff/',
                    '/agent/',
                    '/collaborator/',
                    '/login',
                    '/register',
                    '/forgot-password',
                    '/reset-password',
                    '/setup-admin',
                    '/debug-auth',
                    '/test-token',
                    '/clear-token',
                    '/checkout/',
                    '/account/',
                ],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
