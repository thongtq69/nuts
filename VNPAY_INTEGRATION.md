# Hướng dẫn tích hợp VNPay

## Thông tin đã tích hợp

### Cấu hình VNPay (Môi trường TEST)
- **Terminal ID**: 4J30FZWF
- **Hash Secret**: U0MFILGVIZEHAMSP42RY2743WMG6CJKS
- **Payment URL**: https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
- **Return URL**: http://localhost:3000/checkout/vnpay-return

### Tài khoản Merchant Admin
- **URL**: https://sandbox.vnpayment.vn/merchantv2/
- **Username**: quocthong0801@gmail.com
- **Password**: (Mật khẩu bạn đã đăng ký)

### Test Case - IPN URL
- **URL**: https://sandbox.vnpayment.vn/vnpaygw-sit-testing/user/login
- **Username**: quocthong0801@gmail.com

## Các file đã tạo/cập nhật

### 1. Biến môi trường (.env.local)
```env
VNPAY_TMN_CODE=4J30FZWF
VNPAY_HASH_SECRET=U0MFILGVIZEHAMSP42RY2743WMG6CJKS
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3000/checkout/vnpay-return
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 2. VNPay Utilities
- **src/lib/vnpay.ts**: Server-side utilities (tạo URL thanh toán, verify checksum)
- **src/lib/vnpay-client.ts**: Client-side utilities (response codes)

### 3. API Routes
- **src/app/api/vnpay/create-payment/route.ts**: Tạo đơn hàng và URL thanh toán VNPay
- **src/app/api/vnpay/ipn/route.ts**: Xử lý callback từ VNPay (IPN - Instant Payment Notification)

### 4. Frontend Pages
- **src/app/checkout/page.tsx**: Cập nhật thêm option thanh toán VNPay
- **src/app/checkout/vnpay-return/page.tsx**: Trang xử lý kết quả thanh toán

### 5. Database Model
- **src/models/Order.ts**: Thêm trường `vnpayTransactionNo` và `paymentStatus`

## Luồng thanh toán VNPay

1. **Khách hàng chọn thanh toán VNPay** tại trang checkout
2. **Tạo đơn hàng** với status `pending` và `paymentStatus: 'pending'`
3. **Redirect đến VNPay** với URL thanh toán đã được mã hóa
4. **Khách hàng thanh toán** tại cổng VNPay
5. **VNPay gọi IPN** (callback) để cập nhật trạng thái đơn hàng
6. **VNPay redirect** khách hàng về trang `/checkout/vnpay-return`
7. **Hiển thị kết quả** thanh toán (thành công/thất bại)

## Cách test

### 1. Chạy development server
```bash
npm run dev
```

### 2. Truy cập trang checkout
- Thêm sản phẩm vào giỏ hàng
- Vào trang checkout: http://localhost:3000/checkout
- Chọn phương thức thanh toán "💳 Thanh toán qua VNPay"
- Nhấn "Thanh toán ngay"

### 3. Test thanh toán tại VNPay Sandbox
Bạn sẽ được redirect đến trang VNPay sandbox để test thanh toán.

**Thông tin thẻ test** (xem tại tài liệu VNPay):
- Ngân hàng: NCB
- Số thẻ: 9704198526191432198
- Tên chủ thẻ: NGUYEN VAN A
- Ngày phát hành: 07/15
- Mật khẩu OTP: 123456

### 4. Kiểm tra kết quả
- Sau khi thanh toán, bạn sẽ được redirect về `/checkout/vnpay-return`
- Kiểm tra trạng thái đơn hàng trong database
- Kiểm tra log tại Merchant Admin

## Cấu hình IPN URL

Để VNPay có thể gọi callback IPN, bạn cần:

1. **Deploy lên server public** hoặc dùng ngrok để expose localhost
2. **Cấu hình IPN URL** tại Merchant Admin:
   - URL: `https://your-domain.com/api/vnpay/ipn`
   - Hoặc với ngrok: `https://xxx.ngrok.io/api/vnpay/ipn`

### Sử dụng ngrok (cho development)
```bash
# Cài đặt ngrok
npm install -g ngrok

# Expose port 3000
ngrok http 3000

# Copy HTTPS URL và cập nhật vào .env.local
VNPAY_RETURN_URL=https://xxx.ngrok.io/checkout/vnpay-return
NEXT_PUBLIC_BASE_URL=https://xxx.ngrok.io
```

Sau đó cấu hình IPN URL tại Merchant Admin: `https://xxx.ngrok.io/api/vnpay/ipn`

## Production Deployment

Khi deploy lên production:

1. **Cập nhật biến môi trường**:
```env
VNPAY_RETURN_URL=https://your-domain.com/checkout/vnpay-return
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

2. **Đăng ký tài khoản VNPay Production**:
   - Liên hệ VNPay để đăng ký tài khoản thật
   - Cập nhật `VNPAY_TMN_CODE`, `VNPAY_HASH_SECRET`, `VNPAY_URL`

3. **Cấu hình IPN URL** tại Merchant Admin production

## Tài liệu tham khảo

- Tài liệu API: https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html
- Code demo: https://sandbox.vnpayment.vn/apis/vnpay-demo/code-demo-tích-hợp
- Merchant Admin: https://sandbox.vnpayment.vn/merchantv2/

## Lưu ý

- Môi trường TEST chỉ dùng để phát triển và test
- Không sử dụng thông tin thẻ thật trong môi trường TEST
- IPN URL phải là HTTPS trong production
- Luôn verify checksum từ VNPay để đảm bảo bảo mật
- Timeout thanh toán: 15 phút (có thể điều chỉnh trong `vnpay.ts`)
