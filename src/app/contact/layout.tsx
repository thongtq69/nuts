import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Liên hệ Go Nuts - Hotline, Địa chỉ, Email',
    description: 'Liên hệ Go Nuts qua hotline 096 118 5753, email contact.gonuts@gmail.com. Địa chỉ: Khu đô thị An Hưng, Dương Nội, Hà Nội. Giờ làm việc: T2-T7, 8:00-17:30.',
    keywords: ['liên hệ Go Nuts', 'hotline Go Nuts', 'địa chỉ Go Nuts', 'mua hạt dinh dưỡng Hà Nội'],
    alternates: {
        canonical: 'https://gonuts.vn/contact',
    },
    openGraph: {
        title: 'Liên hệ Go Nuts | Hotline, Địa chỉ, Email',
        description: 'Liên hệ Go Nuts - Hotline: 096 118 5753. Địa chỉ: Khu đô thị An Hưng, Dương Nội, Hà Nội.',
        url: 'https://gonuts.vn/contact',
    },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
