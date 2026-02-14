import type { Metadata } from "next";
import { Titillium_Web } from "next/font/google";
import "./globals.css";
import { Providers } from '@/components/Providers';
import ProductDebugInfo from '@/components/debug/ProductDebugInfo';
import { OrganizationJsonLd, WebSiteJsonLd, LocalBusinessJsonLd } from '@/components/seo/JsonLd';

const titillium = Titillium_Web({
  weight: ["200", "300", "400", "600", "700", "900"],
  subsets: ["latin"],
  variable: "--font-titillium-web",
  display: "swap",
});

export const metadata: Metadata = {
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
  },
  openGraph: {
    title: "Go Nuts - Hạt dinh dưỡng, Thực phẩm sạch từ nông dân Việt Nam",
    description: "Cửa hàng hạt dinh dưỡng, trái cây sấy, thực phẩm sạch từ 5000+ nông dân Việt Nam. Giao hàng toàn quốc.",
    url: "https://gonuts.vn",
    siteName: "Go Nuts",
    images: [
      {
        url: "https://gonuts.vn/assets/images/gonuts-banner-member.png?v=5",
        width: 1200,
        height: 630,
        alt: "Go Nuts - Hạt dinh dưỡng, Thực phẩm sạch",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Go Nuts - Hạt dinh dưỡng, Thực phẩm sạch",
    description: "Cửa hàng hạt dinh dưỡng, trái cây sấy, thực phẩm sạch từ 5000+ nông dân Việt Nam. Giao hàng toàn quốc.",
    images: ["https://gonuts.vn/assets/images/gonuts-banner-member.png?v=5"],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png', sizes: '32x32' },
      { url: '/android-chrome-192x192.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  themeColor: '#9C7043',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={titillium.variable}>
        <OrganizationJsonLd />
        <WebSiteJsonLd />
        <LocalBusinessJsonLd />
        <Providers>
          {children}
          {process.env.NODE_ENV === 'development' && <ProductDebugInfo />}
        </Providers>
      </body>
    </html>
  );
}
