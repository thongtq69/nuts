import dbConnect from '@/lib/db';
import SubscriptionPackage from '@/models/SubscriptionPackage';
import Breadcrumb from '@/components/common/Breadcrumb';
import Link from 'next/link';
import FAQSection from '@/components/common/FAQSection';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PackageList from '@/components/subscription/PackageList';
import BuyPackageWrapper from '@/components/subscription/BuyPackageWrapper';
import { getRequestLocale } from '@/i18n/server';
import { localizePackage } from '@/lib/localized-content';
import { localizePath } from '@/i18n/config';
import { translate } from '@/i18n/messages';

export const dynamic = 'force-dynamic';

async function getPackages(locale: 'vi' | 'en') {
    await dbConnect();
    const packages = await SubscriptionPackage.find({ isActive: true }).sort({ price: 1 }).lean();
    return packages.map((pkg: any) => localizePackage({
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
        translations: pkg.translations,
    }, locale));
}

export default async function SubscriptionsPage() {
    const locale = await getRequestLocale();
    const packages = await getPackages(locale);
    const t = (source: string) => translate(locale, source);

    return (
        <>
            <Header />
            <Navbar />
            <main>
                <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Gói VIP' }]} />

                <section className="subscriptions-hero flex flex-col items-center justify-center text-center">
                    <div className="max-w-4xl px-6 py-12 md:py-20 animate-in fade-in slide-in-from-top-4 duration-700">
                        <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-6">
                            {t('Đặc quyền')} <span className="text-[#E3E846]">VIP</span>
                        </h1>
                        <p className="text-lg md:text-2xl font-medium opacity-70 leading-relaxed max-w-2xl mx-auto">
                            {t('Tiết kiệm triệu đồng mỗi tháng với các lựa chọn hạt dinh dưỡng cao cấp nhất.')}
                        </p>
                    </div>
                </section>

                <section className="subscriptions-section">
                    <div className="container">
                        {packages.length > 0 ? (
                            <BuyPackageWrapper packages={packages} />
                        ) : (
                            <div className="empty-packages">
                                <h3>{t('Chưa có gói VIP nào')}</h3>
                                <p>{t('Vui lòng quay lại sau.')}</p>
                            </div>
                        )}

                        <div className="welcome-voucher-section">
                            <div className="welcome-voucher-card">
                                <div className="voucher-content">
                                    <div className="voucher-icon">🎁</div>
                                    <div className="voucher-info">
                                        <h3>{t('Voucher chào mừng thành viên mới')}</h3>
                                        <p>{t('Đăng ký tài khoản ngay để nhận voucher')} <strong>50,000₫</strong> {t('cho đơn hàng đầu tiên từ 300.000đ')}</p>
                                    </div>
                                </div>
                                <Link href={localizePath('/register', locale)} className="btn-register">
                                    {t('Đăng ký ngay')}
                                </Link>
                            </div>
                        </div>

                        <div className="mt-20">
                            <FAQSection
                                category="membership"
                                title="Câu hỏi về gói VIP"
                                description="Mọi thắc mắc của bạn về quyền lợi và cách sử dụng gói hội viên sẽ được giải đáp tại đây."
                            />
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
