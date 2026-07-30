'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
    ChevronRight,
    FolderTree,
    Loader2,
    Pencil,
    Plus,
    RefreshCw,
    Trash2,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface LinkedSubmenu {
    _id: string;
    name: string;
    slug: string;
    sortOrder: number;
    isActive: boolean;
}

interface LinkedCategory {
    _id: string;
    name: string;
    slug: string;
    sortOrder: number;
    isActive: boolean;
    submenus: LinkedSubmenu[];
}

export default function LinkedProductCategoriesPage() {
    const toast = useToast();
    const [categories, setCategories] = useState<LinkedCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [submenuNames, setSubmenuNames] = useState<Record<string, string>>({});

    const loadCategories = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/linked-product-categories?includeInactive=1', {
                cache: 'no-store',
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Không thể tải danh mục');
            setCategories(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error(
                'Không thể tải danh mục',
                error instanceof Error ? error.message : 'Vui lòng thử lại.',
            );
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    const request = async (method: 'POST' | 'PUT' | 'DELETE', body: object) => {
        const response = await fetch('/api/linked-product-categories', {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Thao tác thất bại');
        return data;
    };

    const createCategory = async (event: FormEvent) => {
        event.preventDefault();
        if (!newCategoryName.trim()) return;
        setSaving(true);
        try {
            await request('POST', { type: 'category', name: newCategoryName });
            setNewCategoryName('');
            toast.success('Đã tạo danh mục liên kết');
            await loadCategories();
        } catch (error) {
            toast.error('Không thể tạo danh mục', error instanceof Error ? error.message : '');
        } finally {
            setSaving(false);
        }
    };

    const createSubmenu = async (categoryId: string) => {
        const name = submenuNames[categoryId]?.trim();
        if (!name) return;
        setSaving(true);
        try {
            await request('POST', { type: 'submenu', categoryId, name });
            setSubmenuNames(previous => ({ ...previous, [categoryId]: '' }));
            toast.success('Đã tạo submenu');
            await loadCategories();
        } catch (error) {
            toast.error('Không thể tạo submenu', error instanceof Error ? error.message : '');
        } finally {
            setSaving(false);
        }
    };

    const renameItem = async (
        type: 'category' | 'submenu',
        category: LinkedCategory,
        submenu?: LinkedSubmenu,
    ) => {
        const currentName = submenu?.name || category.name;
        const name = window.prompt(`Nhập tên mới cho ${type === 'category' ? 'danh mục' : 'submenu'}:`, currentName);
        if (!name?.trim() || name.trim() === currentName) return;

        try {
            await request('PUT', {
                type,
                categoryId: category._id,
                submenuId: submenu?._id,
                name,
                sortOrder: submenu?.sortOrder ?? category.sortOrder,
                isActive: submenu?.isActive ?? category.isActive,
            });
            toast.success('Đã cập nhật tên');
            await loadCategories();
        } catch (error) {
            toast.error('Không thể cập nhật', error instanceof Error ? error.message : '');
        }
    };

    const toggleItem = async (
        type: 'category' | 'submenu',
        category: LinkedCategory,
        submenu?: LinkedSubmenu,
    ) => {
        try {
            await request('PUT', {
                type,
                categoryId: category._id,
                submenuId: submenu?._id,
                name: submenu?.name || category.name,
                sortOrder: submenu?.sortOrder ?? category.sortOrder,
                isActive: !(submenu?.isActive ?? category.isActive),
            });
            await loadCategories();
        } catch (error) {
            toast.error('Không thể đổi trạng thái', error instanceof Error ? error.message : '');
        }
    };

    const deleteItem = async (
        type: 'category' | 'submenu',
        category: LinkedCategory,
        submenu?: LinkedSubmenu,
    ) => {
        const label = submenu?.name || category.name;
        if (!window.confirm(`Xóa “${label}”? Danh mục đang có sản phẩm sẽ không thể xóa.`)) return;

        try {
            await request('DELETE', {
                type,
                categoryId: category._id,
                submenuId: submenu?._id,
            });
            toast.success('Đã xóa danh mục');
            await loadCategories();
        } catch (error) {
            toast.error('Không thể xóa', error instanceof Error ? error.message : '');
        }
    };

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
                            <FolderTree size={26} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Danh mục sản phẩm liên kết</h1>
                            <p className="mt-1 text-sm text-slate-500">
                                Tạo danh mục lớn và các submenu hiển thị trong menu website.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={loadCategories}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        <RefreshCw size={16} /> Tải lại
                    </button>
                    <Link
                        href="/admin/products/new"
                        className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700"
                    >
                        <Plus size={16} /> Tạo sản phẩm
                    </Link>
                </div>
            </div>

            <form
                onSubmit={createCategory}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Tạo danh mục lớn
                </label>
                <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                        value={newCategoryName}
                        onChange={event => setNewCategoryName(event.target.value)}
                        placeholder="Ví dụ: Đồ ăn vặt, Thực phẩm khô..."
                        className="flex-1 rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                    <button
                        type="submit"
                        disabled={saving || !newCategoryName.trim()}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                        Thêm danh mục
                    </button>
                </div>
            </form>

            {loading ? (
                <div className="flex h-56 items-center justify-center rounded-2xl bg-white">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                </div>
            ) : categories.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                    <FolderTree className="mx-auto text-slate-300" size={48} />
                    <h2 className="mt-4 text-lg font-semibold text-slate-700">Chưa có danh mục liên kết</h2>
                    <p className="mt-1 text-sm text-slate-500">Tạo danh mục lớn trước, sau đó thêm submenu bên trong.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {categories.map(category => (
                        <section
                            key={category._id}
                            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                        >
                            <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/70 p-5 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-3">
                                    <FolderTree className="text-blue-600" size={21} />
                                    <div>
                                        <h2 className="font-bold text-slate-900">{category.name}</h2>
                                        <p className="text-xs text-slate-500">{category.submenus.length} submenu</p>
                                    </div>
                                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${category.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                                        {category.isActive ? 'Đang hiện' : 'Đang ẩn'}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => toggleItem('category', category)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-white">
                                        {category.isActive ? 'Ẩn' : 'Hiện'}
                                    </button>
                                    <button onClick={() => renameItem('category', category)} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50" title="Đổi tên">
                                        <Pencil size={17} />
                                    </button>
                                    <button onClick={() => deleteItem('category', category)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" title="Xóa">
                                        <Trash2 size={17} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3 p-5">
                                {category.submenus.map(submenu => (
                                    <div
                                        key={submenu._id}
                                        className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <ChevronRight size={16} className="text-slate-400" />
                                            <span className="font-medium text-slate-700">{submenu.name}</span>
                                            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${submenu.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                {submenu.isActive ? 'Đang hiện' : 'Đang ẩn'}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => toggleItem('submenu', category, submenu)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                                                {submenu.isActive ? 'Ẩn' : 'Hiện'}
                                            </button>
                                            <button onClick={() => renameItem('submenu', category, submenu)} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50" title="Đổi tên">
                                                <Pencil size={16} />
                                            </button>
                                            <button onClick={() => deleteItem('submenu', category, submenu)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" title="Xóa">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <div className="flex flex-col gap-2 rounded-xl border border-dashed border-blue-200 bg-blue-50/50 p-3 sm:flex-row">
                                    <input
                                        value={submenuNames[category._id] || ''}
                                        onChange={event => setSubmenuNames(previous => ({
                                            ...previous,
                                            [category._id]: event.target.value,
                                        }))}
                                        onKeyDown={event => {
                                            if (event.key === 'Enter') {
                                                event.preventDefault();
                                                createSubmenu(category._id);
                                            }
                                        }}
                                        placeholder="Tên submenu: Bánh, Kẹo, Táo đỏ..."
                                        className="flex-1 rounded-lg border border-blue-100 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => createSubmenu(category._id)}
                                        disabled={saving || !submenuNames[category._id]?.trim()}
                                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        <Plus size={16} /> Thêm submenu
                                    </button>
                                </div>
                            </div>
                        </section>
                    ))}
                </div>
            )}
        </div>
    );
}
