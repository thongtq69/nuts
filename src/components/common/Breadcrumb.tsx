'use client';

import Link from 'next/link';
import React from 'react';

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
      <style jsx>{`
        .breadcrumb {
          padding: 10px 0;
          background: #f5f5f5;
          font-size: 13px;
          margin-bottom: 30px;
        }
        .breadcrumb-list {
          display: flex;
          list-style: none;
        }
        .breadcrumb-item {
          color: #666;
          display: flex;
          align-items: center;
        }
        .breadcrumb-item a:hover {
          color: var(--color-primary-brown);
        }
        .separator {
          margin: 0 8px;
          color: #999;
        }
        .breadcrumb-item span {
            color: #333;
        }
      `}</style>
    </div>
  );
}
