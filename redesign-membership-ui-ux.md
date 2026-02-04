# Task: Redesign Membership Plans UI

## 📋 Analysis
The current membership plans UI is functional but lacks a "premium" aesthetic. The user wants a redesign that feels more "Wow" and addresses specific layout issues like vertical hierarchy and feature visibility.

### Current State
- **Layout**: Horizontal scroll with snapping.
- **Card Height**: Fixed at 780px.
- **CTA Position**: In the middle of the card.
- **Features**: Hidden at the bottom or presented with minimal detail.
- **Mascots**: Floating in the header, not integrated.

### Goals
1.  **Premium Aesthetics**: Implement a "Modern Editorial Premium" style.
2.  **Vertical Hierarchy**: Title → Pricing → Features → Mascot Integration → CTA (Action at the bottom).
3.  **Mascot "Crown"**: Integrate mascots into a decorative header that overlaps the card body.
4.  **Full Information**: Expanded feature list with clear icons and descriptive text.
5.  **Dynamic Animations**: Staggered reveals and physical hover feedback.

---

## 🎨 Design Commitment (UI/UX Pro Max)

- **Style**: **Brutalist-Premium Remix**. Using sharp geometric backgrounds contrasted with organic mascot shapes and premium color tokens.
- **Palette**: 
    - **Primary**: #9C7044 (Golden Brown)
    - **Accent**: #E3E846 (Citrus Yellow)
    - **Neutral**: #FFFFFF (White) / #1A1A1A (Deep Tech)
- **Topological Choice**: **Overlapping Layers & Floating Mascots**. Breaking the card into three distinct vertical zones (Header, Info, Action) with the Mascot acting as the bridge.
- **Risk Factor**: Large typography and intentional asymmetric spacing.
- **Cliché Liquidation**: No Bento Grid. No Mesh Gradients. No Purple.
- **Geometry**: Sharp 48px rounded corners for the container, but sharp 2px edges for internal detail badges.

---

## 🛠️ Implementation Plan

### Phase 1: Structure Refactor (`PackageList.tsx`)
1.  **Relocate CTA**: Move the "Đăng ký ngay" button to the bottom of the card, ensuring it is always visible or at the natural end of the value list.
2.  **Refine Header**: Create a new SVG-based "Crown" or "Wave" header that the mascots sit on.
3.  **Expand Features**: Map all `Package` properties (voucher quantity, max discount, etc.) into a cohesive, icon-driven list.

### Phase 2: Information Fill
1.  Update labels to use full, descriptive Vietnamese (e.g., "Mã giảm giá hằng tháng" instead of "Mã giảm").
2.  Add subtext to pricing clarifying the "per day" or "per month" value.

### Phase 3: Visual Polish
1.  **Typography**: Implement `font-black` and `tracking-tighter` for prices to give them "weight."
2.  **Animations**: Add `framer-motion` if available, or use Tailwind `group-hover` transitions for physical depth.
3.  **Shadows**: Use layered box-shadows instead of simple blurs for a "solid" premium feel.

### Phase 4: Testing & Verification
1.  Verify responsiveness at 375px (mobile) and 1440px (desktop).
2.  Confirm all interactions (Terms Modal, CTA) work correctly.

---

## 🏁 Quality Checklist
- [x] No purple/violet colors.
- [x] Hierarchy: Title → Pricing → Action (Bottom).
- [x] All clickable elements have `cursor-pointer`.
- [x] Content is not compressed; ample whitespace used.
- [x] Mascots integrated with "Header Crown".
