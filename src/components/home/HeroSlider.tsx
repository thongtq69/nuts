'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface Banner {
    _id: string;
    title: string;
    imageUrl: string;
    link?: string;
    isActive: boolean;
    order: number;
}

export default function HeroSlider() {
    const [slides, setSlides] = useState<Banner[]>([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [loading, setLoading] = useState(true);

    // Fetch banners from API
    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const response = await fetch('/api/banners/active');
                const activeBanners = await response.json();
                setSlides(activeBanners);
            } catch (error) {
                console.error('Error fetching banners:', error);
                // Fallback to empty array if API fails
                setSlides([]);
            } finally {
                setLoading(false);
            }
        };

        fetchBanners();
    }, []);

    const nextSlide = useCallback(() => {
        if (slides.length > 0) {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }
    }, [slides.length]);

    useEffect(() => {
        if (isPaused || slides.length === 0) return;
        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, [isPaused, nextSlide, slides.length]);

    // Show loading state
    if (loading) {
        return (
            <section className="hero-slider">
                <div className="slider-container">
                    <div className="slides">
                        <div className="slide active">
                            <div className="w-full h-full bg-gradient-to-r from-slate-200 to-slate-300 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <div className="text-slate-600 font-medium">Đang tải banner...</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    // Show message if no active banners
    if (slides.length === 0) {
        return (
            <section className="hero-slider">
                <div className="slider-container">
                    <div className="slides">
                        <div className="slide active">
                            <div className="w-full h-full bg-gradient-to-r from-amber-50 to-orange-50 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-6xl mb-4">🖼️</div>
                                    <div className="text-slate-600 font-medium text-lg">Chưa có banner nào được hiển thị</div>
                                    <div className="text-slate-500 text-sm mt-2">Vui lòng thêm banner trong trang quản trị</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section
            className="hero-slider"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="slider-container">
                <div className="slides">
                    {slides.map((slide, index) => (
                        <div
                            key={slide._id}
                            className={`slide ${index === currentSlide ? 'active' : ''}`}
                        >
                            {slide.link ? (
                                <a href={slide.link} target="_blank" rel="noopener noreferrer">
                                    <img 
                                        src={slide.imageUrl} 
                                        alt={slide.title}
                                        onError={(e) => {
                                            console.error(`Failed to load banner image: ${slide.imageUrl}`);
                                            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1200" height="400"%3E%3Crect fill="%23f1f5f9" width="1200" height="400"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-size="24"%3EBanner không tải được%3C/text%3E%3C/svg%3E';
                                        }}
                                    />
                                </a>
                            ) : (
                                <img 
                                    src={slide.imageUrl} 
                                    alt={slide.title}
                                    onError={(e) => {
                                        console.error(`Failed to load banner image: ${slide.imageUrl}`);
                                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1200" height="400"%3E%3Crect fill="%23f1f5f9" width="1200" height="400"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-size="24"%3EBanner không tải được%3C/text%3E%3C/svg%3E';
                                    }}
                                />
                            )}
                        </div>
                    ))}
                </div>
                {slides.length > 1 && (
                    <div className="slider-dots">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                className={`dot ${index === currentSlide ? 'active' : ''}`}
                                onClick={() => setCurrentSlide(index)}
                                data-slide={index}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
