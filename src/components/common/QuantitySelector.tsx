'use client';

import React, { useState, useEffect } from 'react';

interface QuantitySelectorProps {
    value?: number;
    onChange?: (val: number) => void;
    min?: number;
    max?: number;
}

export default function QuantitySelector({ value: controlledValue, onChange, min = 1, max = 999 }: QuantitySelectorProps) {
    const [internalValue, setInternalValue] = useState(1);
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : internalValue;

    const handleChange = (newVal: number) => {
        if (newVal < min) newVal = min;
        if (newVal > max) newVal = max;
        if (!isControlled) {
            setInternalValue(newVal);
        }
        onChange?.(newVal);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputVal = e.target.value;
        // Allow empty input temporarily
        if (inputVal === '') {
            if (!isControlled) {
                setInternalValue(min);
            }
            return;
        }
        const numVal = parseInt(inputVal, 10);
        if (!isNaN(numVal)) {
            handleChange(numVal);
        }
    };

    const handleBlur = () => {
        // Ensure value is at least min on blur
        if (value < min) {
            handleChange(min);
        }
    };

    return (
        <div className="quantity-selector">
            <button 
                onClick={() => handleChange(value - 1)} 
                className="qty-btn"
                disabled={value <= min}
            >
                -
            </button>
            <input 
                type="number" 
                value={value} 
                onChange={handleInputChange}
                onBlur={handleBlur}
                className="qty-input"
                min={min}
                max={max}
            />
            <button 
                onClick={() => handleChange(value + 1)} 
                className="qty-btn"
                disabled={value >= max}
            >
                +
            </button>
        </div>
    );
}
