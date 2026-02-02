'use client';

import React, { useEffect, useState } from 'react';
import Breadcrumb from '@/components/common/Breadcrumb';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Calendar, MapPin } from 'lucide-react';

interface Event {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    content?: string;
    coverImage?: string;
    eventDate?: string;
    eventLocation?: string;
    isPublished: boolean;
    publishedAt?: string;
    createdAt: string;
    views?: number;
}

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await fetch('/api/events?published=true');
            if (res.ok) {
                const data = await res.json();
                setEvents(data);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        <>
            <Header />
            <Navbar />
            <main>
                <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Sự kiện' }]} />

                <div className="container">
                    <h1 className="page-title">Sự kiện</h1>

                    {loading ? (
                        <div className="events-grid">
                            {[1, 2, 3, 4].map((i) => (
                                <article key={i} className="event-card">
                                    <div className="event-image">
                                        <div className="skeleton h-48 w-full" />
                                    </div>
                                    <div className="event-content">
                                        <div className="skeleton h-4 w-20 mb-2" />
                                        <div className="skeleton h-6 w-full mb-2" />
                                        <div className="skeleton h-4 w-full mb-2" />
                                        <div className="skeleton h-4 w-24" />
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : events.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-gray-500">Chưa có sự kiện nào.</p>
                        </div>
                    ) : (
                        <div className="events-grid">
                            {events.map((item) => (
                                <article key={item._id} className="event-card">
                                    <div className="event-image">
                                        {item.coverImage ? (
                                            <img src={item.coverImage} alt={item.title} />
                                        ) : (
                                            <div className="bg-gray-200 h-48 flex items-center justify-center text-gray-400">
                                                No Image
                                            </div>
                                        )}
                                    </div>
                                    <div className="event-content">
                                        {item.eventDate && (
                                            <div className="event-meta">
                                                <Calendar size={14} className="text-amber-700" />
                                                <span>{formatDate(item.eventDate)}</span>
                                            </div>
                                        )}
                                        {item.eventLocation && (
                                            <div className="event-meta">
                                                <MapPin size={14} className="text-amber-700" />
                                                <span>{item.eventLocation}</span>
                                            </div>
                                        )}
                                        <Link href={`/events/${item.slug}`}>
                                            <h2 className="event-title">{item.title}</h2>
                                        </Link>
                                        <p className="event-excerpt">{item.excerpt}</p>
                                        <Link href={`/events/${item.slug}`} className="read-more">Xem chi tiết →</Link>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}
