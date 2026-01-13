import dbConnect from '@/lib/db';
import SubscriptionPackage from '@/models/SubscriptionPackage';
import Breadcrumb from '@/components/common/Breadcrumb';
import Link from 'next/link';
import BuyPackageButton from '@/components/subscription/BuyPackageButton';

export const dynamic = 'force-dynamic';

async function getPackages() {
    await dbConnect();
    const packages = await SubscriptionPackage.find({}).sort({ price: 1 }).lean();
    return packages.map((pkg: any) => ({
        ...pkg,
        _id: pkg._id.toString(),
    }));
}

function formatPrice(price: number) {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
}

export default async function SubscriptionsPage() {
    const packages = await getPackages();

    const packageColors = ['#cd7f32', '#c0c0c0', '#ffd700']; // Bronze, Silver, Gold
    const packageIcons = ['🥉', '🥈', '🥇'];

    return (
        <>
            <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Gói VIP' }]} />

            <section className="subscriptions-hero">
                <div className="container">
                    <h1>Gói VIP - Tiết kiệm hơn mỗi đơn hàng</h1>
                    <p>Mua gói VIP để nhận voucher giảm giá độc quyền, tiết kiệm đến hàng triệu đồng mỗi tháng</p>
                </div>
            </section>

            <section className="subscriptions-section">
                <div className="container">
                    <div className="packages-grid">
                        {packages.map((pkg: any, index: number) => (
                            <div
                                key={pkg._id}
                                className={`package-card ${index === packages.length - 1 ? 'featured' : ''}`}
                                style={{ '--accent-color': packageColors[index] || '#9C7044' } as any}
                            >
                                <div className="package-icon">{packageIcons[index] || '✨'}</div>
                                <h3 className="package-name">{pkg.name}</h3>
                                <div className="package-price">
                                    <span className="price-amount">{formatPrice(pkg.price)}</span>
                                </div>
                                <p className="package-description">{pkg.description}</p>

                                <ul className="package-features">
                                    <li>
                                        <span className="feature-icon">🎟️</span>
                                        <span><strong>{pkg.voucherQuantity}</strong> mã giảm giá</span>
                                    </li>
                                    <li>
                                        <span className="feature-icon">💰</span>
                                        <span>Giảm <strong>{pkg.discountType === 'percent' ? pkg.discountValue + '%' : formatPrice(pkg.discountValue)}</strong></span>
                                    </li>
                                    <li>
                                        <span className="feature-icon">📊</span>
                                        <span>Tối đa <strong>{formatPrice(pkg.maxDiscount)}</strong>/đơn</span>
                                    </li>
                                    {pkg.minOrderValue > 0 && (
                                        <li>
                                            <span className="feature-icon">🛒</span>
                                            <span>Đơn từ <strong>{formatPrice(pkg.minOrderValue)}</strong></span>
                                        </li>
                                    )}
                                    <li>
                                        <span className="feature-icon">⏰</span>
                                        <span>Hiệu lực <strong>{pkg.validityDays} ngày</strong></span>
                                    </li>
                                </ul>

                                <div className="package-savings">
                                    💡 Tiết kiệm tối đa: <strong>{formatPrice(pkg.voucherQuantity * pkg.maxDiscount)}</strong>
                                </div>

                                <BuyPackageButton
                                    packageId={pkg._id}
                                    price={pkg.price}
                                    packageName={pkg.name}
                                />
                            </div>
                        ))}
                    </div>

                    {packages.length === 0 && (
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
                                <Link href="/register" className="btn-register">
                                    Đăng ký ngay
                                </Link>
                            </div>
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
        </>
    );
}
