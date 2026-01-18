# 🔍 Test Scenarios - Go Nuts E-commerce

## Mục tiêu
Xác minh tất cả các fixes đã được áp dụng hoạt động đúng.

---

## ✅ Test 1: Admin Dashboard Status Query

### Mục tiêu
Kiểm tra Admin Dashboard hiển thị đúng đơn hàng đã giao (`delivered`)

### Steps
1. **Truy cập Admin Dashboard**: `/admin`
2. **Kiểm tra stats**:
   - Total Revenue: Hiển thị từ đơn `status: 'delivered'`
   - Completed Orders: Đếm đơn `status: 'delivered'`
3. **Tạo đơn test**:
   ```bash
   POST /api/orders
   {
     "items": [{"name": "Test", "quantity": 1, "price": 100000}],
     "shippingInfo": {...},
     "paymentMethod": "cod",
     "shippingFee": 30000
   }
   ```
4. **Cập nhật status**:
   ```bash
   PATCH /api/admin/orders/[id]
   { "status": "delivered" }
   ```
5. **Refresh admin dashboard** → Kiểm tra revenue tăng

### Expected Result
- ✅ Revenue tính từ đơn có `status: 'delivered'`
- ✅ Không có lỗi query

---

## ✅ Test 2: Commission Wallet Update

### Mục tiêu
Kiểm tra khi Admin duyệt commission, wallet của affiliate được cập nhật

### Steps
1. **Tạo Staff**:
   ```bash
   POST /api/admin/staff
   {
     "name": "Test Staff",
     "email": "staff@test.com",
     "password": "password123",
     "staffCode": "TEST01"
   }
   ```
2. **Tạo Collaborator** (đăng nhập với staff):
   ```bash
   POST /api/staff/collaborators
   {
     "name": "Test CTV",
     "email": "ctv@test.com",
     "password": "password123"
   }
   ```
3. **Tạo đơn từ referral**:
   ```bash
   POST /api/orders (với cookie gonuts_ref=TEST01-CTV1)
   ```
4. **Kiểm tra commission created**:
   ```bash
   GET /api/admin/commissions
   ```
5. **Duyệt commission**:
   ```bash
   PUT /api/admin/commissions
   { "id": "[comm_id]", "status": "approved" }
   ```
6. **Kiểm tra wallet**:
   ```bash
   GET /api/admin/users/[staff_id]
   ```
   → walletBalance tăng đúng amount

### Expected Result
- ✅ Commission tạo với `status: 'pending'`
- ✅ Khi duyệt → `status: 'approved'`
- ✅ Wallet tăng đúng commissionAmount

---

## ✅ Test 3: Collaborator Creation (bcrypt fix)

### Mục tiêu
Kiểm tra tạo collaborator hoạt động với bcrypt import đúng

### Steps
1. **Đăng nhập Staff**: `/login`
2. **Tạo CTV mới**:
   ```bash
   POST /api/staff/collaborators
   {
     "name": "New CTV",
     "email": "newctv@test.com",
     "password": "password123"
   }
   ```
3. **Kiểm tra response**:
   - 201 Created
   - Có `referralCode` dạng `TEST01-CTV{n}`
4. **Đăng nhập với CTV mới**:
   - Login thành công
   - Có role `sale`
   - Có `affiliateLevel: 'collaborator'`

### Expected Result
- ✅ Không có lỗi "bcrypt is not defined"
- ✅ Password được hash đúng
- ✅ Collaborator hoạt động bình thường

---

## ✅ Test 4: Checkout Provinces API Fallback

### Mục tiêu
Kiểm tra error handling khi API provinces lỗi

### Steps
1. **Mở Checkout page**: `/checkout`
2. **Simulate API failure**:
   - Có thể dùng browser DevTools để mock failed response
   - Hoặc chờ đợi tự nhiên nếu API lỗi
3. **Kiểm tra UI**:
   - Hiển thị thông báo lỗi
   - Có nút "↻" để reload trang
4. **Click reload** → Trang tải lại

### Expected Result
- ✅ Hiển thị error message: "Không thể tải danh sách tỉnh/thành"
- ✅ Có nút reload hoạt động
- ✅ Không crash trang

---

## ✅ Test 5: Email Hotline Configuration

### Mục tiêu
Kiểm tra hotline phone hiển thị đúng trong email

### Steps
1. **Cấu hình .env.local**:
   ```
   HOTLINE_PHONE=0912345678
   ```
2. **Test gửi email OTP**:
   ```bash
   POST /api/auth/send-otp
   { "email": "test@test.com" }
   ```
3. **Kiểm tra email nhận được**:
   - Hotline hiển thị: `0912345678` (hoặc giá trị trong env)
   - Không còn `09xxxxxxxx`

### Expected Result
- ✅ Hotline hiển thị đúng từ environment variable
- ✅ Email template không có placeholder

---

## ✅ Test 6: Cart Hydration (SSR)

### Mục tiêu
Kiểm tra giỏ hàng không bị hydration mismatch

### Steps
1. **Mở trang bất kỳ** với cart có sản phẩm
2. **Kiểm tra Console**:
   - Không có warning: "Text content does not match server-rendered HTML"
   - Không có warning: "Hydration failed"
3. **Refresh trang** nhiều lần:
   - Cart items vẫn giữ nguyên
   - Quantity không reset về mặc định

### Expected Result
- ✅ Không có hydration warnings
- ✅ Cart hoạt động ổn định

---

## ✅ Test 7: Middleware Role Protection

### Mục tiêu
Kiểm tra middleware chặn đúng role

### Steps
1. **User thường đăng nhập** (role: 'user')
2. **Thử truy cập**:
   - `/admin` → Redirect về `/`
   - `/staff` → Redirect về `/`
3. **Staff đăng nhập** (role: 'staff')
4. **Thử truy cập**:
   - `/staff` → OK
   - `/admin` → Redirect về `/` (không có quyền admin)
5. **Admin đăng nhập** (role: 'admin')
6. **Thử truy cập**:
   - `/admin` → OK
   - `/staff` → OK

### Expected Result
- ✅ User thường bị chặn khỏi /admin và /staff
- ✅ Staff có thể truy cập /staff nhưng không /admin
- ✅ Admin truy cập được cả hai

---

## ✅ Test 8: Order Status Update Flow

### Mục tiêu
Kiểm tra toàn bộ flow: Order → Commission → Wallet

### Steps
1. **Tạo đơn hàng với referral**:
   - Staff code: `NV001`
   - Tạo đơn 1.000.000đ
2. **Kiểm tra commission**:
   - GET /api/admin/commissions
   - Commission tạo với `status: 'pending'`
3. **Cập nhật order → 'delivered'**:
   - PATCH /api/admin/orders/[id] { "status": "delivered" }
4. **Kiểm tra auto-approve**:
   - Commission auto chuyển sang `status: 'approved'`
   - Wallet balance tăng
5. **Admin duyệt commission**:
   - PUT /api/admin/commissions { "status": "paid" }
6. **Kiểm tra cuối**:
   - Wallet có tiền
   - Commission `status: 'paid'`

### Expected Result
- ✅ Order tạo → Commission tự động tạo
- ✅ Order 'delivered' → Commission 'approved' → Wallet cộng tiền
- ✅ Admin đánh dấu 'paid' hoàn tất

---

## 🎯 Test Checklist Summary

| # | Test | Status | Notes |
|---|------|--------|-------|
| 1 | Admin Dashboard Status Query | ⏳ | |
| 2 | Commission Wallet Update | ⏳ | |
| 3 | Collaborator Creation (bcrypt) | ⏳ | |
| 4 | Checkout Provinces Fallback | ⏳ | |
| 5 | Email Hotline Config | ⏳ | |
| 6 | Cart Hydration (SSR) | ⏳ | |
| 7 | Middleware Role Protection | ⏳ | |
| 8 | Order Status Update Flow | ⏳ | |

---

## 🚀 Cách Chạy Tests

### Manual Testing
1. Chạy development server: `npm run dev`
2. Mở browser và thực hiện từng test case
3. Kiểm tra Console và Network tabs

### API Testing (curl)
```bash
# Test 1: Create order
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"items":[...],"shippingInfo":{...}}'

# Test 2: Get commissions
curl http://localhost:3000/api/admin/commissions

# Test 3: Update commission status
curl -X PUT http://localhost:3000/api/admin/commissions \
  -H "Content-Type: application/json" \
  -d '{"id":"...","status":"approved"}'
```

---

## 📋 Known Limitations (Không thuộc scope)

1. **VNPay Payment Flow**: Xử lý riêng bên ngoài
2. **Email Sending**: Cần cấu hình Gmail credentials
3. **External API**: provinces.open-api.vn có thể bị rate limit
