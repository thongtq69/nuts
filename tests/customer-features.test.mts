import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { normalizeProductPayload, ProductPayloadError } from '../src/lib/product-payload.ts';
import { describeProductPersistenceError } from '../src/lib/product-persistence-error.ts';
import {
    PRODUCT_CATEGORIES,
    getCategoryValuesWithProducts,
    getProductCategoryLabel,
    sortProductCategoriesAlphabetically,
} from '../src/constants/product-categories.ts';
import { normalizeMenuName } from '../src/lib/menu-name.ts';
import { cleanHTMLContent } from '../src/lib/textUtils.ts';
import { calculateVoucherDiscount } from '../src/lib/voucher-discount.ts';
import { isProductPriceInRanges } from '../src/lib/product-price-filter.ts';
import {
    HOMEPAGE_SECTION_CONFIG,
    HomepageSelectionError,
    normalizeHomepageSelection,
} from '../src/lib/homepage-products.ts';
import { DEFAULT_HOME_FEATURES, normalizeHomeFeatures } from '../src/lib/site-features.ts';
import { formatStaffCode } from '../src/lib/staff-code.ts';
import { addReferralToPath, normalizeReferralCode } from '../src/lib/referral-attribution.ts';
import { ROLE_DEFINITIONS } from '../src/constants/permissions.ts';
import { DEFAULT_HOME_PROMOTION_TEXT, normalizeHomePromotionText } from '../src/lib/home-promotion.ts';
import { calculatePayrollAmounts } from '../src/lib/payroll-formula.ts';
import {
    allocateKpiCommission,
    getEligibleProductRevenue,
    isEligibleStaffRevenueOrder,
} from '../src/lib/staff-commission-rules.ts';
import { calculateLegacyVipSavings } from '../src/lib/vip-savings.ts';
import {
    buildManagedCustomerQuery,
    buildManagedOrderQuery,
    buildMembershipVoucherCode,
    isConfirmedPaymentStatus,
} from '../src/lib/customer-ownership.ts';
import {
    MAX_PASSWORD_LENGTH,
    MIN_PASSWORD_LENGTH,
    getNewPasswordValidationError,
} from '../src/lib/password-policy.ts';

test('authenticated users can change their password and are signed out afterwards', async () => {
    const [changePasswordSource, logoutSource, staffLayoutSource, authContextSource] = await Promise.all([
        readFile(new URL('../src/app/api/auth/change-password/route.ts', import.meta.url), 'utf8'),
        readFile(new URL('../src/app/api/auth/logout/route.ts', import.meta.url), 'utf8'),
        readFile(new URL('../src/app/staff/layout.tsx', import.meta.url), 'utf8'),
        readFile(new URL('../src/context/AuthContext.tsx', import.meta.url), 'utf8'),
    ]);

    assert.match(changePasswordSource, /const auth = await requireAuth\(\)/);
    assert.match(changePasswordSource, /bcrypt\.compare\(currentPassword, user\.password\)/);
    assert.match(changePasswordSource, /bcrypt\.hash\(newPassword, 10\)/);
    assert.match(changePasswordSource, /resetPasswordToken = undefined/);
    assert.match(changePasswordSource, /clearAuthCookie\(response\)/);
    assert.match(logoutSource, /maxAge: 0/);
    assert.match(staffLayoutSource, />Đổi mật khẩu</);
    assert.match(staffLayoutSource, /'Đăng xuất'/);
    assert.match(staffLayoutSource, /\/api\/auth\/change-password/);
    assert.ok(
        staffLayoutSource.indexOf('{/* Account Actions */}') > staffLayoutSource.indexOf('Xem sản phẩm'),
        'staff account actions should appear immediately after the quick product link',
    );
    assert.match(authContextSource, /if \(!response\.ok\)/);
    assert.match(authContextSource, /router\.replace\('\/login'\)/);
});

test('new passwords use the same bounded policy on client and server', () => {
    assert.equal(MIN_PASSWORD_LENGTH, 6);
    assert.equal(MAX_PASSWORD_LENGTH, 128);
    assert.match(getNewPasswordValidationError('short') || '', /6/);
    assert.match(getNewPasswordValidationError('x'.repeat(129)) || '', /128/);
    assert.match(getNewPasswordValidationError('secret1', 'secret1') || '', /khác/);
    assert.equal(getNewPasswordValidationError('secret2', 'secret1'), null);
});

test('customer detail registers the membership package model on cold starts', async () => {
    const source = await readFile(
        new URL('../src/lib/customer-detail.ts', import.meta.url),
        'utf8',
    );

    assert.match(
        source,
        /import SubscriptionPackage from '@\/models\/SubscriptionPackage';/,
    );
    assert.match(source, /model: SubscriptionPackage,/);
});

test('staff payroll and customer finance APIs are scoped to the authenticated account', async () => {
    const [staffPayrollSource, customerFinanceSource, staffCustomerSource] = await Promise.all([
        readFile(new URL('../src/app/api/staff/payroll/route.ts', import.meta.url), 'utf8'),
        readFile(new URL('../src/app/api/user/financial-summary/route.ts', import.meta.url), 'utf8'),
        readFile(new URL('../src/app/api/staff/customers/[id]/route.ts', import.meta.url), 'utf8'),
    ]);

    assert.match(staffPayrollSource, /staffId: auth\.user\._id/);
    assert.match(staffPayrollSource, /getStaffMonthlyRevenue\(auth\.user\._id/);
    assert.match(customerFinanceSource, /getCustomerFinancialSummary\(auth\.user\._id\)/);
    assert.match(staffCustomerSource, /buildManagedCustomerQuery/);
});

test('staff customer details never expose customer voucher codes', async () => {
    const [staffCustomerApiSource, staffCustomerPageSource, customerDetailSource, adminCustomerApiSource] = await Promise.all([
        readFile(new URL('../src/app/api/staff/customers/[id]/route.ts', import.meta.url), 'utf8'),
        readFile(new URL('../src/app/staff/customers/[id]/page.tsx', import.meta.url), 'utf8'),
        readFile(new URL('../src/lib/customer-detail.ts', import.meta.url), 'utf8'),
        readFile(new URL('../src/app/api/admin/users/[id]/detail/route.ts', import.meta.url), 'utf8'),
    ]);

    assert.match(staffCustomerApiSource, /getCustomerDetail\(customer, \{ includeVouchers: false \}\)/);
    assert.match(customerDetailSource, /includeVouchers = true/);
    assert.match(customerDetailSource, /\.\.\.\(includeVouchers \? \{ vouchers \} : \{\}\)/);
    assert.match(adminCustomerApiSource, /getCustomerDetail\(user\)/);
    assert.doesNotMatch(staffCustomerPageSource, /customer\.vouchers/);
    assert.doesNotMatch(staffCustomerPageSource, /voucher\.code/);
    assert.doesNotMatch(staffCustomerPageSource, /key: ['"]vouchers['"]/);
});

test('staff banner management is authenticated and limited to banner settings', async () => {
    const [bannerCrudSource, bannerSettingsSource, uploadSource, staffBannerPageSource, productListSource, homePromoSource] = await Promise.all([
        readFile(new URL('../src/app/api/staff/banners/route.ts', import.meta.url), 'utf8'),
        readFile(new URL('../src/app/api/staff/banner-settings/route.ts', import.meta.url), 'utf8'),
        readFile(new URL('../src/app/api/upload/route.ts', import.meta.url), 'utf8'),
        readFile(new URL('../src/app/staff/banners/page.tsx', import.meta.url), 'utf8'),
        readFile(new URL('../src/components/products/ProductList.tsx', import.meta.url), 'utf8'),
        readFile(new URL('../src/components/home/LargePromoBanner.tsx', import.meta.url), 'utf8'),
    ]);

    for (const source of [bannerCrudSource, bannerSettingsSource, uploadSource]) {
        assert.match(source, /requireStaffAuth/);
        assert.match(source, /if \(!auth\.user\)/);
    }

    assert.match(bannerSettingsSource, /productsBannerUrl/);
    assert.match(bannerSettingsSource, /homePromoBannerUrl/);
    assert.match(bannerSettingsSource, /normalizeBannerUpdate/);
    assert.doesNotMatch(bannerSettingsSource, /\.\.\.body/);
    assert.match(staffBannerPageSource, /StaffSiteBannerSettings/);
    assert.match(productListSource, /settings\.productsBannerEnabled && settings\.productsBannerUrl/);
    assert.match(homePromoSource, /!settings\.homePromoBannerEnabled \|\| !settings\.homePromoBannerUrl/);
});

test('customer care order cards include fulfillment and payment details without vouchers', async () => {
    const [customerDetailSource, orderDetailsSource, staffCustomerPageSource, adminCustomerPageSource] = await Promise.all([
        readFile(new URL('../src/lib/customer-detail.ts', import.meta.url), 'utf8'),
        readFile(new URL('../src/components/customers/CustomerOrderDetails.tsx', import.meta.url), 'utf8'),
        readFile(new URL('../src/app/staff/customers/[id]/page.tsx', import.meta.url), 'utf8'),
        readFile(new URL('../src/app/admin/users/[id]/page.tsx', import.meta.url), 'utf8'),
    ]);

    assert.match(customerDetailSource, /items shippingInfo paymentMethod shippingFee totalAmount status paymentStatus/);
    assert.doesNotMatch(customerDetailSource, /select\([^\n]*voucherCode/);
    assert.match(orderDetailsSource, /Chờ thanh toán/);
    assert.match(orderDetailsSource, /Đã thanh toán/);
    assert.match(orderDetailsSource, /Sản phẩm trong đơn/);
    assert.match(orderDetailsSource, /Địa chỉ giao hàng/);
    assert.match(staffCustomerPageSource, /<CustomerOrderDetails orders=\{customer\.recentOrders\}/);
    assert.match(adminCustomerPageSource, /<CustomerOrderDetails orders=\{user\.recentOrders\}/);
});

test('the storefront uses the polished shared Zalo icon', async () => {
    const [zaloIconSource, topBarSource, headerSource] = await Promise.all([
        readFile(new URL('../src/components/icons/ZaloIcon.tsx', import.meta.url), 'utf8'),
        readFile(new URL('../src/components/layout/TopBar.tsx', import.meta.url), 'utf8'),
        readFile(new URL('../src/components/layout/Header.tsx', import.meta.url), 'utf8'),
    ]);

    assert.match(zaloIconSource, />\s*Zalo\s*</);
    assert.match(zaloIconSource, /aria-hidden="true"/);
    assert.match(topBarSource, /<ZaloIcon/);
    assert.match(headerSource, /<ZaloIcon/);
    assert.match(topBarSource, /aria-label="Chat Go Nuts qua Zalo"/);
});

test('voucher validation is bound to the authenticated voucher owner', async () => {
    const [applyVoucherSource, orderSource] = await Promise.all([
        readFile(new URL('../src/app/api/vouchers/apply/route.ts', import.meta.url), 'utf8'),
        readFile(new URL('../src/app/api/orders/route.ts', import.meta.url), 'utf8'),
    ]);

    assert.match(applyVoucherSource, /if \(!decoded\)/);
    assert.match(applyVoucherSource, /userId: decoded\.id/);
    assert.match(orderSource, /if \(!userId\)/);
    assert.match(orderSource, /userId,/);
});

test('voucher management endpoints are admin-only', async () => {
    const managementApiSources = await Promise.all([
        readFile(new URL('../src/app/api/vouchers/groups/route.ts', import.meta.url), 'utf8'),
        readFile(new URL('../src/app/api/vouchers/all/route.ts', import.meta.url), 'utf8'),
        readFile(new URL('../src/app/api/vouchers/[id]/route.ts', import.meta.url), 'utf8'),
    ]);

    for (const source of managementApiSources) {
        assert.match(source, /import \{ requireAdminAuth \} from '@\/lib\/auth-permissions';/);
        assert.match(source, /const auth = await requireAdminAuth\(\);/);
        assert.match(source, /if \(!auth\.user\)/);
    }
});

test('staff roles can never inherit customer voucher permissions', async () => {
    for (const roleType of ['manager', 'sales', 'support'] as const) {
        assert.equal(
            ROLE_DEFINITIONS[roleType].permissions.some(permission => permission.startsWith('vouchers:')),
            false,
        );
    }

    const [authPermissionsSource, middlewareSource] = await Promise.all([
        readFile(new URL('../src/lib/auth-permissions.ts', import.meta.url), 'utf8'),
        readFile(new URL('../src/middleware.ts', import.meta.url), 'utf8'),
    ]);
    assert.match(authPermissionsSource, /customPermissions[\s\S]*filter\(permission => !permission\.startsWith\('vouchers:'\)\)/);
    assert.match(middlewareSource, /if \(requiredPermission\.startsWith\('vouchers:'\)\) return false;/);
});

test('staff customer scope includes only direct and team referral relationships', () => {
    const query = buildManagedCustomerQuery('staff-1', ['collab-1']);
    assert.equal(query.role, 'user');
    assert.deepEqual(query.$or, [
        { parentStaff: 'staff-1' },
        { 'commissionSettings.managerId': 'staff-1' },
        { referrer: { $in: ['staff-1', 'collab-1'] } },
    ]);
});

test('staff order scope includes only team referrals and managed customers', () => {
    const query = buildManagedOrderQuery(
        'staff-1',
        ['collab-1', 'collab-2'],
        ['customer-1'],
    );

    assert.deepEqual(query.$or, [
        { referrer: { $in: ['staff-1', 'collab-1', 'collab-2'] } },
        { user: { $in: ['customer-1'] } },
        { userId: { $in: ['customer-1'] } },
    ]);
});

test('staff orders page loads scoped API data instead of sample orders', async () => {
    const [apiSource, pageSource] = await Promise.all([
        readFile(new URL('../src/app/api/staff/orders/route.ts', import.meta.url), 'utf8'),
        readFile(new URL('../src/app/staff/orders/page.tsx', import.meta.url), 'utf8'),
    ]);

    assert.match(apiSource, /const auth = await requireStaffAuth\(\)/);
    assert.match(apiSource, /buildManagedCustomerQuery/);
    assert.match(apiSource, /buildManagedOrderQuery/);
    assert.match(pageSource, /fetch\('\/api\/staff\/orders'/);
    assert.match(pageSource, />Chưa có đơn hàng nào</);
    assert.doesNotMatch(pageSource, /ORD001|ORD002|ORD003/);
});

test('membership vouchers can only be activated after confirmed payment', () => {
    assert.equal(isConfirmedPaymentStatus('pending'), false);
    assert.equal(isConfirmedPaymentStatus('failed'), false);
    assert.equal(isConfirmedPaymentStatus('paid'), true);
    assert.equal(isConfirmedPaymentStatus('completed'), true);
});

test('membership packages only accept bank transfer payments', async () => {
    const [checkoutSource, buyPackageSource] = await Promise.all([
        readFile(new URL('../src/app/checkout/membership/page.tsx', import.meta.url), 'utf8'),
        readFile(new URL('../src/app/api/packages/buy/route.ts', import.meta.url), 'utf8'),
    ]);

    assert.match(checkoutSource, /paymentMethod: 'banking'/);
    assert.match(checkoutSource, /Phương thức thanh toán duy nhất/);
    assert.doesNotMatch(checkoutSource, /setPaymentMethod\('cod'\)/);
    assert.doesNotMatch(checkoutSource, /Với phương thức COD/);
    assert.match(buyPackageSource, /requestedPaymentMethod !== 'banking'/);
    assert.match(buyPackageSource, /Gói hội viên chỉ hỗ trợ thanh toán chuyển khoản/);
});

test('membership voucher codes are stable per order and voucher position', () => {
    assert.equal(buildMembershipVoucherCode('698abc1234567890', 0), 'VIP3456789001');
    assert.equal(buildMembershipVoucherCode('698abc1234567890', 1), 'VIP3456789002');
});

test('salary is reduced by the missing KPI percentage when KPI is not reached', () => {
    const payroll = calculatePayrollAmounts({
        baseSalary: 7_000_000,
        kpiTarget: 200_000_000,
        commissionRate: 3,
        revenue: 180_000_000,
    });

    assert.equal(payroll.achievementPercentage, 90);
    assert.equal(payroll.kpiShortfallPercentage, 10);
    assert.equal(payroll.earnedBaseSalary, 6_300_000);
    assert.equal(payroll.commissionAmount, 0);
    assert.equal(payroll.totalSalary, 6_300_000);
});

test('commission is calculated only on revenue above KPI', () => {
    const payroll = calculatePayrollAmounts({
        baseSalary: 7_000_000,
        kpiTarget: 200_000_000,
        commissionRate: 3,
        revenue: 250_000_000,
    });

    assert.equal(payroll.achievementPercentage, 125);
    assert.equal(payroll.earnedBaseSalary, 7_000_000);
    assert.equal(payroll.excessRevenue, 50_000_000);
    assert.equal(payroll.commissionAmount, 1_500_000);
    assert.equal(payroll.totalSalary, 8_500_000);
});

test('staff KPI revenue is product revenue after discounts and excludes shipping', () => {
    const order = {
        orderType: 'product',
        status: 'confirmed',
        paymentStatus: 'paid',
        // 100k product - 10k voucher + 20k shipping
        totalAmount: 110_000,
        shippingFee: 20_000,
    };

    assert.equal(isEligibleStaffRevenueOrder(order), true);
    assert.equal(getEligibleProductRevenue(order), 90_000);
});

test('cancelled, refunded, unpaid and membership orders never count toward staff KPI', () => {
    const baseOrder = {
        orderType: 'product',
        status: 'completed',
        paymentStatus: 'paid',
        totalAmount: 120_000,
        shippingFee: 20_000,
    };

    assert.equal(getEligibleProductRevenue({ ...baseOrder, status: 'cancelled' }), 0);
    assert.equal(getEligibleProductRevenue({ ...baseOrder, status: 'refunded' }), 0);
    assert.equal(getEligibleProductRevenue({
        ...baseOrder,
        status: 'pending',
        paymentStatus: 'pending',
    }), 0);
    assert.equal(getEligibleProductRevenue({ ...baseOrder, orderType: 'membership' }), 0);
});

test('per-order staff commission starts only on the portion crossing KPI', () => {
    const allocations = allocateKpiCommission([
        {
            id: 'before-kpi',
            orderType: 'product',
            status: 'completed',
            totalAmount: 95_000_000,
            shippingFee: 0,
            createdAt: '2026-08-01T00:00:00.000Z',
        },
        {
            id: 'crosses-kpi',
            orderType: 'product',
            status: 'completed',
            totalAmount: 10_000_000,
            shippingFee: 0,
            createdAt: '2026-08-02T00:00:00.000Z',
        },
    ], 100_000_000, 3);

    assert.equal(allocations[0].commissionAmount, 0);
    assert.equal(allocations[1].commissionableRevenue, 5_000_000);
    assert.equal(allocations[1].commissionAmount, 150_000);
});

test('reaching KPI exactly does not create staff commission', () => {
    const [allocation] = allocateKpiCommission([{
        orderType: 'product',
        status: 'completed',
        totalAmount: 100_000_000,
        shippingFee: 0,
        createdAt: '2026-08-01T00:00:00.000Z',
    }], 100_000_000, 3);

    assert.equal(allocation.commissionableRevenue, 0);
    assert.equal(allocation.commissionAmount, 0);
});

test('sum of per-order allocations exactly matches the Admin monthly commission', () => {
    const orders = [1, 2, 3].map((index) => ({
        orderType: 'product',
        status: 'completed',
        totalAmount: index === 1 ? 100_000_000 : 17,
        shippingFee: 0,
        createdAt: `2026-08-0${index}T00:00:00.000Z`,
    }));
    const allocations = allocateKpiCommission(orders, 100_000_000, 3);
    const staffTotal = allocations.reduce((sum, allocation) => sum + allocation.commissionAmount, 0);
    const adminTotal = calculatePayrollAmounts({
        baseSalary: 7_000_000,
        kpiTarget: 100_000_000,
        commissionRate: 3,
        revenue: 100_000_034,
    }).commissionAmount;

    assert.equal(staffTotal, adminTotal);
});

test('admin payroll and staff commission APIs share the KPI revenue source', async () => {
    const [adminPayrollSource, staffPayrollSource, staffCommissionsSource, orderSource] = await Promise.all([
        readFile(new URL('../src/app/api/admin/payroll/route.ts', import.meta.url), 'utf8'),
        readFile(new URL('../src/app/api/staff/payroll/route.ts', import.meta.url), 'utf8'),
        readFile(new URL('../src/app/api/staff/commissions/route.ts', import.meta.url), 'utf8'),
        readFile(new URL('../src/app/api/orders/route.ts', import.meta.url), 'utf8'),
    ]);

    assert.match(adminPayrollSource, /getStaffMonthlyRevenue/);
    assert.match(staffPayrollSource, /getStaffMonthlyRevenue/);
    assert.match(staffCommissionsSource, /getStaffEligibleRevenueOrders/);
    assert.match(staffCommissionsSource, /allocateKpiCommission/);
    assert.doesNotMatch(orderSource, /Staff override from collaborator/);
});

test('every admin order mutation synchronizes or removes legacy commission records', async () => {
    const [adminOrdersSource, adminOrderSource, genericOrderSource, lifecycleSource] = await Promise.all([
        readFile(new URL('../src/app/api/admin/orders/route.ts', import.meta.url), 'utf8'),
        readFile(new URL('../src/app/api/admin/orders/[id]/route.ts', import.meta.url), 'utf8'),
        readFile(new URL('../src/app/api/orders/[id]/route.ts', import.meta.url), 'utf8'),
        readFile(new URL('../src/lib/affiliate-commission-lifecycle.ts', import.meta.url), 'utf8'),
    ]);

    assert.match(adminOrdersSource, /syncAffiliateCommissionsForOrderStatus/);
    assert.match(adminOrderSource, /syncAffiliateCommissionsForOrderStatus/);
    assert.match(genericOrderSource, /syncAffiliateCommissionsForOrderStatus/);
    assert.match(adminOrderSource, /removeAffiliateCommissionsForOrder/);
    assert.match(genericOrderSource, /removeAffiliateCommissionsForOrder/);
    assert.match(lifecycleSource, /commission\.status = 'rejected'/);
});

test('legacy VIP savings use the actual voucher reduction after product pricing', () => {
    assert.equal(calculateLegacyVipSavings({
        items: [{ price: 200_000, quantity: 1 }],
        shippingFee: 0,
        totalAmount: 150_000,
    }), 50_000);
});

test('staff codes are generated in the required fixed-width sequence', () => {
    assert.equal(formatStaffCode(1), 'NV000001');
    assert.equal(formatStaffCode(42), 'NV000042');
});

test('staff referral code stays attached to every registration URL', () => {
    assert.equal(
        addReferralToPath('/register?type=collaborator', 'nv000001'),
        '/register?type=collaborator&ref=NV000001',
    );
    assert.equal(normalizeReferralCode(' nv000042 '), 'NV000042');
    assert.equal(normalizeReferralCode('mã không hợp lệ'), '');
});

test('staff roles do not inherit article publishing rights automatically', () => {
    for (const [role, definition] of Object.entries(ROLE_DEFINITIONS)) {
        if (role === 'admin') continue;
        assert.equal(
            definition.permissions.some(permission => permission.startsWith('blogs:')),
            false,
            `${role} must receive blog permissions explicitly`,
        );
    }

    assert.equal(ROLE_DEFINITIONS.admin.permissions.includes('blogs:create'), true);
});

test('homepage commitments keep four editable content boxes', () => {
    assert.equal(DEFAULT_HOME_FEATURES.length, 4);
    assert.deepEqual(
        DEFAULT_HOME_FEATURES.map(feature => feature.icon),
        ['truck', 'refresh', 'shield', 'users'],
    );
});

test('the homepage announcement strip keeps an editable normalized value', () => {
    assert.equal(
        normalizeHomePromotionText('  Miễn phí vận chuyển từ 500.000đ  '),
        'Miễn phí vận chuyển từ 500.000đ',
    );
    assert.equal(normalizeHomePromotionText(undefined), DEFAULT_HOME_PROMOTION_TEXT);
    assert.equal(normalizeHomePromotionText('x'.repeat(301)).length, 300);
});

test('homepage commitment content is normalized before saving', () => {
    const features = normalizeHomeFeatures([
        { text: '  Miễn phí từ 500.000đ  ', icon: 'truck', enabled: true },
        { text: 'Đổi trả trong 7 ngày', icon: 'refresh', enabled: false },
    ]);

    assert.equal(features.length, 4);
    assert.equal(features[0].text, 'Miễn phí từ 500.000đ');
    assert.equal(features[1].enabled, false);
    assert.equal(features[2].text, DEFAULT_HOME_FEATURES[2].text);
});

test('homepage product groups keep the requested limits', () => {
    assert.equal(HOMEPAGE_SECTION_CONFIG.bestSeller.limit, 8);
    assert.equal(HOMEPAGE_SECTION_CONFIG.new.limit, 8);
    assert.equal(HOMEPAGE_SECTION_CONFIG.promo.limit, 8);
    assert.equal(HOMEPAGE_SECTION_CONFIG.linked.limit, 6);
});

test('homepage product selection removes duplicate ids', () => {
    assert.deepEqual(
        normalizeHomepageSelection('linked', ['a', 'a', 'b']).productIds,
        ['a', 'b'],
    );
});

test('homepage product selection rejects more products than the section can display', () => {
    assert.throws(
        () => normalizeHomepageSelection(
            'linked',
            Array.from({ length: 7 }, (_, index) => `product-${index}`),
        ),
        HomepageSelectionError,
    );
});

test('product price ranges use non-overlapping storefront boundaries', () => {
    assert.equal(isProductPriceInRanges(99_999, ['under-100k']), true);
    assert.equal(isProductPriceInRanges(100_000, ['under-100k']), false);
    assert.equal(isProductPriceInRanges(100_000, ['100k-300k']), true);
    assert.equal(isProductPriceInRanges(300_000, ['100k-300k']), false);
    assert.equal(isProductPriceInRanges(300_000, ['300k-500k']), true);
    assert.equal(isProductPriceInRanges(500_000, ['300k-500k']), true);
    assert.equal(isProductPriceInRanges(500_000, ['over-500k']), false);
    assert.equal(isProductPriceInRanges(500_001, ['over-500k']), true);
});

test('selecting multiple product price ranges combines their results', () => {
    const selectedRanges = ['under-100k', 'over-500k'] as const;

    assert.equal(isProductPriceInRanges(50_000, selectedRanges), true);
    assert.equal(isProductPriceInRanges(175_000, selectedRanges), false);
    assert.equal(isProductPriceInRanges(691_200, selectedRanges), true);
    assert.equal(isProductPriceInRanges(175_000, []), true);
});

test('VIP 30% on 200,000đ is capped at 50,000đ for the product', () => {
    const discount = calculateVoucherDiscount({
        discountType: 'percent',
        discountValue: 30,
        items: [{ unitPrice: 200_000, quantity: 1, vipMaxDiscount: 50_000 }],
        applyProductCaps: true,
    });

    assert.equal(discount, 50_000);
    assert.equal(200_000 - discount, 150_000);
});

test('each product uses its own VIP limit before the whole-voucher limit', () => {
    const discount = calculateVoucherDiscount({
        discountType: 'percent',
        discountValue: 30,
        voucherMaxDiscount: 60_000,
        items: [
            { unitPrice: 200_000, quantity: 1, vipMaxDiscount: 50_000 },
            { unitPrice: 100_000, quantity: 1, vipMaxDiscount: 20_000 },
        ],
        applyProductCaps: true,
    });

    assert.equal(discount, 60_000);
});

test('the product VIP limit is applied per purchased unit', () => {
    const discount = calculateVoucherDiscount({
        discountType: 'percent',
        discountValue: 30,
        items: [{ unitPrice: 200_000, quantity: 2, vipMaxDiscount: 50_000 }],
        applyProductCaps: true,
    });

    assert.equal(discount, 100_000);
});

test('zero means that the product has no individual VIP limit', () => {
    const discount = calculateVoucherDiscount({
        discountType: 'percent',
        discountValue: 30,
        items: [{ unitPrice: 200_000, quantity: 1, vipMaxDiscount: 0 }],
        applyProductCaps: true,
    });

    assert.equal(discount, 60_000);
});

test('fixed VIP vouchers also respect the total of product limits', () => {
    const discount = calculateVoucherDiscount({
        discountType: 'fixed',
        discountValue: 80_000,
        items: [
            { unitPrice: 200_000, quantity: 1, vipMaxDiscount: 50_000 },
            { unitPrice: 100_000, quantity: 1, vipMaxDiscount: 20_000 },
        ],
        applyProductCaps: true,
    });

    assert.equal(discount, 70_000);
});

test('the VIP limit is rounded before the product is persisted', () => {
    const product = normalizeProductPayload({
        vipMaxDiscount: 50_000.4,
    });

    assert.equal(product.vipMaxDiscount, 50_000);
});

test('a linked product requires a submenu', () => {
    assert.throws(
        () => normalizeProductPayload({
            isLinkedProduct: true,
            linkedCategory: '   ',
            vipMaxDiscount: 0,
        }),
        ProductPayloadError,
    );
});

test('a linked product submenu is normalized before persistence', () => {
    const product = normalizeProductPayload({
        isLinkedProduct: true,
        linkedCategory: '  Táo   đỏ  ',
        vipMaxDiscount: 0,
    });

    assert.equal(product.isLinkedProduct, true);
    assert.equal(product.linkedCategory, 'Táo đỏ');
});

test('a regular product does not retain a linked submenu', () => {
    const product = normalizeProductPayload({
        isLinkedProduct: false,
        linkedCategory: 'Bánh',
        vipMaxDiscount: 0,
    });

    assert.equal(product.isLinkedProduct, false);
    assert.equal(product.linkedCategory, '');
});

test('a negative per-product VIP limit is rejected', () => {
    assert.throws(
        () => normalizeProductPayload({
            vipMaxDiscount: -1,
        }),
        ProductPayloadError,
    );
});

test('database quota errors are translated into a useful admin message', () => {
    const error = new Error(
        'you are over your space quota, using 513 MB of 512 MB. Writes are blocked on your cluster',
    );
    const result = describeProductPersistenceError(error, 'create');

    assert.equal(result.status, 507);
    assert.match(result.message, /Cơ sở dữ liệu đã đầy/);
});

test('duplicate product errors return a conflict instead of a generic failure', () => {
    const result = describeProductPersistenceError({ code: 11000 }, 'create');

    assert.equal(result.status, 409);
    assert.match(result.message, /đã tồn tại/);
});

test('the storefront and product form share the same icon-free categories', () => {
    assert.deepEqual(
        PRODUCT_CATEGORIES.map(category => category.label),
        ['Các loại hạt', 'Đồ ăn vặt', 'Hạt giống', 'Hũ đựng', 'Quả mọng', 'Trái cây sấy', 'Túi đựng'],
    );
    assert.equal(getProductCategoryLabel('Dried Fruits'), 'Trái cây sấy');
    assert.equal(
        new Set(PRODUCT_CATEGORIES.map(category => category.value)).size,
        PRODUCT_CATEGORIES.length,
    );
});

test('product categories use English alphabetical order without Vietnamese accents', () => {
    const categories = sortProductCategoriesAlphabetically([
        { label: 'Yến Sào' },
        { label: 'Đông Trùng Hạ Thảo' },
        { label: 'Bánh' },
        { label: 'Áo quà tặng' },
    ]);

    assert.deepEqual(
        categories.map(category => category.label),
        ['Áo quà tặng', 'Bánh', 'Đông Trùng Hạ Thảo', 'Yến Sào'],
    );
});

test('the storefront only shows categories containing regular products', () => {
    const categoryValues = getCategoryValuesWithProducts([
        { category: 'Nuts', isLinkedProduct: false },
        { category: 'Nuts', isLinkedProduct: false },
        { category: 'Berries', isLinkedProduct: true },
        { category: '  Snacks  ' },
        { category: '' },
    ]);

    assert.deepEqual(categoryValues, ['Nuts', 'Snacks']);
});

test('new category names are normalized before they are saved', () => {
    assert.equal(normalizeMenuName('  Đông   trùng hạ thảo  '), 'Đông trùng hạ thảo');
});

test('short product descriptions preserve an intentional VAT line break', () => {
    const description = 'Đông Trùng Hạ Thảo khô 300mg.\nGiá bán đã bao gồm VAT';
    assert.equal(cleanHTMLContent(description), description);
});
