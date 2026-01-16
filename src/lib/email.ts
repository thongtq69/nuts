import nodemailer from 'nodemailer';

// Gmail Configuration - supports both OAuth2 and App Password
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

// OAuth2 (optional - if you prefer OAuth)
const GMAIL_CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const GMAIL_CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const GMAIL_REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;

// Create transporter - prefer App Password for simplicity
async function createTransporter() {
    // Method 1: App Password (simpler, recommended)
    if (GMAIL_APP_PASSWORD) {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: GMAIL_USER,
                pass: GMAIL_APP_PASSWORD,
            },
        });
    }
    
    // Method 2: OAuth2 (more secure but complex setup)
    if (GMAIL_CLIENT_ID && GMAIL_CLIENT_SECRET && GMAIL_REFRESH_TOKEN) {
        const { google } = await import('googleapis');
        const OAuth2 = google.auth.OAuth2;
        
        const oauth2Client = new OAuth2(
            GMAIL_CLIENT_ID,
            GMAIL_CLIENT_SECRET,
            'https://developers.google.com/oauthplayground'
        );
        
        oauth2Client.setCredentials({
            refresh_token: GMAIL_REFRESH_TOKEN
        });
        
        const accessToken = await oauth2Client.getAccessToken();
        
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: GMAIL_USER,
                clientId: GMAIL_CLIENT_ID,
                clientSecret: GMAIL_CLIENT_SECRET,
                refreshToken: GMAIL_REFRESH_TOKEN,
                accessToken: accessToken.token || '',
            },
        });
    }
    
    throw new Error('Gmail credentials not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in .env.local');
}

// Base URL for assets
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const LOGO_URL = `${BASE_URL}/assets/logo.png`;

// Email Templates
const emailStyles = `
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #9C7044 0%, #7d5a36 100%); padding: 30px; text-align: center; }
        .header img.logo { max-width: 120px; height: auto; margin-bottom: 10px; }
        .header h1 { color: white; margin: 10px 0 0; font-size: 24px; }
        .content { padding: 30px; }
        .otp-box { background: #f8f4f0; border: 2px dashed #9C7044; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
        .otp-code { font-size: 36px; font-weight: bold; color: #9C7044; letter-spacing: 8px; }
        .order-box { background: #f9f9f9; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .order-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .order-total { font-size: 20px; font-weight: bold; color: #9C7044; text-align: right; margin-top: 15px; }
        .btn { display: inline-block; background: #9C7044; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; }
        .footer { background: #333; color: #999; padding: 20px; text-align: center; font-size: 12px; }
        .footer a { color: #9C7044; }
        .footer img.logo-footer { max-width: 80px; height: auto; margin-bottom: 10px; opacity: 0.8; }
    </style>
`;

// Email header with logo
const emailHeader = `
    <div class="header">
        <img src="${LOGO_URL}" alt="Go Nuts Logo" class="logo" />
        <h1>Go Nuts</h1>
    </div>
`;

// Email footer with logo
const emailFooter = `
    <div class="footer">
        <img src="${LOGO_URL}" alt="Go Nuts" class="logo-footer" />
        <p>© 2026 Go Nuts - Thực phẩm sạch, dinh dưỡng</p>
        <p>Email này được gửi tự động, vui lòng không trả lời.</p>
    </div>
`;

// Generate OTP
export function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP Email
export async function sendOTPEmail(to: string, otp: string, purpose: string = 'xác thực') {
    const transporter = await createTransporter();
    
    const html = `
        <!DOCTYPE html>
        <html>
        <head>${emailStyles}</head>
        <body>
            <div class="container">
                ${emailHeader}
                <div class="content">
                    <h2>Mã xác thực OTP</h2>
                    <p>Xin chào,</p>
                    <p>Bạn đang yêu cầu ${purpose}. Vui lòng sử dụng mã OTP bên dưới:</p>
                    
                    <div class="otp-box">
                        <div class="otp-code">${otp}</div>
                        <p style="color: #666; margin: 10px 0 0; font-size: 14px;">Mã có hiệu lực trong 5 phút</p>
                    </div>
                    
                    <p style="color: #666; font-size: 14px;">
                        ⚠️ Không chia sẻ mã này với bất kỳ ai. Go Nuts sẽ không bao giờ yêu cầu mã OTP của bạn.
                    </p>
                </div>
                ${emailFooter}
            </div>
        </body>
        </html>
    `;
    
    await transporter.sendMail({
        from: `"Go Nuts" <${GMAIL_USER}>`,
        to,
        subject: `[Go Nuts] Mã xác thực OTP: ${otp}`,
        html,
    });
}

// Send Order Confirmation Email
export async function sendOrderConfirmationEmail(
    to: string,
    orderData: {
        orderId: string;
        customerName: string;
        items: { name: string; quantity: number; price: number }[];
        shippingFee: number;
        discount: number;
        totalAmount: number;
        shippingAddress: string;
        paymentMethod: string;
    }
) {
    const transporter = await createTransporter();
    
    const itemsHtml = orderData.items.map(item => `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${(item.price * item.quantity).toLocaleString()}đ</td>
        </tr>
    `).join('');
    
    const html = `
        <!DOCTYPE html>
        <html>
        <head>${emailStyles}</head>
        <body>
            <div class="container">
                ${emailHeader}
                <div class="content">
                    <h2>✅ Đặt hàng thành công!</h2>
                    <p>Xin chào <strong>${orderData.customerName}</strong>,</p>
                    <p>Cảm ơn bạn đã đặt hàng tại Go Nuts. Đơn hàng của bạn đã được tiếp nhận và đang được xử lý.</p>
                    
                    <div class="order-box">
                        <p style="margin: 0 0 15px;"><strong>Mã đơn hàng:</strong> #${orderData.orderId}</p>
                        
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: #f5f5f5;">
                                    <th style="padding: 12px; text-align: left;">Sản phẩm</th>
                                    <th style="padding: 12px; text-align: center;">SL</th>
                                    <th style="padding: 12px; text-align: right;">Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                            </tbody>
                        </table>
                        
                        <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #eee;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span>Phí vận chuyển:</span>
                                <span>${orderData.shippingFee === 0 ? 'Miễn phí' : orderData.shippingFee.toLocaleString() + 'đ'}</span>
                            </div>
                            ${orderData.discount > 0 ? `
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #059669;">
                                <span>Giảm giá:</span>
                                <span>-${orderData.discount.toLocaleString()}đ</span>
                            </div>
                            ` : ''}
                            <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #9C7044;">
                                <span>Tổng cộng:</span>
                                <span>${orderData.totalAmount.toLocaleString()}đ</span>
                            </div>
                        </div>
                    </div>
                    
                    <div style="background: #f8f4f0; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0 0 10px;"><strong>📍 Địa chỉ giao hàng:</strong></p>
                        <p style="margin: 0; color: #666;">${orderData.shippingAddress}</p>
                    </div>
                    
                    <p><strong>💳 Phương thức thanh toán:</strong> ${orderData.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 'Chuyển khoản ngân hàng'}</p>
                    
                    <p style="text-align: center; margin-top: 30px;">
                        <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/account" class="btn">Theo dõi đơn hàng</a>
                    </p>
                </div>
                <div class="footer">
                    <img src="${LOGO_URL}" alt="Go Nuts" class="logo-footer" />
                    <p>Nếu có thắc mắc, vui lòng liên hệ hotline: <strong>09xxxxxxxx</strong></p>
                    <p>© 2026 Go Nuts - Thực phẩm sạch, dinh dưỡng</p>
                </div>
            </div>
        </body>
        </html>
    `;
    
    await transporter.sendMail({
        from: `"Go Nuts" <${GMAIL_USER}>`,
        to,
        subject: `[Go Nuts] Xác nhận đơn hàng #${orderData.orderId}`,
        html,
    });
}

// Send Order Status Update Email
export async function sendOrderStatusEmail(
    to: string,
    orderData: {
        orderId: string;
        customerName: string;
        status: string;
        statusMessage: string;
    }
) {
    const transporter = await createTransporter();
    
    const statusColors: Record<string, string> = {
        'processing': '#f59e0b',
        'shipped': '#3b82f6',
        'delivered': '#10b981',
        'cancelled': '#ef4444',
    };
    
    const statusIcons: Record<string, string> = {
        'processing': '📦',
        'shipped': '🚚',
        'delivered': '✅',
        'cancelled': '❌',
    };
    
    const html = `
        <!DOCTYPE html>
        <html>
        <head>${emailStyles}</head>
        <body>
            <div class="container">
                ${emailHeader}
                <div class="content">
                    <h2>${statusIcons[orderData.status] || '📋'} Cập nhật đơn hàng</h2>
                    <p>Xin chào <strong>${orderData.customerName}</strong>,</p>
                    
                    <div style="background: ${statusColors[orderData.status] || '#9C7044'}15; border-left: 4px solid ${statusColors[orderData.status] || '#9C7044'}; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                        <p style="margin: 0; font-size: 16px;">
                            Đơn hàng <strong>#${orderData.orderId}</strong> của bạn ${orderData.statusMessage}
                        </p>
                    </div>
                    
                    <p style="text-align: center; margin-top: 30px;">
                        <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/account" class="btn">Xem chi tiết đơn hàng</a>
                    </p>
                </div>
                ${emailFooter}
            </div>
        </body>
        </html>
    `;
    
    await transporter.sendMail({
        from: `"Go Nuts" <${GMAIL_USER}>`,
        to,
        subject: `[Go Nuts] Cập nhật đơn hàng #${orderData.orderId}`,
        html,
    });
}

// Send Welcome Email
export async function sendWelcomeEmail(to: string, name: string, voucherCode?: string) {
    const transporter = await createTransporter();
    
    const html = `
        <!DOCTYPE html>
        <html>
        <head>${emailStyles}</head>
        <body>
            <div class="container">
                ${emailHeader}
                <div class="content">
                    <h2>🎉 Chào mừng bạn đến với Go Nuts!</h2>
                    <p>Xin chào <strong>${name}</strong>,</p>
                    <p>Cảm ơn bạn đã đăng ký tài khoản tại Go Nuts. Chúng tôi rất vui được chào đón bạn!</p>
                    
                    ${voucherCode ? `
                    <div class="otp-box">
                        <p style="margin: 0 0 10px; font-size: 14px;">🎁 Quà tặng chào mừng dành cho bạn:</p>
                        <div class="otp-code">${voucherCode}</div>
                        <p style="color: #666; margin: 10px 0 0; font-size: 14px;">Giảm 50.000đ cho đơn hàng từ 300.000đ</p>
                    </div>
                    ` : ''}
                    
                    <p>Khám phá ngay các sản phẩm hạt dinh dưỡng chất lượng cao tại Go Nuts!</p>
                    
                    <p style="text-align: center; margin-top: 30px;">
                        <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/products" class="btn">Mua sắm ngay</a>
                    </p>
                </div>
                ${emailFooter}
            </div>
        </body>
        </html>
    `;
    
    await transporter.sendMail({
        from: `"Go Nuts" <${GMAIL_USER}>`,
        to,
        subject: `[Go Nuts] Chào mừng ${name} đến với Go Nuts! 🎉`,
        html,
    });
}

// Send Password Reset Email
export async function sendPasswordResetEmail(to: string, resetToken: string) {
    const transporter = await createTransporter();
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const html = `
        <!DOCTYPE html>
        <html>
        <head>${emailStyles}</head>
        <body>
            <div class="container">
                ${emailHeader}
                <div class="content">
                    <h2>🔐 Đặt lại mật khẩu</h2>
                    <p>Xin chào,</p>
                    <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản Go Nuts. Nhấn vào nút bên dưới để tiếp tục:</p>
                    
                    <p style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" class="btn">Đặt lại mật khẩu</a>
                    </p>
                    
                    <p style="color: #666; font-size: 14px;">
                        Link này sẽ hết hạn sau 1 giờ. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
                    </p>
                </div>
                ${emailFooter}
            </div>
        </body>
        </html>
    `;
    
    await transporter.sendMail({
        from: `"Go Nuts" <${GMAIL_USER}>`,
        to,
        subject: `[Go Nuts] Đặt lại mật khẩu`,
        html,
    });
}

export default {
    generateOTP,
    sendOTPEmail,
    sendOrderConfirmationEmail,
    sendOrderStatusEmail,
    sendWelcomeEmail,
    sendPasswordResetEmail,
};
