'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

interface AffiliateTermsModalProps {
    isOpen: boolean;
    onClose: () => void;
    affiliateType: 'agent' | 'collaborator';
}

const AFFILIATE_TERMS = {
    agent: {
        title: 'THỂ LỆ VÀ ĐIỀU KHOẢN CHƯƠNG TRÌNH ĐẠI LÝ GO NUTS',
        benefits: [
            'Hoa hồng 10% trên mỗi đơn hàng thành công từ khách hàng giới thiệu',
            'Hoa hồng 2% từ doanh thu của đội ngũ Cộng tác viên (CTV) bạn quản lý',
            'Mã giới thiệu riêng để chia sẻ với khách hàng',
            'Dashboard quản lý theo dõi doanh thu và hoa hồng',
            'Rút tiền hoa hồng về tài khoản ngân hàng linh hoạt',
            'Hỗ trợ marketing và tài liệu bán hàng',
        ],
        obligations: [
            'Tích cực giới thiệu sản phẩm Go Nuts đến khách hàng tiềm năng',
            'Không được sử dụng các phương thức marketing trái phép (spam, quảng cáo sai sự thật...)',
            'Tuân thủ chính sách giá và quy định của công ty',
            'Báo cáo định kỳ về hoạt động giới thiệu (nếu được yêu cầu)',
            'Không được đại diện cho Go Nuts mà không có sự ủy quyền bằng văn bản',
        ],
        commissionPolicy: [
            'Hoa hồng được tính dựa trên giá trị đơn hàng sau khi trừ phí vận chuyển',
            'Hoa hồng chỉ được thanh toán khi đơn hàng hoàn thành (không bị hủy/hoàn tiền)',
            'Thời hạn thanh toán hoa hồng: 15 ngày sau khi đơn hàng hoàn thành',
            'Số dư tối thiểu để rút: 100.000 VNĐ',
        ],
        rights: [
            'Được cấp mã giới thiệu riêng và quyền truy cập dashboard',
            'Nhận hoa hồng đúng quy định chương trình',
            'Được hỗ trợ từ đội ngũ Go Nuts',
            'Có quyền từ chối tham gia chương trình bất cứ lúc nào',
        ],
    },
    collaborator: {
        title: 'THỂ LỆ VÀ ĐIỀU KHOẢN CHƯƠNG TRÌNH CỘNG TÁC VIÊN GO NUTS',
        benefits: [
            'Hoa hồng 8% cho mỗi đơn hàng giới thiệu thành công',
            'Mã giới thiệu riêng để chia sẻ với khách hàng',
            'Theo dõi đơn hàng và hoa hồng trực tuyến',
            'Nhận voucher ưu đãi từ Go Nuts',
        ],
        obligations: [
            'Giới thiệu sản phẩm Go Nuts một cách trung thực',
            'Không spam hoặc sử dụng phương thức quảng cáo không phù hợp',
            'Tuân thủ quy định của công ty',
        ],
        commissionPolicy: [
            'Hoa hồng được tính trên đơn hàng hoàn thành',
            'Hoa hồng thanh toán sau 15 ngày kể từ khi đơn hoàn thành',
            'Số dư tối thiểu để rút: 50.000 VNĐ',
        ],
        rights: [
            'Mã giới thiệu riêng và quyền truy cập trang CTV',
            'Nhận hoa hồng theo quy định',
            'Hỗ trợ qua email/tài liệu',
        ],
    },
};

export default function AffiliateTermsModal({ isOpen, onClose, affiliateType }: AffiliateTermsModalProps) {
    const [agreed, setAgreed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasScrolled, setHasScrolled] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const { user } = useAuth();
    const toast = useToast();
    const router = useRouter();

    const terms = AFFILIATE_TERMS[affiliateType];
    const typeLabel = affiliateType === 'agent' ? 'Đại lý' : 'Cộng tác viên';

    useEffect(() => {
        const handleScroll = () => {
            if (contentRef.current) {
                const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
                if (scrollTop + clientHeight >= scrollHeight - 10) {
                    setHasScrolled(true);
                }
            }
        };

        const element = contentRef.current;
        if (element) {
            element.addEventListener('scroll', handleScroll);
            return () => element.removeEventListener('scroll', handleScroll);
        }
    }, []);

    const handleSubmit = async () => {
        if (!agreed || !hasScrolled) {
            toast.error('Vui lòng đọc hết điều khoản và đồng ý để tiếp tục');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/auth/apply-sale', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Có lỗi xảy ra');
            }

            toast.success('Đăng ký thành công!', data.message);
            onClose();
            router.refresh();
        } catch (err: any) {
            toast.error('Lỗi', err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h2>Đăng ký làm {typeLabel}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <div className="terms-intro">
                        <p>
                            Xin chào <strong>{user?.name}</strong>! 
                            Trước khi đăng ký làm {typeLabel.toLowerCase()}, vui lòng đọc kỹ và đồng ý với các điều khoản dưới đây.
                        </p>
                    </div>

                    <div className="terms-content" ref={contentRef}>
                        <h3>{terms.title}</h3>

                        <section>
                            <h4>1. Lợi ích khi trở thành {typeLabel}</h4>
                            <ul>
                                {terms.benefits.map((benefit, index) => (
                                    <li key={index}>{benefit}</li>
                                ))}
                            </ul>
                        </section>

                        <section>
                            <h4>2. Nghĩa vụ của {typeLabel}</h4>
                            <ul>
                                {terms.obligations.map((obligation, index) => (
                                    <li key={index}>{obligation}</li>
                                ))}
                            </ul>
                        </section>

                        <section>
                            <h4>3. Chính sách hoa hồng</h4>
                            <ul>
                                {terms.commissionPolicy.map((policy, index) => (
                                    <li key={index}>{policy}</li>
                                ))}
                            </ul>
                        </section>

                        <section>
                            <h4>4. Quyền của {typeLabel}</h4>
                            <ul>
                                {terms.rights.map((right, index) => (
                                    <li key={index}>{right}</li>
                                ))}
                            </ul>
                        </section>

                        <section>
                            <h4>5. Điều khoản chung</h4>
                            <ul>
                                <li>Go Nuts có quyền thay đổi điều khoản chương trình với thông báo trước 15 ngày.</li>
                                <li>Go Nuts có thể tạm ngưng hoặc chấm dứt tư cách {typeLabel.toLowerCase()} nếu vi phạm điều khoản.</li>
                                <li>Tranh chấp sẽ được giải quyết theo pháp luật Việt Nam.</li>
                                <li>Thời hạn hợp tác: không giới hạn, có thể hủy bất cứ lúc nào.</li>
                            </ul>
                        </section>

                        <section>
                            <h4>6. Xử lý vi phạm</h4>
                            <p>
                                Nếu {typeLabel} vi phạm các quy định trên, Go Nuts có quyền:
                            </p>
                            <ul>
                                <li>Khóa tài khoản và thu hồi mã giới thiệu</li>
                                <li>Không thanh toán hoa hồng cho đơn hàng vi phạm</li>
                                <li>Chấm dứt hợp tác và thu hồi quyền lợi</li>
                            </ul>
                        </section>
                    </div>

                    <div className="terms-footer">
                        <label className="checkbox-container">
                            <input
                                type="checkbox"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                            />
                            <span className="checkmark"></span>
                            <span>
                                Tôi đã đọc kỹ, hiểu rõ và đồng ý với tất cả các điều khoản trên
                            </span>
                        </label>
                    </div>
                </div>

                <div className="modal-actions">
                    <button className="cancel-btn" onClick={onClose} disabled={isSubmitting}>
                        Hủy bỏ
                    </button>
                    <button
                        className="submit-btn"
                        onClick={handleSubmit}
                        disabled={!agreed || !hasScrolled || isSubmitting}
                    >
                        {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu đăng ký'}
                    </button>
                </div>
            </div>

            <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 20px;
                }

                .modal-container {
                    background: white;
                    border-radius: 16px;
                    width: 100%;
                    max-width: 600px;
                    max-height: 90vh;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                }

                .modal-header {
                    flex-shrink: 0;
                }

                .modal-body {
                    flex: 1;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    min-height: 0;
                }

                .terms-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px 24px;
                    max-height: 50vh;
                }

                .terms-content h3 {
                    font-size: 16px;
                    color: #9C7043;
                    margin: 0 0 16px 0;
                    text-align: center;
                }

                .terms-content section {
                    margin-bottom: 20px;
                }

                .terms-content h4 {
                    font-size: 15px;
                    color: #333;
                    margin: 0 0 10px 0;
                }

                .terms-content ul {
                    margin: 0;
                    padding-left: 20px;
                }

                .terms-content li {
                    font-size: 14px;
                    color: #555;
                    margin-bottom: 6px;
                    line-height: 1.5;
                }

                .terms-footer {
                    padding: 16px 24px;
                    border-top: 1px solid #eee;
                    background: #fafafa;
                    flex-shrink: 0;
                }

                .checkbox-container {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    cursor: pointer;
                    font-size: 14px;
                    color: #555;
                }

                .checkbox-container input {
                    display: none;
                }

                .checkmark {
                    width: 20px;
                    height: 20px;
                    border: 2px solid #9C7043;
                    border-radius: 4px;
                    flex-shrink: 0;
                    margin-top: 2px;
                    position: relative;
                    transition: all 0.2s;
                }

                .checkbox-container input:checked + .checkmark {
                    background: #9C7043;
                }

                .checkbox-container input:checked + .checkmark::after {
                    content: '✓';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    color: white;
                    font-size: 12px;
                }

                .modal-actions {
                    padding: 16px 24px;
                    border-top: 1px solid #eee;
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                    flex-shrink: 0;
                }

                .cancel-btn {
                    padding: 12px 24px;
                    border: 2px solid #ddd;
                    background: white;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    color: #666;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .cancel-btn:hover {
                    border-color: #999;
                    color: #333;
                }

                .submit-btn {
                    padding: 12px 24px;
                    background: #9C7043;
                    border: none;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    color: white;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .submit-btn:hover:not(:disabled) {
                    background: #7d5a36;
                }

                .submit-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
}
