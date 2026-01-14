# 🔐 Hướng dẫn Setup Tài khoản Admin

## Cách 1: Sử dụng Setup Page (Khuyên dùng)

1. **Truy cập trang setup:**
   ```
   http://localhost:3000/setup-admin
   ```
   Hoặc trên production:
   ```
   https://your-domain.vercel.app/setup-admin
   ```

2. **Click "Create Admin Account"** để tạo tài khoản admin mới

3. **Thông tin đăng nhập mặc định:**
   - Email: `admin@gonuts.com`
   - Password: `admin123`

4. **Đăng nhập:**
   - Truy cập: `/login`
   - Nhập email và password
   - Sau khi đăng nhập, truy cập `/admin` để vào Admin Panel

## Cách 2: Sử dụng API trực tiếp

### Tạo tài khoản admin mới:
```bash
curl http://localhost:3000/api/seed/admin
```

### Reset mật khẩu admin:
```bash
curl http://localhost:3000/api/seed/admin?force=true
```

## Cách 3: Tạo thủ công qua Database

Nếu bạn có quyền truy cập MongoDB:

```javascript
// Connect to MongoDB
use gonuts

// Hash password (sử dụng bcrypt với salt rounds = 10)
// Password: admin123
// Hash: $2a$10$... (tạo bằng bcrypt)

db.users.insertOne({
  name: "Administrator",
  email: "admin@gonuts.com",
  password: "$2a$10$YourHashedPasswordHere",
  role: "admin",
  phone: "0123456789",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

## Thông tin tài khoản Admin mặc định

| Field    | Value              |
|----------|--------------------|
| Email    | admin@gonuts.com   |
| Password | admin123           |
| Role     | admin              |
| Name     | Administrator      |

## ⚠️ Lưu ý bảo mật

1. **Đổi mật khẩu ngay sau lần đăng nhập đầu tiên**
2. **Xóa hoặc bảo vệ trang `/setup-admin` trên production**
3. **Không chia sẻ thông tin đăng nhập admin**
4. **Sử dụng mật khẩu mạnh cho production**

## Kiểm tra tài khoản admin

Sau khi tạo, bạn có thể kiểm tra trong MongoDB:

```javascript
db.users.findOne({ email: "admin@gonuts.com" })
```

Hoặc kiểm tra qua API:

```bash
# Login để lấy token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gonuts.com","password":"admin123"}'
```

## Các quyền của Admin

Admin có thể:
- ✅ Quản lý sản phẩm (thêm, sửa, xóa)
- ✅ Quản lý đơn hàng
- ✅ Quản lý người dùng
- ✅ Quản lý vouchers
- ✅ Quản lý banners
- ✅ Quản lý blogs
- ✅ Quản lý subscription packages
- ✅ Xem thống kê và báo cáo

## Troubleshooting

### Không thể đăng nhập?
1. Kiểm tra email và password
2. Reset password bằng cách truy cập `/setup-admin` và click "Reset Admin Password"
3. Kiểm tra database xem tài khoản có tồn tại không

### Bị redirect về trang chủ sau khi đăng nhập?
1. Kiểm tra role trong database phải là "admin"
2. Xóa cookies và đăng nhập lại
3. Kiểm tra console log để xem lỗi

### Không thấy trang setup-admin?
1. Đảm bảo file `src/app/setup-admin/page.tsx` tồn tại
2. Restart development server
3. Clear cache và reload

## Production Deployment

Khi deploy lên production:

1. **Tạo admin account ngay sau khi deploy:**
   ```
   https://your-domain.vercel.app/setup-admin
   ```

2. **Sau khi tạo xong, xóa hoặc bảo vệ route này:**
   - Xóa file `src/app/setup-admin/page.tsx`
   - Hoặc thêm authentication cho route này

3. **Đổi mật khẩu admin ngay lập tức**

4. **Cân nhắc thêm 2FA (Two-Factor Authentication) cho admin**
