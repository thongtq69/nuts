'use client';

import React, { useState, useEffect } from 'react';

interface QuantitySelectorProps {
    value?: number;
    onChange?: (val: number) => void;
}

export default function QuantitySelector({ value: controlledValue, onChange }: QuantitySelectorProps) {
    const [internalValue, setInternalValue] = useState(1);
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : internalValue;

    const handleChange = (newVal: number) => {
        if (newVal < 1) return;
        if (!isControlled) {
            setInternalValue(newVal);
        }
        onChange?.(newVal);
    };

    return (
        <div className="quantity-selector">
            <button onClick={() => handleChange(value - 1)} className="qty-btn">-</button>
            <input type="text" value={value} readOnly className="qty-input" />
            <button onClick={() => handleChange(value + 1)} className="qty-btn">+</button>

            <style jsx>{`
        .quantity-selector {
            display: flex;
            align-items: center;
            border: 1px solid #ddd;
            border-radius: 4px;
            width: fit-content;
        }
        .qty-btn {
            width: 30px;
            height: 30px;
            background: #f5f5f5;
            border: none;
            cursor: pointer;
            font-size: 16px;
            color: #333;
        }
        .qty-btn:hover {
            background: #e5e5e5;
        }
        .qty-input {
            width: 40px;
            height: 30px;
            text-align: center;
            border: none;
            border-left: 1px solid #ddd;
            border-right: 1px solid #ddd;
            font-size: 14px;
            color: #333;
        }
      `}</style>
        </div>
    );
}
