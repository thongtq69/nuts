# Admin UI Components - Hướng dẫn sử dụng

## 📋 Tổng quan

Danh sách các component UI đã được tạo để cải thiện trải nghiệm Admin Panel của GoNuts.

## 🎨 Component đã hoàn thành

### 1. **ConfirmModal** - Modal xác nhận
Thay thế `window.confirm()` bằng modal tùy chỉnh.

**Location**: `/src/components/admin/ui/ConfirmModal.tsx`

**Cách sử dụng**:
```tsx
import { ConfirmModal } from '@/components/admin/ui/ConfirmModal';

function MyComponent() {
    const [showModal, setShowModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        await deleteItem();
        setIsDeleting(false);
        setShowModal(false);
    };

    return (
        <ConfirmModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onConfirm={handleDelete}
            title="Xác nhận xóa"
            message="Bạn có chắc chắn muốn xóa mục này? Hành động này không thể hoàn tác."
            confirmText="Xóa"
            cancelText="Hủy"
            variant="danger"
            isLoading={isDeleting}
        />
    );
}
```

**Variants**:
- `danger` (mặc định): Dành cho các hành động phá hủy (xóa, hủy bỏ)
- `warning`: Dành cho các cảnh báo
- `info`: Dành cho thông tin chung

---

### 2. **AlertDialog** - Modal thông báo
Hiển thị thông báo quan trọng với icon và màu theo loại.

**Location**: `/src/components/admin/ui/AlertDialog.tsx`

**Cách sử dụng**:
```tsx
import { AlertDialog } from '@/components/admin/ui/AlertDialog';

function MyComponent() {
    const [showAlert, setShowAlert] = useState(false);

    return (
        <AlertDialog
            isOpen={showAlert}
            onClose={() => setShowAlert(false)}
            title="Cảnh báo"
            message="Số lượng sản phẩm đang thấp!"
            type="warning"
            actionText="Kiểm tra kho"
            onAction={() => { /* handle action */ }}
        />
    );
}
```

**Types**:
- `info` (mặc định): Thông tin chung
- `warning`: Cảnh báo
- `success`: Thành công
- `error`: Lỗi

---

### 3. **Pagination** - Phân trang
Component phân trang hoàn chỉnh với tất cả tính năng cần thiết.

**Location**: `/src/components/admin/ui/Pagination.tsx`

**Cách sử dụng**:
```tsx
import { Pagination } from '@/components/admin/ui/Pagination';

function OrdersList() {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);
    const totalRecords = 1234;
    const totalPages = Math.ceil(totalRecords / pageSize);

    return (
        <>
            <div>
                {/* Render data based on currentPage and pageSize */}
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalRecords={totalRecords}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                pageSizeOptions={[10, 25, 50, 100]}
                showPageSizeSelector={true}
                showTotalRecords={true}
                isLoading={false}
            />
        </>
    );
}
```

**Tính năng**:
- Hiển thị trang hiện tại/tổng số trang
- Next/Previous buttons
- First/Last page buttons
- Jump to page trực tiếp
- Page size selector (10, 25, 50, 100)
- Hiển thị số bản ghi (x-y của z)
- Loading state

---

### 4. **SearchInput** - Search với Debounce
Input tìm kiếm với debouncing để giảm requests.

**Location**: `/src/components/admin/ui/SearchInput.tsx`

**Cách sử dụng**:
```tsx
import { SearchInput, AdvancedSearch } from '@/components/admin/ui/SearchInput';

function ProductsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [advancedFilters, setAdvancedFilters] = useState({
        name: '',
        category: '',
        inStock: false,
    });

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        // API call sẽ được debounced
    };

    const handleFilterChange = (key: string, value: string | boolean) => {
        setAdvancedFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="space-y-4">
            {/* Basic Search */}
            <SearchInput
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Tìm kiếm sản phẩm..."
                debounceMs={300}
                isLoading={false}
                onClear={() => setSearchQuery('')}
            />

            {/* Advanced Search */}
            <AdvancedSearch
                filters={advancedFilters}
                onFilterChange={handleFilterChange}
                onReset={() => setAdvancedFilters({})}
            />
        </div>
    );
}
```

**Tính năng**:
- Debounce (mặc định 300ms)
- Loading state với spinner
- Clear button
- Icon search
- Disabled state
- AutoFocus option
- Xử lý phím Escape

---

### 5. **DateRangePicker** - Chọn ngày
Component chọn khoảng ngày với presets.

**Location**: `/src/components/admin/ui/DateRangePicker.tsx`

**Cách sử dụng**:
```tsx
import { useState } from 'react';
import { DateRangePicker } from '@/components/admin/ui/DateRangePicker';

function OrdersPage() {
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [dateRange, setDateRange] = useState({
        startDate: null,
        endDate: null,
    });

    const handleDateRangeChange = (range) => {
        setDateRange(range);
        // Filter orders by date range
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                className="px-4 py-2 bg-white border border-slate-300 rounded-lg"
            >
                {dateRange.startDate || dateRange.endDate
                    ? `${dateRange.startDate?.toLocaleDateString('vi-VN')} - ${dateRange.endDate?.toLocaleDateString('vi-VN')}`
                    : 'Chọn ngày'}
            </button>

            <DateRangePicker
                isOpen={isDatePickerOpen}
                value={dateRange}
                onChange={handleDateRangeChange}
                onClose={() => setIsDatePickerOpen(false)}
                position="right"
            />
        </div>
    );
}
```

**Presets có sẵn**:
- Hôm nay
- Hôm qua
- 7 ngày qua
- 30 ngày qua
- Tháng này
- Tháng trước
- Năm nay

**Tính năng**:
- Calendar view với Vietnamese locale
- Start/End date selection
- Quick presets
- Reset button
- Hiển thị ngày đã chọn

---

### 6. **Breadcrumbs** - Điều hướng
Hiển thị đường dẫn điều hướng.

**Location**: `/src/components/admin/ui/Breadcrumbs.tsx`

**Cách sử dụng**:
```tsx
import { Breadcrumbs, BreadcrumbList } from '@/components/admin/ui/Breadcrumbs';
import { Package, ShoppingCart } from 'lucide-react';

function OrderDetailPage() {
    return (
        <>
            {/* Variant 1: Inline Breadcrumbs */}
            <Breadcrumbs
                items={[
                    { label: 'Đơn hàng', href: '/admin/orders' },
                    { label: 'Chi tiết đơn hàng #12345' },
                ]}
                showHome={true}
                homeHref="/admin"
            />

            {/* Variant 2: List Breadcrumbs */}
            <BreadcrumbList
                items={[
                    { label: 'Đơn hàng', href: '/admin/orders', icon: <ShoppingCart size={16} /> },
                    { label: 'Sản phẩm', href: '/admin/products', icon: <Package size={16} /> },
                    { label: 'Chi tiết', },
                ]}
            />
        </>
    );
}
```

---

### 7. **BulkActions** - Thao tác hàng loạt
Component cho phép chọn nhiều mục và thực hiện hành động hàng loạt.

**Location**: `/src/components/admin/ui/BulkActions.tsx`

**Cách sử dụng**:
```tsx
import { BulkActions, BulkActionToolbar, BulkActionItem } from '@/components/admin/ui/BulkActions';
import { Trash2, FileText, Download } from 'lucide-react';

function OrdersPage() {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [allOrders] = useState([]);
    const totalCount = allOrders.length;

    const bulkActions = [
        {
            id: 'delete',
            label: 'Xóa đơn hàng',
            icon: <Trash2 size={16} />,
            onClick: async (ids) => {
                await deleteOrders(ids);
                setSelectedIds([]);
            },
            danger: true,
            requiresConfirmation: true,
            confirmTitle: 'Xác nhận xóa',
            confirmMessage: `Bạn có chắc chắn muốn xóa ${ids.length} đơn hàng đã chọn?`,
        },
        {
            id: 'export',
            label: 'Xuất CSV',
            icon: <Download size={16} />,
            onClick: (ids) => exportOrders(ids),
        },
        {
            id: 'print',
            label: 'In hóa đơn',
            icon: <FileText size={16} />,
            onClick: (ids) => printOrders(ids),
        },
    ];

    const handleSelectAll = () => {
        if (selectedIds.length === totalCount) {
            setSelectedIds([]);
        } else {
            setSelectedIds(allOrders.map(o => o.id));
        }
    };

    return (
        <div>
            {/* Variant 1: Floating Bulk Actions */}
            <BulkActions
                selectedIds={selectedIds}
                totalCount={totalCount}
                actions={bulkActions}
                onClearSelection={() => setSelectedIds([])}
                onSelectAll={handleSelectAll}
                position="floating"
            />

            {/* Variant 2: Sticky Toolbar */}
            <BulkActionToolbar
                selectedIds={selectedIds}
                totalCount={totalCount}
                actions={bulkActions}
                onClearSelection={() => setSelectedIds([])}
                onSelectAll={handleSelectAll}
            />

            {/* Render orders with checkboxes */}
            <table>
                <tbody>
                    {allOrders.map(order => (
                        <tr key={order.id}>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(order.id)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedIds([...selectedIds, order.id]);
                                        } else {
                                            setSelectedIds(selectedIds.filter(id => id !== order.id));
                                        }
                                    }}
                                />
                            </td>
                            <td>{order.name}</td>
                            <td>{order.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
```

---

### 8. **ColumnSorting** - Sắp xếp cột
Component hỗ trợ sắp xếp cột trong table.

**Location**: `/src/components/admin/ui/ColumnSorting.tsx`

**Cách sử dụng**:
```tsx
import { TableHeader, SortableHeader, useSorting } from '@/components/admin/ui/ColumnSorting';

function ProductsPage() {
    const products = [...]; // Your data
    const { sortedItems, sortConfig, handleSort } = useSorting(products);

    const columns = [
        { key: 'name', label: 'Tên sản phẩm', sortable: true },
        { key: 'price', label: 'Giá', sortable: true },
        { key: 'stock', label: 'Tồn kho', sortable: true, width: '150px' },
        { key: 'category', label: 'Danh mục', sortable: true },
    ];

    return (
        <table>
            <TableHeader
                columns={columns}
                sortConfig={sortConfig}
                onSort={handleSort}
            />
            <tbody>
                {sortedItems.map(product => (
                    <tr key={product.id}>
                        <td>{product.name}</td>
                        <td>{product.price}</td>
                        <td>{product.stock}</td>
                        <td>{product.category}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
```

---

### 9. **SidebarOptimized** - Sidebar cải tiến
Sidebar với collapsible sections, search, và mobile support.

**Location**: `/src/components/admin/SidebarOptimized.tsx`

**Cách sử dụng**:
```tsx
import { Sidebar, NavItem } from '@/components/admin/SidebarOptimized';

function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const customNavItems: NavItem[] = [
        {
            label: 'Quản lý',
            icon: <LayoutDashboard size={20} />,
            children: [
                { label: 'Đơn hàng', href: '/admin/orders' },
                { label: 'Sản phẩm', href: '/admin/products' },
                { label: 'Người dùng', href: '/admin/users' },
            ],
        },
        // ... more sections
    ];

    const userInfo = {
        name: 'Admin User',
        email: 'admin@gonuts.com',
    };

    return (
        <Sidebar
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
            navItems={customNavItems}
            userInfo={userInfo}
        />
    );
}
```

**Tính năng**:
- Collapsible sections
- Search menu items
- Mobile responsive
- Badge notifications
- Active state indicators
- Persist expanded state

---

### 10. **ExportButton** - Xuất dữ liệu
Component xuất dữ liệu ra CSV/Excel.

**Location**: `/src/components/admin/ui/ExportButton.tsx`

**Cách sử dụng**:
```tsx
import { ExportButton, BulkExport, exportToCSV, exportToExcel } from '@/components/admin/ui/ExportButton';

function ProductsPage() {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const products = [...]; // Your data

    const exportColumns = [
        { key: 'name', label: 'Tên sản phẩm' },
        { key: 'price', label: 'Giá', format: (v) => `${v.toLocaleString()}đ` },
        { key: 'stock', label: 'Tồn kho' },
        { key: 'category', label: 'Danh mục' },
    ];

    const handleExport = async (format: 'csv' | 'excel', selectedOnly: boolean) => {
        const dataToExport = selectedOnly
            ? products.filter(p => selectedIds.includes(p.id))
            : products;

        if (format === 'csv') {
            exportToCSV({ data: dataToExport, columns: exportColumns, filename: 'san-pham' });
        } else {
            exportToExcel({ data: dataToExport, columns: exportColumns, filename: 'san-pham' });
        }
    };

    return (
        <div className="flex items-center gap-4">
            {/* Export all data */}
            <ExportButton
                data={products}
                columns={exportColumns}
                filename="san-pham"
                isLoading={false}
                disabled={products.length === 0}
            />

            {/* Export selected */}
            <BulkExport
                selectedIds={selectedIds}
                totalCount={products.length}
                onExport={handleExport}
                isLoading={false}
                disabled={selectedIds.length === 0}
            />
        </div>
    );
}
```

---

## 🎯 Tích hợp vào Orders Page

Ví dụ đầy đủ về cách tích hợp tất cả component vào một page:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { Breadcrumbs } from '@/components/admin/ui/Breadcrumbs';
import { SearchInput } from '@/components/admin/ui/SearchInput';
import { Pagination } from '@/components/admin/ui/Pagination';
import { BulkActions, BulkActionToolbar } from '@/components/admin/ui/BulkActions';
import { TableHeader } from '@/components/admin/ui/ColumnSorting';
import { BulkExport } from '@/components/admin/ui/ExportButton';
import { ConfirmModal } from '@/components/admin/ui/ConfirmModal';
import { Trash2, Download, FileText } from 'lucide-react';

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);
    const [totalRecords, setTotalRecords] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, [currentPage, pageSize, searchQuery]);

    const fetchOrders = async () => {
        setLoading(true);
        const res = await fetch(`/api/admin/orders?page=${currentPage}&limit=${pageSize}&search=${searchQuery}`);
        const data = await res.json();
        setOrders(data.orders);
        setTotalRecords(data.total);
        setLoading(false);
    };

    const bulkActions = [
        {
            id: 'delete',
            label: 'Xóa đơn hàng',
            icon: <Trash2 size={16} />,
            onClick: (ids) => {
                setSelectedIds(ids);
                setShowDeleteModal(true);
            },
            danger: true,
            requiresConfirmation: true,
        },
        {
            id: 'export',
            label: 'Xuất CSV',
            icon: <Download size={16} />,
            onClick: (ids) => exportToCSV({ data: orders.filter(o => ids.includes(o.id)), columns: [...], filename: 'don-hang' }),
        },
    ];

    const handleDelete = async () => {
        setIsDeleting(true);
        await Promise.all(selectedIds.map(id => fetch(`/api/admin/orders/${id}`, { method: 'DELETE' })));
        setIsDeleting(false);
        setShowDeleteModal(false);
        setSelectedIds([]);
        fetchOrders();
    };

    const totalPages = Math.ceil(totalRecords / pageSize);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Breadcrumbs */}
            <Breadcrumbs
                items={[{ label: 'Đơn hàng' }]}
                showHome={true}
            />

            {/* Bulk Action Toolbar */}
            <BulkActionToolbar
                selectedIds={selectedIds}
                totalCount={totalRecords}
                actions={bulkActions}
                onClearSelection={() => setSelectedIds([])}
                onSelectAll={() => setSelectedIds(orders.map(o => o.id))}
            />

            {/* Search and Filter Bar */}
            <div className="flex items-center gap-4 px-6 py-4 bg-white border-b border-slate-200">
                <SearchInput
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Tìm kiếm đơn hàng..."
                    className="flex-1"
                />

                <BulkExport
                    selectedIds={selectedIds}
                    totalCount={totalRecords}
                    onExport={(format, selectedOnly) => console.log(format, selectedOnly)}
                />
            </div>

            {/* Orders Table */}
            <div className="px-6 py-4">
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">Đang tải...</div>
                    ) : (
                        <table className="w-full">
                            <TableHeader
                                columns={[
                                    { key: 'id', label: 'Mã đơn', sortable: true },
                                    { key: 'customer', label: 'Khách hàng', sortable: true },
                                    { key: 'total', label: 'Tổng tiền', sortable: true },
                                    { key: 'status', label: 'Trạng thái', sortable: true },
                                ]}
                                sortConfig={null}
                                onSort={(key) => console.log('Sort by', key)}
                            />

                            <tbody>
                                {orders.map((order, index) => (
                                    <tr key={order.id} className="hover:bg-slate-50">
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(order.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedIds([...selectedIds, order.id]);
                                                    } else {
                                                        setSelectedIds(selectedIds.filter(id => id !== order.id));
                                                    }
                                                }}
                                            />
                                        </td>
                                        <td>#{(index + 1) + (currentPage - 1) * pageSize}</td>
                                        <td>{order.customer}</td>
                                        <td>{order.total?.toLocaleString()}đ</td>
                                        <td>{order.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalRecords={totalRecords}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                showPageSizeSelector={true}
                showTotalRecords={true}
                isLoading={loading}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Xác nhận xóa đơn hàng"
                message={`Bạn có chắc chắn muốn xóa ${selectedIds.length} đơn hàng đã chọn? Hành động này không thể hoàn tác.`}
                confirmText="Xóa"
                cancelText="Hủy"
                variant="danger"
                isLoading={isDeleting}
            />
        </div>
    );
}
```

---

## 📊 Tiến độ hoàn thành

| # | Component | Trạng thái |
|---|-----------|-----------|
| 1 | ConfirmModal | ✅ Hoàn thành |
| 2 | AlertDialog | ✅ Hoàn thành |
| 3 | Pagination | ✅ Hoàn thành |
| 4 | SearchInput (Debounce) | ✅ Hoàn thành |
| 5 | DateRangePicker | ✅ Hoàn thành |
| 6 | Breadcrumbs | ✅ Hoàn thành |
| 7 | BulkActions | ✅ Hoàn thành |
| 8 | ColumnSorting | ✅ Hoàn thành |
| 9 | SidebarOptimized | ✅ Hoàn thành |
| 10 | ExportButton (CSV/Excel) | ✅ Hoàn thành |

---

## 🎨 Màu thương hiệu

**Màu chính:**
- Primary brand: `#9C7043` (nâu/cam đất) - cho nút chính, active states
- Primary light: `#E3E846` (vàng nhạt/xanh lá nhạt) - cho điểm nhấn, badges
- White: `#FFFFFF` - cho backgrounds

**Sử dụng trong Tailwind:**
```css
bg-brand          /* #9C7043 */
bg-brand-light     /* #E3E846 */
bg-brand-dark      /* #7d5a36 */
text-brand         /* #9C7043 */
text-brand-light    /* #E3E846 */
```

---

## 🔧 Cài đặt và tích hợp

### Step 1: Import components
```tsx
import { ConfirmModal } from '@/components/admin/ui/ConfirmModal';
import { AlertDialog } from '@/components/admin/ui/AlertDialog';
import { Pagination } from '@/components/admin/ui/Pagination';
import { SearchInput } from '@/components/admin/ui/SearchInput';
import { DateRangePicker } from '@/components/admin/ui/DateRangePicker';
import { Breadcrumbs } from '@/components/admin/ui/Breadcrumbs';
import { BulkActions } from '@/components/admin/ui/BulkActions';
import { ColumnSorting } from '@/components/admin/ui/ColumnSorting';
import { ExportButton } from '@/components/admin/ui/ExportButton';
import { SidebarOptimized } from '@/components/admin/SidebarOptimized';
```

### Step 2: Thêm state cần thiết
```tsx
const [selectedIds, setSelectedIds] = useState<string[]>([]);
const [currentPage, setCurrentPage] = useState(1);
const [pageSize, setPageSize] = useState(25);
const [searchQuery, setSearchQuery] = useState('');
```

### Step 3: Tích hợp vào layout
```tsx
<div className="min-h-screen">
    <SidebarOptimized
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
    />

    <main className="flex-1">
        <Breadcrumbs items={breadcrumbs} />
        {/* Main content */}
    </main>
</div>
```

---

## 🚀 Lợi ích

1. **Tốc độ**: Debounce giúp giảm số lượng API requests
2. **UX tốt hơn**: Custom modal thay thế browser dialogs
3. **Scalability**: Pagination giúp xử lý lượng dữ liệu lớn
4. **Flexibility**: Reusable components dễ dàng tích hợp
5. **Tính nhất quán**: Đối với màu thương hiệu và design language
6. **Responsiveness**: Tất cả components hỗ trợ mobile
7. **Accessibility**: Keyboard navigation và screen reader support

---

## 📝 Notes

- Tất cả components sử dụng TypeScript
- Màu thương hiệu đã được tích hợp (#9C7043, #E3E846)
- Icons từ `lucide-react`
- Responsive design cho mobile và desktop
- Loading states và error handling đã được tích hợp
- Components sẵn sàng để tích hợp vào các admin pages hiện tại

---

## 🔄 Bước tiếp theo

Bạn có thể:
1. Tích hợp các component này vào các admin pages hiện tại
2. Tích hợp SidebarOptimized thay thế sidebar cũ
3. Thêm sorting và filtering vào tất cả tables
4. Thêm export functionality vào tất cả data views
5. Tích hợp pagination vào tất cả list views

Hãy cho tôi biết nếu bạn cần giúp đỡ tích hợp!
