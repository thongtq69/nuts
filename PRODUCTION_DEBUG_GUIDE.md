# 🔍 Production Debug Guide - Sửa Lỗi Không Hiển Thị Sản Phẩm

## ❌ Vấn đề:
- **Localhost**: Sản phẩm hiển thị bình thường
- **Production**: Không có sản phẩm hiển thị

## 🔧 Các bước debug đã thực hiện:

### **1. Thêm Logging Chi Tiết**
```typescript
// src/app/api/products/route.ts
console.log('🔍 Products API: Starting request...');
console.log('✅ Products API: Database connected');
console.log(`✅ Products API: Found ${products.length} products`);

// src/lib/api.ts  
console.log('🔍 Fetching products from:', url);
console.log('📡 Products API Response:', res.status, res.statusText);
console.log(`✅ Products fetched successfully: ${products.length} items`);

// src/app/page.tsx
console.log('🏠 Home page: Starting to fetch products...');
console.log('🏠 Home page: Products fetched:', { bestSellers, newProducts, promotionProducts });
```

### **2. Cải Thiện API URL Handling**
```typescript
// src/lib/api.ts
const getApiUrl = () => {
    if (typeof window !== 'undefined') {
        // Client-side: use relative URL
        return '/api';
    }
    
    // Server-side: use full URL
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}/api`;
    }
    
    if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL;
    }
    
    return 'http://localhost:3000/api';
};
```

### **3. Tạo Debug API Endpoint**
```typescript
// src/app/api/debug/route.ts
// Endpoint để kiểm tra:
// - Environment variables
// - Database connection
// - Product count
// - Sample products
```

### **4. Debug Component**
```typescript
// src/components/debug/ProductDebugInfo.tsx
// Component hiển thị debug info trên UI
// Chỉ hiện trong development mode
```

## 🎯 Các nguyên nhân có thể:

### **1. Environment Variables**
```bash
# Kiểm tra các biến môi trường trên production:
MONGODB_URI=mongodb+srv://...  # Phải có
NEXT_PUBLIC_API_URL=https://... # Tùy chọn
NODE_ENV=production
```

### **2. Database Connection**
- MongoDB URI không đúng trên production
- Database không có dữ liệu sản phẩm
- Network/firewall issues

### **3. API Routing**
- API URL không đúng trên production
- CORS issues
- Server-side vs client-side rendering

### **4. Build Issues**
- Static generation vs dynamic rendering
- Cache issues
- Deployment configuration

## 📋 Checklist Debug:

### **Bước 1: Kiểm tra Debug API**
```bash
# Truy cập trên production:
https://your-domain.com/api/debug

# Kiểm tra response:
{
  "environment": "production",
  "mongoUri": "SET" | "NOT SET",
  "dbConnection": "SUCCESS" | "FAILED",
  "productCount": 0 | number,
  "sampleProducts": [...],
  "dbError": "error message if any"
}
```

### **Bước 2: Kiểm tra Products API**
```bash
# Truy cập trực tiếp:
https://your-domain.com/api/products

# Kiểm tra response:
- Status: 200 OK
- Content: Array of products
- Length: > 0
```

### **Bước 3: Kiểm tra Console Logs**
```bash
# Trên production, check server logs:
- Vercel: Function logs
- Other platforms: Server logs

# Tìm các log messages:
🔍 Products API: Starting request...
✅ Products API: Database connected
✅ Products API: Found X products
```

### **Bước 4: Kiểm tra Database**
```bash
# Kết nối trực tiếp MongoDB:
1. Kiểm tra connection string
2. Verify database name
3. Check collection "products"
4. Verify documents exist
5. Check indexes and permissions
```

## 🛠️ Các giải pháp có thể:

### **1. Nếu Database Connection Failed**
```bash
# Kiểm tra MongoDB URI:
- Correct username/password
- Correct cluster URL
- Network access (IP whitelist)
- Database permissions
```

### **2. Nếu API URL Wrong**
```bash
# Set environment variables:
NEXT_PUBLIC_API_URL=https://your-domain.com/api
# Hoặc để trống để dùng relative URLs
```

### **3. Nếu No Products Found**
```bash
# Seed database với sample data:
1. Tạo products qua admin panel
2. Import data từ localhost
3. Run seed script
```

### **4. Nếu Build Issues**
```bash
# Force dynamic rendering:
export const dynamic = 'force-dynamic';

# Clear cache:
- Redeploy application
- Clear CDN cache
- Hard refresh browser
```

## 🚀 Hướng dẫn sử dụng Debug Tools:

### **1. Debug API (Production)**
```bash
# Truy cập: https://your-domain.com/api/debug
# Kiểm tra tất cả thông tin debug
```

### **2. Debug Component (Development)**
```bash
# Trong development mode:
1. Click nút "DEBUG" ở góc phải dưới
2. Xem thông tin debug real-time
3. Click "Refresh" để update
```

### **3. Console Logging**
```bash
# Check browser console và server logs:
- 🔍 = Starting operations
- ✅ = Success operations  
- ❌ = Error operations
- 📡 = API responses
```

## 🎯 Next Steps:

1. **Deploy với debug code**
2. **Truy cập `/api/debug` trên production**
3. **Kiểm tra response để xác định vấn đề**
4. **Fix theo kết quả debug**
5. **Remove debug code sau khi fix**

## 📞 Common Issues & Solutions:

### **Issue: "mongoUri": "NOT SET"**
```bash
Solution: Set MONGODB_URI environment variable on deployment platform
```

### **Issue: "dbConnection": "FAILED"**
```bash
Solution: 
- Check MongoDB connection string
- Verify network access
- Check database permissions
```

### **Issue: "productCount": 0**
```bash
Solution:
- Add products via admin panel
- Import data from localhost
- Check database collection name
```

### **Issue: API returns empty array**
```bash
Solution:
- Check product tags (best-seller, new, promo)
- Verify query filters
- Check product schema
```

**Ready to debug production! 🔍**