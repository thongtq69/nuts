# ✅ Image Cropper - Checklist Kiểm Tra

## 🎯 Tính năng cần test

### **📤 Upload & Auto-detect**
- [ ] **Upload ảnh đúng tỉ lệ 3:1** → Sử dụng trực tiếp (không mở cropper)
- [ ] **Upload ảnh sai tỉ lệ** → Tự động mở ImageCropper
- [ ] **Nút "Chỉnh sửa"** → Mở cropper với ảnh hiện tại

### **🎨 Giao diện ImageCropper**
- [ ] **Modal hiển thị đúng** → Full-screen với header gradient xanh
- [ ] **Crop area** → 600x200px với border dashed
- [ ] **Grid overlay** → Hiện khi hover, 3x3 grid
- [ ] **Tỉ lệ indicator** → Badge "Tỉ lệ 3:1" ở góc phải

### **🎮 Tương tác cơ bản**
- [ ] **Drag & Drop** → Kéo thả ảnh trong crop area
- [ ] **Cursor states** → `grab` → `grabbing` khi drag
- [ ] **Zoom slider** → Từ 10% đến 300%, hiển thị %
- [ ] **Quick buttons** → Thu nhỏ, Đặt lại, Phóng to

### **🔧 Tính năng nâng cao**
- [ ] **Smart constraints** → Ảnh không ra khỏi crop area
- [ ] **Auto-fit** → Ảnh tự động fit vào khung khi load
- [ ] **Real-time preview** → Cập nhật ngay khi thay đổi
- [ ] **Reset function** → Về vị trí ban đầu

### **💾 Export & Save**
- [ ] **Crop & Export** → Tạo ảnh 2000x667px chất lượng cao
- [ ] **Apply & Save** → Cập nhật ảnh trong form
- [ ] **Cancel** → Đóng cropper không lưu thay đổi

### **📱 Responsive**
- [ ] **Desktop** → Layout đầy đủ, tất cả tính năng
- [ ] **Tablet** → Responsive tốt, touch-friendly
- [ ] **Mobile** → Hoạt động mượt mà trên điện thoại

## 🐛 Các lỗi có thể gặp

### **⚠️ Lỗi thường gặp**
1. **Canvas không hiển thị** → Kiểm tra imageRef và canvasRef
2. **Drag không hoạt động** → Kiểm tra mouse events
3. **Zoom không smooth** → Kiểm tra slider range và step
4. **Export lỗi** → Kiểm tra canvas.toBlob()
5. **Ảnh bị méo** → Kiểm tra aspect ratio calculations

### **🔍 Debug steps**
```javascript
// 1. Kiểm tra image load
console.log('Image loaded:', imageLoaded);
console.log('Image dimensions:', imageDimensions);

// 2. Kiểm tra canvas
console.log('Canvas ref:', canvasRef.current);
console.log('Canvas context:', canvasRef.current?.getContext('2d'));

// 3. Kiểm tra scale và position
console.log('Scale:', scale);
console.log('Position:', position);

// 4. Kiểm tra crop area
console.log('Crop area:', cropArea);
```

## 🎯 Test Cases cụ thể

### **Test Case 1: Upload ảnh vuông (1:1)**
```
Input: Ảnh 1000x1000px
Expected: Tự động mở ImageCropper
Result: [ ] Pass / [ ] Fail
```

### **Test Case 2: Upload ảnh dọc (1:2)**
```
Input: Ảnh 500x1000px  
Expected: Tự động mở ImageCropper
Result: [ ] Pass / [ ] Fail
```

### **Test Case 3: Upload ảnh đúng tỉ lệ (3:1)**
```
Input: Ảnh 1500x500px
Expected: Sử dụng trực tiếp, không mở cropper
Result: [ ] Pass / [ ] Fail
```

### **Test Case 4: Drag ảnh lớn**
```
Input: Ảnh 3000x1000px, zoom 150%
Action: Kéo thả ảnh
Expected: Di chuyển smooth, không ra khỏi crop area
Result: [ ] Pass / [ ] Fail
```

### **Test Case 5: Zoom extreme**
```
Input: Ảnh nhỏ 300x100px
Action: Zoom 300%
Expected: Ảnh phóng to, vẫn giữ chất lượng
Result: [ ] Pass / [ ] Fail
```

### **Test Case 6: Export chất lượng**
```
Input: Bất kỳ ảnh nào
Action: Crop và export
Expected: File JPEG 2000x667px, chất lượng 90%
Result: [ ] Pass / [ ] Fail
```

## 🚀 Performance Tests

### **⚡ Tốc độ**
- [ ] **Load ảnh** → < 1s cho ảnh 5MB
- [ ] **Drag response** → < 16ms (60fps)
- [ ] **Zoom smooth** → Không lag khi zoom
- [ ] **Export speed** → < 2s cho ảnh lớn

### **💾 Memory**
- [ ] **Memory leak** → Không tăng RAM khi dùng lâu
- [ ] **Canvas cleanup** → Giải phóng memory khi đóng
- [ ] **Image cleanup** → Revoke object URLs

## 🎨 UI/UX Tests

### **👀 Visual**
- [ ] **Colors** → Đúng brand colors (xanh gradient)
- [ ] **Typography** → Font size, weight phù hợp
- [ ] **Spacing** → Padding, margin đều đặn
- [ ] **Shadows** → Depth và hierarchy rõ ràng

### **🎭 Animations**
- [ ] **Modal entrance** → Fade in + slide in smooth
- [ ] **Hover effects** → Grid overlay, button hover
- [ ] **Slider thumb** → Scale on hover
- [ ] **Button states** → Active, disabled states

### **📱 Accessibility**
- [ ] **Keyboard navigation** → Tab through controls
- [ ] **Screen reader** → Alt texts, labels
- [ ] **Focus indicators** → Visible focus states
- [ ] **Color contrast** → WCAG compliant

## 🔧 Browser Compatibility

### **🌐 Desktop Browsers**
- [ ] **Chrome** → Latest version
- [ ] **Firefox** → Latest version  
- [ ] **Safari** → Latest version
- [ ] **Edge** → Latest version

### **📱 Mobile Browsers**
- [ ] **Chrome Mobile** → Android
- [ ] **Safari Mobile** → iOS
- [ ] **Samsung Internet** → Android
- [ ] **Firefox Mobile** → Android/iOS

## 📊 Final Checklist

### **✅ Must Have (Critical)**
- [ ] Upload detection hoạt động
- [ ] Drag & drop smooth
- [ ] Zoom slider responsive
- [ ] Export đúng kích thước (2000x667px)
- [ ] Cancel/Apply buttons hoạt động

### **🎯 Should Have (Important)**
- [ ] Grid overlay hiển thị
- [ ] Smart constraints
- [ ] Auto-fit khi load
- [ ] Responsive mobile

### **✨ Nice to Have (Enhancement)**
- [ ] Smooth animations
- [ ] Keyboard shortcuts
- [ ] Touch gestures
- [ ] Performance optimizations

## 🎉 Sign-off

**Tested by:** _______________  
**Date:** _______________  
**Status:** [ ] ✅ Passed / [ ] ❌ Failed / [ ] ⚠️ Needs fixes  
**Notes:** _______________

---

**🚀 Ready for Production:** [ ] Yes / [ ] No