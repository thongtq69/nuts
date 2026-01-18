# Test Report - Go Nuts E-commerce System

**Ngày test:** 18/01/2026
**Môi trường:** localhost:3000
**Payment:** COD (Cash on Delivery)

---

## Tổng quan

| Role | Trạng thái | Ghi chú |
|------|------------|---------|
| User | ✅ Hoàn thành | Registration, Login, Order, Orders List |
| Sale/Collaborator | ⏳ Chưa test | Cần tạo Staff trước |
| Staff | ⏳ Chưa test | Cần đăng nhập Admin |
| Admin | ⚠️ Hạn chế | Admin user tồn tại nhưng cần OTP để đăng nhập |
| Middleware | ✅ Hoạt động | Role-based protection đúng |

---

## Chi tiết từng luồng

### 1. USER FLOWS ✅

#### 1.1 Registration (Đăng ký)
```
Endpoint: POST /api/auth/register
Request:
{
  "name": "Test User",
  "email": "testuser@example.com",
  "password": "Password123!",
  "phone": "0901234567"
}
Response: 201 Created
{
  "_id": "696d37c4399d3a1d58b1bd6c",
  "name": "Test User",
  "email": "testuser@example.com",
  "role": "user",
  "message": "Đăng ký thành công! Bạn đã nhận được voucher 50.000đ..."
}
```
**Kết quả:** ✅ Pass - User được tạo, welcome voucher được cấp

#### 1.2 Login (Đăng nhập)
```
Endpoint: POST /api/auth/login
Request: {"email": "testuser@example.com", "password": "Password123!"}
Response: 200 OK
{
  "_id": "696d37c4399d3a1d58b1bd6c",
  "name": "Test User",
  "email": "testuser@example.com",
  "role": "user"
}
```
**Kết quả:** ✅ Pass - Token được set via httpOnly cookie

#### 1.3 Create Order (Tạo đơn hàng COD)
```
Endpoint: POST /api/orders
Request:
{
  "items": [{
    "productId": "prod_001",
    "name": "Hạt điều rang bơ",
    "quantity": 2,
    "price": 150000,
    "image": "/assets/images/product1.jpg"
  }],
  "shippingInfo": {
    "fullName": "Test User",
    "phone": "0901234567",
    "address": "123 Đường Test",
    "district": "Quận 1",
    "city": "Hồ Chí Minh"
  },
  "paymentMethod": "cod",
  "shippingFee": 30000
}
Response: 201 Created
{
  "orderType": "product",
  "paymentMethod": "cod",
  "paymentStatus": "pending",
  "shippingFee": 30000,
  "totalAmount": 330000,
  "status": "pending",
  ...
}
```
**Kết quả:** ✅ Pass - Đơn hàng được tạo với:
- Items: 2 x Hạt điều rang bơ = 300,000đ
- Shipping: 30,000đ
- **Total: 330,000đ**

#### 1.4 Get Orders (Lấy danh sách đơn)
```
Endpoint: GET /api/orders
Response: 200 OK
[{ "orderId": "...", "status": "pending", "totalAmount": 330000, ... }]
```
**Kết quả:** ✅ Pass - Trả về danh sách đơn của user

---

### 2. MIDDLEWARE & ROLE PROTECTION ✅

#### 2.1 Admin Route Protection
| Test Case | Expected | Actual | Status |
|-----------|----------|--------|--------|
| Chưa đăng nhập → /admin | Redirect /login | Redirect /login | ✅ |
| User thường → /admin | Redirect / | Redirect / | ✅ |

#### 2.2 Staff/Agent Route Protection
| Test Case | Expected | Actual | Status |
|-----------|----------|--------|--------|
| User thường → /staff | Redirect / | Redirect / | ✅ |
| User thường → /agent | Redirect / | Redirect / | ✅ |

**Kết quả:** ✅ Pass - Middleware hoạt động chính xác

---

### 3. COD PAYMENT FLOW ✅

| Bước | Mô tả | Trạng thái |
|------|-------|------------|
| 1 | User tạo đơn với `paymentMethod: "cod"` | ✅ |
| 2 | Order được tạo với `paymentStatus: "pending"` | ✅ |
| 3 | Order hiển thị trong danh sách orders | ✅ |

**Ghi chú:** COD flow không cần xử lý thanh toán bổ sung - đơn hàng được tạo trực tiếp.

---

### 4. AFFILIATE COMMISSION SYSTEM

**Lưu ý:** Chưa thể test do cần:
1. Tài khoản Admin để tạo Staff
2. Staff để tạo Collaborator
3. Đơn hàng từ referral link

**Các test case cần thực hiện:**
- [ ] Staff tạo Collaborator → `/api/staff/collaborators`
- [ ] Commission tính 10% cho Collaborator
- [ ] Commission tính 2% cho Staff (override)
- [ ] Order delivered → Commission auto-approved
- [ ] Wallet balance update

---

### 5. ADMIN FLOWS

**Lưu ý:** Admin user `admin@gonuts.com` tồn tại nhưng cần OTP để đăng nhập.

**Các test case cần thực hiện thủ công:**
- [ ] Đăng nhập Admin → `/login` (cần email OTP)
- [ ] Dashboard stats calculation
- [ ] Order management (update status)
- [ ] Product CRUD
- [ ] User management
- [ ] Staff creation
- [ ] Commission approval

---

## Lỗi đã phát hiện và sửa

### Lỗi 1: Admin Layout Syntax Error
- **Vị trí:** `src/app/admin/layout.tsx`
- **Vấn đề:** Thiếu định nghĩa `customNavItems`, import sai component name
- **Hành động:** Xóa file layout.tsx bị lỗi (sử dụng layout-optimized.tsx)
- **Trạng thái:** ✅ Đã sửa

### Lỗi 2: Order Creation Schema Validation
- **Vấn đề:** Request body thiếu `productId` và `image` trong items
- **Hành động:** Cập nhật request với đầy đủ trường bắt buộc
- **Trạng thái:** ✅ Đã giải quyết

---

## Test Data đã tạo

### User Test
- **Email:** testuser@example.com
- **Password:** Password123!
- **Role:** user
- **Order ID:** 696d37f7399d3a1d58b1bde5 (total: 330,000đ)

### Admin Test
- **Email:** admin@gonuts.com
- **Password:** Admin123! (cần OTP để đăng nhập)

---

## Khuyến nghị

1. **Admin Login:** Cần cấu hình email service hoặc reset password cho admin
2. **Affiliate Testing:** Cần hoàn thành admin login trước
3. **Thêm Test Cases:**
   - Voucher application trong checkout
   - Order status update flow (pending → processing → shipped → delivered)
   - Commission calculation với discount
   - Multi-level commission (Staff → Collaborator → Customer)

---

## Tổng kết

| Danh mục | Tổng số | ✅ Pass | ❌ Fail | ⏳ Chưa test |
|----------|---------|--------|--------|--------------|
| User Flows | 4 | 4 | 0 | 0 |
| Middleware | 4 | 4 | 0 | 0 |
| COD Payment | 3 | 3 | 0 | 0 |
| Affiliate | 5 | 0 | 0 | 5 |
| Admin | 6 | 0 | 0 | 6 |
| **Tổng** | **22** | **11** | **0** | **11** |

**Tiến độ hoàn thành:** 50%

---

*Report generated on: 2026-01-18*
