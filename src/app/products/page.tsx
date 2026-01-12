import { getProducts } from '@/lib/api';
import ProductList from '@/components/products/ProductList';

export const dynamic = 'force-dynamic'; // Since we are using API

export default async function ProductsPage() {
    const products = await getProducts();
    return <ProductList products={products} />;
}
