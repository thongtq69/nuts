'use client';

import Link from 'next/link';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function MembershipSuccessPage() {
    return (
        <main>
            <Header />
            <Navbar />
            <div className="container py-20 text-center">
                <div className="text-6xl mb-6">🎉</div>
                <h1 className="text-3xl font-bold mb-4">Đăng ký thành công!</h1>
                <p className="text-gray-600 mb-8 max-w-lg mx-auto">
                    Thanh toán đã được xác nhận và gói hội viên của bạn đã được kích hoạt tự động.
                </p>
                <div className="flex justify-center gap-4">
                    <Link href="/" className="bg-gray-100 text-gray-800 px-6 py-3 rounded font-medium hover:bg-gray-200">
                        Về trang chủ
                    </Link>
                    <Link href="/account" className="bg-brand text-white px-6 py-3 rounded font-medium hover:bg-brand/90">
                        Xem đơn hàng
                    </Link>
                </div>
            </div>
            <Footer />
        </main>
    );
}
