import { Metadata } from 'next';
import { getRequestLocale } from '@/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
    const isEnglish = (await getRequestLocale()) === 'en';
    return {
    title: isEnglish ? 'Policies & Terms | Go Nuts' : 'Chính sách & Điều khoản | Go Nuts',
    description: isEnglish ? 'Read Go Nuts policies on returns, shipping, privacy and terms of use.' : 'Chính sách đổi trả, bảo mật, vận chuyển và điều khoản sử dụng của Go Nuts. Cam kết bảo vệ quyền lợi khách hàng.',
    keywords: isEnglish ? ['Go Nuts policies', 'returns', 'shipping', 'privacy', 'terms'] : ['chính sách Go Nuts', 'đổi trả', 'vận chuyển', 'bảo mật', 'điều khoản sử dụng'],
    alternates: {
        canonical: `https://gonuts.vn${isEnglish ? '/en' : ''}/policy`,
        languages: { 'vi-VN': 'https://gonuts.vn/policy', 'en-US': 'https://gonuts.vn/en/policy', 'x-default': 'https://gonuts.vn/policy' },
    },
    openGraph: {
        title: isEnglish ? 'Policies & Terms | Go Nuts' : 'Chính sách & Điều khoản | Go Nuts',
        description: isEnglish ? 'Returns, shipping, privacy and terms of use at Go Nuts.' : 'Chính sách đổi trả, bảo mật, vận chuyển và điều khoản sử dụng của Go Nuts.',
        url: `https://gonuts.vn${isEnglish ? '/en' : ''}/policy`,
    },
    };
}

export default function PolicyLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
