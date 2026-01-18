# 📧 Tổng Quan Hệ Thống Email - Go Nuts

## 🎯 Khi Nào Hệ Thống Gửi Email?

### **1. 🔐 Email OTP (Xác Thực)**
**API**: `POST /api/auth/send-otp`
**Khi nào gửi**:
- User yêu cầu xác thực tài khoản
- User đăng ký tài khoản mới
- User quên mật khẩu
- Các tình huống cần xác thực khác

**Nội dung**:
- Mã OTP 6 số
- Thời gian hết hạn: 5 phút
- Cảnh báo bảo mật

### **2. 📦 Email Xác Nhận Đơn Hàng**
**API**: `POST /api/orders` (tự động gửi sau khi tạo đơn)
**Khi nào gửi**:
- Ngay sau khi user đặt hàng thành công
- Có email trong thông tin giao hàng HOẶC user đã đăng nhập

**Nội dung**:
- Mã đơn hàng
- Chi tiết sản phẩm (tên, số lượng, giá)
- Phí vận chuyển
- Giảm giá (nếu có)
- Tổng tiền
- Địa chỉ giao hàng
- Phương thức thanh toán
- Link theo dõi đơn hàng

### **3. 📋 Email Cập Nhật Trạng Thái Đơn Hàng**
**Function**: `sendOrderStatusEmail()` (chưa được implement trong API)
**Khi nào gửi**:
- Khi admin cập nhật trạng thái đơn hàng
- Các trạng thái: processing, shipped, delivered, cancelled

**Nội dung**:
- Thông báo thay đổi trạng thái
- Mã đơn hàng
- Thông điệp phù hợp với từng trạng thái
- Link xem chi tiết đơn hàng

### **4. 🎉 Email Chào Mừng**
**Function**: `sendWelcomeEmail()` (chưa được implement trong API)
**Khi nào gửi**:
- User đăng ký tài khoản thành công
- Có thể kèm voucher chào mừng

**Nội dung**:
- Lời chào mừng
- Voucher giảm giá (nếu có)
- Link mua sắm
- Giới thiệu về Go Nuts

### **5. 🔑 Email Đặt Lại Mật Khẩu**
**Function**: `sendPasswordResetEmail()` (chưa được implement trong API)
**Khi nào gửi**:
- User yêu cầu đặt lại mật khẩu
- Quên mật khẩu

**Nội dung**:
- Link đặt lại mật khẩu
- Token bảo mật
- Thời gian hết hạn: 1 giờ
- Cảnh báo bảo mật

## 🔧 Cấu Hình Email

### **Environment Variables Cần Thiết**
```env
# Gmail Configuration (Required)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password

# OAuth2 (Optional - Alternative to App Password)
GMAIL_CLIENT_ID=your-client-id
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_REFRESH_TOKEN=your-refresh-token

# Base URL for links in emails
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

### **Gmail App Password Setup**
1. Bật 2-Factor Authentication cho Gmail
2. Vào Google Account Settings
3. Security → 2-Step Verification → App passwords
4. Tạo app password cho "Mail"
5. Sử dụng password này cho `GMAIL_APP_PASSWORD`

## 🎨 Template Email

### **Design Features**
- **Logo Go Nuts**: Hiển thị ở header và footer
- **Brand Colors**: Sử dụng #9C7044 (màu chủ đạo)
- **Responsive**: Tối ưu cho mobile và desktop
- **Professional**: Layout chuyên nghiệp với gradient
- **Consistent**: Thiết kế nhất quán cho tất cả email

### **Email Structure**
```html
Header (Logo + Brand Name)
├── Content Area
│   ├── Title
│   ├── Main Content
│   ├── Call-to-Action Button
│   └── Additional Info
└── Footer (Logo + Contact Info)
```

## 🧪 Test Hệ Thống Email

### **API Test Endpoint**
**URL**: `GET /api/test-email`
**Mục đích**: Test cấu hình email và gửi OTP thử nghiệm

**Response Success**:
```json
{
  "success": true,
  "message": "Email đã được gửi đến your-email@gmail.com",
  "otp": "123456"
}
```

**Response Error**:
```json
{
  "success": false,
  "message": "Error message",
  "debug": {
    "GMAIL_USER": "SET/NOT SET",
    "GMAIL_CLIENT_ID": "SET/NOT SET",
    "GMAIL_CLIENT_SECRET": "SET/NOT SET",
    "GMAIL_REFRESH_TOKEN": "SET/NOT SET"
  }
}
```

### **Manual Testing**
1. **Test OTP**: `POST /api/auth/send-otp` với email
2. **Test Order**: Đặt hàng với email hợp lệ
3. **Test System**: `GET /api/test-email`

## 📊 Email Analytics & Monitoring

### **Current Logging**
- Console logs cho email sending attempts
- Error logging với chi tiết lỗi
- Debug info cho troubleshooting

### **Recommended Improvements**
- Database logging cho email history
- Delivery status tracking
- Open/click rate tracking
- Failed email retry mechanism

## 🚨 Error Handling

### **Common Issues**
1. **Gmail credentials not configured**
   - Check environment variables
   - Verify app password

2. **Authentication failed**
   - Regenerate app password
   - Check 2FA settings

3. **Rate limiting**
   - Gmail has sending limits
   - Implement retry logic

4. **Invalid email addresses**
   - Validate email format
   - Handle bounced emails

### **Graceful Degradation**
- Order creation continues even if email fails
- Error logging without breaking user flow
- Fallback mechanisms for critical emails

## 🔄 Current Implementation Status

### **✅ Implemented & Working**
- ✅ OTP Email (`sendOTPEmail`)
- ✅ Order Confirmation Email (`sendOrderConfirmationEmail`)
- ✅ Email templates with branding
- ✅ Gmail integration (App Password)
- ✅ Test endpoint

### **⚠️ Defined But Not Used**
- ⚠️ Order Status Update Email (function exists, not called)
- ⚠️ Welcome Email (function exists, not called)
- ⚠️ Password Reset Email (function exists, not called)

### **🔄 Recommended Next Steps**
1. **Implement Welcome Email**: Call in user registration
2. **Implement Status Updates**: Call in admin order management
3. **Implement Password Reset**: Create forgot password flow
4. **Add Email History**: Database tracking
5. **Add Retry Logic**: Handle failed sends

## 📋 Email Triggers Summary

| **Email Type** | **Trigger** | **Status** | **API/Function** |
|---|---|---|---|
| OTP Verification | User requests OTP | ✅ Active | `POST /api/auth/send-otp` |
| Order Confirmation | Order created successfully | ✅ Active | Auto in `POST /api/orders` |
| Order Status Update | Admin updates order status | ⚠️ Ready | `sendOrderStatusEmail()` |
| Welcome Email | User registration complete | ⚠️ Ready | `sendWelcomeEmail()` |
| Password Reset | User forgot password | ⚠️ Ready | `sendPasswordResetEmail()` |

## 🎯 Business Impact

### **Customer Experience**
- ✅ **Order Confirmation**: Customers receive immediate confirmation
- ✅ **Security**: OTP verification for account security
- ⚠️ **Status Updates**: Missing real-time order updates
- ⚠️ **Welcome Flow**: Missing onboarding emails

### **Operational Benefits**
- **Reduced Support**: Automated confirmations reduce inquiries
- **Trust Building**: Professional emails build brand trust
- **Security**: OTP system prevents unauthorized access
- **Marketing**: Email templates ready for promotional content

## 🔐 Security Considerations

### **Email Security**
- ✅ App Password instead of plain password
- ✅ Environment variable protection
- ✅ OTP expiration (5 minutes)
- ✅ Secure email templates

### **Data Protection**
- ✅ No sensitive data in email content
- ✅ Secure token handling for password reset
- ✅ Email validation before sending

## 🎊 Kết Luận

**Hệ thống email Go Nuts đã sẵn sàng và hoạt động tốt cho:**
- ✅ **OTP Verification**: Bảo mật tài khoản
- ✅ **Order Confirmations**: Xác nhận đơn hàng tự động

**Cần implement thêm:**
- 📧 **Welcome emails** khi đăng ký
- 📋 **Order status updates** từ admin
- 🔑 **Password reset** flow

**Test ngay**: Truy cập `/api/test-email` để kiểm tra cấu hình email! 🚀