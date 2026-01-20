'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';

interface ProductGalleryProps {
    images: string[];
    productName?: string;
}

export default function ProductGallery({ images, productName = 'Product' }: ProductGalleryProps) {
    const validImages = useMemo(() => {
        return images && images.length > 0 ? images : ['/assets/images/product1.jpg'];
    }, [images]);

    const [activeIndex, setActiveIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const imageContainerRef = useRef<HTMLDivElement>(null);

    const activeImage = validImages[activeIndex] || validImages[0];

    // Reset active index when images change
    useEffect(() => {
        setActiveIndex(0);
    }, [validImages]);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                handlePrev();
            } else if (e.key === 'ArrowRight') {
                handleNext();
            } else if (e.key === 'Escape') {
                setIsZoomed(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeIndex, validImages.length]);

    const handlePrev = useCallback(() => {
        setActiveIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
    }, [validImages.length]);

    const handleNext = useCallback(() => {
        setActiveIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
    }, [validImages.length]);

    // Touch handlers for swipe
    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const minSwipeDistance = 50;
        
        if (Math.abs(distance) > minSwipeDistance) {
            if (distance > 0) {
                handleNext();
            } else {
                handlePrev();
            }
        }
    };

    // Zoom handlers
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isZoomed || !imageContainerRef.current) return;
        
        const rect = imageContainerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        setZoomPosition({ x, y });
    };

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.src = '/assets/images/product1.jpg';
    };

    return (
        <div className="product-gallery-modern">
            {/* Main Image Container */}
            <div 
                ref={imageContainerRef}
                className={`main-image-container ${isZoomed ? 'zoomed' : ''}`}
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div 
                    className="main-image-wrapper"
                    style={isZoomed ? {
                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                        transform: 'scale(2)'
                    } : undefined}
                >
                    <img
                        src={activeImage}
                        alt={`${productName} - ${activeIndex + 1}`}
                        onError={handleImageError}
                        className="main-product-image"
                        draggable={false}
                    />
                </div>

                {/* Navigation Arrows */}
                {validImages.length > 1 && (
                    <>
                        <button 
                            className="gallery-nav-btn prev"
                            onClick={handlePrev}
                            aria-label="Previous image"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>
                        <button 
                            className="gallery-nav-btn next"
                            onClick={handleNext}
                            aria-label="Next image"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </button>
                    </>
                )}

                {/* Image Counter */}
                {validImages.length > 1 && (
                    <div className="image-counter">
                        {activeIndex + 1} / {validImages.length}
                    </div>
                )}

                {/* Zoom Hint */}
                <div className="zoom-hint">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <path d="M21 21l-4.35-4.35" />
                        <path d="M11 8v6M8 11h6" />
                    </svg>
                    <span>Di chuot de zoom</span>
                </div>
            </div>

            {/* Thumbnail List */}
            {validImages.length > 1 && (
                <div className="thumbnail-container">
                    <div className="thumbnail-list-modern">
                        {validImages.map((img, index) => (
                            <button
                                key={index}
                                className={`thumbnail-item ${activeIndex === index ? 'active' : ''}`}
                                onClick={() => setActiveIndex(index)}
                                aria-label={`View image ${index + 1}`}
                            >
                                <img
                                    src={img}
                                    alt={`${productName} thumbnail ${index + 1}`}
                                    onError={handleImageError}
                                    draggable={false}
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
