# 🏠 Hướng Dẫn Sửa Sản Phẩm Không Hiển Thị Trên Trang Chủ

## 🔍 Vấn đề
Sản phẩm không hiển thị trên trang chủ production (nuts-mocha-tau.vercel.app) nhưng hoạt động bình thường trên localhost.

## 🎯 Nguyên nhân
Trang chủ tìm sản phẩm theo **tags cụ thể** (`best-seller`, `new`, `promo`) nhưng sản phẩm trong database không có những tags này.

## ✅ Giải pháp đã tạo

### **1. API Sửa Tự Động**
Đã tạo API endpoint: `/api/fix-homepage`
- **GET**: Kiểm tra tình trạng hiện tại
- **POST**: Tự động thêm tags cho tất cả sản phẩm

### **2. Trang Admin Quản Lý**
Đã tạo trang admin: `/admin/fix-homepage`
- Giao diện thân thiện để kiểm tra và sửa
- Hiển thị thống kê tags hiện tại
- Nút "Sửa Ngay" để khắc phục

### **3. Quản Lý Tags Chi Tiết**
Đã tạo trang: `/admin/product-tags`
- Xem danh sách tất cả sản phẩm và tags
- Thống kê số lượng theo từng loại tag
- Quản lý tags chi tiết

## 🚀 Cách Sử Dụng

### **Bước 1: Truy cập Admin**
1. Đăng nhập admin: `nuts-mocha-tau.vercel.app/admin`
2. Credentials: `admin@gonuts.com` / `admin123`

### **Bước 2: Sửa Trang Chủ**
1. Vào menu **"CÀI ĐẶT" → "Sửa Trang Chủ"**
2. Nhấn **"Kiểm tra"** để xem tình trạng hiện tại
3. Nhấn **"Sửa Ngay"** để thêm tags tự động
4. Chờ thông báo thành công

### **Bước 3: Kiểm Tra Kết Quả**
1. Truy cập trang chủ: `nuts-mocha-tau.vercel.app`
2. Sản phẩm sẽ hiển thị trong các section:
   - **Sản phẩm bán chạy** (tag: `best-seller`)
   - **Sản phẩm mới** (tag: `new`)  
   - **Khuyến mãi** (tag: `promo`)

## 🔧 Cách Hoạt Động

### **Tags Được Phân Bổ:**
- **Sản phẩm 1, 4, 7, 10...**: `best-seller`
- **Sản phẩm 2, 5, 8, 11...**: `new`
- **Sản phẩm 3, 6, 9, 12...**: `promo`
- **4 sản phẩm đầu**: thêm tag `featured`

### **Fallback Logic:**
Nếu không tìm thấy sản phẩm theo tag cụ thể, hệ thống sẽ:
1. Tìm sản phẩm bất kỳ làm fallback
2. Hiển thị thông báo "Đang cập nhật sản phẩm"

## 📊 Kiểm Tra Thủ Công

### **API Endpoints:**
```bash
# Kiểm tra tình trạng
GET /api/fix-homepage

# Sửa tự động
POST /api/fix-homepage

# Xem chi tiết tags
GET /api/seed/product-tags
```

### **Database Query:**
```javascript
// Kiểm tra sản phẩm có tags
db.products.find({ tags: { $exists: true, $ne: [] } })

// Kiểm tra sản phẩm theo tag cụ thể
db.products.find({ tags: "best-seller" })
db.products.find({ tags: "new" })
db.products.find({ tags: "promo" })
```

## 🎯 Kết Quả Mong Đợi

Sau khi sửa:
- ✅ Trang chủ hiển thị sản phẩm bình thường
- ✅ 3 section sản phẩm có dữ liệu
- ✅ Không còn thông báo "Đang cập nhật sản phẩm"
- ✅ Trải nghiệm giống localhost

## 🔄 Bảo Trì

### **Khi Thêm Sản Phẩm Mới:**
1. Vào `/admin/product-tags` để kiểm tra
2. Thêm tags thủ công hoặc chạy lại fix tự động
3. Tags khuyến nghị: `best-seller`, `new`, `promo`

### **Tùy Chỉnh Tags:**
- Sửa file `src/app/page.tsx` để thay đổi logic filter
- Sửa `getProductsByTag()` function để tùy chỉnh fallback
- Thêm tags mới trong admin interface

## 📝 Ghi Chú Kỹ Thuật

### **Files Liên Quan:**
- `src/app/page.tsx` - Trang chủ, logic fetch sản phẩm theo tags
- `src/app/api/fix-homepage/route.ts` - API sửa tự động
- `src/app/admin/fix-homepage/page.tsx` - Giao diện admin
- `src/app/admin/product-tags/page.tsx` - Quản lý tags chi tiết
- `src/components/home/ProductSection.tsx` - Component hiển thị sản phẩm

### **Cấu Trúc Tags:**
```typescript
interface Product {
  _id: ObjectId;
  name: string;
  tags: string[]; // ['best-seller', 'new', 'promo', 'featured']
  // ... other fields
}
```

## 🎉 Hoàn Thành!

Sau khi thực hiện các bước trên, trang chủ sẽ hiển thị sản phẩm bình thường như localhost. Vấn đề đã được khắc phục hoàn toàn! 🚀