'use client';

import React, { useState } from 'react';

interface BankInfoProps {
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    qrCodeUrl?: string;
    amount?: number;
    description?: string;
    compact?: boolean;
    customerName?: string;
}

const BANK_INFO = {
    name: 'ACB',
    shortName: 'ACB',
    accountNumber: '621588',
    accountName: 'CÔNG TY TNHH GO NUTS VIỆT NAM',
    qrCodeUrl: 'https://img.vietqr.io/image/ACB-621588-compact.png'
};

// Hàm tạo URL VietQR động với thông tin chuyển khoản
const generateVietQRUrl = (
    bankBin: string,
    accountNumber: string,
    amount?: number,
    description?: string,
    accountName?: string
) => {
    // VietQR.io API format
    // https://img.vietqr.io/image/{bankBin}-{accountNumber}-{template}.png?amount={amount}&addInfo={description}&accountName={accountName}
    let url = `https://img.vietqr.io/image/${bankBin}-${accountNumber}-compact.png`;
    
    const params: string[] = [];
    
    if (amount && amount > 0) {
        params.push(`amount=${amount}`);
    }
    
    if (description) {
        // Mã hóa nội dung chuyển khoản để URL safe - dùng encodeURIComponent để xử lý dấu cách và ký tự đặc biệt
        const encodedDesc = encodeURIComponent(description);
        params.push(`addInfo=${encodedDesc}`);
    }
    
    if (accountName) {
        const encodedName = encodeURIComponent(accountName);
        params.push(`accountName=${encodedName}`);
    }
    
    if (params.length > 0) {
        url += `?${params.join('&')}`;
    }
    
    return url;
};

export default function BankInfoDisplay({ 
    bankName = BANK_INFO.name,
    accountNumber = BANK_INFO.accountNumber,
    accountName = BANK_INFO.accountName,
    qrCodeUrl,
    amount,
    description,
    compact = false
}: BankInfoProps) {
    const [copied, setCopied] = useState<string | null>(null);

    // Nội dung QR chỉ dùng mã thanh toán để ngân hàng không nối tên khách vào mã đơn.
    const generateTransferContent = () => {
        const content = description || '';
        return content.substring(0, 50);
    };

    const transferContent = generateTransferContent();
    
    // Tạo URL QR động với thông tin chuyển khoản
    const dynamicQrUrl = qrCodeUrl || generateVietQRUrl(
        'ACB', // Bank BIN code
        accountNumber,
        amount,
        transferContent,
        accountName
    );

    const copyToClipboard = async (text: string, field: string) => {
        await navigator.clipboard.writeText(text);
        setCopied(field);
        setTimeout(() => setCopied(null), 2000);
    };

    if (compact) {
        return (
            <div className="bank-info-compact">
                <div className="bank-qr">
                    <img src={dynamicQrUrl} alt="VietQR" />
                </div>
                <div className="bank-details">
                    <div className="bank-name">{bankName}</div>
                    <div className="account-number">
                        <span>STK: {accountNumber}</span>
                        <button 
                            onClick={() => copyToClipboard(accountNumber, 'stk')}
                            className="copy-btn"
                        >
                            {copied === 'stk' ? '✓' : '📋'}
                        </button>
                    </div>
                    <div className="account-name">{accountName}</div>
                </div>
                <style jsx>{`
                    .bank-info-compact {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        padding: 12px;
                        background: #f8f4f0;
                        border-radius: 12px;
                    }
                    .bank-qr {
                        width: 80px;
                        height: 80px;
                        flex-shrink: 0;
                    }
                    .bank-qr img {
                        width: 100%;
                        height: 100%;
                        object-fit: contain;
                        border-radius: 8px;
                    }
                    .bank-details {
                        flex: 1;
                        min-width: 0;
                    }
                    .bank-name {
                        font-weight: 600;
                        font-size: 13px;
                        color: #333;
                        margin-bottom: 4px;
                    }
                    .account-number {
                        display: flex;
                        align-items: center;
                        gap: 6px;
                        font-size: 14px;
                        font-weight: 600;
                        color: #9C7043;
                        margin-bottom: 2px;
                    }
                    .copy-btn {
                        background: none;
                        border: none;
                        cursor: pointer;
                        font-size: 12px;
                        padding: 2px;
                    }
                    .account-name {
                        font-size: 12px;
                        color: #666;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="bank-info-container">
            <div className="bank-header">
                <h4>🏦 Thông tin chuyển khoản</h4>
                <span className="bank-badge">{bankName}</span>
            </div>

            <div className="bank-content">
                <div className="qr-section">
                    <img src={dynamicQrUrl} alt="VietQR Code" className="qr-image" />
                    {amount && (
                        <div className="amount-display">
                            {amount.toLocaleString()}đ
                        </div>
                    )}
                    <div className="qr-hint">
                        👆 Quét mã để tự điền thông tin
                    </div>
                </div>

                <div className="details-section">
                    <div className="detail-row">
                        <span className="label">Ngân hàng</span>
                        <span className="value bank">{bankName}</span>
                    </div>

                    <div className="detail-row">
                        <span className="label">Số tài khoản</span>
                        <div className="value-with-copy">
                            <span className="value number">{accountNumber}</span>
                            <button 
                                onClick={() => copyToClipboard(accountNumber, 'stk')}
                                className="copy-btn"
                                title="Sao chép"
                            >
                                {copied === 'stk' ? '✓ Đã copy' : '📋 Copy'}
                            </button>
                        </div>
                    </div>

                    <div className="detail-row">
                        <span className="label">Chủ tài khoản</span>
                        <div className="value-with-copy">
                            <span className="value name">{accountName}</span>
                            <button 
                                onClick={() => copyToClipboard(accountName, 'name')}
                                className="copy-btn"
                                title="Sao chép"
                            >
                                {copied === 'name' ? '✓ Đã copy' : '📋 Copy'}
                            </button>
                        </div>
                    </div>

                    {(description || transferContent) && (
                        <div className="detail-row">
                            <span className="label">Nội dung CK</span>
                            <div className="value-with-copy">
                                <span className="value desc">{transferContent || description}</span>
                                <button 
                                    onClick={() => copyToClipboard(transferContent || description || '', 'desc')}
                                    className="copy-btn"
                                    title="Sao chép"
                                >
                                    {copied === 'desc' ? '✓ Đã copy' : '📋 Copy'}
                                </button>
                            </div>
                        </div>
                    )}

                    {amount && (
                        <div className="detail-row amount">
                            <span className="label">Số tiền</span>
                            <span className="value amount">{amount.toLocaleString()}đ</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="bank-footer">
                <p className="notice">💡 Quét mã QR bằng app ngân hàng để tự động điền thông tin chuyển khoản</p>
                <p className="note">Hoặc chuyển khoản thủ công với đúng số tiền và nội dung bên trên. Đơn hàng sẽ được xử lý sau khi nhận được thanh toán.</p>
            </div>

            <style jsx>{`
                .bank-info-container {
                    background: white;
                    border: 2px solid #e5e7eb;
                    border-radius: 16px;
                    overflow: hidden;
                }
                .bank-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                    background: linear-gradient(135deg, #f8f4f0 0%, #fff 100%);
                    border-bottom: 1px solid #e5e7eb;
                }
                .bank-header h4 {
                    margin: 0;
                    font-size: 16px;
                    font-weight: 600;
                    color: #333;
                }
                .bank-badge {
                    background: #9C7043;
                    color: white;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                }
                .bank-content {
                    display: grid;
                    grid-template-columns: auto 1fr;
                    gap: 24px;
                    padding: 20px;
                }
                .qr-section {
                    text-align: center;
                }
                .qr-image {
                    width: 180px;
                    height: 180px;
                    object-fit: contain;
                    border-radius: 12px;
                    border: 2px solid #e5e7eb;
                    background: white;
                    padding: 8px;
                }
                .amount-display {
                    margin-top: 12px;
                    font-size: 18px;
                    font-weight: 700;
                    color: #9C7043;
                }
                .qr-hint {
                    margin-top: 8px;
                    font-size: 11px;
                    color: #059669;
                    background: #d1fae5;
                    padding: 4px 10px;
                    border-radius: 12px;
                    display: inline-block;
                }
                .details-section {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    padding: 8px 0;
                    border-bottom: 1px dashed #eee;
                }
                .detail-row:last-child {
                    border-bottom: none;
                }
                .detail-row.amount {
                    background: #f8f4f0;
                    margin: 8px -20px -20px;
                    padding: 16px 20px;
                }
                .detail-row.amount .value.amount {
                    font-size: 20px;
                    font-weight: 700;
                    color: #9C7043;
                }
                .label {
                    font-size: 13px;
                    color: #666;
                }
                .value {
                    font-size: 14px;
                    color: #333;
                    text-align: right;
                }
                .value.bank {
                    font-weight: 600;
                }
                .value.number {
                    font-family: var(--font-family);
                    font-weight: 600;
                    letter-spacing: 1px;
                }
                .value.name {
                    font-weight: 500;
                }
                .value.desc {
                    font-family: var(--font-family);
                    font-size: 13px;
                    background: #f0f0f0;
                    padding: 4px 8px;
                    border-radius: 4px;
                }
                .value-with-copy {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .copy-btn {
                    background: #f0f0f0;
                    border: none;
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                }
                .copy-btn:hover {
                    background: #e0e0e0;
                }
                .bank-footer {
                    padding: 16px 20px;
                    background: #fafafa;
                    border-top: 1px solid #eee;
                }
                .notice {
                    margin: 0 0 8px 0;
                    font-size: 13px;
                    color: #666;
                }
                .note {
                    margin: 0;
                    font-size: 12px;
                    color: #999;
                }
                @media (max-width: 576px) {
                    .bank-content {
                        grid-template-columns: 1fr;
                        text-align: center;
                    }
                    .qr-section {
                        order: -1;
                    }
                    .value-with-copy {
                        flex-direction: column;
                        gap: 4px;
                    }
                }
            `}</style>
        </div>
    );
}
