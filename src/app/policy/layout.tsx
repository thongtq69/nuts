import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Chính sách & Điều khoản | Go Nuts',
    description: 'Chính sách đổi trả, bảo mật, vận chuyển và điều khoản sử dụng của Go Nuts. Cam kết bảo vệ quyền lợi khách hàng.',
    keywords: ['chính sách Go Nuts', 'đổi trả', 'vận chuyển', 'bảo mật', 'điều khoản sử dụng'],
    alternates: {
        canonical: 'https://gonuts.vn/policy',
    },
    openGraph: {
        title: 'Chính sách & Điều khoản | Go Nuts',
        description: 'Chính sách đổi trả, bảo mật, vận chuyển và điều khoản sử dụng của Go Nuts.',
        url: 'https://gonuts.vn/policy',
    },
};

export default function PolicyLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
