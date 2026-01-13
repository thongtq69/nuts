'use client';

import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ReactNode } from 'react';

interface MainLayoutProps {
    children: ReactNode;
    showNavbar?: boolean;
}

export default function MainLayout({ children, showNavbar = true }: MainLayoutProps) {
    return (
        <>
            <Header />
            {showNavbar && <Navbar />}
            <main>{children}</main>
            <Footer />
        </>
    );
}
