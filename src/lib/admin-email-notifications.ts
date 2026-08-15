import dbConnect from '@/lib/db';
import {
    normalizeAdminNotificationPreferences,
    normalizeNotificationEmails,
    type AdminNotificationPreferences,
} from '@/lib/admin-notification-settings';
import {
    sendAdminNewAccountEmail,
    sendAdminNewOrderEmail,
} from '@/lib/email';
import AdminNotificationSettings from '@/models/AdminNotificationSettings';
import Order from '@/models/Order';
import SiteSettings from '@/models/SiteSettings';
import User, { type IUser } from '@/models/User';

export interface AdminNotificationResult {
    sent: boolean;
    reason?: 'duplicate' | 'disabled' | 'no_recipients' | 'not_found' | 'failed';
}

export async function getAdminNotificationPreferences(): Promise<AdminNotificationPreferences> {
    await dbConnect();
    const configured = await AdminNotificationSettings.findOne({ key: 'default' }).lean();
    const preferences = normalizeAdminNotificationPreferences(configured || undefined);

    if (preferences.recipients.length > 0) return preferences;

    const siteSettings = await SiteSettings.findOne().sort({ updatedAt: -1 }).select('email').lean();
    return {
        ...preferences,
        recipients: normalizeNotificationEmails([
            siteSettings?.email,
            process.env.GMAIL_USER,
        ]),
    };
}

type NotificationUser = Pick<
    IUser,
    'role' | 'affiliateLevel' | 'saleApplicationStatus' | 'saleType'
>;

function describeAccountType(user: NotificationUser): string {
    if (user.role === 'staff') return 'Nhân viên';
    if (user.affiliateLevel === 'collaborator' || user.role === 'sale') return 'Cộng tác viên/Đại lý';
    if (user.saleApplicationStatus === 'pending' && user.saleType === 'agent') return 'Đăng ký Đại lý (chờ duyệt)';
    if (user.saleApplicationStatus === 'pending' && user.saleType === 'collaborator') return 'Đăng ký CTV (chờ duyệt)';
    return 'Khách hàng';
}

async function findManagingStaff(user: Pick<IUser, 'parentStaff' | 'commissionSettings' | 'referrer'>) {
    const directManagerId = user.parentStaff || user.commissionSettings?.managerId;
    if (directManagerId) {
        return User.findById(directManagerId).select('name staffCode').lean();
    }

    if (!user.referrer) return null;
    const referrer = await User.findById(user.referrer)
        .select('name staffCode role affiliateLevel parentStaff')
        .lean();
    if (!referrer) return null;
    if (referrer.role === 'staff' || referrer.affiliateLevel === 'staff') return referrer;
    if (referrer.parentStaff) {
        return User.findById(referrer.parentStaff).select('name staffCode').lean();
    }
    return null;
}

export async function notifyAdminOfNewAccount(userId: string): Promise<AdminNotificationResult> {
    try {
        await dbConnect();
        const now = new Date();
        const user = await User.findOneAndUpdate(
            {
                _id: userId,
                adminNewAccountNotificationStatus: { $nin: ['processing', 'sent', 'skipped'] },
            },
            {
                $set: {
                    adminNewAccountNotificationStatus: 'processing',
                    adminNewAccountNotificationLastAttemptAt: now,
                },
            },
            { new: true },
        ).lean();

        if (!user) {
            const exists = await User.exists({ _id: userId });
            return { sent: false, reason: exists ? 'duplicate' : 'not_found' };
        }

        const preferences = await getAdminNotificationPreferences();
        if (!preferences.notifyNewAccount || preferences.recipients.length === 0) {
            await User.updateOne(
                { _id: userId },
                { $set: { adminNewAccountNotificationStatus: 'skipped' } },
            );
            return {
                sent: false,
                reason: preferences.notifyNewAccount ? 'no_recipients' : 'disabled',
            };
        }

        const managingStaff = await findManagingStaff(user);
        await sendAdminNewAccountEmail(preferences.recipients, {
            userId: String(user._id),
            name: user.name,
            email: user.email,
            phone: user.phone,
            accountType: describeAccountType(user),
            staffName: managingStaff?.name,
            staffCode: managingStaff?.staffCode,
            createdAt: user.createdAt,
        });

        await User.updateOne(
            { _id: userId },
            {
                $set: {
                    adminNewAccountNotificationStatus: 'sent',
                    adminNewAccountNotificationSentAt: new Date(),
                },
            },
        );
        return { sent: true };
    } catch (error) {
        console.error('Admin new-account email notification failed:', error);
        await User.updateOne(
            { _id: userId },
            { $set: { adminNewAccountNotificationStatus: 'failed' } },
        ).catch(() => undefined);
        return { sent: false, reason: 'failed' };
    }
}

function describePaymentMethod(value: unknown): string {
    const method = String(value || '').toLowerCase();
    if (method === 'banking') return 'Chuyển khoản ngân hàng';
    if (method === 'cod') return 'Thanh toán khi nhận hàng';
    if (method === 'vnpay') return 'VNPay';
    return String(value || 'Chưa xác định');
}

function describePaymentStatus(value: unknown): string {
    const status = String(value || '').toLowerCase();
    if (['paid', 'completed'].includes(status)) return 'Đã thanh toán';
    if (status === 'failed') return 'Thanh toán thất bại';
    if (status === 'refunded') return 'Đã hoàn tiền';
    return 'Chờ thanh toán';
}

export async function notifyAdminOfNewOrder(orderId: string): Promise<AdminNotificationResult> {
    try {
        await dbConnect();
        const now = new Date();
        const order = await Order.findOneAndUpdate(
            {
                _id: orderId,
                adminNewOrderNotificationStatus: { $nin: ['processing', 'sent', 'skipped'] },
            },
            {
                $set: {
                    adminNewOrderNotificationStatus: 'processing',
                    adminNewOrderNotificationLastAttemptAt: now,
                },
            },
            { new: true },
        ).lean();

        if (!order) {
            const exists = await Order.exists({ _id: orderId });
            return { sent: false, reason: exists ? 'duplicate' : 'not_found' };
        }

        const preferences = await getAdminNotificationPreferences();
        if (!preferences.notifyNewOrder || preferences.recipients.length === 0) {
            await Order.updateOne(
                { _id: orderId },
                { $set: { adminNewOrderNotificationStatus: 'skipped' } },
            );
            return {
                sent: false,
                reason: preferences.notifyNewOrder ? 'no_recipients' : 'disabled',
            };
        }

        const shipping = order.shippingInfo || {};
        const address = [shipping.address, shipping.ward, shipping.district, shipping.city]
            .filter(Boolean)
            .join(', ');
        await sendAdminNewOrderEmail(preferences.recipients, {
            orderId: String(order._id),
            customerName: shipping.fullName || 'Khách vãng lai',
            customerEmail: shipping.email,
            customerPhone: shipping.phone,
            items: (order.items || []).map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
            })),
            shippingFee: Number(order.shippingFee || 0),
            discount: Number(order.voucherDiscountAmount || 0),
            totalAmount: Number(order.totalAmount || 0),
            shippingAddress: address || 'Không yêu cầu giao hàng',
            paymentMethod: describePaymentMethod(order.paymentMethod),
            paymentStatus: describePaymentStatus(order.paymentStatus),
            orderType: order.orderType || 'product',
            createdAt: order.createdAt,
        });

        await Order.updateOne(
            { _id: orderId },
            {
                $set: {
                    adminNewOrderNotificationStatus: 'sent',
                    adminNewOrderNotificationSentAt: new Date(),
                },
            },
        );
        return { sent: true };
    } catch (error) {
        console.error('Admin new-order email notification failed:', error);
        await Order.updateOne(
            { _id: orderId },
            { $set: { adminNewOrderNotificationStatus: 'failed' } },
        ).catch(() => undefined);
        return { sent: false, reason: 'failed' };
    }
}
