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
    description: string;
    images: string[]; // For gallery
}

export const products: Product[] = [
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
        description: 'Limited pink edition packaging.',
        images: ['/assets/images/product2.jpg', '/assets/images/product2.jpg']
    }
];
