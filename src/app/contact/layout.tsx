import { Metadata } from 'next';
import { getRequestLocale } from '@/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
    const isEnglish = (await getRequestLocale()) === 'en';
    return {
    title: isEnglish ? 'Contact Go Nuts - Hotline, Address & Email' : 'Liên hệ Go Nuts - Hotline, Địa chỉ, Email',
    description: isEnglish ? 'Contact Go Nuts by hotline, email or at our Hanoi office. Our team is ready to help with products, orders and partnerships.' : 'Liên hệ Go Nuts qua hotline 096 118 5753, email contact.gonuts@gmail.com. Địa chỉ: Khu đô thị An Hưng, Dương Nội, Hà Nội. Giờ làm việc: T2-T7, 8:00-17:30.',
    keywords: isEnglish ? ['contact Go Nuts', 'Go Nuts hotline', 'Go Nuts Hanoi'] : ['liên hệ Go Nuts', 'hotline Go Nuts', 'địa chỉ Go Nuts', 'mua hạt dinh dưỡng Hà Nội'],
    alternates: {
        canonical: `https://gonuts.vn${isEnglish ? '/en' : ''}/contact`,
        languages: { 'vi-VN': 'https://gonuts.vn/contact', 'en-US': 'https://gonuts.vn/en/contact', 'x-default': 'https://gonuts.vn/contact' },
    },
    openGraph: {
        title: isEnglish ? 'Contact Go Nuts | Hotline, Address & Email' : 'Liên hệ Go Nuts | Hotline, Địa chỉ, Email',
        description: isEnglish ? 'Contact Go Nuts for product, order and partnership support.' : 'Liên hệ Go Nuts - Hotline: 096 118 5753. Địa chỉ: Khu đô thị An Hưng, Dương Nội, Hà Nội.',
        url: `https://gonuts.vn${isEnglish ? '/en' : ''}/contact`,
    },
    };
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
