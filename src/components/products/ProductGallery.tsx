'use client';

import React, { useState } from 'react';

interface ProductGalleryProps {
    images: string[];
}

export default function ProductGallery({ images }: ProductGalleryProps) {
    const validImages = images && images.length > 0 ? images : ['/assets/images/product1.jpg'];
    const [activeImage, setActiveImage] = useState(validImages[0]);

    return (
        <div className="product-gallery">
            <div className="main-image">
                <img 
                    src={activeImage} 
                    alt="Product Detail"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/images/product1.jpg';
                    }}
                />
            </div>
            {validImages.length > 1 && (
                <div className="thumbnail-list">
                    {validImages.map((img, index) => (
                        <div
                            key={index}
                            className={`thumbnail ${activeImage === img ? 'active' : ''}`}
                            onClick={() => setActiveImage(img)}
                        >
                            <img 
                                src={img} 
                                alt={`Thumbnail ${index}`}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/assets/images/product1.jpg';
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
