'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

    return (
        <aside className="admin-sidebar">
            <div className="sidebar-header">
                <h2>Go Nuts Admin</h2>
            </div>
            <nav className="sidebar-nav">
                <ul>
                    <li>
                        <Link href="/admin" className={pathname === '/admin' ? 'active' : ''}>
                            Dashboard
                        </Link>
                    </li>
                    <li>
                        <Link href="/admin/products" className={isActive('/admin/products') ? 'active' : ''}>
                            Sản phẩm
                        </Link>
                    </li>
                    <li>
                        <Link href="/admin/orders" className={isActive('/admin/orders') ? 'active' : ''}>
                            Đơn hàng
                        </Link>
                    </li>
                    <li>
                        <Link href="/" target="_blank">
                            Xem trang chủ
                        </Link>
                    </li>
                </ul>
            </nav>
            <style jsx>{`
                .admin-sidebar {
                    width: 250px;
                    background: #2c3e50;
                    color: white;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                }
                .sidebar-header {
                    padding: 20px;
                    border-bottom: 1px solid #34495e;
                }
                .sidebar-header h2 {
                    margin: 0;
                    font-size: 20px;
                }
                .sidebar-nav ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                .sidebar-nav li a {
                    display: block;
                    padding: 15px 20px;
                    color: #ecf0f1;
                    text-decoration: none;
                    border-bottom: 1px solid #34495e;
                    transition: background 0.2s;
                }
                .sidebar-nav li a:hover, .sidebar-nav li a.active {
                    background: #34495e;
                    color: #fff;
                }
            `}</style>
        </aside>
    );
}
