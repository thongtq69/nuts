# Shipping Fee Setup - Vietnam Provinces & Weight

This plan outlines the implementation of a dynamic shipping fee system for the Go Nuts platform, based on Vietnam's provinces and product weight tiers, as requested by the USER.

## Overview
The system will allow the admin to manage shipping zones (Nội tỉnh, Nội miền, Cận miền, Liên miền) and weight-based pricing tiers. The checkout process will automatically calculate the shipping fee based on the total weight of the items in the cart and the user's selected delivery address.

## Project Type
WEB (Next.js App Router)

## Success Criteria
- [ ] Admin can define and manage Shipping Zones.
- [ ] Admin can define weight-based pricing tiers for each zone.
- [ ] Products have a `weight` field (in kg).
- [ ] Shipping fee in checkout is calculated dynamically based on total weight and province.
- [ ] Hardcoded free shipping (> 500k) is removed/modified as per user's request.
- [ ] Prices include VAT as requested.

## Tech Stack
- **Frontend**: Next.js, Tailwind CSS, Lucide Icons.
- **Backend**: Next.js API Routes, MongoDB (Mongoose).
- **Icons**: Lucide React.

## File Structure Changes
- `src/models/ShippingConfig.ts`: New model for shipping zones and rates.
- `src/models/Product.ts`: Add `weight` field.
- `src/app/api/admin/shipping/route.ts`: API for admin to manage shipping.
- `src/app/api/shipping/calculate/route.ts`: API to calculate shipping fee.
- `src/app/admin/shipping/page.tsx`: Admin management UI.
- `src/app/checkout/page.tsx`: Update checkout logic.

## Task Breakdown

### Phase 1: Database & Models (P0)
- [ ] **Task ID: model-shipping**: Create `src/models/ShippingConfig.ts` with schemas for Zones, Tiers, and Province mapping.
  - *Input*: Nhat Tin Logistics logic from user images.
  - *Output*: Mongoose model.
  - *Verify*: Code review of the schema.
- [ ] **Task ID: update-product-model**: Add `weight` field to `src/models/Product.ts`.
  - *Input*: `IProduct` interface.
  - *Output*: Updated `Product.ts`.
  - *Verify*: Check file content for `weight` field.

### Phase 2: Backend APIs (P1)
- [ ] **Task ID: api-admin-shipping**: Implement `GET` and `POST` in `src/app/api/admin/shipping/route.ts`.
  - *Input*: Shipping data from Admin UI.
  - *Output*: CRUD operations for shipping settings.
  - *Verify*: Test with Postman/Thunder Client.
- [ ] **Task ID: api-calc-shipping**: (Optional) or integrated into checkout. Let's make it a client-side calculation first if possible, but server-side is more secure. Actually, checkout already handles it.

### Phase 3: Admin UI (P2)
- [ ] **Task ID: ui-admin-shipping**: Create `src/app/admin/shipping/page.tsx` with a modern, glassmorphism design.
  - *Input*: Mock data based on the user's image.
  - *Output*: Interactive UI to manage zones/tiers.
  - *Verify*: Navigate to `/admin/shipping`.

### Phase 4: Checkout Integration (P3)
- [ ] **Task ID: checkout-logic**: Update `src/app/checkout/page.tsx`.
  - Fetch product weights.
  - Map provinces to zones.
  - Implement the calculation formula.
  - Remove hardcoded free shipping.
  - *Input*: Cart items and selected address.
  - *Output*: Correct `shippingFee` displayed.
  - *Verify*: Manual test with different addresses and weights.

## Phase X: Verification
- [ ] **Lint & Type Check**: `npm run lint`
- [ ] **UX Audit**: Check if the calculation is transparent to the user.
- [ ] **Final Build**: `npm run build`
