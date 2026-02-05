# Plan: Redesign About Us, Policy & Q&A System

This plan outlines the implementation of a dynamic management system for the "About Us" page, "Policy" pages, and "Q&A" (FAQ) sections, allowing Admin to edit all content via the administration dashboard.

## 1. Database Schema
- **FAQ Model (`src/models/FAQ.ts`)**: 
    - Fields: `question`, `answer`, `category` (general, membership, about, etc.), `order`, `isActive`.
- **PageContent Model (`src/models/PageContent.ts`)**:
    - Fields: `slug` (unique identifier), `title`, `content` (HTML/RichText), `metadata`.
    - Used for: `about-us`, `return-policy`, `privacy-policy`, `terms-of-service`, `shipping-policy`.

## 2. API Endpoints
- **FAQ API**:
    - `GET /api/faqs`: Fetch FAQs (with optional category filtering).
    - `POST /api/admin/faqs`: Create new FAQ (Admin only).
    - `PUT /api/admin/faqs/:id`: Update FAQ (Admin only).
    - `DELETE /api/admin/faqs/:id`: Delete FAQ (Admin only).
- **PageContent API**:
    - `GET /api/page-content/:slug`: Fetch content for a specific page.
    - `PUT /api/admin/page-content/:slug`: Update page content (Admin only).

## 3. Admin Dashboard Updates
- **Sidebar**: Add "Câu hỏi thường gặp" and "Trang nội dung" to Content section.
- **FAQ Management**: CRUD interface for FAQs with category assignment.
- **Page Editor**: A rich-text editor interface for managing About Us and all Policy pages.

## 4. Frontend Redesign (UI/UX)
- **About Us Page**: 
    - Premium storytelling layout with high-quality images.
    - Integrated FAQ section at the bottom (filtered for 'about' category).
- **Policy Pages**: 
    - Side navigation for switching between policies.
    - Clean, readable typography for legal content.
- **Shared FAQ Component**:
    - Modern accordion style with smooth transitions.
    - Category-specific filtering for use in Membership (Subscription) and About pages.
    - A dedicated "Top Q&A" section on the About page.

## 5. Implementation Steps
1. [x] Create Mongoose Models (`FAQ.ts`, `PageContent.ts`).
2. [ ] Implement API routes for FAQs and PageContent.
3. [ ] Register new menu items in Admin Sidebar.
4. [ ] Build Admin Management pages for FAQs and Page Content.
5. [ ] Refactor About Us page to fetch data from API.
6. [ ] Refactor Policy pages to fetch data from API.
7. [ ] Create and integrate dynamic FAQ Section component.
