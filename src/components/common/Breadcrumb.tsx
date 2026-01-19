'use client';

import Link from 'next/link';

interface BreadcrumbProps {
  items: { label: string; href?: string }[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <div className="breadcrumb">
      <div className="container">
        <ul className="breadcrumb-list">
          {items.map((item, index) => (
            <li key={index} className="breadcrumb-item">
              {item.href ? (
                <Link href={item.href}>{item.label}</Link>
              ) : (
                <span>{item.label}</span>
              )}
              {index < items.length - 1 && <span className="separator">/</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
