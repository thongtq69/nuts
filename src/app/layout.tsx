import type { Metadata } from "next";
import { Titillium_Web } from "next/font/google";
import "./globals.css";
import { Providers } from '@/components/Providers';
import ProductDebugInfo from '@/components/debug/ProductDebugInfo';

const titillium = Titillium_Web({
  weight: ["200", "300", "400", "600", "700", "900"],
  subsets: ["latin"],
  variable: "--font-titillium-web",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Go Nuts - Thực phẩm sạch, dinh dưỡng",
  description: "Go Nuts - Cửa hàng thực phẩm sạch, dinh dưỡng từ 5000+ nông dân Việt Nam",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={titillium.variable}>
        <Providers>
          {children}
          {process.env.NODE_ENV === 'development' && <ProductDebugInfo />}
        </Providers>
      </body>
    </html>
  );
}
