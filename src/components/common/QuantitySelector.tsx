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

            <style jsx>{`
        .quantity-selector {
            display: flex;
            align-items: center;
            border: 1px solid #ddd;
            border-radius: 4px;
            width: fit-content;
        }
        .qty-btn {
            width: 36px;
            height: 40px;
            background: #f5f5f5;
            border: none;
            cursor: pointer;
            font-size: 18px;
            color: #333;
            transition: background 0.2s;
        }
        .qty-btn:hover:not(:disabled) {
            background: #e5e5e5;
        }
        .qty-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        .qty-input {
            width: 60px;
            height: 40px;
            text-align: center;
            border: none;
            border-left: 1px solid #ddd;
            border-right: 1px solid #ddd;
            font-size: 16px;
            color: #333;
            -moz-appearance: textfield;
        }
        .qty-input::-webkit-outer-spin-button,
        .qty-input::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }
      `}</style>
        </div>
    );
}
