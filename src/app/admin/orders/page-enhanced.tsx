'use client';

import { useState, useEffect } from 'react';
import { Breadcrumbs } from '@/components/admin/ui/Breadcrumbs';
import { SearchInput } from '@/components/admin/ui/SearchInput';
import { Pagination } from '@/components/admin/ui/Pagination';
import { BulkActionToolbar } from '@/components/admin/ui/BulkActions';
import { TableHeader } from '@/components/admin/ui/ColumnSorting';
import { ExportButton, exportToCSV, exportToExcel } from '@/components/admin/ui/ExportButton';
import { ConfirmModal } from '@/components/admin/ui/ConfirmModal';
import { DateRangePicker } from '@/components/admin/ui/DateRangePicker';
import Link from 'next/link';
import {
    ShoppingCart,
    Eye,
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    Truck,
    RefreshCw,
    Trash2,
    Download,
    FileText,
    Filter,
} from 'lucide-react';

interface Order {
    id: string;
    customer: string;
    email: string;
    total: number;
    status: string;
    paymentMethod: string;
    date: string;
    time: string;
    itemCount: number;
}

interface OrderResponse {
    orders: Order[];
    total: number;
    page: number;
    pageSize: number;
}

const statusConfig: Record<string, { label: string; class: string; icon: any; bgColor: string }> = {
    pending: { label: 'Chờ xử lý', class: 'bg-brand-light/30 text-brand-dark border-brand-light/50', icon: Clock, bgColor: 'bg-brand' },
    confirmed: { label: 'Đã xác nhận', class: 'bg-brand/10 text-brand border-brand/20', icon: CheckCircle, bgColor: 'bg-brand' },
    shipping: { label: 'Đang giao', class: 'bg-brand/10 text-brand border-brand/20', icon: Truck, bgColor: 'bg-brand' },
    completed: { label: 'Hoàn thành', class: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle, bgColor: 'bg-emerald-500' },
    paid: { label: 'Đã thanh toán', class: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle, bgColor: 'bg-emerald-500' },
    cancelled: { label: 'Đã hủy', class: 'bg-red-100 text-red-700 border-red-200', icon: XCircle, bgColor: 'bg-red-500' },
};

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);
    const [totalRecords, setTotalRecords] = useState(0);

    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [dateRange, setDateRange] = useState<{ startDate: Date | null; endDate: Date | null }>({
        startDate: null,
        endDate: null,
    });
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

    const totalPages = Math.ceil(totalRecords / pageSize);

    useEffect(() => {
        fetchOrders();
    }, [currentPage, pageSize, searchQuery, filterStatus, dateRange]);

    const fetchOrders = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: pageSize.toString(),
            });

            if (searchQuery.trim()) {
                params.append('search', searchQuery);
            }

            if (filterStatus !== 'all') {
                params.append('status', filterStatus);
            }

            if (dateRange.startDate) {
                params.append('startDate', dateRange.startDate.toISOString());
            }

            if (dateRange.endDate) {
                params.append('endDate', dateRange.endDate.toISOString());
            }

            const res = await fetch(`/api/admin/orders?${params.toString()}`);
            if (res.ok) {
                const data: OrderResponse = await res.json();
                setOrders(data.orders || []);
                setTotalRecords(data.total || 0);
            } else {
                const error = await res.json();
                console.error('Error fetching orders:', error);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            setUpdating(orderId);
            const res = await fetch(`/api/admin/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                setOrders(prev => prev.map(order =>
                    order.id === orderId ? { ...order, status: newStatus } : order
                ));
            } else {
                const data = await res.json();
                alert(data.message || 'Lỗi cập nhật trạng thái');
            }
        } catch (error) {
            console.error('Error updating order:', error);
            alert('Lỗi khi cập nhật trạng thái');
        } finally {
            setUpdating(null);
            setOpenDropdown(null);
        }
    };

    const handleSelectAll = () => {
        if (selectedIds.length === orders.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(orders.map(order => order.id));
        }
    };

    const handleBulkDelete = async () => {
        try {
            setDeleting('bulk');
            await Promise.all(selectedIds.map(id =>
                fetch(`/api/admin/orders/${id}`, { method: 'DELETE' })
            ));
            setOrders(prev => prev.filter(order => !selectedIds.includes(order.id)));
            setSelectedIds([]);
            setShowDeleteModal(false);
            setDeleting(null);
            fetchOrders();
        } catch (error) {
            console.error('Error deleting orders:', error);
            alert('Lỗi xóa đơn hàng');
            setDeleting(null);
        }
    };

    const handleExport = (format: 'csv' | 'excel', selectedOnly: boolean) => {
        const dataToExport = selectedOnly
            ? orders.filter(order => selectedIds.includes(order.id))
            : orders;

        const exportColumns: any[] = [
            { key: 'id', label: 'Mã đơn' },
            { key: 'customer', label: 'Khách hàng' },
            { key: 'email', label: 'Email' },
            { key: 'total', label: 'Tổng tiền' },
            { key: 'status', label: 'Trạng thái' },
            { key: 'date', label: 'Ngày tạo' },
            { key: 'time', label: 'Giờ tạo' },
        ];

        if (format === 'csv') {
            exportToCSV({ data: dataToExport, columns: exportColumns, filename: `don-hang-${new Date().toISOString().split('T')[0]}-${Date.now()}` });
        } else {
            exportToExcel({ data: dataToExport, columns: exportColumns, filename: `don-hang-${new Date().toISOString().split('T')[0]}-${Date.now()}` });
        }
    };

    const bulkActions = [
        {
            id: 'delete',
            label: 'Xóa đơn hàng',
            icon: <Trash2 size={16} />,
            onClick: () => setShowDeleteModal(true),
            danger: true,
            requiresConfirmation: true,
            confirmTitle: 'Xác nhận xóa',
            confirmMessage: `Bạn có chắc chắn muốn xóa ${selectedIds.length} đơn hàng đã chọn? Hành động này không thể hoàn tác.`,
        },
        {
            id: 'export',
            label: 'Xuất CSV',
            icon: <Download size={16} />,
            onClick: () => handleExport('csv', true),
        },
        {
            id: 'export_excel',
            label: 'Xuất Excel',
            icon: <Download size={16} />,
            onClick: () => handleExport('excel', true),
        },
        {
            id: 'print',
            label: 'In hóa đơn',
            icon: <FileText size={16} />,
            onClick: () => {
                console.log('Print orders:', selectedIds);
                alert('Tính năng in hóa đơn đang phát triển');
            },
        },
    ];

    const filteredOrders = orders;

    const pendingCount = orders.filter(o => o.status === 'pending').length;
    const shippingCount = orders.filter(o => o.status === 'shipping').length;
    const completedCount = orders.filter(o => ['completed', 'paid'].includes(o.status)).length;
    const cancelledCount = orders.filter(o => o.status === 'cancelled').length;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw size={48} className="animate-spin text-brand" />
                    <div className="text-slate-600">Đang tải dữ liệu...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Breadcrumbs
                items={[{ label: 'Đơn hàng' }]}
                showHome={true}
            />

            <div className="space-y-6 px-6 py-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white shadow-lg shadow-brand/25">
                                <ShoppingCart className="h-6 w-6" />
                            </div>
                            Quản lý Đơn hàng
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 ml-15">
                            {totalRecords.toLocaleString()} đơn hàng • {pendingCount} chờ xử lý • {completedCount} hoàn thành
                        </p>
                    </div>
                    <button
                        onClick={fetchOrders}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                    >
                        <RefreshCw size={18} />
                        Làm mới
                    </button>
                </div>

                <BulkActionToolbar
                    selectedIds={selectedIds}
                    totalCount={orders.length}
                    actions={bulkActions}
                    onClearSelection={() => setSelectedIds([])}
                    onSelectAll={handleSelectAll}
                />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-brand-light/30 dark:bg-brand-light/20 flex items-center justify-center">
                            <Clock className="w-6 h-6 text-brand-dark" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-800 dark:text-white">{pendingCount}</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">Chờ xử lý</div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-brand/10 dark:bg-brand/20 flex items-center justify-center">
                            <Truck className="w-6 h-6 text-brand" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-800 dark:text-white">{shippingCount}</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">Đang giao</div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-800 dark:text-white">{completedCount}</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">Hoàn thành</div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <XCircle className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-800 dark:text-white">{cancelledCount}</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">Đã hủy</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <SearchInput
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Tìm kiếm đơn hàng..."
                            debounceMs={300}
                            isLoading={false}
                            onClear={() => setSearchQuery('')}
                            className="flex-1"
                        />
                    </div>

                    <div className="relative">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="appearance-none px-4 py-2.5 pr-10 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium cursor-pointer focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="pending">Chờ xử lý</option>
                            <option value="confirmed">Đã xác nhận</option>
                            <option value="shipping">Đang giao</option>
                            <option value="completed">Hoàn thành</option>
                            <option value="cancelled">Đã hủy</option>
                        </select>
                        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                            className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-left cursor-pointer focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
                        >
                            {dateRange.startDate || dateRange.endDate
                                ? `${dateRange.startDate?.toLocaleDateString('vi-VN')} - ${dateRange.endDate?.toLocaleDateString('vi-VN')}`
                                : 'Chọn ngày'}
                        </button>

                        <DateRangePicker
                            isOpen={isDatePickerOpen}
                            value={dateRange}
                            onChange={(range) => setDateRange(range)}
                            onClose={() => setIsDatePickerOpen(false)}
                            position="right"
                        />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
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

                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                    <ShoppingCart className="w-8 h-8 text-slate-400" />
                                                </div>
                                                <p className="text-slate-500 dark:text-slate-400">
                                                    {searchQuery || filterStatus !== 'all' || dateRange.startDate || dateRange.endDate
                                                        ? 'Không tìm thấy đơn hàng phù hợp'
                                                        : 'Chưa có đơn hàng nào'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOrders.map((order, index) => {
                                        const config = statusConfig[order.status] || statusConfig.pending;
                                        const StatusIcon = config.icon;
                                        const isUpdating = updating === order.id;
                                        const isDropdownOpen = openDropdown === order.id;
                                        const isSelected = selectedIds.includes(order.id);

                                        return (
                                            <tr
                                                key={order.id}
                                                className={`
                                                    group hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors
                                                    ${isSelected ? 'bg-brand/5' : ''}
                                                `}
                                            >
                                                <td className="px-4 py-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedIds([...selectedIds, order.id]);
                                                            } else {
                                                                setSelectedIds(selectedIds.filter(id => id !== order.id));
                                                            }
                                                        }}
                                                        className="w-5 h-5 rounded border-slate-300 text-brand focus:ring-brand cursor-pointer"
                                                    />
                                                </td>
                                                <td className="px-4 py-4 cursor-pointer" onClick={() => window.location.href = `/admin/orders/${order.id}`}>
                                                    <div className="font-mono font-bold text-slate-700 dark:text-slate-300">
                                                        #{order.id.slice(-6).toUpperCase()}
                                                    </div>
                                                    <div className="text-xs text-slate-400 mt-0.5">
                                                        {order.paymentMethod}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 cursor-pointer" onClick={() => window.location.href = `/admin/orders/${order.id}`}>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 font-medium text-sm">
                                                            {order.customer.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-slate-800 dark:text-white">
                                                                {order.customer}
                                                            </div>
                                                            {order.email && (
                                                                <div className="text-xs text-slate-400">{order.email}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-right cursor-pointer" onClick={() => window.location.href = `/admin/orders/${order.id}`}>
                                                    <span className="font-bold text-lg text-brand">
                                                        {order.total.toLocaleString()}đ
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${config.class}`}>
                                                        <StatusIcon size={14} />
                                                        {config.label}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Link
                                                            href={`/admin/orders/${order.id}`}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand/10 hover:bg-brand/20 text-brand rounded-lg text-sm font-medium transition-colors"
                                                        >
                                                            <Eye size={14} />
                                                            Chi tiết
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
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
                    isLoading={loading}
                />
            </div>

            {showDeleteModal && (
                <ConfirmModal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={handleBulkDelete}
                    title="Xác nhận xóa"
                    message={`Bạn có chắc chắn muốn xóa ${selectedIds.length} đơn hàng đã chọn? Hành động này không thể hoàn tác.`}
                    confirmText="Xóa"
                    cancelText="Hủy"
                    variant="danger"
                    isLoading={deleting === 'bulk'}
                />
            )}
        </div>
    );
}
