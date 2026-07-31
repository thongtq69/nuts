'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    ArrowLeft,
    BadgePercent,
    Check,
    ExternalLink,
    Home,
    Link2,
    Loader2,
    Save,
    Search,
    Sparkles,
    TrendingUp,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import {
    HOMEPAGE_SECTION_CONFIG,
    type HomepageSection,
} from '@/lib/homepage-products';

interface Product {
    _id: string;
    name: string;
    image: string;
    currentPrice: number;
    category?: string;
    tags?: string[];
    isLinkedProduct?: boolean;
    linkedCategory?: string;
    sortOrder?: number;
    stockStatus?: 'in_stock' | 'out_of_stock' | 'low_stock';
}

interface SectionState {
    configured: boolean;
    label: string;
    limit: number;
    productIds: string[];
}

type SectionsState = Record<HomepageSection, SectionState>;

const SECTION_ICONS = {
    bestSeller: TrendingUp,
    new: Sparkles,
    promo: BadgePercent,
    linked: Link2,
};

const SECTION_COLORS = {
    bestSeller: 'bg-amber-50 text-amber-700 border-amber-200',
    new: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    promo: 'bg-rose-50 text-rose-700 border-rose-200',
    linked: 'bg-blue-50 text-blue-700 border-blue-200',
};

const SECTION_KEYS = Object.keys(HOMEPAGE_SECTION_CONFIG) as HomepageSection[];

function sameSelection(left: string[], right: string[]) {
    if (left.length !== right.length) return false;
    return [...left].sort().every((id, index) => id === [...right].sort()[index]);
}

export default function HomepageProductsPage() {
    const toast = useToast();
    const [products, setProducts] = useState<Product[]>([]);
    const [sections, setSections] = useState<SectionsState | null>(null);
    const [savedSelections, setSavedSelections] = useState<Record<HomepageSection, string[]> | null>(null);
    const [activeSection, setActiveSection] = useState<HomepageSection>('bestSeller');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchConfiguration = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/products/homepage', { cache: 'no-store' });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Không thể tải cấu hình');

            setProducts(data.products);
            setSections(data.sections);
            setSavedSelections(Object.fromEntries(
                SECTION_KEYS.map(section => [section, [...data.sections[section].productIds]]),
            ) as Record<HomepageSection, string[]>);
        } catch (error) {
            toast.error(
                'Không thể tải sản phẩm trang chủ',
                error instanceof Error ? error.message : 'Vui lòng thử lại',
            );
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchConfiguration();
    }, [fetchConfiguration]);

    const activeConfig = sections?.[activeSection];
    const selectedIds = useMemo(() => activeConfig?.productIds || [], [activeConfig]);
    const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

    const eligibleProducts = useMemo(() => {
        const linkedOnly = HOMEPAGE_SECTION_CONFIG[activeSection].linkedOnly;
        const normalizedSearch = searchQuery.trim().toLocaleLowerCase('vi');

        return products
            .filter(product => linkedOnly ? product.isLinkedProduct : !product.isLinkedProduct)
            .filter(product => {
                if (!normalizedSearch) return true;
                return [product.name, product.category, product.linkedCategory]
                    .filter(Boolean)
                    .some(value => value!.toLocaleLowerCase('vi').includes(normalizedSearch));
            })
            .sort((left, right) => {
                const selectedDifference = Number(selectedSet.has(right._id)) - Number(selectedSet.has(left._id));
                if (selectedDifference !== 0) return selectedDifference;
                return (right.sortOrder || 0) - (left.sortOrder || 0);
            });
    }, [activeSection, products, searchQuery, selectedSet]);

    const hasChanges = Boolean(
        activeConfig &&
        savedSelections &&
        !sameSelection(activeConfig.productIds, savedSelections[activeSection]),
    );

    const toggleProduct = (productId: string) => {
        if (!sections || !activeConfig) return;

        const isSelected = selectedSet.has(productId);
        if (!isSelected && selectedIds.length >= activeConfig.limit) {
            toast.error(
                'Đã đủ số lượng',
                `${activeConfig.label} chỉ hiển thị tối đa ${activeConfig.limit} sản phẩm trên trang chủ. Hãy bỏ chọn một sản phẩm trước.`,
            );
            return;
        }

        setSections(previous => {
            if (!previous) return previous;
            const currentIds = previous[activeSection].productIds;
            return {
                ...previous,
                [activeSection]: {
                    ...previous[activeSection],
                    productIds: isSelected
                        ? currentIds.filter(id => id !== productId)
                        : [...currentIds, productId],
                },
            };
        });
    };

    const saveSection = async () => {
        if (!activeConfig) return;

        try {
            setSaving(true);
            const response = await fetch('/api/admin/products/homepage', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    section: activeSection,
                    productIds: activeConfig.productIds,
                }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Không thể lưu thay đổi');

            setSavedSelections(previous => previous ? {
                ...previous,
                [activeSection]: [...activeConfig.productIds],
            } : previous);
            setSections(previous => previous ? {
                ...previous,
                [activeSection]: { ...previous[activeSection], configured: true },
            } : previous);
            toast.success('Đã cập nhật trang chủ', data.message);
        } catch (error) {
            toast.error(
                'Lưu thất bại',
                error instanceof Error ? error.message : 'Vui lòng thử lại',
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[420px] items-center justify-center">
                <div className="text-center">
                    <Loader2 className="mx-auto h-9 w-9 animate-spin text-amber-600" />
                    <p className="mt-3 text-sm text-slate-500">Đang tải sản phẩm trang chủ...</p>
                </div>
            </div>
        );
    }

    if (!sections || !activeConfig) {
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
                Không thể tải cấu hình. Vui lòng tải lại trang.
            </div>
        );
    }

    const ActiveIcon = SECTION_ICONS[activeSection];

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-start gap-3">
                    <Link
                        href="/admin/products"
                        className="mt-1 rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition hover:bg-slate-50"
                        aria-label="Quay lại danh sách sản phẩm"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900">
                            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-lg shadow-amber-500/20">
                                <Home className="h-5 w-5" />
                            </span>
                            Sản phẩm trang chủ
                        </h1>
                        <p className="mt-1 text-slate-500">
                            Chọn và đổi sản phẩm xuất hiện trong từng khu vực ngoài trang chủ.
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Link
                        href="/"
                        target="_blank"
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >
                        <ExternalLink className="h-4 w-4" />
                        Xem trang chủ
                    </Link>
                    <button
                        onClick={saveSection}
                        disabled={!hasChanges || saving}
                        className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 font-semibold text-white shadow-lg shadow-amber-600/20 transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Lưu thay đổi
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                {SECTION_KEYS.map(section => {
                    const sectionState = sections[section];
                    const Icon = SECTION_ICONS[section];
                    const active = activeSection === section;
                    return (
                        <button
                            key={section}
                            onClick={() => {
                                setActiveSection(section);
                                setSearchQuery('');
                            }}
                            className={`rounded-2xl border p-4 text-left transition ${active
                                ? `${SECTION_COLORS[section]} shadow-md ring-2 ring-current/10`
                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                        >
                            <div className="flex items-center justify-between gap-2">
                                <Icon className="h-5 w-5" />
                                <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-bold">
                                    {sectionState.productIds.length}/{sectionState.limit}
                                </span>
                            </div>
                            <p className="mt-3 text-sm font-bold sm:text-base">{sectionState.label}</p>
                        </button>
                    );
                })}
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-4 sm:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                                <ActiveIcon className="h-5 w-5 text-amber-600" />
                                {activeConfig.label}
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Đã chọn {selectedIds.length}/{activeConfig.limit} sản phẩm. Sản phẩm được chọn sẽ được ưu tiên theo “Thứ tự ưu tiên”.
                            </p>
                            {activeSection === 'linked' && (
                                <p className="mt-1 text-sm text-blue-600">
                                    Việc chọn ở đây chỉ quyết định 6 sản phẩm liên kết ngoài trang chủ, không xóa sản phẩm khỏi mục Sản phẩm liên kết.
                                </p>
                            )}
                        </div>
                        <div className="relative w-full lg:max-w-sm">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                value={searchQuery}
                                onChange={event => setSearchQuery(event.target.value)}
                                placeholder="Tìm tên hoặc danh mục..."
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/10"
                            />
                        </div>
                    </div>
                </div>

                {eligibleProducts.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                        Không tìm thấy sản phẩm phù hợp.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 sm:gap-4 sm:p-6 lg:grid-cols-4 2xl:grid-cols-6">
                        {eligibleProducts.map(product => {
                            const selected = selectedSet.has(product._id);
                            return (
                                <button
                                    key={product._id}
                                    type="button"
                                    onClick={() => toggleProduct(product._id)}
                                    aria-pressed={selected}
                                    className={`group relative overflow-hidden rounded-2xl border-2 bg-white text-left transition ${selected
                                        ? 'border-amber-500 shadow-md shadow-amber-500/10'
                                        : 'border-slate-100 hover:border-slate-300 hover:shadow-sm'
                                    }`}
                                >
                                    <span className={`absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 transition ${selected
                                        ? 'border-amber-500 bg-amber-500 text-white'
                                        : 'border-white bg-slate-200 text-transparent'
                                    }`}>
                                        <Check className="h-4 w-4" />
                                    </span>
                                    <div className="aspect-square overflow-hidden bg-slate-50 p-2">
                                        <Image
                                            src={product.image}
                                            alt={product.name}
                                            width={320}
                                            height={320}
                                            unoptimized
                                            className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.03]"
                                        />
                                    </div>
                                    <div className="p-3">
                                        <p className="line-clamp-2 min-h-10 text-sm font-semibold text-slate-800">
                                            {product.name}
                                        </p>
                                        <p className="mt-1 font-bold text-amber-700">
                                            {Number(product.currentPrice || 0).toLocaleString('vi-VN')}đ
                                        </p>
                                        <p className="mt-1 truncate text-xs text-slate-500">
                                            {activeSection === 'linked'
                                                ? product.linkedCategory || 'Chưa có submenu'
                                                : product.category || 'Chưa có danh mục'}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {hasChanges && (
                <div className="sticky bottom-4 z-20 flex items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-lg">
                    <p className="text-sm font-medium text-amber-900">Bạn có thay đổi chưa lưu trong mục {activeConfig.label}.</p>
                    <button
                        onClick={saveSection}
                        disabled={saving}
                        className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Lưu
                    </button>
                </div>
            )}
        </div>
    );
}
