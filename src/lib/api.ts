import { IProduct } from '@/models/Product';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export async function getProducts(category?: string, query?: string): Promise<IProduct[]> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (query) params.append('q', query);

    try {
        const res = await fetch(`${API_URL}/products?${params.toString()}`, {
            cache: 'no-store' // Dynamic data
        });

        if (!res.ok) {
            throw new Error('Failed to fetch products');
        }

        return res.json();
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

export async function getProductById(id: string): Promise<IProduct | null> {
    try {
        // Since we are moving to API, we might need a dedicated single product endpoint or filter by ID on list
        // Let's assume we have a list for now, or filter client side if list is small.
        // Better: Implement GET /api/products/[id]
        const res = await fetch(`${API_URL}/products/${id}`, {
            cache: 'no-store'
        });

        if (!res.ok) return null;

        return res.json();
    } catch (error) {
        console.log('Error fetching product by ID', error);
        return null;
    }
}
