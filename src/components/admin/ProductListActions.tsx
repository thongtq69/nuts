'use client';

import Link from 'next/link';

export default function ProductListActions({ productId }: { productId: string }) {
    const handleDelete = async () => {
        if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;

        try {
            const res = await fetch(`/api/products/${productId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                window.location.reload();
            } else {
                alert('Xóa sản phẩm thất bại');
            }
        } catch (error) {
            console.error(error);
            alert('Lỗi khi xóa sản phẩm');
        }
    };

    return (
        <div className="actions">
            <Link href={`/admin/products/${productId}`} className="btn-link">Sửa</Link>
            <button onClick={handleDelete} className="btn-link text-danger">Xóa</button>
        </div>
    );
}
