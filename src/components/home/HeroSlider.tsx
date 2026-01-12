'use client';

import React, { useState, useEffect, useCallback } from 'react';

const slides = [
    { id: 1, image: '/assets/images/slide1.jpg', alt: 'Wholesome Indulgence - Farmley Date Bites' },
    { id: 2, image: '/assets/images/slide1.jpg', alt: 'Banner 2' },
    { id: 3, image: '/assets/images/slide1.jpg', alt: 'Banner 3' },
    { id: 4, image: '/assets/images/slide1.jpg', alt: 'Banner 4' },
    { id: 5, image: '/assets/images/slide1.jpg', alt: 'Banner 5' },
];

export default function HeroSlider() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const nextSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, []);

    useEffect(() => {
        if (isPaused) return;
        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, [isPaused, nextSlide]);

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
                            key={slide.id}
                            className={`slide ${index === currentSlide ? 'active' : ''}`}
                        >
                            <img src={slide.image} alt={slide.alt} />
                        </div>
                    ))}
                </div>
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
            </div>
        </section>
    );
}
