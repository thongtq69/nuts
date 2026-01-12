import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Link from 'next/link';
import ProductListActions from '@/components/admin/ProductListActions';

async function getProducts() {
    await dbConnect();
    const products = await Product.find({}).sort({ createdAt: -1 });
    return products.map((p) => ({
        id: p._id.toString(),
        name: p.name,
        currentPrice: p.currentPrice,
        category: p.category,
        image: p.image,
    }));
}

export default async function AdminProductsPage() {
    const products = await getProducts();

    return (
        <div>
            <div className="page-header">
                <h1>Products</h1>
                <Link href="/admin/products/new" className="btn btn-primary">
                    + Add New Product
                </Link>
            </div>

            <div className="card">
                <table>
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product.id}>
                                <td>
                                    <img src={product.image} alt={product.name} width="50" style={{ borderRadius: '4px' }} />
                                </td>
                                <td>{product.name}</td>
                                <td>{product.category || '-'}</td>
                                <td>{product.currentPrice.toLocaleString()}đ</td>
                                <td>
                                    <ProductListActions productId={product.id} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <style jsx>{`
                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
            `}</style>
        </div>
    );
}
