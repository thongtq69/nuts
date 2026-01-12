'use client';

import React, { useState } from 'react';

interface ProductGalleryProps {
    images: string[];
}

export default function ProductGallery({ images }: ProductGalleryProps) {
    const [activeImage, setActiveImage] = useState(images[0]);

    return (
        <div className="product-gallery">
            <div className="main-image">
                <img src={activeImage} alt="Product Detail" />
            </div>
            <div className="thumbnail-list">
                {images.map((img, index) => (
                    <div
                        key={index}
                        className={`thumbnail ${activeImage === img ? 'active' : ''}`}
                        onClick={() => setActiveImage(img)}
                    >
                        <img src={img} alt={`Thumbnail ${index}`} />
                    </div>
                ))}
            </div>

            <style jsx>{`
        .product-gallery {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        .main-image {
            background: #f9f9f9;
            border: 1px solid #eee;
            border-radius: 8px;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .main-image img {
            max-width: 100%;
            height: auto;
            max-height: 400px;
            object-fit: contain;
        }
        .thumbnail-list {
            display: flex;
            gap: 10px;
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
