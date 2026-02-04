'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, CreditCard, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Pagination } from '@/components/admin/ui/Pagination';
import { ConfirmModal } from '@/components/admin/ui/ConfirmModal';
import { useToast } from '@/context/ToastContext';

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
    const toast = useToast();

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
                toast.error('Lỗi cập nhật', 'Vui lòng thử lại.');
            }
        } catch (e) {
            toast.error('Lỗi cập nhật', 'Vui lòng thử lại.');
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

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white shadow-lg">
                            <CreditCard className="h-6 w-6" />
                        </div>
                        Quản lý Hoa hồng
                    </h1>
                    <p className="text-slate-500 mt-1 text-base">
                        {filteredCommissions.length} hoa hồng • Tổng: {new Intl.NumberFormat('vi-VN').format(totalCommissionAmount)}đ
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-yellow-100 flex items-center justify-center">
                        <Clock className="w-7 h-7 text-yellow-700" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-900">{totalPending}</div>
                        <div className="text-sm text-slate-500">Chờ duyệt</div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <CheckCircle className="w-7 h-7 text-emerald-700" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-900">{totalApproved}</div>
                        <div className="text-sm text-slate-500">Đã duyệt</div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center">
                        <TrendingUp className="w-7 h-7 text-amber-700" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-900">{totalPaid}</div>
                        <div className="text-sm text-slate-500">Đã thanh toán</div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <span className="text-emerald-700 font-bold text-xl">đ</span>
                    </div>
                    <div>
                        <div className="text-xl font-bold text-emerald-600">{new Intl.NumberFormat('vi-VN').format(totalCommissionAmount)}đ</div>
                        <div className="text-sm text-slate-500">Tổng hoa hồng</div>
                    </div>
                </div>
            </div>

            {/* Filter */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {['all', 'pending', 'approved', 'paid', 'rejected'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                                statusFilter === status
                                    ? 'bg-amber-500 text-white shadow-md'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {status === 'all' ? 'Tất cả' :
                                status === 'pending' ? 'Chờ duyệt' :
                                status === 'approved' ? 'Đã duyệt' :
                                status === 'paid' ? 'Đã thanh toán' : 'Từ chối'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table - Fixed with proper overflow */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
                <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
                    <table className="w-full" style={{ minWidth: '1100px' }}>
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-4 text-center text-sm font-semibold text-slate-600 uppercase w-16">STT</th>
                                <th className="px-4 py-4 text-left text-sm font-semibold text-slate-600 uppercase min-w-[200px]">CTV</th>
                                <th className="px-4 py-4 text-left text-sm font-semibold text-slate-600 uppercase w-40">Đơn hàng</th>
                                <th className="px-4 py-4 text-right text-sm font-semibold text-slate-600 uppercase w-36">Giá trị đơn</th>
                                <th className="px-4 py-4 text-right text-sm font-semibold text-slate-600 uppercase w-32">Hoa hồng</th>
                                <th className="px-4 py-4 text-center text-sm font-semibold text-slate-600 uppercase w-36">Trạng thái</th>
                                <th className="px-4 py-4 text-left text-sm font-semibold text-slate-600 uppercase w-32">Ngày</th>
                                <th className="px-4 py-4 text-center text-sm font-semibold text-slate-600 uppercase w-44">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-12 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500" />
                                    </td>
                                </tr>
                            ) : paginatedCommissions.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-12 text-center text-slate-500 text-lg">
                                        {searchTerm || statusFilter !== 'all' ? 'Không tìm thấy hoa hồng nào' : 'Chưa có hoa hồng nào'}
                                    </td>
                                </tr>
                            ) : (
                                paginatedCommissions.map((comm, index) => (
                                    <tr
                                        key={comm._id}
                                        className="hover:bg-slate-50 transition-colors"
                                    >
                                        <td className="px-4 py-4 text-center font-semibold text-slate-500">
                                            {startIndex + index + 1}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="font-semibold text-slate-900 text-base">{comm.affiliateId?.name || 'Unknown'}</div>
                                            <div className="text-sm text-slate-500 font-mono mt-0.5">{comm.affiliateId?.referralCode}</div>
                                        </td>
                                        <td className="px-4 py-4 text-slate-600">
                                            {comm.orderId?._id ? (
                                                <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded">...{comm.orderId._id.slice(-6)}</span>
                                            ) : 'N/A'}
                                        </td>
                                        <td className="px-4 py-4 text-right text-slate-700 font-medium">
                                            {new Intl.NumberFormat('vi-VN').format(comm.orderValue)}đ
                                        </td>
                                        <td className="px-4 py-4 text-right font-bold text-emerald-600">
                                            {new Intl.NumberFormat('vi-VN').format(comm.commissionAmount)}đ
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className={`inline-flex px-3 py-1.5 rounded-full text-sm font-semibold
                                                ${comm.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                                    comm.status === 'paid' ? 'bg-amber-100 text-amber-700' :
                                                        comm.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                            'bg-yellow-100 text-yellow-700'}`}>
                                                {comm.status === 'approved' ? 'Đã duyệt' :
                                                    comm.status === 'paid' ? 'Đã TT' :
                                                    comm.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-slate-600">
                                            {new Date(comm.createdAt).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-center gap-2">
                                                {comm.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => openUpdateModal(comm._id, 'approved')}
                                                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg transition-colors"
                                                        >
                                                            Duyệt
                                                        </button>
                                                        <button
                                                            onClick={() => openUpdateModal(comm._id, 'rejected')}
                                                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-colors"
                                                        >
                                                            Từ chối
                                                        </button>
                                                    </>
                                                )}
                                                {comm.status === 'approved' && (
                                                    <button
                                                        onClick={() => openUpdateModal(comm._id, 'paid')}
                                                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition-colors"
                                                    >
                                                        Đã TT
                                                    </button>
                                                )}
                                                {(comm.status === 'paid' || comm.status === 'rejected') && (
                                                    <span className="text-slate-400 text-sm">-</span>
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
