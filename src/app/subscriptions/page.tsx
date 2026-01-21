import dbConnect from '@/lib/db';
import SubscriptionPackage from '@/models/SubscriptionPackage';
import Breadcrumb from '@/components/common/Breadcrumb';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PackageList from '@/components/subscription/PackageList';
import BuyPackageWrapper from '@/components/subscription/BuyPackageWrapper';

export const dynamic = 'force-dynamic';

async function getPackages() {
    await dbConnect();
    const packages = await SubscriptionPackage.find({ isActive: true }).sort({ price: 1 }).lean();
    return packages.map((pkg: any) => ({
        _id: pkg._id.toString(),
        name: pkg.name,
        price: pkg.price,
        imageUrl: pkg.imageUrl || '',
        imagePublicId: pkg.imagePublicId || '',
        description: pkg.description,
        voucherQuantity: pkg.voucherQuantity,
        discountType: pkg.discountType,
        discountValue: pkg.discountValue,
        maxDiscount: pkg.maxDiscount,
        minOrderValue: pkg.minOrderValue,
        validityDays: pkg.validityDays,
        isUnlimitedVoucher: pkg.isUnlimitedVoucher || false,
        badgeText: pkg.badgeText || '',
        terms: pkg.terms,
    }));
}

export default async function SubscriptionsPage() {
    const packages = await getPackages();

    return (
        <>
            <Header />
            <Navbar />
            <main>
                <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Gói VIP' }]} />

                <section className="subscriptions-hero flex flex-col items-center justify-center text-center">
                    <div className="max-w-4xl px-6 py-12 md:py-20 animate-in fade-in slide-in-from-top-4 duration-700">
                        <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-6">
                            Đặc quyền <span className="text-[#E3E846]">VIP</span>
                        </h1>
                        <p className="text-lg md:text-2xl font-medium opacity-70 leading-relaxed max-w-2xl mx-auto">
                            Tiết kiệm triệu đồng mỗi tháng với các lựa chọn hạt dinh dưỡng cao cấp nhất.
                        </p>
                    </div>
                </section>

                <section className="subscriptions-section">
                    <div className="container">
                        {packages.length > 0 ? (
                            <BuyPackageWrapper packages={packages} />
                        ) : (
                            <div className="empty-packages">
                                <h3>Chưa có gói VIP nào</h3>
                                <p>Vui lòng quay lại sau.</p>
                            </div>
                        )}

                        <div className="welcome-voucher-section">
                            <div className="welcome-voucher-card">
                                <div className="voucher-content">
                                    <div className="voucher-icon">🎁</div>
                                    <div className="voucher-info">
                                        <h3>Voucher chào mừng thành viên mới</h3>
                                        <p>Đăng ký tài khoản ngay để nhận voucher <strong>50.000đ</strong> cho đơn hàng đầu tiên từ 300.000đ</p>
                                    </div>
                                </div>
                                <Link href="/register" className="btn-register">
                                    Đăng ký ngay
                                </Link>
                            </div>
                        </div>

                        <div className="faq-section">
                            <h2>Câu hỏi thường gặp</h2>
                            <div className="faq-grid">
                                <div className="faq-item">
                                    <h4>Voucher có thể dùng cho sản phẩm nào?</h4>
                                    <p>Voucher áp dụng cho tất cả sản phẩm trên website, không giới hạn danh mục.</p>
                                </div>
                                <div className="faq-item">
                                    <h4>Mỗi đơn hàng dùng được bao nhiêu voucher?</h4>
                                    <p>Mỗi đơn hàng chỉ áp dụng được 1 voucher. Hãy chọn voucher phù hợp nhất!</p>
                                </div>
                                <div className="faq-item">
                                    <h4>Voucher có thời hạn bao lâu?</h4>
                                    <p>Tùy theo gói, voucher có hiệu lực từ 30-90 ngày kể từ ngày mua gói.</p>
                                </div>
                                <div className="faq-item">
                                    <h4>Có thể mua nhiều gói cùng lúc?</h4>
                                    <p>Có, bạn có thể mua nhiều gói để tích lũy thêm voucher.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
