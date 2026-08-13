import type { Metadata, Viewport } from "next";
import { headers } from 'next/headers';
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Providers } from '@/components/Providers';
import ProductDebugInfo from '@/components/debug/ProductDebugInfo';
import { OrganizationJsonLd, WebSiteJsonLd, LocalBusinessJsonLd } from '@/components/seo/JsonLd';
import { LOCALE_HEADER, normalizeLocale } from '@/i18n/config';

const montserrat = Montserrat({
  weight: "variable",
  subsets: ["latin", "vietnamese"],
  variable: "--font-montserrat",
  display: "swap",
});

const sharedMetadata: Metadata = {
  metadataBase: new URL("https://gonuts.vn"),
  title: {
    default: "Go Nuts - Hạt dinh dưỡng, Thực phẩm sạch từ nông dân Việt Nam",
    template: "%s | Go Nuts",
  },
  description: "Go Nuts - Cửa hàng hạt dinh dưỡng, trái cây sấy, thực phẩm sạch từ 5000+ nông dân Việt Nam. Giao hàng toàn quốc, cam kết 100% tự nhiên.",
  keywords: [
    "hạt dinh dưỡng",
    "thực phẩm sạch",
    "trái cây sấy",
    "hạt macadamia",
    "hạt óc chó",
    "hạt hạnh nhân",
    "hạt điều",
    "combo quà tặng",
    "Go Nuts",
    "gonuts",
    "thực phẩm dinh dưỡng",
    "nông sản Việt Nam",
    "mua hạt dinh dưỡng online",
    "hạt dinh dưỡng giá tốt",
    "hạt mix tổng hợp",
    "snack healthy",
  ],
  authors: [{ name: "Go Nuts", url: "https://gonuts.vn" }],
  creator: "Go Nuts",
  publisher: "Go Nuts",
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  alternates: {
    canonical: "https://gonuts.vn",
    languages: {
      'vi-VN': 'https://gonuts.vn',
      'en-US': 'https://gonuts.vn/en',
      'x-default': 'https://gonuts.vn',
    },
  },
  openGraph: {
    title: "Go Nuts - Hạt dinh dưỡng, Thực phẩm sạch từ nông dân Việt Nam",
    description: "Cửa hàng hạt dinh dưỡng, trái cây sấy, thực phẩm sạch từ 5000+ nông dân Việt Nam. Giao hàng toàn quốc.",
    url: "https://gonuts.vn",
    siteName: "Go Nuts",
    images: [
      {
        url: "https://gonuts.vn/og-gonuts-logo.png?v=20260731-1",
        width: 1200,
        height: 630,
        alt: "Logo chính thức Go Nuts",
        type: "image/png",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Go Nuts - Hạt dinh dưỡng, Thực phẩm sạch",
    description: "Cửa hàng hạt dinh dưỡng, trái cây sấy, thực phẩm sạch từ 5000+ nông dân Việt Nam. Giao hàng toàn quốc.",
    images: ["https://gonuts.vn/og-gonuts-logo.png?v=20260731-1"],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon.png', type: 'image/png', sizes: '32x32' },
      { url: '/android-chrome-192x192.png', type: 'image/png', sizes: '192x192' },
      { url: '/android-chrome-512x512.png', type: 'image/png', sizes: '512x512' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/apple-icon.png',
      },
    ],
  },
  manifest: '/site.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Go Nuts',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Để trang web xuất hiện trên Google, bạn hãy:
    // 1. Truy cập https://search.google.com/search-console
    // 2. Thêm domain gonuts.vn
    // 3. Lấy mã xác thực (google-site-verification) và dán vào bên dưới:
    google: '8v1_6fcPtr0f5v1X5Of7_WMLITdVKJBCru84nbbuOhg',
    // facebook: 'your-facebook-domain-verification',
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const locale = normalizeLocale(requestHeaders.get(LOCALE_HEADER));
  if (locale === 'vi') return sharedMetadata;

  return {
    ...sharedMetadata,
    title: {
      default: 'Go Nuts - Premium Nuts & Natural Foods from Vietnamese Farmers',
      template: '%s | Go Nuts',
    },
    description: 'Shop premium nuts, dried fruits and natural foods sourced from 5,000+ Vietnamese farmers. Nationwide delivery and 100% natural quality commitment.',
    keywords: [
      'premium nuts', 'healthy snacks', 'dried fruit', 'macadamia nuts', 'walnuts',
      'almonds', 'cashews', 'Vietnamese natural foods', 'healthy gift boxes', 'Go Nuts',
    ],
    alternates: {
      canonical: 'https://gonuts.vn/en',
      languages: {
        'vi-VN': 'https://gonuts.vn',
        'en-US': 'https://gonuts.vn/en',
        'x-default': 'https://gonuts.vn',
      },
    },
    openGraph: {
      ...sharedMetadata.openGraph,
      title: 'Go Nuts - Premium Nuts & Natural Foods from Vietnam',
      description: 'Premium nuts, dried fruits and natural foods sourced from 5,000+ Vietnamese farmers, delivered nationwide.',
      url: 'https://gonuts.vn/en',
      locale: 'en_US',
      alternateLocale: ['vi_VN'],
      images: [{
        url: 'https://gonuts.vn/og-gonuts-logo.png?v=20260731-1',
        width: 1200,
        height: 630,
        alt: 'Go Nuts official logo',
        type: 'image/png',
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Go Nuts - Premium Nuts & Natural Foods',
      description: 'Premium nuts, dried fruits and natural foods from 5,000+ Vietnamese farmers.',
      images: ['https://gonuts.vn/og-gonuts-logo.png?v=20260731-1'],
    },
  };
}

export const viewport: Viewport = {
  themeColor: '#9C7043',
};


import Script from 'next/script';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const requestHeaders = await headers();
  const locale = normalizeLocale(requestHeaders.get(LOCALE_HEADER));

  return (
    <html lang={locale} className={`${montserrat.variable} font-sans`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
        {/* Google Analytics - G-KGQP8YG0B5 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-KGQP8YG0B5"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-KGQP8YG0B5');
          `}
        </Script>

        <Providers locale={locale}>
          <OrganizationJsonLd locale={locale} />
          <WebSiteJsonLd locale={locale} />
          <LocalBusinessJsonLd />
          {children}

          {process.env.NODE_ENV === 'development' && <ProductDebugInfo />}
        </Providers>
      </body>
    </html>
  );
}
