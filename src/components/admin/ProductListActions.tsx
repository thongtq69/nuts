'use client';

import Link from 'next/link';

export default function ProductListActions({ productId }: { productId: string }) {
    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            const res = await fetch(`/api/products/${productId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                window.location.reload();
            } else {
                alert('Failed to delete product');
            }
        } catch (error) {
            console.error(error);
            alert('Error deleting product');
        }
    };

    return (
        <div className="actions">
            <Link href={`/admin/products/${productId}`} className="btn-link">Edit</Link>
            <button onClick={handleDelete} className="btn-link text-danger">Delete</button>

            <style jsx>{`
                .actions { display: flex; gap: 10px; }
                .btn-link {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #3498db;
                    font-size: 14px;
                    padding: 0;
                    text-decoration: underline;
                }
                .text-danger { color: #e74c3c; }
            `}</style>
        </div>
    );
}
