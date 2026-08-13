'use client';

import Link from 'next/link';
import { useLocale } from '@/context/LocaleContext';

interface BreadcrumbProps {
  items: { label: string; href?: string }[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const { t, href } = useLocale();
  return (
    <div className="breadcrumb">
      <div className="container">
        <ul className="breadcrumb-list">
          {items.map((item, index) => (
            <li key={index} className="breadcrumb-item">
              {item.href ? (
                <Link href={href(item.href)}>{t(item.label)}</Link>
              ) : (
                <span>{t(item.label)}</span>
              )}
              {index < items.length - 1 && <span className="separator">/</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
