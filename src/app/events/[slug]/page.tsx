'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Breadcrumb from '@/components/common/Breadcrumb';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Calendar, MapPin } from 'lucide-react';

interface Event {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage?: string;
    eventDate?: string;
    eventLocation?: string;
    isPublished: boolean;
    publishedAt?: string;
    createdAt: string;
    viewCount: number;
}

export default function EventDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (slug) {
            fetchEvent(slug);
        }
    }, [slug]);

    const fetchEvent = async (slug: string) => {
        try {
            const res = await fetch(`/api/events/${slug}`);
            if (res.ok) {
                const data = await res.json();
                setEvent(data);
            }
        } catch (error) {
            console.error('Error fetching event:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    if (loading) {
        return (
            <>
                <Header />
                <Navbar />
                <main>
                    <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Sự kiện', href: '/events' }, { label: 'Đang tải...' }]} />
                    <div className="container py-20">
                        <div className="skeleton h-8 w-3/4 mb-4" />
                        <div className="skeleton h-4 w-1/4 mb-8" />
                        <div className="skeleton h-96 w-full mb-8" />
                        <div className="skeleton h-4 w-full mb-2" />
                        <div className="skeleton h-4 w-full mb-2" />
                        <div className="skeleton h-4 w-3/4" />
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    if (!event) {
        return (
            <>
                <Header />
                <Navbar />
                <main>
                    <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Sự kiện', href: '/events' }]} />
                    <div className="container py-20 text-center">
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">Sự kiện không tồn tại</h1>
                        <p className="text-gray-500">Sự kiện bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <Navbar />
            <main>
                <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Sự kiện', href: '/events' }, { label: event.title }]} />

                <div className="container">
                    <article className="event-detail">
                        <header className="event-header">
                            <h1 className="event-title">{event.title}</h1>
                            <div className="event-meta">
                                {event.eventDate && (
                                    <span className="flex items-center gap-2">
                                        <Calendar size={16} className="text-amber-700" />
                                        {formatDate(event.eventDate)}
                                    </span>
                                )}
                                {event.eventLocation && (
                                    <span className="flex items-center gap-2">
                                        <MapPin size={16} className="text-amber-700" />
                                        {event.eventLocation}
                                    </span>
                                )}
                                <span>{event.viewCount || 0} lượt xem</span>
                            </div>
                        </header>

                        {event.coverImage && (
                            <div className="event-cover">
                                <img src={event.coverImage} alt={event.title} />
                            </div>
                        )}

                        <div className="event-content" dangerouslySetInnerHTML={{ __html: event.content }} />
                    </article>
                </div>
            </main>
            <Footer />
        </>
    );
}
