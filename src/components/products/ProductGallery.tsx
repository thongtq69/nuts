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

            <style jsx>{`
        .product-gallery {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        .main-image {
            background: #E3E846;
            border-radius: 8px;
            padding: 40px;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            box-sizing: border-box;
        }
        .main-image img {
            max-width: 100%;
            height: auto;
            max-height: 450px;
            object-fit: contain;
        }
        .thumbnail-list {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        .thumbnail {
            width: 80px;
            height: 80px;
            border: 1px solid #ddd;
            border-radius: 6px;
            padding: 5px;
            cursor: pointer;
            opacity: 0.6;
            transition: all 0.2s;
        }
        .thumbnail.active {
            border-color: var(--color-primary-brown);
            opacity: 1;
        }
        .thumbnail:hover {
            opacity: 1;
        }
        .thumbnail img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
      `}</style>
        </div>
    );
}
