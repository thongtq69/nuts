'use client';

import React, { useState, useEffect, useCallback } from 'react';

import { heroSlides } from '@/data/banners';

const slides = heroSlides;

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
