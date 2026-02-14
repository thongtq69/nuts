import React from 'react';

const BASE_URL = 'https://gonuts.vn';

// ========== Organization Schema ==========
export function OrganizationJsonLd() {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Go Nuts',
        url: BASE_URL,
        logo: `${BASE_URL}/android-chrome-512x512.png`,
        description: 'Go Nuts - Cửa hàng thực phẩm sạch, dinh dưỡng từ 5000+ nông dân Việt Nam. Hạt dinh dưỡng, trái cây sấy, combo quà tặng.',
        address: {
            '@type': 'PostalAddress',
            streetAddress: 'Tầng 4, VT1-B09, Khu đô thị mới An Hưng, Phường Dương Nội',
            addressLocality: 'Hà Nội',
            addressCountry: 'VN',
        },
        contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+84-96-118-5753',
            contactType: 'customer service',
            availableLanguage: ['Vietnamese'],
        },
        sameAs: [
            'https://www.facebook.com/profile.php?id=61572944004088',
        ],
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// ========== WebSite Schema (for Sitelinks Search Box) ==========
export function WebSiteJsonLd() {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Go Nuts',
        url: BASE_URL,
        description: 'Cửa hàng thực phẩm sạch, dinh dưỡng từ 5000+ nông dân Việt Nam',
        inLanguage: 'vi',
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// ========== BreadcrumbList Schema ==========
interface BreadcrumbItem {
    name: string;
    url?: string;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            ...(item.url ? { item: item.url } : {}),
        })),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// ========== Product Schema ==========
interface ProductJsonLdProps {
    name: string;
    description: string;
    image: string | string[];
    price: number;
    originalPrice?: number;
    currency?: string;
    availability?: 'InStock' | 'OutOfStock' | 'LimitedAvailability';
    sku?: string;
    rating?: number;
    reviewCount?: number;
    url: string;
}

export function ProductJsonLd({
    name,
    description,
    image,
    price,
    originalPrice,
    currency = 'VND',
    availability = 'InStock',
    sku,
    rating,
    reviewCount,
    url,
}: ProductJsonLdProps) {
    const schema: any = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name,
        description,
        image: Array.isArray(image) ? image : [image],
        url,
        brand: {
            '@type': 'Brand',
            name: 'Go Nuts',
        },
        offers: {
            '@type': 'Offer',
            price: price,
            priceCurrency: currency,
            availability: `https://schema.org/${availability}`,
            seller: {
                '@type': 'Organization',
                name: 'Go Nuts',
            },
            url,
        },
    };

    if (sku) {
        schema.sku = sku;
    }

    if (rating && reviewCount) {
        schema.aggregateRating = {
            '@type': 'AggregateRating',
            ratingValue: rating,
            reviewCount: reviewCount,
            bestRating: 5,
            worstRating: 1,
        };
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// ========== Article Schema (for Blog/News) ==========
interface ArticleJsonLdProps {
    title: string;
    description: string;
    image?: string;
    datePublished: string;
    dateModified?: string;
    author?: string;
    url: string;
}

export function ArticleJsonLd({
    title,
    description,
    image,
    datePublished,
    dateModified,
    author = 'Go Nuts',
    url,
}: ArticleJsonLdProps) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: title,
        description,
        image: image || `${BASE_URL}/assets/images/gonuts-banner-member.png`,
        datePublished,
        dateModified: dateModified || datePublished,
        author: {
            '@type': 'Organization',
            name: author,
            url: BASE_URL,
        },
        publisher: {
            '@type': 'Organization',
            name: 'Go Nuts',
            logo: {
                '@type': 'ImageObject',
                url: `${BASE_URL}/android-chrome-512x512.png`,
            },
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': url,
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// ========== FAQ Schema ==========
interface FAQItem {
    question: string;
    answer: string;
}

export function FAQJsonLd({ items }: { items: FAQItem[] }) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: items.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
            },
        })),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// ========== LocalBusiness Schema ==========
export function LocalBusinessJsonLd() {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Store',
        name: 'Go Nuts - Thực phẩm sạch, dinh dưỡng',
        image: `${BASE_URL}/android-chrome-512x512.png`,
        url: BASE_URL,
        telephone: '+84-96-118-5753',
        email: 'contact.gonuts@gmail.com',
        address: {
            '@type': 'PostalAddress',
            streetAddress: 'Tầng 4, VT1-B09, Khu đô thị mới An Hưng, Phường Dương Nội',
            addressLocality: 'Hà Nội',
            addressCountry: 'VN',
        },
        geo: {
            '@type': 'GeoCoordinates',
            latitude: 20.9725,
            longitude: 105.7348,
        },
        openingHoursSpecification: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            opens: '08:00',
            closes: '17:30',
        },
        priceRange: '₫₫',
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
