'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { Pagination } from '@/components/admin/ui/Pagination';
import { SearchInput } from '@/components/admin/ui/SearchInput';
import { ExportButton, exportToCSV, ExportColumn } from '@/components/admin/ui/ExportButton';
import { ConfirmModal } from '@/components/admin/ui/ConfirmModal';

interface Commission {
    _id: string;
    affiliateId?: {
        name: string;
        referralCode: string;
    };
    orderId?: {
        _id: string;
    };
    orderValue: number;
    commissionAmount: number;
    status: 'pending' | 'approved' | 'paid' | 'rejected';
    createdAt: string;
}

export default function AdminCommissionsPage() {
    const [commissions, setCommissions] = useState<Commission[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [updateModal, setUpdateModal] = useState<{ isOpen: boolean; id: string | null; newStatus: string }>({
        isOpen: false,
        id: null,
        newStatus: ''
    });
    const [updating, setUpdating] = useState<string | null>(null);

    const fetchCommissions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/commissions');
            const data = await res.json();
            setCommissions(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCommissions();
    }, [fetchCommissions]);

    const openUpdateModal = (id: string, newStatus: string) => {
        setUpdateModal({ isOpen: true, id, newStatus });
    };

    const handleUpdateStatus = async () => {
        if (!updateModal.id) return;
        try {
            setUpdating(updateModal.id);
            const res = await fetch('/api/admin/commissions', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: updateModal.id, status: updateModal.newStatus })
            });
            if (res.ok) {
                setCommissions(prev =>
                    prev.map(c => c._id === updateModal.id ? { ...c, status: updateModal.newStatus as Commission['status'] } : c)
                );
                setUpdateModal({ isOpen: false, id: null, newStatus: '' });
            } else {
                alert('Lỗi cập nhật');
            }
        } catch (e) {
            alert('Lỗi cập nhật');
        } finally {
            setUpdating(null);
        }
    };

    const filteredCommissions = commissions.filter(comm => {
        const matchesSearch = searchTerm === '' ||
            comm.affiliateId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            comm.affiliateId?.referralCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            comm.orderId?._id?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || comm.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredCommissions.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedCommissions = filteredCommissions.slice(startIndex, startIndex + pageSize);

    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(1);
        }
    }, [totalPages, currentPage]);

    const exportColumns: ExportColumn<Commission>[] = [
        { key: '_id', label: 'ID', format: (v) => v || '' },
        {
            key: 'affiliateId', label: 'CTV',
            format: (v) => v?.name || 'Unknown'
        },
        {
            key: 'affiliateId', label: 'Mã giới thiệu',
            format: (v) => v?.referralCode || '-'
        },
        {
            key: 'orderId', label: 'Đơn hàng',
            format: (v) => v?._id ? `...${v._id.slice(-6)}` : 'N/A'
        },
        {
            key: 'orderValue', label: 'Giá trị đơn',
            format: (v) => `${new Intl.NumberFormat('vi-VN').format(v)}đ`
        },
        {
            key: 'commissionAmount', label: 'Hoa hồng',
            format: (v) => `${new Intl.NumberFormat('vi-VN').format(v)}đ`
        },
        {
            key: 'status', label: 'Trạng thái',
            format: (v) =>
                v === 'approved' ? 'Đã duyệt' :
                v === 'paid' ? 'Đã thanh toán' :
                v === 'rejected' ? 'Từ chối' : 'Chờ duyệt'
        },
        {
            key: 'createdAt', label: 'Ngày tạo',
            format: (v) => v ? new Date(v).toLocaleDateString('vi-VN') : '-'
        }
    ];

    const totalPending = commissions.filter(c => c.status === 'pending').length;
    const totalApproved = commissions.filter(c => c.status === 'approved').length;
    const totalPaid = commissions.filter(c => c.status === 'paid').length;
    const totalCommissionAmount = commissions.reduce((sum, c) => sum + c.commissionAmount, 0);

    return (
        <div className="space-y-6">
            <ConfirmModal
                isOpen={updateModal.isOpen}
                onClose={() => setUpdateModal({ ...updateModal, isOpen: false })}
                onConfirm={handleUpdateStatus}
                title="Cập nhật trạng thái"
                message={`Bạn có chắc chắn muốn đổi trạng thái thành ${updateModal.newStatus === 'approved' ? 'Đã duyệt' : updateModal.newStatus === 'paid' ? 'Đã thanh toán' : 'Từ chối'}?`}
                confirmText="Xác nhận"
                variant="warning"
                isLoading={updating !== null}
            />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white shadow-lg shadow-brand/25">
                            <span className="text-lg font-bold">%</span>
                        </div>
                        Quản lý Hoa hồng
                    </h1>
                    <p className="text-slate-500 mt-1">
                        {filteredCommissions.length} hoa hồng • Tổng: {new Intl.NumberFormat('vi-VN').format(totalCommissionAmount)}đ
                    </p>
                </div>
                <ExportButton
                    data={filteredCommissions}
                    columns={exportColumns}
                    filename="hoa-hong"
                    disabled={filteredCommissions.length === 0}
                />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                            <span className="text-yellow-600 font-bold text-sm">Chờ</span>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-800">{totalPending}</div>
                            <div className="text-sm text-slate-500">Chờ duyệt</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <span className="text-green-600 font-bold text-sm">Duyệt</span>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-800">{totalApproved}</div>
                            <div className="text-sm text-slate-500">Đã duyệt</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center">
                            <span className="text-brand font-bold text-sm">TT</span>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-800">{totalPaid}</div>
                            <div className="text-sm text-slate-500">Đã thanh toán</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 col-span-2 lg:col-span-1">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <span className="text-emerald-600 font-bold text-sm">đ</span>
                        </div>
                        <div>
                            <div className="text-lg font-bold text-emerald-600">{new Intl.NumberFormat('vi-VN').format(totalCommissionAmount)}đ</div>
                            <div className="text-sm text-slate-500">Tổng hoa hồng</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                    <SearchInput
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Tìm theo tên CTV, mã giới thiệu, đơn hàng..."
                        isLoading={loading}
                    />
                </div>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
                    <div className="flex gap-2 p-2">
                        {['all', 'pending', 'approved', 'paid', 'rejected'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                                    statusFilter === status
                                        ? 'bg-brand text-white shadow-md'
                                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                {status === 'all' ? 'Tất cả' :
                                    status === 'pending' ? 'Chờ' :
                                    status === 'approved' ? 'Duyệt' :
                                    status === 'paid' ? 'TT' : 'Từ chối'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr className="text-xs uppercase text-slate-500 font-semibold tracking-wider">
                                <th className="px-6 py-4 w-16 text-center">STT</th>
                                <th className="px-6 py-4">CTV</th>
                                <th className="px-6 py-4">Đơn hàng</th>
                                <th className="px-6 py-4 text-right">Giá trị đơn</th>
                                <th className="px-6 py-4 text-right">Hoa hồng</th>
                                <th className="px-6 py-4 text-center">Trạng thái</th>
                                <th className="px-6 py-4">Ngày</th>
                                <th className="px-6 py-4 text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand" />
                                    </td>
                                </tr>
                            ) : paginatedCommissions.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-slate-500 italic">
                                        {searchTerm || statusFilter !== 'all' ? 'Không tìm thấy hoa hồng nào' : 'Chưa có hoa hồng nào'}
                                    </td>
                                </tr>
                            ) : (
                                paginatedCommissions.map((comm, index) => (
                                    <tr
                                        key={comm._id}
                                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                                        onClick={() => {
                                            alert(`Hoa hồng: ${new Intl.NumberFormat('vi-VN').format(comm.commissionAmount)}đ\nCTV: ${comm.affiliateId?.name || 'Unknown'}\nĐơn hàng: ${comm.orderId?._id ? '...' + comm.orderId._id.slice(-6) : 'N/A'}\nTrạng thái: ${comm.status}`);
                                        }}
                                    >
                                        <td className="px-6 py-4 text-center font-semibold text-slate-500 text-sm">
                                            {startIndex + index + 1}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-800">{comm.affiliateId?.name || 'Unknown'}</div>
                                            <div className="text-xs text-slate-500 font-mono">{comm.affiliateId?.referralCode}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {comm.orderId?._id ? (
                                                <span className="font-mono" title={comm.orderId._id}>...{comm.orderId._id.slice(-6)}</span>
                                            ) : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm text-slate-600">
                                            {new Intl.NumberFormat('vi-VN').format(comm.orderValue)}đ
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-semibold text-green-600">
                                            {new Intl.NumberFormat('vi-VN').format(comm.commissionAmount)}đ
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold
                                                ${comm.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                    comm.status === 'paid' ? 'bg-brand/10 text-brand-dark' :
                                                        comm.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'}`}>
                                                {comm.status === 'approved' ? 'Đã duyệt' :
                                                    comm.status === 'paid' ? 'Đã TT' :
                                                    comm.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {new Date(comm.createdAt).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-center gap-2">
                                                {comm.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => openUpdateModal(comm._id, 'approved')}
                                                            className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-lg hover:bg-green-200 transition-colors"
                                                        >
                                                            Duyệt
                                                        </button>
                                                        <button
                                                            onClick={() => openUpdateModal(comm._id, 'rejected')}
                                                            className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-lg hover:bg-red-200 transition-colors"
                                                        >
                                                            Từ chối
                                                        </button>
                                                    </>
                                                )}
                                                {comm.status === 'approved' && (
                                                    <button
                                                        onClick={() => openUpdateModal(comm._id, 'paid')}
                                                        className="px-3 py-1 bg-brand/10 text-brand text-xs font-semibold rounded-lg hover:bg-brand/20 transition-colors"
                                                    >
                                                        Đã TT
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalRecords={filteredCommissions.length}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
                    isLoading={loading}
                />
            </div>
        </div>
    );
}
