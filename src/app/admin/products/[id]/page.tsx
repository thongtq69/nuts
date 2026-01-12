import ProductForm from '@/components/admin/ProductForm';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { notFound } from 'next/navigation';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    await dbConnect();
    const product = await Product.findById(id).lean();

    if (!product) {
        notFound();
    }

    // Serialize MongoDB object to plain JSON object
    const p = {
        ...product,
        _id: product._id.toString(),
        id: product._id.toString(),
        createdAt: product.createdAt?.toISOString(),
        updatedAt: product.updatedAt?.toISOString()
    };

    return (
        <div>
            <h1>Edit Product</h1>
            <ProductForm initialData={p} isEdit={true} />
        </div>
    );
}
