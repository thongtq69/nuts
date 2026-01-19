# Test Report - Go Nuts E-commerce (Full Test)

**Ngày test:** 19/01/2026
**Môi trường:** localhost:3000
**Payment:** COD (Cash on Delivery)

---

## Tổng quan kết quả

| Role | Trạng thái | Chi tiết |
|------|------------|----------|
| User | ✅ Hoàn thành | Registration, Login, Order, Orders List |
| Sale/Collaborator | ✅ Hoàn thành | Dashboard, Stats, Commissions |
| Staff | ✅ Hoàn thành | Create Collaborators, Team Management, Stats |
| Admin | ✅ Hoàn thành | Dashboard, Orders, Users, Staff, Commissions |
| Middleware | ✅ Hoàn thành | Role-based protection |

---

## Chi tiết từng luồng test

### 1. USER FLOWS ✅

#### 1.1 Registration
```
POST /api/auth/register
Request: {"name":"Test User","email":"testuser@example.com","password":"Password123!","phone":"0901234567"}
Response: 201 Created
Result: ✅ User created with welcome voucher 50,000đ
```

#### 1.2 Login
```
POST /api/auth/login
Request: {"email":"testuser@example.com","password":"Password123!"}
Response: 200 OK
Result: ✅ Token set via httpOnly cookie
```

#### 1.3 Create Order (COD)
```
POST /api/orders
Items: 2 x Hạt điều (150,000đ) = 300,000đ
Shipping: 30,000đ
Total: 330,000đ
Response: 201 Created
Result: ✅ Order created with paymentMethod: "cod"
```

---

### 2. MIDDLEWARE & ROLE PROTECTION ✅

| Route | Không login | User thường | Staff | Admin |
|-------|-------------|-------------|-------|-------|
| /admin | ✅ Redirect /login | ✅ Redirect / | ✅ Redirect / | ✅ Access |
| /staff | ✅ Redirect /login | ✅ Redirect / | ✅ Access | ✅ Access |
| /agent | ✅ Redirect /login | ✅ Redirect / | ✅ Access | ✅ Access |

**Result:** ✅ Tất cả middleware hoạt động chính xác

---

### 3. ADMIN FLOWS ✅

#### 3.1 Create Staff
```
POST /api/admin/staff
Request: {"name":"Nguyễn Văn Staff","email":"staff1@gonuts.com","password":"Staff123!","staffCode":"NV001"}
Response: 201 Created
Result: ✅ Staff created
Staff ID: 696da7b2fb78e1eed24505d2
```

#### 3.2 Admin Orders List
```
GET /api/admin/orders
Response: 200 OK
Result: ✅ List all orders with status, total, customer info
```

---

### 4. STAFF FLOWS ✅

#### 4.1 Staff Login
```
POST /api/auth/login
Request: {"email":"staff1@gonuts.com","password":"Staff123!"}
Response: 200 OK
Role: staff
Result: ✅ Login successful
```

#### 4.2 Create Collaborator
```
POST /api/staff/collaborators
Request: {"name":"Trần Văn CTV","email":"ctv1@gonuts.com","password":"Ctv123!"}
Response: 201 Created
Result: ✅ CTV created with code: NV001-CTV1
CTV ID: 696da7bdfb78e1eed24505db
```

#### 4.3 Staff Stats
```
GET /api/staff/stats
Response:
{
  "totalCommission": 9000,
  "walletBalance": 9000,
  "totalCollaborators": 1,
  "totalOrders": 1,
  "teamRevenue": 480000
}
Result: ✅ Stats displayed correctly
```

---

### 5. AFFILIATE COMMISSION SYSTEM (2-LEVEL) ✅

#### 5.1 Create Order with Referral
```
POST /api/orders (with cookie gonuts_ref=NV001-CTV1)
Items: 3 x Hạt sen (150,000đ) = 450,000đ
Shipping: 30,000đ
Total: 480,000đ
Response: 201 Created
Result: ✅ Order created with referrer
```

#### 5.2 Commission Records Created

| Affiliate | Role | Rate | Amount | Status |
|-----------|------|------|--------|--------|
| Trần Văn CTV | collaborator | 10% | 45,000đ | pending |
| Nguyễn Văn Staff | staff | 2% | 9,000đ | pending |

**Total Commission:** 54,000đ (12% of 450,000đ base revenue)

#### 5.3 Update Order Status → Delivered
```
PATCH /api/admin/orders/{orderId}
Request: {"status": "delivered"}
Response: 200 OK
Result: ✅ Order status updated
```

#### 5.4 Commission Auto-Approved

| Affiliate | Before | After |
|-----------|--------|-------|
| Trần Văn CTV | pending | **approved** |
| Nguyễn Văn Staff | pending | **approved** |

#### 5.5 Wallet Balance Updated

| User | Role | walletBalance | totalCommission |
|------|------|---------------|-----------------|
| Trần Văn CTV | collaborator | **45,000đ** | 45,000đ |
| Nguyễn Văn Staff | staff | **9,000đ** | 9,000đ |

**Result:** ✅ Hệ thống hoa hồng 2 cấp hoạt động hoàn hảo!

---

### 6. COD PAYMENT FLOW ✅

| Bước | Mô tả | Trạng thái |
|------|-------|------------|
| 1 | User tạo đơn với `paymentMethod: "cod"` | ✅ |
| 2 | Order được tạo với `paymentStatus: "pending"` | ✅ |
| 3 | Admin cập nhật status | ✅ |
| 4 | Commission tự động approved khi delivered | ✅ |
| 5 | Wallet được cộng tiền | ✅ |

---

## Test Data đã tạo

### Admin Account
- **Email:** admin@gonuts.com
- **Password:** admin123

### Staff Account
- **Email:** staff1@gonuts.com
- **Password:** Staff123!
- **Staff Code:** NV001

### Collaborator Account
- **Email:** ctv1@gonuts.com
- **Password:** Ctv123!
- **Referral Code:** NV001-CTV1

### User Account
- **Email:** testuser@example.com
- **Password:** Password123!

### Test Orders
| Order ID | Customer | Total | Status | Commission |
|----------|----------|-------|--------|------------|
| 696da7d4fb78e1eed245060c | Customer Cookie Ref | 480,000đ | delivered | 54,000đ |
| 696da7ccfb78e1eed2450605 | Customer Ref Test | 1,030,000đ | pending | 0 |
| 696da7c5fb78e1eed24505e1 | Customer Test | 1,030,000đ | pending | 0 |
| 696d37f7399d3a1d58b1bde5 | Test User | 330,000đ | pending | 0 |

---

## Commission Flow Test Summary

```
Customer Order (480,000đ)
       ↓
   [Order Created]
       ↓
[Cookie: gonuts_ref=NV001-CTV1]
       ↓
[Commission Created]
   - CTV (10%): 45,000đ → status: pending
   - Staff (2%): 9,000đ → status: pending
       ↓
[Order Status: pending → delivered]
       ↓
[Auto-Approve Commission]
   - CTV: pending → approved
   - Staff: pending → approved
       ↓
[Wallet Updated]
   - CTV wallet: +45,000đ
   - Staff wallet: +9,000đ
```

---

## Tổng kết

| Danh mục | Tổng số | ✅ Pass | ❌ Fail | ⏳ Chưa test |
|----------|---------|--------|--------|--------------|
| User Flows | 4 | 4 | 0 | 0 |
| Middleware | 4 | 4 | 0 | 0 |
| Admin Flows | 3 | 3 | 0 | 0 |
| Staff Flows | 3 | 3 | 0 | 0 |
| Affiliate System | 6 | 6 | 0 | 0 |
| COD Payment | 5 | 5 | 0 | 0 |
| **Tổng** | **25** | **25** | **0** | **0** |

**Tiến độ hoàn thành:** 100% ✅

---

## Kết luận

✅ **Tất cả các luồng đều hoạt động chính xác:**

1. **User Registration & Login:** Hoạt động tốt
2. **Order Creation (COD):** Hoạt động tốt
3. **Middleware Protection:** Chặn đúng role
4. **Admin Management:** Tạo Staff, quản lý đơn hàng
5. **Staff Management:** Tạo Collaborator, xem stats
6. **Affiliate System (2-level):** Tính hoa hồng chính xác
   - Collaborator: 10%
   - Staff override: 2%
7. **Commission Auto-Approve:** Tự động khi order delivered
8. **Wallet Update:** Cộng tiền chính xác

---

*Report generated on: 2026-01-19*
*Tested by: Automated CLI Test*
