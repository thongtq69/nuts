'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    className?: string;
    disabled?: boolean;
    name?: string;
    id?: string;
}

export default function PasswordInput({
    value,
    onChange,
    placeholder = "Nhập mật khẩu",
    required = false,
    className = "",
    disabled = false,
    name,
    id
}: PasswordInputProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className={`password-input-container ${className}`}>
            <input
                type={showPassword ? "text" : "password"}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                name={name}
                id={id}
            />
            <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={disabled}
                tabIndex={-1}
            >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
        </div>
    );
}