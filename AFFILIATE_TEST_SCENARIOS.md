# Affiliate Marketing Test Scenarios

## Mô hình tiếp thị liên kết 2 cấp

### Cấu trúc
- **Staff (Nhân viên)**: `role: 'staff'`, `affiliateLevel: 'staff'`
  - Có `staffCode` (mã nhân viên, ví dụ: NV001)
  - Có `referralCode` (cùng với staffCode)
  - Có `staffCommissionRate` (mặc định 2%) - nhận hoa hồng từ doanh thu của CTV
  - Có thể quản lý nhiều Cộng tác viên (CTV)

- **Collaborator (Cộng tác viên)**: `role: 'sale'`, `affiliateLevel: 'collaborator'`
  - Có `parentStaff` (trỏ đến Staff quản lý)
  - Có `referralCode` (format: `{staffCode}-CTV{n}`, ví dụ: NV001-CTV1)
  - Có `commissionRateOverride` (mặc định 10%) - nhận hoa hồng trực tiếp từ khách hàng
  - Có `staffCommissionRate` (mặc định 2%) - phần hoa hồng Staff nhận được

- **Customer (Khách hàng)**: `role: 'user'`
  - Có `referrer` (trỏ đến người giới thiệu - Staff hoặc CTV)
  - Khi mua hàng, sẽ tạo hoa hồng cho người giới thiệu

### Cơ chế tính hoa hồng

#### Trường hợp 1: Khách mua hàng qua link của CTV
- CTV: Nhận 10% doanh thu
- Staff quản lý CTV đó: Nhận thêm 2% doanh thu

**Ví dụ**: Khách mua đơn 1.000.000đ qua link CTV1
- CTV1: +100.000đ (10%)
- Staff quản lý: +20.000đ (2%)
- Tổng hoa hồng: 120.000đ (12%)

#### Trường hợp 2: Khách mua hàng qua link của Staff
- Staff: Nhận 10% doanh thu
- Không có hoa hồng cấp 2

**Ví dụ**: Khách mua đơn 1.000.000đ qua link Staff
- Staff: +100.000đ (10%)
- Tổng hoa hồng: 100.000đ (10%)

## Test Scenarios

### Scenario 1: Tạo Staff và tạo đơn hàng từ link Staff
**Mục tiêu**: Kiểm tra Staff nhận được 10% hoa hồng

**Steps**:
1. Admin đăng nhập
2. Tạo Staff mới:
   ```json
   POST /api/admin/staff
   {
     "name": "Nguyen Van A",
     "email": "staff1@example.com",
     "phone": "0123456789",
     "password": "password123",
     "staffCode": "NV001"
   }
   ```
3. Lấy `referralCode` của Staff (đồng thời là `staffCode`)
4. Tạo đơn hàng test với referral code của Staff:
   ```json
   POST /api/admin/test-affiliate
   {
     "items": [
       {
         "name": "Hạt điều",
         "quantity": 10,
         "price": 100000
       }
     ],
     "shippingInfo": {
       "fullName": "Customer 1",
       "phone": "0987654321",
       "address": "123 ABC",
       "city": "Hà Nội"
     },
     "referralCode": "NV001"
   }
   ```
5. Kiểm tra kết quả:
   - Đơn hàng được tạo thành công
   - CommissionAmount = 10% của 1.000.000đ = 100.000đ
   - Có 1 record trong AffiliateCommission:
     - `affiliateId`: Staff ID
     - `orderId`: Order ID
     - `orderValue`: 1.000.000đ
     - `commissionRate`: 10
     - `commissionAmount`: 100.000đ
     - `status`: 'pending'
     - `note`: 'Staff direct commission'
6. Admin cập nhật trạng thái đơn hàng sang 'delivered'
7. Kiểm tra lại:
   - Commission status = 'approved'
   - Staff `walletBalance` = 100.000đ
   - Staff `totalCommission` = 100.000đ

### Scenario 2: Staff tạo CTV và đơn hàng từ link CTV
**Mục tiêu**: Kiểm tra CTV nhận 10% và Staff nhận 2%

**Steps**:
1. Staff đăng nhập với tài khoản NV001
2. Tạo CTV mới:
   ```json
   POST /api/staff/collaborators
   {
     "name": "Tran Van B",
     "email": "ctv1@example.com",
     "phone": "0123456788",
     "password": "password123"
   }
   ```
3. Kiểm tra CTV được tạo:
   - `referralCode`: NV001-CTV1
   - `parentStaff`: NV001's ID
   - `role`: 'sale'
   - `affiliateLevel`: 'collaborator'
4. Staff's `collaboratorCount` = 1
5. Tạo đơn hàng test với referral code của CTV:
   ```json
   POST /api/admin/test-affiliate
   {
     "items": [
       {
         "name": "Hạt óc chó",
         "quantity": 5,
         "price": 200000
       }
     ],
     "shippingInfo": {
       "fullName": "Customer 2",
       "phone": "0987654322",
       "address": "456 DEF",
       "city": "HCM"
     },
     "referralCode": "NV001-CTV1"
   }
   ```
6. Kiểm tra kết quả:
   - Đơn hàng được tạo thành công
   - TotalAmount = 1.000.000đ
   - CommissionAmount = 120.000đ (10% CTV + 2% Staff)
   - Có 2 records trong AffiliateCommission:
     - Record 1 (CTV):
       - `affiliateId`: CTV ID
       - `orderId`: Order ID
       - `orderValue`: 1.000.000đ
       - `commissionRate`: 10
       - `commissionAmount`: 100.000đ
       - `status`: 'pending'
       - `note`: 'Collaborator commission'
     - Record 2 (Staff):
       - `affiliateId`: Staff ID
       - `orderId`: Order ID
       - `orderValue`: 1.000.000đ
       - `commissionRate`: 2
       - `commissionAmount`: 20.000đ
       - `status`: 'pending'
       - `note`: 'Staff override commission from collaborator'
7. Admin cập nhật trạng thái đơn hàng sang 'delivered'
8. Kiểm tra lại:
   - Cả 2 commissions status = 'approved'
   - CTV `walletBalance` = 100.000đ
   - CTV `totalCommission` = 100.000đ
   - Staff `walletBalance` = 120.000đ (100k + 20k)
   - Staff `totalCommission` = 120.000đ

### Scenario 3: Tạo nhiều CTV cho một Staff
**Mục tiêu**: Kiểm tra Staff có thể quản lý nhiều CTV

**Steps**:
1. Staff đăng nhập với tài khoản NV001
2. Tạo CTV thứ 2:
   ```json
   POST /api/staff/collaborators
   {
     "name": "Le Van C",
     "email": "ctv2@example.com",
     "phone": "0123456787",
     "password": "password123"
   }
   ```
3. Kiểm tra CTV được tạo với `referralCode`: NV001-CTV2
4. Tạo đơn hàng từ CTV2 (500.000đ)
5. Kiểm tra Staff stats:
   ```json
   GET /api/staff/stats
   ```
   - `totalCommission`: 170.000đ (120k từ CTV1 + 50k từ CTV2)
   - `totalCollaborators`: 2
   - `teamRevenue`: 1.500.000đ
6. Kiểm tra danh sách CTV:
   ```json
   GET /api/staff/collaborators
   ```
   - Có 2 CTV với thông tin chi tiết (số đơn, doanh thu mỗi người)

### Scenario 4: Cập nhật trạng thái đơn hàng từ pending → delivered → cancelled
**Mục tiêu**: Kiểm tra commission được update đúng theo trạng thái

**Steps**:
1. Tạo đơn hàng mới từ CTV (500.000đ)
2. Commission status = 'pending'
3. Cập nhật sang 'processing' - Commission vẫn 'pending'
4. Cập nhật sang 'shipped' - Commission vẫn 'pending'
5. Cập nhật sang 'delivered' - Commission chuyển sang 'approved', wallet được cập nhật
6. Tạo đơn hàng mới khác từ CTV (300.000đ)
7. Cập nhật sang 'cancelled' - Commission chuyển sang 'rejected', wallet không được cập nhật

### Scenario 5: Khách hàng đã có referrer, mua hàng không qua referral code
**Mục tiêu**: Kiểm tra referrer vẫn nhận hoa hồng nếu khách đã từng được giới thiệu

**Steps**:
1. Tạo user mới với referrer:
   ```json
   POST /api/auth/register
   {
     "name": "Customer 3",
     "email": "customer3@example.com",
     "password": "password123"
   }
   ```
   và set cookie `gonuts_ref` = 'NV001-CTV1'
2. User được tạo với `referrer` = CTV1's ID
3. User đăng nhập và tạo đơn hàng (không có referral code):
   ```json
   POST /api/orders
   {
     "items": [...],
     "shippingInfo": {...}
   }
   ```
4. Kiểm tra kết quả:
   - Referrer = CTV1's ID
   - CTV1 nhận 10%, Staff nhận 2%
   - Commission được tạo đúng

### Scenario 6: Voucher giảm giá và commission
**Mục tiêu**: Kiểm tra commission được tính trên doanh thu thực tế (sau khi giảm giá)

**Steps**:
1. User có voucher giảm 200.000đ
2. Tạo đơn hàng:
   - Items total: 1.000.000đ
   - Voucher: -200.000đ
   - Shipping: 30.000đ
   - Final total: 830.000đ
3. Kiểm tra commission:
   - Base revenue: 800.000đ (1.000.000đ - 200.000đ, không tính shipping)
   - CTV: 10% của 800.000đ = 80.000đ
   - Staff: 2% của 800.000đ = 16.000đ
   - Total commission: 96.000đ

### Scenario 7: Staff thay đổi commission rate
**Mục tiêu**: Kiểm tra commission rate override hoạt động đúng

**Steps**:
1. Admin cập nhật Staff NV001 với `commissionRateOverride` = 12%
2. Tạo đơn hàng từ Staff trực tiếp (500.000đ)
3. Kiểm tra commission:
   - Staff nhận 12% (thay vì 10% mặc định) = 60.000đ
4. Admin cập nhật CTV1 với `commissionRateOverride` = 8%
5. Tạo đơn hàng từ CTV1 (500.000đ)
6. Kiểm tra commission:
   - CTV1 nhận 8% = 40.000đ
   - Staff vẫn nhận 2% = 10.000đ
   - Total: 50.000đ

### Scenario 8: Rút tiền từ wallet (nếu có tính năng)
**Mục tiêu**: Kiểm tra quy trình rút tiền

**Steps**:
1. CTV có walletBalance = 100.000đ
2. CTV yêu cầu rút 50.000đ
3. Kiểm tra:
   - WalletBalance giảm xuống 50.000đ
   - TotalCommission không đổi
   - Tạo record yêu cầu rút tiền
4. Admin duyệt yêu cầu rút tiền
5. CTV nhận tiền vào tài khoản ngân hàng

### Scenario 9: Xóa Staff và CTV
**Mục tiêu**: Kiểm tra xóa Staff và CTV hoạt động đúng

**Steps**:
1. Admin xóa CTV:
   ```json
   DELETE /api/staff/collaborators
   {
     "collaboratorId": "ctv1_id"
   }
   ```
2. Kiểm tra:
   - CTV bị xóa
   - Staff `collaboratorCount` giảm đi 1
   - Commissions cũ vẫn được giữ lại
3. Admin xóa Staff:
   ```json
   DELETE /api/admin/staff
   {
     "staffId": "staff_id"
   }
   ```
4. Kiểm tra:
   - Tất cả CTV dưới quyền bị xóa
   - Staff bị xóa
   - Commissions cũ vẫn được giữ lại

### Scenario 10: Thống kê và báo cáo
**Mục tiêu**: Kiểm tra dashboard và thống kê hoạt động đúng

**Steps**:
1. Admin xem danh sách Staff:
   ```json
   GET /api/admin/staff
   ```
   - Hiển thị thông tin Staff
   - Số lượng CTV
   - Tổng doanh thu team
   - Tổng commission
2. Staff xem thống kê:
   ```json
   GET /api/staff/stats
   ```
   - Tổng commission cá nhân
   - Wallet balance
   - Số lượng CTV
   - Tổng đơn hàng team
   - Tổng doanh thu team
   - Biểu đồ commission 7 ngày gần nhất
   - Top 5 CTV
3. Admin xem tất cả commissions:
   ```json
   GET /api/admin/commissions
   ```
   - Lọc theo affiliate, status, date
   - Export dữ liệu

## Test Data Preparation

### Tạo Staff
```json
POST /api/admin/staff
{
  "name": "Nguyen Van Staff",
  "email": "staff@ Gonuts.com",
  "phone": "0901234567",
  "password": "Staff@123",
  "staffCode": "STAFF01"
}
```

### Tạo CTV1
```json
POST /api/staff/collaborators
{
  "name": "Tran Van CTV",
  "email": "ctv1@gonuts.com",
  "phone": "0912345678",
  "password": "CTV@123"
}
```

### Tạo CTV2
```json
POST /api/staff/collaborators
{
  "name": "Le Van CTV2",
  "email": "ctv2@gonuts.com",
  "phone": "0923456789",
  "password": "CTV@123"
}
```

### Affiliate Settings
```json
POST /api/admin/affiliate-settings
{
  "defaultCommissionRate": 10,
  "cookieDurationDays": 30,
  "minWithdrawalAmount": 200000,
  "commissionType": "percent"
}
```

## Expected Results

| Scenario | Expected Outcome |
|----------|------------------|
| 1 | Staff nhận 10% commission |
| 2 | CTV nhận 10%, Staff nhận 2% |
| 3 | Staff quản lý được nhiều CTV, thống kê tổng hợp chính xác |
| 4 | Commission update đúng theo trạng thái đơn hàng |
| 5 | Referrer vẫn nhận hoa hồng từ khách đã được giới thiệu |
| 6 | Commission tính trên doanh thu sau giảm giá |
| 7 | Commission rate override hoạt động đúng |
| 8 | Quá trình rút tiền hoạt động đúng (nếu có tính năng) |
| 9 | Xóa Staff/CTV không làm mất dữ liệu commission |
| 10 | Dashboard và thống kê hiển thị chính xác |

## Known Issues & Limitations

1. **Chưa có tính năng rút tiền**: Hiện tại chỉ có wallet balance nhưng chưa có API rút tiền
2. **Chưa có phân quyền chi tiết**: Chỉ phân biệt admin/staff/collaborator/user
3. **Chưa có báo cáo chi tiết**: Chỉ có thống kê cơ bản
4. **Chưa có multi-level sâu hơn**: Chỉ hỗ trợ 2 cấp (Staff → CTV → Customer)
5. **Chưa có tính năng time-based cookie**: Referral cookie không có thời gian hết hạn
6. **Chưa có cơ chế prevent self-referral**: User có thể giới thiệu chính mình (không nên)
