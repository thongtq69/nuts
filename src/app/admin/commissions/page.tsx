'use client';

import { useState, useEffect } from 'react';

export default function AdminCommissionsPage() {
    const [commissions, setCommissions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCommissions = () => {
        setLoading(true);
        fetch('/api/admin/commissions')
            .then(res => res.json())
            .then(data => {
                setCommissions(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchCommissions();
    }, []);

    const updateStatus = async (id: string, newStatus: string) => {
        if (!confirm(`Bạn có chắc chắn muốn đổi trạng thái thành ${newStatus}?`)) return;
        try {
            const res = await fetch('/api/admin/commissions', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus })
            });
            if (res.ok) {
                fetchCommissions();
            } else {
                alert('Lỗi cập nhật');
            }
        } catch (e) {
            alert('Lỗi cập nhật');
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Quản lý Hoa hồng</h1>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">STT</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CTV</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đơn hàng</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá trị đơn</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hoa hồng</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={7} className="px-6 py-4 text-center">Đang tải...</td></tr>
                        ) : commissions.length === 0 ? (
                            <tr><td colSpan={7} className="px-6 py-4 text-center">Chưa có hoa hồng nào</td></tr>
                        ) : (
                            commissions.map((comm: any, index: number) => (
                                <tr key={comm._id}>
                                    <td className="px-6 py-4 text-center font-semibold text-gray-500 text-sm">
                                        {index + 1}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                        {comm.affiliateId?.name || 'Unknown'}<br />
                                        <span className="text-gray-500 text-xs">{comm.affiliateId?.referralCode}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {comm.orderId?._id ? (
                                            <span title={comm.orderId._id}>...{comm.orderId._id.slice(-6)}</span>
                                        ) : 'N/A'}<br />
                                        <span className="text-xs">{new Date(comm.createdAt).toLocaleDateString()}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Intl.NumberFormat('vi-VN').format(comm.orderValue)}đ
                                    </td>
                                    <td className="px-6 py-4 text-sm font-semibold text-green-600">
                                        {new Intl.NumberFormat('vi-VN').format(comm.commissionAmount)}đ
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${comm.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                comm.status === 'paid' ? 'bg-blue-100 text-blue-800' :
                                                    comm.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'}`}>
                                            {comm.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium">
                                        {comm.status === 'pending' && (
                                            <div className="flex gap-2">
                                                <button onClick={() => updateStatus(comm._id, 'approved')} className="text-green-600 hover:text-green-900">Duyệt</button>
                                                <button onClick={() => updateStatus(comm._id, 'rejected')} className="text-red-600 hover:text-red-900">Từ chối</button>
                                            </div>
                                        )}
                                        {comm.status === 'approved' && (
                                            <button onClick={() => updateStatus(comm._id, 'paid')} className="text-blue-600 hover:text-blue-900">Đã TT</button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
