# ☁️ Hướng Dẫn Tích Hợp Cloudinary - Quản Lý Hình Ảnh Chuyên Nghiệp

## 🎯 Tổng Quan
Đã tích hợp hoàn toàn Cloudinary để thay thế việc lưu trữ hình ảnh base64. Tất cả hình ảnh của website bây giờ được upload và quản lý qua Cloudinary CDN.

## ✅ Các Tính Năng Đã Tích Hợp

### **1. Upload API Mới**
- **Endpoint**: `/api/upload`
- **Methods**: `POST` (file upload), `PUT` (base64 upload)
- **Tự động phân loại**: Banners, Products, Test files
- **Tối ưu hóa**: Chất lượng và format tự động

### **2. Banner Upload với Cloudinary**
- **Auto-crop**: Tỉ lệ 3:1 với ImageCropper
- **Direct upload**: Ảnh đúng tỉ lệ upload trực tiếp
- **Folder**: `gonuts/banners`
- **Quality**: JPEG 90% cho kích thước tối ưu

### **3. Product Image Upload**
- **Folder**: `gonuts/products`
- **Support**: File upload và URL input
- **Integration**: ProductForm component

### **4. Admin Management**
- **Cloudinary Dashboard**: `/admin/cloudinary`
- **Test Upload**: Kiểm tra kết nối và upload
- **Configuration**: Hiển thị thông tin cấu hình

## 🔧 Cấu Hình Cloudinary

### **Environment Variables**
```env
CLOUDINARY_URL=cloudinary://473628735676585:s9qVQxSK45B6jlMxota5v9HMq4c@du6no35fj
CLOUDINARY_CLOUD_NAME=du6no35fj
CLOUDINARY_API_KEY=473628735676585
CLOUDINARY_API_SECRET=s9qVQxSK45B6jlMxota5v9HMq4c
```

### **Folder Structure**
```
gonuts/
├── banners/          # Banner images (3:1 ratio)
├── products/         # Product images
└── test/            # Test uploads
```

## 🚀 Cách Sử Dụng

### **1. Upload Banner**
1. Vào `/admin/banners`
2. Chọn "Thêm Banner Mới"
3. Upload file hoặc nhập URL
4. Nếu tỉ lệ không đúng → ImageCropper tự động mở
5. Crop và save → Upload lên Cloudinary

### **2. Upload Product Image**
1. Vào `/admin/products/new` hoặc edit product
2. Chọn file trong phần "Hình ảnh"
3. Upload tự động lên Cloudinary
4. URL Cloudinary được lưu vào database

### **3. Test Cloudinary**
1. Vào `/admin/cloudinary`
2. Nhấn "Test Kết Nối" để kiểm tra
3. Upload file test để verify
4. Xem thông tin chi tiết upload

## 📊 API Endpoints

### **POST /api/upload**
Upload file lên Cloudinary
```javascript
const formData = new FormData();
formData.append('file', file);
formData.append('folder', 'gonuts/banners');
formData.append('type', 'banner');

const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
});
```

### **PUT /api/upload**
Upload base64 image (cho cropped images)
```javascript
const response = await fetch('/api/upload', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        imageData: base64String,
        folder: 'gonuts/banners',
        type: 'banner',
        filename: 'cropped_banner'
    })
});
```

## 🔄 Migration từ Base64

### **Trước (Base64)**
```javascript
// Lưu base64 trực tiếp vào database
const reader = new FileReader();
reader.onload = () => {
    setImageUrl(reader.result); // data:image/jpeg;base64,/9j/4AAQ...
};
```

### **Sau (Cloudinary)**
```javascript
// Upload lên Cloudinary, lưu URL
const formData = new FormData();
formData.append('file', file);

const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
});

const result = await response.json();
setImageUrl(result.data.url); // https://res.cloudinary.com/du6no35fj/...
```

## 🎨 ImageCropper Integration

### **Workflow Mới**
1. User upload ảnh không đúng tỉ lệ
2. ImageCropper mở với ảnh gốc
3. User crop ảnh theo tỉ lệ 3:1
4. Cropped image → base64 → Cloudinary
5. Cloudinary URL được trả về và lưu

### **Code Example**
```javascript
// Trong ImageCropper component
finalCanvas.toBlob(async (blob) => {
    const reader = new FileReader();
    reader.onload = async () => {
        const base64Data = reader.result;
        
        const response = await fetch('/api/upload', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                imageData: base64Data,
                folder: 'gonuts/banners',
                type: 'banner'
            })
        });

        const result = await response.json();
        onCrop(result.data.url); // Cloudinary URL
    };
    reader.readAsDataURL(blob);
}, 'image/jpeg', 0.9);
```

## 🌟 Lợi Ích Cloudinary

### **Performance**
- ✅ CDN toàn cầu → Tải ảnh nhanh hơn
- ✅ Tự động tối ưu format (WebP, AVIF)
- ✅ Responsive images với URL parameters
- ✅ Lazy loading support

### **Storage**
- ✅ Không giới hạn dung lượng database
- ✅ Backup tự động trên cloud
- ✅ Version control cho images
- ✅ Metadata tracking

### **Features**
- ✅ Image transformations on-the-fly
- ✅ Auto quality optimization
- ✅ Format conversion
- ✅ Compression algorithms

## 🔧 Troubleshooting

### **Upload Fails**
1. Kiểm tra API keys trong .env.local
2. Verify Cloudinary account limits
3. Check file size (max 10MB)
4. Test connection tại `/admin/cloudinary`

### **Images Not Loading**
1. Verify Cloudinary URLs in database
2. Check network connectivity
3. Confirm public_id format
4. Test direct Cloudinary URL access

### **Cropper Issues**
1. Ensure proper aspect ratio calculation
2. Check canvas rendering
3. Verify base64 conversion
4. Test upload API separately

## 📈 Monitoring & Analytics

### **Cloudinary Dashboard**
- Usage statistics
- Bandwidth monitoring
- Storage analytics
- Transformation metrics

### **Admin Panel**
- Upload success/failure rates
- File size statistics
- Folder organization
- Connection status

## 🎯 Best Practices

### **Image Optimization**
- Use JPEG for photos (smaller size)
- Use PNG for graphics with transparency
- Set quality to 80-90% for balance
- Enable auto format conversion

### **Folder Organization**
- Separate by content type (banners, products)
- Use consistent naming conventions
- Include timestamps in filenames
- Organize by date/category when needed

### **Security**
- Keep API secrets secure
- Use signed URLs for sensitive content
- Implement upload restrictions
- Monitor usage regularly

## 🚀 Deployment Notes

### **Production Environment**
Đảm bảo các environment variables được set trên production:
```
CLOUDINARY_CLOUD_NAME=du6no35fj
CLOUDINARY_API_KEY=473628735676585
CLOUDINARY_API_SECRET=s9qVQxSK45B6jlMxota5v9HMq4c
```

### **Vercel Deployment**
1. Add environment variables trong Vercel dashboard
2. Redeploy application
3. Test upload functionality
4. Verify image loading on production

## 🎉 Hoàn Thành!

Hệ thống Cloudinary đã được tích hợp hoàn toàn:
- ✅ Upload API hoạt động
- ✅ Banner cropper sử dụng Cloudinary
- ✅ Product images upload lên cloud
- ✅ Admin dashboard để quản lý
- ✅ Tối ưu performance và storage

**Tất cả hình ảnh của website bây giờ được quản lý chuyên nghiệp qua Cloudinary!** 🌟