# Test Scenarios - Agent Pricing & Bulk Discounts

## Test Case 1: Normal User - No Agent Discount, No Bulk Discount
**Mục tiêu:** Xác minh khách hàng thường trả giá gốc

### Steps:
1. Đăng nhập với tài khoản có `role: 'user'`
2. Thêm sản phẩm vào giỏ hàng (giá: 100.000đ)
3. Kiểm tra giá trong giỏ = 100.000đ
4. Đặt hàng
5. Backend kiểm tra:
   - `items[].price` = 100.000đ
   - `isAgentOrder` = false
   - `originalTotalAmount` = 100.000đ
   - `agentSavings` = 0

### Expected Result:
- Giá hiển thị: 100.000đ
- Không có tiết kiệm
- Order total = 100.000đ

---

## Test Case 2: Agent User - Agent Discount Only
**Mục tiêu:** Xác minh đại lý được giảm giá khi mua số lượng 1

### Preconditions:
- User có `role: 'sale'`
- Cài đặt: `agentDiscountEnabled = true`, `agentDiscountPercent = 10`
- Sản phẩm: giá 100.000đ, không có bulk pricing

### Steps:
1. Đăng nhập với tài khoản đại lý
2. Thêm sản phẩm vào giỏ hàng (quantity = 1)
3. Kiểm tra giá trong giỏ:
   - Giá gốc: 100.000đ (gạch ngang)
   - Giá đại lý: 90.000đ (10% giảm)
   - Tiết kiệm: 10.000đ
4. Đặt hàng
5. Backend kiểm tra:
   - `items[].price` = 90.000đ
   - `items[].isAgent` = true
   - `isAgentOrder` = true
   - `originalTotalAmount` = 100.000đ
   - `agentSavings` = 10.000đ

### Expected Result:
- Giá hiển thị: 90.000đ
- Tiết kiệm: 10.000đ
- Order total = 90.000đ

---

## Test Case 3: Agent User - Bulk Discount Only
**Mục tiêu:** Xác minh giảm giá số lượng cho khách thường

### Preconditions:
- User có `role: 'user'`
- Cài đặt: `bulkDiscountEnabled = true`, `agentDiscountEnabled = false`
- Sản phẩm: giá 100.000đ, bulk pricing:
  - minQuantity: 5, discountPercent: 10
  - minQuantity: 10, discountPercent: 15

### Steps:
1. Đăng nhập với tài khoản thường
2. Thêm sản phẩm vào giỏ hàng (quantity = 5)
3. Kiểm tra giá trong giỏ:
   - Giá mỗi sản phẩm: 90.000đ (10% giảm)
   - Tổng: 450.000đ
4. Thêm 5 sản phẩm nữa (quantity = 10)
5. Kiểm tra giá:
   - Giá mỗi sản phẩm: 85.000đ (15% giảm)
   - Tổng: 850.000đ
6. Đặt hàng

### Expected Result:
- Quantity 5: Total = 450.000đ (10% off)
- Quantity 10: Total = 850.000đ (15% off)

---

## Test Case 4: Agent User - Combined Agent + Bulk Discount
**Mục tiêu:** Xác minh đại lý được cả giảm giá cá nhân VÀ giảm giá số lượng

### Preconditions:
- User có `role: 'sale'`
- Cài đặt: `agentDiscountEnabled = true`, `agentDiscountPercent = 10`, `bulkDiscountEnabled = true`
- Sản phẩm: giá 100.000đ, bulk pricing:
  - minQuantity: 5, discountPercent: 5
  - minQuantity: 10, discountPercent: 10

### Calculation Logic:
- Base price: 100.000đ
- Agent discount (10%): 90.000đ
- Bulk discount on agent price:
  - 5 items: 90.000đ × 0.95 = 85.500đ/each
  - 10 items: 90.000đ × 0.90 = 81.000đ/each

### Steps:
1. Đăng nhập với tài khoản đại lý
2. Thêm sản phẩm (quantity = 5)
   - Giá mỗi sản phẩm: 85.500đ
   - Tổng: 427.500đ
3. Thêm 5 sản phẩm nữa (quantity = 10)
   - Giá mỗi sản phẩm: 81.000đ
   - Tổng: 810.000đ
4. Đặt hàng

### Expected Result:
- Quantity 5: Total = 427.500đ
- Quantity 10: Total = 810.000đ
- Tiết kiệm hiển thị so với giá gốc: 190.000đ (10 items)

---

## Test Case 5: Agent Discount Disabled
**Mục tiêu:** Xác minh đại lý trả giá gốc khi tắt agent discount

### Preconditions:
- User có `role: 'sale'`
- Cài đặt: `agentDiscountEnabled = false`, `bulkDiscountEnabled = true`
- Sản phẩm: giá 100.000đ, bulk pricing: minQuantity: 5, discountPercent: 10

### Steps:
1. Đăng nhập với tài khoản đại lý
2. Thêm sản phẩm (quantity = 5)
   - Giá mỗi sản phẩm: 90.000đ (chỉ bulk discount)
3. Đặt hàng

### Expected Result:
- Quantity 5: Total = 450.000đ (chỉ bulk discount, không có agent discount)

---

## Test Case 6: Bulk Discount Disabled
**Mục tiêu:** Xác minh không có giảm giá số lượng khi tắt bulk discount

### Preconditions:
- User có `role: 'user'`
- Cài đặt: `bulkDiscountEnabled = false`, `agentDiscountEnabled = true`
- Sản phẩm: giá 100.000đ, có bulk pricing
- Đại lý với agentDiscountPercent = 10

### Steps:
1. Đăng nhập với tài khoản đại lý
2. Thêm sản phẩm (quantity = 10)
   - Giá: 90.000đ (chỉ agent discount)
3. Đặt hàng

### Expected Result:
- Quantity 10: Total = 900.000đ (chỉ agent discount, không có bulk discount)

---

## Test Case 7: Multiple Products with Different Bulk Pricing
**Mục tiêu:** Xác minh tính toán đúng khi có nhiều sản phẩm khác nhau

### Preconditions:
- User có `role: 'sale'`
- Cài đặt: `agentDiscountEnabled = true`, `agentDiscountPercent = 10`, `bulkDiscountEnabled = true`
- Product A: giá 100.000đ, bulk: minQuantity 5, discountPercent 10
- Product B: giá 200.000đ, bulk: minQuantity 3, discountPercent 15

### Steps:
1. Thêm 3 Product A (chưa đủ bulk)
   - Giá: 90.000đ × 3 = 270.000đ
2. Thêm 2 Product A nữa (tổng 5)
   - Giá: 81.000đ × 5 = 405.000đ
3. Thêm 2 Product B (đủ bulk 3)
   - Giá: 153.000đ × 2 = 306.000đ
4. Tổng giỏ hàng: 405.000đ + 306.000đ = 711.000đ
5. Đặt hàng

### Expected Result:
- Total = 711.000đ

---

## Test Case 8: Backend Price Validation
**Mục tiêu:** Xác minh backend tính giá chính xác như frontend

### Steps:
1. Tạo đơn hàng với các scenarios khác nhau
2. Backend fetch product data và tính lại giá
3. So sánh `items[].price` từ frontend với giá tính được
4. Nếu khác nhau, backend dùng giá tính được

### Expected Result:
- Backend luôn tính giá chính xác dù frontend gửi sai

---

## Test Case 9: Order with Voucher + Agent Discount
**Mục tiêu:** Xác minh voucher được áp dụng sau agent/bulk discount

### Preconditions:
- User có `role: 'sale'`
- Cài đặt: agent discount 10%, bulk discount enabled
- Sản phẩm: giá 100.000đ, quantity = 2
- Voucher: giảm 20.000đ

### Calculation:
- Giá gốc: 100.000đ × 2 = 200.000đ
- Agent discount (10%): 180.000đ
- Voucher (-20.000đ): 160.000đ
- Shipping: 0đ (trên 500.000đ)
- Total: 160.000đ

### Expected Result:
- Total = 160.000đ

---

## Test Case 10: Zero Quantity Items
**Mục tiêu:** Xác minh không thể thêm sản phẩm với số lượng 0

### Steps:
1. Thử update quantity về 0
2. Kiểm tra giá trị tối thiểu là 1

### Expected Result:
- Quantity không thể nhỏ hơn 1

---

## Summary of Changes

### Files Modified:
1. **Product Model** (`src/models/Product.ts`)
   - Thêm `agentPrice`
   - Thêm `bulkPricing` array với `minQuantity` và `discountPercent`

2. **AffiliateSettings Model** (`src/models/AffiliateSettings.ts`)
   - Thêm `agentDiscountEnabled`
   - Thêm `agentDiscountPercent`
   - Thêm `bulkDiscountEnabled`

3. **Order Model** (`src/models/Order.ts`)
   - Thêm `originalTotalAmount`
   - Thêm `agentSavings`
   - Thêm `isAgentOrder`
   - Thêm `originalPrice` và `isAgent` trong items

4. **CartContext** (`src/context/CartContext.tsx`)
   - Tính giá dựa trên role và số lượng
   - Thêm `originalTotal`, `savingsTotal`
   - Thêm `getItemPrice()`

5. **Order API** (`src/api/orders/route.ts`)
   - Recalculate giá từ backend
   - Áp dụng agent và bulk discounts

6. **Admin Settings Page** (`src/app/admin/affiliate-settings/page.tsx`)
   - UI mới với 3 tabs: Commission, Agent, Bulk

### Frontend Pages Updated:
- Cart page: Hiển thị giá gốc (gạch ngang) và giá đã giảm
- Checkout page: Hiển thị savings
- Admin page: Cấu hình discounts
