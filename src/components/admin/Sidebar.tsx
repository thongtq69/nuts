'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

    const menuItems = [
        { href: '/admin', label: 'Dashboard', exact: true },
        { href: '/admin/products', label: 'Sản phẩm' },
        { href: '/admin/orders', label: 'Đơn hàng' },
        { href: '/admin/users', label: 'Người dùng' },
        { href: '/admin/banners', label: 'Banner' },
        { href: '/admin/blogs', label: 'Bài viết' },
        { href: '/admin/packages', label: 'Gói VIP' },
        { href: '/admin/vouchers', label: 'Voucher' },
    ];

    return (
        <aside className="admin-sidebar">
            <div className="sidebar-header">
                <h2>Go Nuts Admin</h2>
            </div>
            <nav className="sidebar-nav">
                <ul>
                    {menuItems.map((item) => (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                className={item.exact ? (pathname === item.href ? 'active' : '') : (isActive(item.href) ? 'active' : '')}
                            >
                                {item.label}
                            </Link>
                        </li>
                    ))}
                    <li className="separator"></li>
                    <li>
                        <Link href="/" target="_blank">
                            Xem trang chủ
                        </Link>
                    </li>
                </ul>
            </nav>
        </aside>
    );
}
