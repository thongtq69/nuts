import Link from 'next/link';
import React from 'react';

export default function Navbar() {
    return (
        <nav className="main-nav">
            <div className="container">
                <ul className="nav-menu">
                    <li>
                        <Link href="/" className="nav-link active">
                            Trang chủ
                        </Link>
                    </li>
                    <li>
                        <Link href="#" className="nav-link">
                            Sản phẩm bán chạy
                        </Link>
                    </li>
                    <li>
                        <Link href="#" className="nav-link">
                            Sản phẩm mới
                        </Link>
                    </li>
                    <li>
                        <Link href="#" className="nav-link">
                            Sản phẩm
                        </Link>
                    </li>
                    <li>
                        <Link href="#" className="nav-link">
                            Khuyến mãi
                        </Link>
                    </li>
                    <li>
                        <Link href="#" className="nav-link">
                            Thẻ quà tặng
                        </Link>
                    </li>
                    <li>
                        <Link href="/news" className="nav-link">
                            Tin tức
                        </Link>
                    </li>
                    <li>
                        <Link href="/contact" className="nav-link">
                            Liên hệ
                        </Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
}
