'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import {
    buildResumePaymentUrl,
    describeCustomerCancelBlock,
    orderStatusLabel,
    paymentMethodLabel,
    paymentStatusLabel,
} from '@/lib/order-status';

export interface AccountOrder {
    _id: string;
    status?: string;
    paymentStatus?: string;
    paymentMethod?: string;
    paymentRef?: string;
    orderType?: string;
    membershipActivatedAt?: string | null;
    createdAt?: string;
    cancelledAt?: string | null;
    totalAmount?: number;
    shippingFee?: number;
    voucherCode?: string;
    voucherDiscountAmount?: number;
    note?: string;
    packageInfo?: { name?: string; voucherQuantity?: number };
    shippingInfo?: {
        fullName?: string;
        phone?: string;
        email?: string;
        address?: string;
        ward?: string;
        district?: string;
        city?: string;
    };
    items?: Array<{
        productId?: string;
        name?: string;
        quantity?: number;
        price?: number;
        image?: string;
    }>;
}

interface OrderDetailModalProps {
    order: AccountOrder;
    onClose: () => void;
    onCancelOrder: (order: AccountOrder) => void;
    cancelling: boolean;
}

function money(value: number | undefined) {
    return `${new Intl.NumberFormat('vi-VN').format(Math.max(0, Number(value) || 0))}đ`;
}

function statusTone(status?: string): { bg: string; color: string } {
    switch (String(status || '').toLowerCase()) {
        case 'completed':
        case 'delivered':
        case 'paid':
            return { bg: '#d1fae5', color: '#065f46' };
        case 'cancelled':
        case 'failed':
            return { bg: '#fee2e2', color: '#b91c1c' };
        case 'shipping':
        case 'shipped':
            return { bg: '#e0e7ff', color: '#3730a3' };
        default:
            return { bg: '#fef3c7', color: '#92400e' };
    }
}

function addressText(order: AccountOrder) {
    const shipping = order.shippingInfo;
    if (!shipping) return 'Chưa có địa chỉ';
    return [shipping.address, shipping.ward, shipping.district, shipping.city]
        .filter(Boolean)
        .join(', ') || 'Chưa có địa chỉ';
}

export default function OrderDetailModal({ order, onClose, onCancelOrder, cancelling }: OrderDetailModalProps) {
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    const items = order.items || [];
    const itemsTotal = items.reduce(
        (total, item) => total + (Number(item.price) || 0) * (Number(item.quantity) || 0),
        0,
    );
    const discount = Number(order.voucherDiscountAmount) || 0;
    const resumeUrl = buildResumePaymentUrl(order);
    const cancelBlock = describeCustomerCancelBlock(order);
    const isMembership = order.orderType === 'membership';

    const orderTone = statusTone(order.status);
    const paymentTone = statusTone(order.paymentStatus);

    return (
        <div className="odm-backdrop" onClick={onClose} role="presentation">
            <div
                className="odm-panel"
                onClick={event => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label={`Chi tiết đơn hàng ${order._id.slice(-6).toUpperCase()}`}
            >
                <div className="odm-header">
                    <div>
                        <h3>Đơn hàng #{order._id.slice(-6).toUpperCase()}</h3>
                        <p className="odm-sub">
                            Đặt ngày {order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : '—'}
                        </p>
                    </div>
                    <button type="button" className="odm-close" onClick={onClose} aria-label="Đóng">×</button>
                </div>

                <div className="odm-body">
                    <div className="odm-badges">
                        <span className="odm-badge" style={{ background: orderTone.bg, color: orderTone.color }}>
                            {orderStatusLabel(order.status)}
                        </span>
                        <span className="odm-badge" style={{ background: paymentTone.bg, color: paymentTone.color }}>
                            {paymentStatusLabel(order.paymentStatus)}
                        </span>
                        {isMembership && <span className="odm-badge odm-badge-vip">Gói hội viên</span>}
                    </div>

                    {resumeUrl && (
                        <div className="odm-alert">
                            Đơn hàng này chưa hoàn tất thanh toán. Bấm <strong>Thanh toán tiếp</strong> để mở lại mã QR
                            chuyển khoản và hệ thống sẽ tự xác nhận khi nhận được tiền.
                        </div>
                    )}

                    <section className="odm-section">
                        <h4>Sản phẩm</h4>
                        <div className="odm-items">
                            {items.map((item, index) => (
                                <div className="odm-item" key={`${item.productId || 'item'}-${index}`}>
                                    <div className="odm-thumb">
                                        {item.image ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={item.image} alt={item.name || 'Sản phẩm'} />
                                        ) : (
                                            <span aria-hidden="true">{isMembership ? '👑' : '📦'}</span>
                                        )}
                                    </div>
                                    <div className="odm-item-info">
                                        <div className="odm-item-name">{item.name}</div>
                                        <div className="odm-item-meta">
                                            {money(item.price)} × {item.quantity}
                                        </div>
                                    </div>
                                    <div className="odm-item-total">
                                        {money((Number(item.price) || 0) * (Number(item.quantity) || 0))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="odm-section">
                        <h4>Thanh toán</h4>
                        <div className="odm-row"><span>Tạm tính</span><strong>{money(itemsTotal)}</strong></div>
                        <div className="odm-row"><span>Phí vận chuyển</span><strong>{money(order.shippingFee)}</strong></div>
                        {discount > 0 && (
                            <div className="odm-row">
                                <span>Giảm giá{order.voucherCode ? ` (${order.voucherCode})` : ''}</span>
                                <strong className="odm-discount">-{money(discount)}</strong>
                            </div>
                        )}
                        <div className="odm-row odm-row-total"><span>Tổng cộng</span><strong>{money(order.totalAmount)}</strong></div>
                        <div className="odm-row"><span>Hình thức</span><strong>{paymentMethodLabel(order.paymentMethod)}</strong></div>
                        {order.paymentRef && (
                            <div className="odm-row"><span>Nội dung chuyển khoản</span><strong>{order.paymentRef}</strong></div>
                        )}
                    </section>

                    {!isMembership && (
                        <section className="odm-section">
                            <h4>Thông tin nhận hàng</h4>
                            <div className="odm-row"><span>Người nhận</span><strong>{order.shippingInfo?.fullName || '—'}</strong></div>
                            <div className="odm-row"><span>Điện thoại</span><strong>{order.shippingInfo?.phone || '—'}</strong></div>
                            <div className="odm-row"><span>Địa chỉ</span><strong>{addressText(order)}</strong></div>
                            {order.note && <div className="odm-row"><span>Ghi chú</span><strong>{order.note}</strong></div>}
                        </section>
                    )}
                </div>

                <div className="odm-footer">
                    {resumeUrl && (
                        <Link href={resumeUrl} className="odm-btn odm-btn-primary">
                            Thanh toán tiếp
                        </Link>
                    )}
                    {!cancelBlock && (
                        <button
                            type="button"
                            className="odm-btn odm-btn-danger"
                            onClick={() => onCancelOrder(order)}
                            disabled={cancelling}
                        >
                            {cancelling ? 'Đang xóa...' : 'Xóa đơn hàng'}
                        </button>
                    )}
                    <button type="button" className="odm-btn odm-btn-ghost" onClick={onClose}>Đóng</button>
                </div>

                {cancelBlock && String(order.status).toLowerCase() !== 'cancelled' && (
                    <p className="odm-note">{cancelBlock}</p>
                )}
            </div>

            <style jsx>{`
                .odm-backdrop {
                    position: fixed;
                    inset: 0;
                    background: rgba(15, 23, 42, 0.55);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    z-index: 1000;
                }
                .odm-panel {
                    background: #fff;
                    border-radius: 16px;
                    width: 100%;
                    max-width: 620px;
                    max-height: 90vh;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
                }
                .odm-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 16px;
                    padding: 20px 24px;
                    border-bottom: 1px solid #eee;
                }
                .odm-header h3 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 700;
                    color: var(--color-primary-brown, #9C7043);
                }
                .odm-sub {
                    margin: 4px 0 0;
                    font-size: 13px;
                    color: #6b7280;
                }
                .odm-close {
                    background: none;
                    border: none;
                    font-size: 28px;
                    line-height: 1;
                    cursor: pointer;
                    color: #9ca3af;
                    padding: 0 4px;
                }
                .odm-body {
                    padding: 20px 24px;
                    overflow-y: auto;
                }
                .odm-badges {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-bottom: 16px;
                }
                .odm-badge {
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                }
                .odm-badge-vip {
                    background: #fef3c7;
                    color: #92400e;
                }
                .odm-alert {
                    background: #fffbeb;
                    border: 1px solid #fde68a;
                    color: #92400e;
                    border-radius: 10px;
                    padding: 12px 14px;
                    font-size: 13px;
                    line-height: 1.5;
                    margin-bottom: 18px;
                }
                .odm-section {
                    margin-bottom: 22px;
                }
                .odm-section h4 {
                    margin: 0 0 10px;
                    font-size: 14px;
                    font-weight: 700;
                    color: #374151;
                }
                .odm-items {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .odm-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    border: 1px solid #f1f1f1;
                    border-radius: 10px;
                    padding: 10px;
                }
                .odm-thumb {
                    width: 48px;
                    height: 48px;
                    border-radius: 8px;
                    background: #f8f8f8;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    flex-shrink: 0;
                    font-size: 22px;
                }
                .odm-thumb :global(img) {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .odm-item-info {
                    flex: 1;
                    min-width: 0;
                }
                .odm-item-name {
                    font-size: 14px;
                    font-weight: 600;
                    color: #1f2937;
                }
                .odm-item-meta {
                    font-size: 12px;
                    color: #6b7280;
                    margin-top: 2px;
                }
                .odm-item-total {
                    font-size: 14px;
                    font-weight: 700;
                    color: #1f2937;
                    white-space: nowrap;
                }
                .odm-row {
                    display: flex;
                    justify-content: space-between;
                    gap: 16px;
                    font-size: 14px;
                    color: #6b7280;
                    padding: 6px 0;
                }
                .odm-row strong {
                    color: #1f2937;
                    font-weight: 600;
                    text-align: right;
                }
                .odm-row-total {
                    border-top: 1px solid #eee;
                    margin-top: 6px;
                    padding-top: 12px;
                    font-size: 16px;
                }
                .odm-row-total strong {
                    color: var(--color-primary-brown, #9C7043);
                    font-size: 18px;
                }
                .odm-discount {
                    color: #16a34a !important;
                }
                .odm-footer {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    justify-content: flex-end;
                    padding: 16px 24px;
                    border-top: 1px solid #eee;
                }
                .odm-btn {
                    padding: 10px 18px;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    border: none;
                    cursor: pointer;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                }
                .odm-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                .odm-btn-primary {
                    background: var(--color-primary-brown, #9C7043);
                    color: #fff;
                }
                .odm-btn-danger {
                    background: #fff;
                    color: #dc2626;
                    border: 1px solid #fecaca;
                }
                .odm-btn-ghost {
                    background: #f3f4f6;
                    color: #374151;
                }
                .odm-note {
                    margin: 0;
                    padding: 0 24px 18px;
                    font-size: 12px;
                    color: #9ca3af;
                    text-align: right;
                }
                @media (max-width: 640px) {
                    .odm-footer {
                        justify-content: stretch;
                    }
                    .odm-btn {
                        flex: 1;
                        justify-content: center;
                    }
                }
            `}</style>
        </div>
    );
}
