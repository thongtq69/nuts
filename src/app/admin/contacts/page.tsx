'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Phone, User, MessageSquare, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';

interface Contact {
    _id: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    status: 'pending' | 'processing' | 'completed' | 'canceled';
    createdAt: string;
}

export default function AdminContactsPage() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const toast = useToast();
    const confirm = useConfirm();

    const fetchContacts = async () => {
        try {
            const res = await fetch('/api/admin/contacts');
            const data = await res.json();
            setContacts(data);
        } catch (error) {
            console.error('Error fetching contacts:', error);
            toast.error('Lỗi', 'Không thể tải danh sách liên hệ');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            const res = await fetch(`/api/admin/contacts/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                toast.success('Thành công', 'Đã cập nhật trạng thái');
                fetchContacts();
            }
        } catch (error) {
            toast.error('Lỗi', 'Không thể cập nhật trạng thái');
        }
    };

    const handleDelete = async (id: string) => {
        const isConfirmed = await confirm({
            title: 'Xác nhận xóa',
            description: 'Bạn có chắc chắn muốn xóa tin nhắn liên hệ này?',
            confirmText: 'Xóa',
            cancelText: 'Hủy'
        });

        if (isConfirmed) {
            try {
                const res = await fetch(`/api/admin/contacts/${id}`, {
                    method: 'DELETE'
                });

                if (res.ok) {
                    toast.success('Thành công', 'Đã xóa liên hệ');
                    fetchContacts();
                }
            } catch (error) {
                toast.error('Lỗi', 'Không thể xóa liên hệ');
            }
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">Chờ xử lý</span>;
            case 'processing':
                return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Đang xử lý</span>;
            case 'completed':
                return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Đã xong</span>;
            case 'canceled':
                return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Đã hủy</span>;
            default:
                return null;
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-[400px]">Đang tải...</div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">Quản lý Liên hệ</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Quản lý và phản hồi các yêu cầu từ khách hàng.</p>
                </div>
                <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Tổng cộng: </span>
                    <span className="text-sm font-black text-brand">{contacts.length}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {contacts.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500 shadow-sm">
                        <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-medium">Chưa có tin nhắn liên hệ nào.</p>
                    </div>
                ) : (
                    contacts.map((contact) => (
                        <div key={contact._id} className="bg-white dark:bg-slate-900 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300">
                            <div className="flex flex-col lg:flex-row">
                                {/* Left Side: Status and Content */}
                                <div className="flex-1 p-6 sm:p-8">
                                    <div className="flex flex-wrap items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center text-brand">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-800 dark:text-white text-xl tracking-tight leading-none">{contact.name}</h3>
                                            <div className="mt-1 flex items-center gap-2">
                                                {getStatusBadge(contact.status)}
                                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{new Date(contact.createdAt).toLocaleString('vi-VN')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                            <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 shadow-sm">
                                                <Mail size={16} />
                                            </div>
                                            <span className="text-sm font-bold text-slate-600 dark:text-slate-300 truncate">{contact.email}</span>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                            <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 shadow-sm">
                                                <Phone size={16} />
                                            </div>
                                            <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{contact.phone}</span>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <div className="absolute -top-3 left-6 px-2 bg-white dark:bg-slate-900 text-[10px] font-black uppercase tracking-widest text-slate-400">Tin nhắn</div>
                                        <div className="p-6 bg-white dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 italic text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                                            "{contact.message}"
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Actions (Sidebar in the card) */}
                                <div className="bg-slate-50/50 dark:bg-slate-800/50 p-6 lg:w-24 flex lg:flex-col items-center justify-center gap-3 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800">
                                    <button
                                        onClick={() => handleUpdateStatus(contact._id, 'processing')}
                                        className="w-12 h-12 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all duration-300 bg-white dark:bg-slate-900 shadow-sm border border-blue-100 dark:border-blue-900/30 group"
                                        title="Chuyển sang Đang xử lý"
                                    >
                                        <Clock size={20} className="group-hover:scale-110 transition-transform" />
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus(contact._id, 'completed')}
                                        className="w-12 h-12 flex items-center justify-center text-green-600 hover:bg-green-600 hover:text-white rounded-xl transition-all duration-300 bg-white dark:bg-slate-900 shadow-sm border border-green-100 dark:border-green-900/30 group"
                                        title="Đánh dấu Hoàn thành"
                                    >
                                        <CheckCircle size={20} className="group-hover:scale-110 transition-transform" />
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus(contact._id, 'canceled')}
                                        className="w-12 h-12 flex items-center justify-center text-amber-600 hover:bg-amber-600 hover:text-white rounded-xl transition-all duration-300 bg-white dark:bg-slate-900 shadow-sm border border-amber-100 dark:border-amber-900/30 group"
                                        title="Hủy yêu cầu"
                                    >
                                        <XCircle size={20} className="group-hover:scale-110 transition-transform" />
                                    </button>
                                    <div className="h-px w-8 lg:w-auto lg:h-px bg-slate-200 dark:bg-slate-700 my-1"></div>
                                    <button
                                        onClick={() => handleDelete(contact._id)}
                                        className="w-12 h-12 flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all duration-300 bg-white dark:bg-slate-900 shadow-sm border border-red-100 dark:border-red-900/30 group"
                                        title="Xóa liên hệ"
                                    >
                                        <Trash2 size={20} className="group-hover:scale-110 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
