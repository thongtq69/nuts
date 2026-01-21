# Task: Redesign Membership Plans UI (Premium & Detailed)

## 📋 Analysis & Goals
User Feedback: "Looking very un-aesthetic (missing aesthetic feel). Fill in full info and arrange layout correctly."

Current Layout Failures:
- Content feels compressed in the middle.
- Voucher details are hidden in a small bottom box.
- The "Mua ngay" button is placed too high, breaking the "Flow" of value.
- The character images look disconnected from the card body.
- Huge empty spaces in some cards while others look cramped.

**New Goals:**
1. **Vertical Hierarchy**: Title → Value Proposition → Character (Visual) → Pricing → Features List → CTA (Action).
2. **Detailed Feature List**: Don't hide the value! Show exactly what the user gets in a clean, vertical list.
3. **Character Integration**: Use character as a "mascot" that interacts with the card's header, not just a floating icon.
4. **Visual Contrast**: High-premium contrast using Brown (#9C7044) and Yellow (#E3E846) with white spacing.
5. **Standardized Cards**: Fixed height with adaptive spacing to ensure all cards look identical regardless of text length.

---

## 🎨 Design Commitment

- **Style**: **Modern Editorial Premium**. Think luxury food magazine meets SaaS pricing.
- **Palette**: **#9C7044 (Golden Brown)**, **#E3E846 (Citrus Yellow)**, **#FFFFFF (Pure White)**.
- **Topological Choice**: **Z-Axis Layering**. Using subtle borders and soft shadows (not blur) to create height.
- **Typography**: Bold Serif/Display for Titles, Clean Sans for data.
- **Character Strategy**: Positioned at the top-center, partially overlapping a "header crown" element to anchor the mascot.

---

## 🛠️ Implementation Plan

### Phase 1: Card Structure Overhaul (`PackageList.tsx`)
- Move "Mua ngay" to the absolute bottom of the card.
- Create a clear "Header" area for the mascot and Title.
- Expand the feature list: Show Discount, Max Discount, Voucher Quantity, and Validity as distinct list items with icons.

### Phase 2: Information Filling
- Use full text for labels (e.g., "Giảm tối đa 50.000đ" instead of "Max 50k").
- Add descriptive sub-labels for each perk.

### Phase 3: Aesthetic Polishing
- Implement "Premium Crown" or "Header Wave" to house the character images.
- Use a 2-column or clean vertical list for vouchers (removing the boxy bottom overlay).

### Phase 4: Page Layout (`page.tsx`)
- Improve the "Hero" text spacing.
- Ensure the "Welcome Voucher" at the bottom feels like a secondary reward, not a competing element.

---

## 🏁 Quality Checklist
- [ ] Mascot doesn't look like it's "just floating".
- [ ] No empty "dead zones" in the card layout.
- [ ] Pricing is the most prominent visual element after the Title.
- [ ] All icons are consistent (Lucide).
- [ ] "Best Value" / "Long Term" labels feel like premium medals.
