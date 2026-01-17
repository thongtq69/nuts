import { IProduct } from '@/models/Product';

// Use relative URL for same-origin requests in production
const getApiUrl = () => {
    if (typeof window !== 'undefined') {
        // Client-side: use relative URL
        return '/api';
    }
    
    // Server-side: use full URL
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}/api`;
    }
    
    if (process.env.NEXT_PUBLIC_VERCEL_URL) {
        return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/api`;
    }
    
    if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL;
    }
    
    // For production, try to construct URL from headers or use relative
    if (process.env.NODE_ENV === 'production') {
        // Use relative URL for same-origin requests
        return '/api';
    }
    
    return 'http://localhost:3000/api';
};

export async function getProducts(category?: string, query?: string): Promise<IProduct[]> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (query) params.append('q', query);

    const apiUrl = getApiUrl();
    const url = `${apiUrl}/products?${params.toString()}`;
    
    console.log('🔍 Fetching products from:', url);

    try {
        const res = await fetch(url, {
            cache: 'no-store', // Dynamic data
            headers: {
                'Content-Type': 'application/json',
            }
        });

        console.log('📡 Products API Response:', res.status, res.statusText);

        if (!res.ok) {
            const errorText = await res.text();
            console.error('❌ Products API Error Response:', errorText);
            throw new Error(`Failed to fetch products: ${res.status} ${res.statusText}`);
        }

        const products = await res.json();
        console.log(`✅ Products fetched successfully: ${products.length} items`);
        
        return products;
    } catch (error: any) {
        console.error('❌ Error fetching products:', error.message);
        return [];
    }
}

export async function getProductById(id: string): Promise<IProduct | null> {
    const apiUrl = getApiUrl();
    const url = `${apiUrl}/products/${id}`;
    
    console.log('🔍 Fetching product by ID from:', url);
    
    try {
        const res = await fetch(url, {
            cache: 'no-store'
        });

        console.log('📡 Product API Response:', res.status, res.statusText);

        if (!res.ok) {
            console.error('❌ Product not found or API error');
            return null;
        }

        const product = await res.json();
        console.log('✅ Product fetched successfully:', product.name);
        
        return product;
    } catch (error: any) {
        console.error('❌ Error fetching product by ID:', error.message);
        return null;
    }
}
