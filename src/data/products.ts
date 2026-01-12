export interface Product {
    id: number;
    image: string;
    name: string;
    currentPrice: string;
    originalPrice: string;
    priceValue: number; // Helper for sorting/cart
    badgeText: string;
    badgeColor?: 'red' | 'green' | 'pink' | '';
    buttonColor?: 'green' | 'pink' | '';
    priceColor?: 'pink' | '';
    category: string;
    tags: string[];
    description: string;
    images: string[]; // For gallery
}

export const products: Product[] = [
    // Best Sellers
    {
        id: 1,
        image: '/assets/images/product1.jpg',
        name: 'Farmley Panchmeva',
        currentPrice: 'From Rs. 345.00',
        originalPrice: 'Rs. 400.00',
        priceValue: 345,
        badgeText: 'Save Rs. 55.00',
        badgeColor: '',
        category: 'Jars',
        tags: ['best-seller', 'promo'],
        description: 'A premium blend of 5 healthy nuts and dried fruits. Perfect for snacking or gifting.',
        images: ['/assets/images/product1.jpg', '/assets/images/product1.jpg']
    },
    {
        id: 2,
        image: '/assets/images/product2.jpg',
        name: 'Farmley Berry Mix',
        currentPrice: 'From Rs. 345.00',
        originalPrice: 'Rs. 400.00',
        priceValue: 345,
        badgeText: 'Save Rs. 55.00',
        badgeColor: '',
        category: 'Bags',
        tags: ['best-seller', 'new'],
        description: 'A delicious mix of dried berries. High in antioxidants and great taste.',
        images: ['/assets/images/product2.jpg', '/assets/images/product2.jpg']
    },
    {
        id: 3,
        image: '/assets/images/product1.jpg',
        name: 'Farmley Panchmeva Special',
        currentPrice: 'From Rs. 345.00',
        originalPrice: 'Rs. 400.00',
        priceValue: 345,
        badgeText: 'Save Rs. 55.00',
        badgeColor: 'red',
        category: 'Jars',
        tags: ['best-seller'],
        description: 'Special edition Panchmeva with extra almonds.',
        images: ['/assets/images/product1.jpg', '/assets/images/product1.jpg']
    },
    {
        id: 4,
        image: '/assets/images/product2.jpg',
        name: 'Farmley Berry Mix Large',
        currentPrice: 'From Rs. 345.00',
        originalPrice: 'Rs. 400.00',
        priceValue: 345,
        badgeText: 'Save Rs. 55.00',
        badgeColor: 'red',
        category: 'Bags',
        tags: ['best-seller'],
        description: 'Large pack for the whole family.',
        images: ['/assets/images/product2.jpg', '/assets/images/product2.jpg']
    },
    {
        id: 5,
        image: '/assets/images/product1.jpg',
        name: 'Farmley Panchmeva Green',
        currentPrice: 'From Rs. 345.00',
        originalPrice: 'Rs. 400.00',
        priceValue: 345,
        badgeText: 'Save Rs. 55.00',
        badgeColor: 'green',
        buttonColor: 'green',
        category: 'Jars',
        tags: ['best-seller', 'new'],
        description: 'Organically sourced ingredients.',
        images: ['/assets/images/product1.jpg', '/assets/images/product1.jpg']
    },
    {
        id: 6,
        image: '/assets/images/product2.jpg',
        name: 'Farmley Berry Mix Pink',
        currentPrice: 'From Rs. 345.00',
        originalPrice: 'Rs. 400.00',
        priceValue: 345,
        badgeText: 'Save Rs. 55.00',
        badgeColor: 'pink',
        buttonColor: 'pink',
        priceColor: 'pink',
        category: 'Bags',
        tags: ['best-seller', 'promo'],
        description: 'Limited pink edition packaging.',
        images: ['/assets/images/product2.jpg', '/assets/images/product2.jpg']
    },

    // New Products (Using some overlaps but different badge configs in real DB? simplified here)
    {
        id: 7,
        image: '/assets/images/product1.jpg',
        name: 'Roasted Almonds',
        currentPrice: 'From Rs. 500.00',
        originalPrice: 'Rs. 600.00',
        priceValue: 500,
        badgeText: 'New Arrival',
        badgeColor: 'red',
        category: 'Nuts',
        tags: ['new'],
        description: 'Freshly roasted almonds with a hint of salt.',
        images: ['/assets/images/product1.jpg']
    },
    {
        id: 8,
        image: '/assets/images/product2.jpg',
        name: 'Dried Cranberries',
        currentPrice: 'From Rs. 200.00',
        originalPrice: 'Rs. 250.00',
        priceValue: 200,
        badgeText: 'Save 20%',
        badgeColor: '',
        category: 'Berries',
        tags: ['new', 'promo'],
        description: 'Sweet and tangy dried cranberries.',
        images: ['/assets/images/product2.jpg']
    },
    {
        id: 9,
        image: '/assets/images/product1.jpg',
        name: 'Walnut Kernels',
        currentPrice: 'From Rs. 800.00',
        originalPrice: 'Rs. 1000.00',
        priceValue: 800,
        badgeText: 'Premium',
        badgeColor: '',
        category: 'Nuts',
        tags: ['new'],
        description: 'High quality walnut kernels.',
        images: ['/assets/images/product1.jpg']
    },
    {
        id: 10,
        image: '/assets/images/product2.jpg',
        name: 'Mixed Seeds',
        currentPrice: 'From Rs. 150.00',
        originalPrice: 'Rs. 200.00',
        priceValue: 150,
        badgeText: 'Healthy',
        badgeColor: '',
        category: 'Seeds',
        tags: ['new'],
        description: 'A mix of pumpkin, sunflower, and chia seeds.',
        images: ['/assets/images/product2.jpg']
    }
];
