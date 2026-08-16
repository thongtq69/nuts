import { isConfirmedPaymentStatus } from './customer-ownership.ts';

/**
 * Pure order presentation + eligibility rules shared by the API routes and the
 * customer UI, so both sides agree on what a customer may do with an order.
 * Must stay free of database imports — this is bundled into client components.
 */

export const ORDER_STATUS_LABELS: Record<string, string> = {
    pending: 'Chờ xử lý',
    confirmed: 'Đã xác nhận',
    processing: 'Đang xử lý',
    paid: 'Đã thanh toán',
    shipping: 'Đang giao',
    shipped: 'Đang giao',
    delivered: 'Đã giao',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
    pending: 'Chờ thanh toán',
    unpaid: 'Chờ thanh toán',
    paid: 'Đã thanh toán',
    completed: 'Đã thanh toán',
    failed: 'Thanh toán thất bại',
    refunded: 'Đã hoàn tiền',
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
    banking: 'Chuyển khoản ngân hàng',
    bank_transfer: 'Chuyển khoản ngân hàng',
    acb: 'Chuyển khoản ACB',
    cod: 'Thanh toán khi nhận hàng (COD)',
    vnpay: 'VNPay',
};

export function orderStatusLabel(status?: string): string {
    const key = String(status || '').toLowerCase();
    return ORDER_STATUS_LABELS[key] || status || 'Không rõ';
}

export function paymentStatusLabel(status?: string): string {
    const key = String(status || '').toLowerCase();
    return PAYMENT_STATUS_LABELS[key] || 'Chờ thanh toán';
}

export function paymentMethodLabel(method?: string): string {
    const key = String(method || '').toLowerCase();
    return PAYMENT_METHOD_LABELS[key] || method || 'Chưa xác định';
}

export interface CancellableOrderShape {
    status?: string;
    paymentStatus?: string;
    orderType?: string;
    membershipActivatedAt?: string | Date | null;
}

const CUSTOMER_CANCELLABLE_STATUSES = ['pending', 'processing', 'confirmed'];

/**
 * Returns the reason the customer cannot cancel, or null when they can.
 * Anything already paid needs a human to agree on a refund first.
 */
export function describeCustomerCancelBlock(order: CancellableOrderShape): string | null {
    const status = String(order.status || '').trim().toLowerCase();

    if (status === 'cancelled') return 'Đơn hàng này đã được hủy trước đó.';
    if (isConfirmedPaymentStatus(order.paymentStatus)) {
        return 'Đơn đã thanh toán nên không thể tự hủy. Vui lòng liên hệ cửa hàng để được hỗ trợ hoàn tiền.';
    }
    if (order.orderType === 'membership' && order.membershipActivatedAt) {
        return 'Gói hội viên đã kích hoạt nên không thể tự hủy. Vui lòng liên hệ cửa hàng.';
    }
    if (!CUSTOMER_CANCELLABLE_STATUSES.includes(status)) {
        return 'Đơn hàng đang được xử lý nên không thể tự hủy. Vui lòng liên hệ cửa hàng.';
    }

    return null;
}

export function canCustomerCancelOrder(order: CancellableOrderShape): boolean {
    return describeCustomerCancelBlock(order) === null;
}

export interface ResumablePaymentOrder {
    _id: string;
    paymentRef?: string;
    paymentMethod?: string;
    paymentStatus?: string;
    status?: string;
    totalAmount?: number;
    shippingInfo?: { fullName?: string; email?: string; phone?: string };
}

const BANK_REF_PATTERN = /^(?:GO|VIP)[A-Z0-9]{6,12}$/i;

/**
 * The bank-pending screen already renders the VietQR and polls ACB for a match,
 * so "thanh toán tiếp" is just a deep link back into it for this order.
 */
export function buildResumePaymentUrl(order: ResumablePaymentOrder): string | null {
    const method = String(order.paymentMethod || '').toLowerCase();
    const ref = String(order.paymentRef || '').trim().toUpperCase();
    const amount = Number(order.totalAmount) || 0;

    if (method !== 'banking') return null;
    if (!BANK_REF_PATTERN.test(ref)) return null;
    if (amount <= 0) return null;
    if (isConfirmedPaymentStatus(order.paymentStatus)) return null;
    if (String(order.status || '').toLowerCase() === 'cancelled') return null;

    const params = new URLSearchParams({
        order: String(order._id).slice(-6).toUpperCase(),
        ref,
        amount: String(amount),
        name: order.shippingInfo?.fullName || '',
        email: order.shippingInfo?.email || '',
        phone: order.shippingInfo?.phone || '',
    });

    return `/checkout/bank-pending?${params.toString()}`;
}
