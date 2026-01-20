'use client';

import Link from 'next/link';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';

export default function ProductListActions({ productId }: { productId: string }) {
    const toast = useToast();
    const confirm = useConfirm();

    const handleDelete = async () => {
        const confirmed = await confirm({
            title: 'Xác nhận xóa sản phẩm',
            description: 'Bạn có chắc chắn muốn xóa sản phẩm này?',
            confirmText: 'Xóa sản phẩm',
            cancelText: 'Hủy',
        });

        if (!confirmed) return;

        try {
            const res = await fetch(`/api/products/${productId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                window.location.reload();
            } else {
                toast.error('Xóa sản phẩm thất bại', 'Vui lòng thử lại.');
            }
        } catch (error) {
            console.error(error);
            toast.error('Lỗi khi xóa sản phẩm', 'Vui lòng thử lại.');
        }
    };

    return (
        <div className="actions">
            <Link href={`/admin/products/${productId}`} className="btn-link">Sửa</Link>
            <button onClick={handleDelete} className="btn-link text-danger">Xóa</button>
        </div>
    );
}
