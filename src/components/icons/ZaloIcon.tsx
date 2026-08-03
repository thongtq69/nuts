interface ZaloIconProps {
    size?: number;
    className?: string;
}

export default function ZaloIcon({ size = 28, className = '' }: ZaloIconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-hidden="true"
        >
            <rect width="32" height="32" rx="10" fill="#0068FF" />
            <path
                d="M7 8.5C7 7.12 8.12 6 9.5 6h13C23.88 6 25 7.12 25 8.5v9.75c0 1.38-1.12 2.5-2.5 2.5h-6.2l-4.86 4.04c-.65.54-1.64.08-1.64-.77v-3.27h-.3A2.5 2.5 0 0 1 7 18.25V8.5Z"
                fill="white"
            />
            <text
                x="16"
                y="16.4"
                fill="#0068FF"
                fontSize="7.1"
                fontWeight="800"
                textAnchor="middle"
                fontFamily="Arial, sans-serif"
                letterSpacing="-.25"
            >
                Zalo
            </text>
        </svg>
    );
}
