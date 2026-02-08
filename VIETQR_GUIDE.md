# Hướng Dẫn Tích Hợp VietQR Tự Động Điền Nội Dung Chuyển Khoản

## 📱 Cách Hoạt Động

Khi khách hàng chọn thanh toán bằng chuyển khoản ngân hàng, hệ thống sẽ tạo một **mã QR động** chứa đầy đủ thông tin:

1. **Số tài khoản**: ACB 621588
2. **Số tiền**: Tổng đơn hàng
3. **Nội dung chuyển khoản**: `GOXXXXXX` + `Tên khách hàng`

## 🔧 Kỹ Thuật

### API VietQR.io

Hệ thống sử dụng API của VietQR.io để tạo mã QR động:

```
https://img.vietqr.io/image/{bankBin}-{accountNumber}-{template}.png?amount={amount}&addInfo={description}&accountName={accountName}
```

Ví dụ:
```
https://img.vietqr.io/image/ACB-621588-compact.png?amount=500000&addInfo=GO123456%20NGUYEN%20VAN%20A&accountName=CÔNG%20TY%20TNHH%20GO%20NUTS%20VIỆT%20NAM
```

### Các Tham Số

| Tham số | Mô tả | Ví dụ |
|---------|-------|-------|
| `bankBin` | Mã BIN ngân hàng | `ACB`, `VCB`, `TCB`... |
| `accountNumber` | Số tài khoản | `621588` |
| `amount` | Số tiền (VNĐ) | `500000` |
| `addInfo` | Nội dung chuyển khoản | `GO123456 NGUYEN VAN A` |
| `accountName` | Tên chủ tài khoản | `CÔNG TY TNHH GO NUTS` |

## 📲 Trải Nghiệm NgườI Dùng

### Bước 1: Khách hàng chọn thanh toán
```
✅ Chuyển khoản ngân hàng
```

### Bước 2: Mã QR được tạo với thông tin đầy đủ
```
┌─────────────────────────────┐
│                             │
│    [MÃ QR VIETQR]          │
│                             │
│  ┌─────────────────────┐   │
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │   │
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │   │
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │   │
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │   │
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │   │
│  └─────────────────────┘   │
│                             │
│   👆 Quét mã để tự điền    │
│                             │
└─────────────────────────────┘
```

### Bước 3: Khách hàng quét mã QR
- Mở app ngân hàng (ACB, Vietcombank, Techcombank...)
- Chọn chức năng quét QR
- **Tự động điền**: Số tiền + Nội dung CK
- Khách hàng chỉ cần xác nhận chuyển khoản

## 📝 Format Nội Dung Chuyển Khoản

```
GO{6 số cuối timestamp} {Tên khách hàng}
```

Ví dụ:
- Mã đơn: `GO123456`
- Tên KH: `Nguyễn Văn A`
- Nội dung: `GO123456 A`

## 🔒 Xác Thực Thanh Toán

Hệ thống sử dụng webhook từ ACB để tự động xác nhận thanh toán:

```typescript
// API Endpoint: /api/payment/acb/callback
// Tìm đơn hàng theo PaymentRef trong note
const order = await Order.findOne({
    note: { $regex: `\\[PaymentRef: GO${orderIdPart}\\]` }
});
```

## 🎨 UI Components

### BankInfoDisplay Props

```typescript
interface BankInfoProps {
    bankName?: string;        // Tên ngân hàng
    accountNumber?: string;   // Số tài khoản
    accountName?: string;     // Chủ tài khoản
    amount?: number;          // Số tiền
    description?: string;     // Mã đơn hàng (GOXXXXXX)
    customerName?: string;    // Tên khách hàng
    compact?: boolean;        // Chế độ hiển thị compact
}
```

### Ví dụ Sử Dụng

```tsx
<BankInfoDisplay
    amount={500000}
    description="GO123456"
    customerName="Nguyễn Văn A"
/>
```

## 📋 Danh Sách Ngân Hàng Hỗ Trợ

Hầu hết các ngân hàng tại Việt Nam đều hỗ trợ quét mã VietQR:

| Ngân hàng | Mã BIN | Hỗ trợ QR |
|-----------|--------|-----------|
| ACB | ACB | ✅ |
| Vietcombank | VCB | ✅ |
| Techcombank | TCB | ✅ |
| MB Bank | MBB | ✅ |
| Sacombank | STB | ✅ |
| VPBank | VPB | ✅ |
| TPBank | TPB | ✅ |
| ... | ... | ✅ |

## ⚠️ Lưu Ý

1. **Giới hạn ký tự**: Nội dung chuyển khoản được giới hạn 50 ký tự
2. **Tên khách hàng**: Chỉ lấy tên cuối cùng để tối ưu độ dài
3. **Kiểm tra**: Luôn hiển thị số tiền và nội dung rõ ràng bên cạnh mã QR
4. **Backup**: Cung cấp nút sao chép thông tin thủ công nếu quét QR lỗi

## 🚀 Cải Tiến Tương Lai

- [ ] Tích hợp nhiều ngân hàng (tạo selector chọn ngân hàng)
- [ ] Thêm tính năng "Đã chuyển khoản" với upload biên lai
- [ ] Tự động gửi email xác nhận sau khi webhook nhận được tiền
- [ ] Thêm QR code cho VNPay, Momo, ZaloPay
