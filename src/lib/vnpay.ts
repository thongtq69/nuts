import crypto from 'crypto';
import querystring from 'qs';

export interface VNPayConfig {
    vnp_TmnCode: string;
    vnp_HashSecret: string;
    vnp_Url: string;
    vnp_ReturnUrl: string;
}

export interface CreatePaymentUrlParams {
    orderId: string;
    amount: number;
    orderInfo: string;
    ipAddr: string;
    locale?: 'vn' | 'en';
    bankCode?: string;
}

export function getVNPayConfig(): VNPayConfig {
    return {
        vnp_TmnCode: process.env.VNPAY_TMN_CODE || '',
        vnp_HashSecret: process.env.VNPAY_HASH_SECRET || '',
        vnp_Url: process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
        vnp_ReturnUrl: process.env.VNPAY_RETURN_URL || 'http://localhost:3000/checkout/vnpay-return',
    };
}

function sortObject(obj: Record<string, string>): Record<string, string> {
    const sorted: Record<string, string> = {};
    const keys = Object.keys(obj).sort();
    for (const key of keys) {
        sorted[key] = obj[key];
    }
    return sorted;
}

export function createPaymentUrl(params: CreatePaymentUrlParams): string {
    const config = getVNPayConfig();
    const date = new Date();
    
    const createDate = date.toISOString()
        .replace(/[-:T.Z]/g, '')
        .slice(0, 14);
    
    const expireDate = new Date(date.getTime() + 30 * 60 * 1000) // Tăng lên 30 phút
        .toISOString()
        .replace(/[-:T.Z]/g, '')
        .slice(0, 14);

    let vnp_Params: Record<string, string> = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: config.vnp_TmnCode,
        vnp_Locale: params.locale || 'vn',
        vnp_CurrCode: 'VND',
        vnp_TxnRef: params.orderId,
        vnp_OrderInfo: params.orderInfo,
        vnp_OrderType: 'other',
        vnp_Amount: String(params.amount * 100),
        vnp_ReturnUrl: config.vnp_ReturnUrl,
        vnp_IpAddr: params.ipAddr,
        vnp_CreateDate: createDate,
        vnp_ExpireDate: expireDate,
    };

    if (params.bankCode) {
        vnp_Params['vnp_BankCode'] = params.bankCode;
    }

    vnp_Params = sortObject(vnp_Params);

    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', config.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    vnp_Params['vnp_SecureHash'] = signed;

    return `${config.vnp_Url}?${querystring.stringify(vnp_Params, { encode: false })}`;
}

export function verifyReturnUrl(vnpParams: Record<string, string>): boolean {
    const config = getVNPayConfig();
    const secureHash = vnpParams['vnp_SecureHash'];
    
    const params = { ...vnpParams };
    delete params['vnp_SecureHash'];
    delete params['vnp_SecureHashType'];

    const sortedParams = sortObject(params);
    const signData = querystring.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac('sha512', config.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    return secureHash === signed;
}

export const VNPayResponseCode: Record<string, string> = {
    '00': 'Giao dịch thành công',
    '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
    '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
    '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
    '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
    '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
    '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.',
    '15': 'Giao dịch đã quá thời gian chờ thanh toán. Vui lòng thực hiện lại giao dịch.',
    '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
    '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
    '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
    '75': 'Ngân hàng thanh toán đang bảo trì.',
    '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch',
    '99': 'Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)',
};
