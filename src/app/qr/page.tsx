import type { Metadata } from 'next';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { getRequestLocale } from '@/i18n/server';

export const metadata: Metadata = {
  title: 'Mã QR website Go Nuts',
  description: 'Tải mã QR chính thức để quét và mở website Go Nuts tại https://gonuts.vn/.',
  alternates: { canonical: 'https://gonuts.vn/qr' },
};

export default async function WebsiteQrPage() {
  const isEnglish = (await getRequestLocale()) === 'en';

  return (
    <>
      <Header />
      <Navbar />
      <main className="min-h-[65vh] bg-[#fffaf4] px-4 py-12 sm:py-20">
        <div className="mx-auto max-w-3xl rounded-3xl border border-[#eadccf] bg-white p-6 text-center shadow-[0_20px_60px_rgba(60,42,26,0.08)] sm:p-12">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[#9c7044]">Go Nuts</p>
          <h1 className="text-2xl font-extrabold text-[#33271c] sm:text-4xl">
            {isEnglish ? 'Scan to visit Go Nuts' : 'Quét mã QR để vào website Go Nuts'}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#665747] sm:text-base">
            {isEnglish
              ? 'Point your phone camera at the code to open the official Go Nuts website directly.'
              : 'Mở camera điện thoại và quét mã để truy cập trực tiếp website chính thức của Go Nuts.'}
          </p>

          <div className="mx-auto mt-8 w-fit rounded-2xl border border-[#e9dfd5] bg-white p-3 shadow-sm sm:p-5">
            <Image
              src="/qr/gonuts-website.svg"
              alt={isEnglish ? 'QR code linking to https://gonuts.vn/' : 'Mã QR dẫn đến https://gonuts.vn/'}
              width={320}
              height={320}
              className="h-auto w-[min(72vw,320px)]"
            />
          </div>
          <a className="mt-5 inline-block font-semibold text-[#7d5a36] underline underline-offset-4" href="https://gonuts.vn/">
            https://gonuts.vn/
          </a>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="/qr/gonuts-website.png"
              download="gonuts-website-qr.png"
              className="rounded-xl bg-[#9c7044] px-5 py-3 text-sm font-bold text-white hover:bg-[#7d5a36] hover:text-white"
            >
              {isEnglish ? 'Download PNG for print' : 'Tải PNG để in'}
            </a>
            <a
              href="/qr/gonuts-website.svg"
              download="gonuts-website-qr.svg"
              className="rounded-xl border border-[#9c7044] px-5 py-3 text-sm font-bold text-[#7d5a36] hover:bg-[#fff4e8]"
            >
              {isEnglish ? 'Download vector SVG' : 'Tải SVG chất lượng vector'}
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
