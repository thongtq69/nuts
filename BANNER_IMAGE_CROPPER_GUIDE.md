# 🖼️ Banner Image Cropper - Tính Năng Mới

## ✨ Tổng quan

Tính năng **Image Cropper** giống Facebook đã được tích hợp vào hệ thống quản lý banner, cho phép admin dễ dàng chỉnh sửa ảnh về đúng tỉ lệ 3:1 mà không cần phần mềm bên ngoài.

## 🎯 Cách hoạt động

### **🔍 Tự động phát hiện tỉ lệ**
- Khi upload ảnh, hệ thống tự động kiểm tra tỉ lệ
- Nếu tỉ lệ **không phải 3:1** (cho phép sai lệch 10%) → Mở **Image Cropper**
- Nếu tỉ lệ **đúng 3:1** → Sử dụng trực tiếp

### **✂️ Chỉnh sửa thủ công**
- Nút **"Chỉnh sửa"** xuất hiện khi đã có ảnh
- Click để mở Image Cropper bất cứ lúc nào
- Cho phép tinh chỉnh lại vị trí crop

## 🎨 Giao diện Image Cropper

### **📱 Layout chính**
```
┌─────────────────────────────────────────┐
│ 🎨 Header: Chỉnh sửa Banner             │
├─────────────────────────────────────────┤
│ 📋 Hướng dẫn sử dụng                    │
├─────────────────────────────────────────┤
│ 🖼️ Crop Area (600x200px - Tỉ lệ 3:1)   │
│ ┌─────────────────────────────────────┐ │
│ │ [Ảnh với grid overlay]              │ │
│ │ • Kéo thả để di chuyển              │ │
│ │ • Grid 3x3 để căn chỉnh             │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ 🎚️ Zoom Slider: [−] ████████ [+] 100%  │
├─────────────────────────────────────────┤
│ 🔧 Quick Actions: Thu nhỏ | Đặt lại | Phóng to │
├─────────────────────────────────────────┤
│ 💡 Hướng dẫn chi tiết                   │
├─────────────────────────────────────────┤
│ [Hủy] [Áp dụng & Lưu]                  │
└─────────────────────────────────────────┘
```

### **🎨 Màu sắc và thiết kế**
- **Header**: Gradient xanh (`from-blue-500 to-blue-600`)
- **Crop Area**: Border dashed xám với background xám nhạt
- **Grid**: Overlay trắng trong suốt (hiện khi hover)
- **Slider**: Xanh với thumb tròn có shadow
- **Buttons**: Gradient xanh cho primary, xám cho secondary

## 🛠️ Tính năng chính

### **1. 🎯 Drag & Drop**
```typescript
// Kéo thả để di chuyển ảnh
const handleMouseMove = (e: React.MouseEvent) => {
  if (!isDragging) return;
  
  const newX = e.clientX - dragStart.x;
  const newY = e.clientY - dragStart.y;
  
  // Giới hạn di chuyển trong crop area
  const clampedX = Math.max(-maxX, Math.min(maxX, newX));
  const clampedY = Math.max(-maxY, Math.min(maxY, newY));
  
  setPosition({ x: clampedX, y: clampedY });
};
```

### **2. 🔍 Zoom Control**
- **Slider**: Từ 10% đến 300%
- **Quick buttons**: Thu nhỏ (-20%), Phóng to (+20%)
- **Real-time preview**: Cập nhật ngay lập tức

### **3. 📐 Smart Constraints**
- **Giới hạn di chuyển**: Ảnh không thể ra khỏi crop area
- **Auto-fit**: Tự động scale để fit ảnh vào khung
- **Aspect ratio lock**: Luôn giữ tỉ lệ 3:1

### **4. 🎨 Visual Feedback**
- **Grid overlay**: Hiện khi hover để căn chỉnh
- **Cursor states**: `grab` → `grabbing` khi drag
- **Tỉ lệ indicator**: Badge "Tỉ lệ 3:1" ở góc phải
- **Zoom percentage**: Hiển thị % zoom hiện tại

## 🔧 Tính năng kỹ thuật

### **📊 Canvas Rendering**
```typescript
const drawImage = useCallback(() => {
  const canvas = canvasRef.current;
  const img = imageRef.current;
  
  // Tính toán vị trí và kích thước
  const scaledWidth = imageDimensions.width * scale;
  const scaledHeight = imageDimensions.height * scale;
  
  const x = (cropArea.width - scaledWidth) / 2 + position.x;
  const y = (cropArea.height - scaledHeight) / 2 + position.y;

  // Vẽ ảnh lên canvas
  ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
}, [scale, position, imageDimensions]);
```

### **🎯 Export chất lượng cao**
```typescript
const handleCropImage = () => {
  // Tạo canvas cuối cùng với kích thước 2000x667
  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = 2000;
  finalCanvas.height = 667;
  
  // Copy và scale từ preview canvas
  finalCtx.drawImage(canvas, 0, 0, 600, 200, 0, 0, 2000, 667);
  
  // Export JPEG chất lượng 90%
  finalCanvas.toBlob(callback, 'image/jpeg', 0.9);
};
```

### **📱 Responsive Design**
- **Desktop**: Full-size cropper (600x200px preview)
- **Mobile**: Tự động scale xuống phù hợp
- **Touch support**: Hoạt động tốt trên thiết bị cảm ứng

## 🎮 Cách sử dụng

### **📤 Upload ảnh mới**
1. Click **"Chọn ảnh từ thiết bị"**
2. Chọn file ảnh từ máy tính
3. **Nếu tỉ lệ sai** → Image Cropper tự động mở
4. **Nếu tỉ lệ đúng** → Sử dụng trực tiếp

### **✂️ Chỉnh sửa ảnh có sẵn**
1. Click nút **"Chỉnh sửa"** (icon ✂️)
2. Image Cropper mở với ảnh hiện tại
3. Điều chỉnh vị trí và zoom
4. Click **"Áp dụng & Lưu"**

### **🎯 Trong Image Cropper**
1. **Kéo thả**: Di chuyển ảnh trong khung
2. **Zoom slider**: Phóng to/thu nhỏ ảnh
3. **Quick actions**: Thu nhỏ, Đặt lại, Phóng to
4. **Grid**: Sử dụng để căn chỉnh chính xác
5. **Áp dụng**: Lưu ảnh đã crop

## 🎨 Hiệu ứng và Animation

### **✨ Smooth Transitions**
```css
.slider {
  transition: all 0.2s ease;
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.cropper-grid {
  opacity: 0;
  transition: opacity 0.3s ease;
}
```

### **🎭 Interactive States**
- **Hover effects**: Grid hiện, thumb scale
- **Drag states**: Cursor thay đổi
- **Loading states**: Disable buttons khi chưa load xong

## 📊 Thông số kỹ thuật

### **🎯 Crop Area**
- **Preview size**: 600x200px (tỉ lệ 3:1)
- **Final output**: 2000x667px (chất lượng cao)
- **Aspect ratio**: 3:1 (cố định)

### **🔍 Zoom Range**
- **Minimum**: 10% (0.1x)
- **Maximum**: 300% (3.0x)
- **Step**: 10% (0.1x)
- **Default**: Auto-fit để ảnh vừa khung

### **📁 File Support**
- **Formats**: JPG, PNG, WebP, GIF
- **Max size**: Không giới hạn (browser limit)
- **Output**: JPEG 90% quality

## 🎯 Lợi ích

### ✅ **Cho Admin**
- **Không cần phần mềm**: Crop trực tiếp trên web
- **Chính xác**: Luôn đúng tỉ lệ 3:1
- **Dễ sử dụng**: Giao diện trực quan như Facebook
- **Chất lượng cao**: Output 2000x667px

### ✅ **Cho Hệ thống**
- **Tự động**: Phát hiện và xử lý tỉ lệ sai
- **Nhất quán**: Tất cả banner cùng tỉ lệ
- **Tối ưu**: Không cần lưu ảnh gốc
- **Responsive**: Hiển thị tốt mọi thiết bị

## 🔄 Workflow hoàn chỉnh

```
📤 Upload ảnh
    ↓
🔍 Kiểm tra tỉ lệ
    ↓
❓ Tỉ lệ đúng 3:1?
    ├─ ✅ Có → Sử dụng trực tiếp
    └─ ❌ Không → Mở Image Cropper
                    ↓
                🎨 Điều chỉnh vị trí & zoom
                    ↓
                💾 Áp dụng & Lưu
                    ↓
                🎯 Ảnh đã crop (2000x667px)
```

## 🎉 Kết luận

Tính năng **Banner Image Cropper** cung cấp:
- 🎨 **Trải nghiệm như Facebook**: Quen thuộc và dễ sử dụng
- ⚡ **Tự động thông minh**: Phát hiện và xử lý tỉ lệ
- 🎯 **Chính xác tuyệt đối**: Luôn đúng tỉ lệ 3:1
- 📱 **Responsive hoàn hảo**: Hoạt động mọi thiết bị

**Admin giờ đây có thể dễ dàng tạo banner chuyên nghiệp mà không cần bất kỳ phần mềm nào khác!** 🚀