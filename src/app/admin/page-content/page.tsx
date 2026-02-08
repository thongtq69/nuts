'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    FileText,
    Save,
    Loader2,
    ChevronRight,
    Search,
    BookOpen,
    Shield,
    FileCheck,
    Truck,
    Info,
    History,
    Settings,
    Eye,
    Image as ImageIcon,
    BarChart3,
    Award,
    Plus,
    Trash2,
    GripVertical,
    Users,
    Sprout,
    Heart,
    Leaf,
    Sparkles,
    TrendingUp,
    X
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { Button, Card, Input, Textarea, Badge, RichTextEditor } from '@/components/admin/ui';

const PAGES = [
    { slug: 'about-us', title: 'Về Go Nuts', icon: Info, description: 'Trang giới thiệu câu chuyện thương hiệu, giá trị cốt lõi.', hasExtraFields: true },
    { slug: 'return-policy', title: 'Chính sách đổi trả', icon: History, description: 'Các quy định về điều kiện đổi trả sản phẩm.', hasExtraFields: false },
    { slug: 'privacy-policy', title: 'Chính sách bảo mật', icon: Shield, description: 'Cam kết bảo mật thông tin khách hàng.', hasExtraFields: false },
    { slug: 'terms', title: 'Điều khoản sử dụng', icon: FileCheck, description: 'Các điều khoản khi mua hàng và sử dụng website.', hasExtraFields: false },
    { slug: 'shipping-policy', title: 'Chính sách vận chuyển', icon: Truck, description: 'ThờI gian, chi phí và phương thức giao nhận.', hasExtraFields: false }
];

const AVAILABLE_ICONS = [
    { value: 'Users', label: 'NgườI dùng', icon: Users },
    { value: 'Sprout', label: 'Cây xanh', icon: Sprout },
    { value: 'Award', label: 'Giải thưởng', icon: Award },
    { value: 'Heart', label: 'Trái tim', icon: Heart },
    { value: 'Leaf', label: 'Lá cây', icon: Leaf },
    { value: 'Sparkles', label: 'Lấp lánh', icon: Sparkles },
    { value: 'TrendingUp', label: 'Tăng trưởng', icon: TrendingUp },
    { value: 'Shield', label: 'Bảo vệ', icon: Shield },
];

const COLOR_OPTIONS = [
    { value: 'bg-blue-50 text-blue-600', label: 'Xanh dương', color: 'bg-blue-500' },
    { value: 'bg-emerald-50 text-emerald-600', label: 'Xanh lá', color: 'bg-emerald-500' },
    { value: 'bg-amber-50 text-amber-600', label: 'Vàng cam', color: 'bg-amber-500' },
    { value: 'bg-pink-50 text-pink-600', label: 'Hồng', color: 'bg-pink-500' },
    { value: 'bg-purple-50 text-purple-600', label: 'Tím', color: 'bg-purple-500' },
    { value: 'bg-orange-50 text-orange-600', label: 'Cam', color: 'bg-orange-500' },
];

interface PageStat {
    label: string;
    value: string;
    icon: string;
    color: string;
}

interface PageCommitment {
    text: string;
}

interface PageImage {
    url: string;
    alt: string;
    publicId?: string;
}

export default function AdminPageContent() {
    const [selectedPage, setSelectedPage] = useState(PAGES[0]);
    const [contentData, setContentData] = useState({
        title: '',
        subtitle: '',
        content: '',
        heroImage: { url: '', alt: '' } as PageImage,
        sideImage: { url: '', alt: '' } as PageImage,
        stats: [] as PageStat[],
        commitments: [] as PageCommitment[],
        metadata: {
            description: '',
            keywords: ''
        }
    });
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isPreview, setIsPreview] = useState(false);
    const [activeTab, setActiveTab] = useState<'content' | 'images' | 'stats' | 'seo'>('content');

    const toast = useToast();

    useEffect(() => {
        fetchPageContent(selectedPage.slug);
        setActiveTab('content');
    }, [selectedPage]);

    const fetchPageContent = async (slug: string) => {
        setFetching(true);
        try {
            const res = await fetch(`/api/page-content/${slug}`);
            if (res.ok) {
                const data = await res.json();
                setContentData({
                    title: data.title || '',
                    subtitle: data.subtitle || '',
                    content: data.content || '',
                    heroImage: data.heroImage || { url: '', alt: '' },
                    sideImage: data.sideImage || { url: '', alt: '' },
                    stats: data.stats || [],
                    commitments: data.commitments || [],
                    metadata: {
                        description: data.metadata?.description || '',
                        keywords: (data.metadata?.keywords || []).join(', ')
                    }
                });
            }
        } catch (error) {
            console.error('Error fetching page content:', error);
            toast.error('Lỗi khi tải nội dung trang');
        } finally {
            setFetching(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const processedData: any = {
                title: contentData.title,
                content: contentData.content,
                metadata: {
                    description: contentData.metadata.description,
                    keywords: contentData.metadata.keywords.split(',').map(k => k.trim()).filter(Boolean)
                }
            };

            // Add about-us specific fields
            if (selectedPage.slug === 'about-us') {
                processedData.subtitle = contentData.subtitle;
                processedData.heroImage = contentData.heroImage;
                processedData.sideImage = contentData.sideImage;
                processedData.stats = contentData.stats;
                processedData.commitments = contentData.commitments;
            }

            const res = await fetch(`/api/page-content/${selectedPage.slug}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(processedData),
            });

            const result = await res.json();

            if (res.ok) {
                toast.success('Đã lưu nội dung trang thành công');
                if (result.content) {
                    const savedData = result.content;
                    setContentData(prev => ({
                        ...prev,
                        title: savedData.title || '',
                        subtitle: savedData.subtitle || '',
                        content: savedData.content || '',
                        heroImage: savedData.heroImage || { url: '', alt: '' },
                        sideImage: savedData.sideImage || { url: '', alt: '' },
                        stats: savedData.stats || [],
                        commitments: savedData.commitments || [],
                        metadata: {
                            description: savedData.metadata?.description || '',
                            keywords: (savedData.metadata?.keywords || []).join(', ')
                        }
                    }));
                }
            } else {
                toast.error(result.error || 'Lỗi khi lưu dữ liệu');
            }
        } catch (error) {
            toast.error('Lỗi kết nối');
        } finally {
            setSaving(false);
        }
    };

    const addStat = () => {
        setContentData(prev => ({
            ...prev,
            stats: [...prev.stats, { label: '', value: '', icon: 'Users', color: 'bg-blue-50 text-blue-600' }]
        }));
    };

    const updateStat = (index: number, field: keyof PageStat, value: string) => {
        setContentData(prev => ({
            ...prev,
            stats: prev.stats.map((stat, i) => i === index ? { ...stat, [field]: value } : stat)
        }));
    };

    const removeStat = (index: number) => {
        setContentData(prev => ({
            ...prev,
            stats: prev.stats.filter((_, i) => i !== index)
        }));
    };

    const addCommitment = () => {
        setContentData(prev => ({
            ...prev,
            commitments: [...prev.commitments, { text: '' }]
        }));
    };

    const updateCommitment = (index: number, text: string) => {
        setContentData(prev => ({
            ...prev,
            commitments: prev.commitments.map((item, i) => i === index ? { ...item, text } : item)
        }));
    };

    const removeCommitment = (index: number) => {
        setContentData(prev => ({
            ...prev,
            commitments: prev.commitments.filter((_, i) => i !== index)
        }));
    };

    const isAboutPage = selectedPage.slug === 'about-us';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <BookOpen className="text-brand" size={28} />
                        Quản lý nội dung trang tĩnh
                    </h1>
                    <p className="text-slate-500 mt-1">Chỉnh sửa nội dung các trang Giới thiệu và Chính sách</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={() => setIsPreview(!isPreview)}
                        className="flex items-center gap-2"
                    >
                        <Eye size={18} />
                        {isPreview ? 'Chế độ sửa' : 'Xem trước'}
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 shadow-lg shadow-brand/20"
                    >
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Lưu thay đổi
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Sidebar - Page Selection */}
                <div className="lg:col-span-3 space-y-4">
                    <Card className="p-2">
                        <div className="space-y-1">
                            {PAGES.map((page) => {
                                const Icon = page.icon;
                                const isActive = selectedPage.slug === page.slug;
                                return (
                                    <button
                                        key={page.slug}
                                        onClick={() => setSelectedPage(page)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                                            ? 'bg-brand text-white shadow-md'
                                            : 'text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                                        <span className="flex-1 text-left">{page.title}</span>
                                        <ChevronRight size={14} className={isActive ? 'text-white/50' : 'text-slate-300'} />
                                    </button>
                                );
                            })}
                        </div>
                    </Card>

                    <Card className="p-4 bg-slate-50 border-slate-200">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Thông tin trang</h4>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            {selectedPage.description}
                        </p>
                        <div className="mt-4 pt-4 border-t border-slate-200">
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Settings size={14} />
                                Slug: <span className="font-mono bg-slate-200 px-1.5 py-0.5 rounded">{selectedPage.slug}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Quick Link */}
                    <Card className="p-4 bg-gradient-to-br from-brand/5 to-brand/10 border-brand/20">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-brand/20 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-brand" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800">Xem trang</h4>
                                <p className="text-xs text-slate-500">Kiểm tra trên website</p>
                            </div>
                        </div>
                        <a
                            href={selectedPage.slug === 'about-us' ? '/about' : `/${selectedPage.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-2.5 bg-white text-brand font-semibold rounded-xl border border-brand/20 hover:bg-brand hover:text-white transition-all text-sm"
                        >
                            Mở trang <ChevronRight size={14} />
                        </a>
                    </Card>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-9">
                    {fetching ? (
                        <Card className="h-96 flex flex-col items-center justify-center">
                            <Loader2 className="w-10 h-10 animate-spin text-brand mb-4" />
                            <p className="text-slate-500 font-medium">Đang tải nội dung...</p>
                        </Card>
                    ) : (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            {!isPreview ? (
                                <>
                                    {/* Tabs for About Page */}
                                    {isAboutPage && (
                                        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-1">
                                            {[
                                                { id: 'content', label: 'Nội dung chính', icon: FileText },
                                                { id: 'images', label: 'Hình ảnh', icon: ImageIcon },
                                                { id: 'stats', label: 'Thống kê & Cam kết', icon: BarChart3 },
                                                { id: 'seo', label: 'SEO', icon: Search },
                                            ].map((tab) => (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => setActiveTab(tab.id as any)}
                                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-medium text-sm transition-all ${activeTab === tab.id
                                                        ? 'text-brand border-b-2 border-brand bg-brand/5'
                                                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                                        }`}
                                                >
                                                    <tab.icon size={16} />
                                                    {tab.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Content Tab */}
                                    {(activeTab === 'content' || !isAboutPage) && (
                                        <Card className="p-6 space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Tiêu đề hiển thị</label>
                                                <Input
                                                    value={contentData.title}
                                                    onChange={e => setContentData({ ...contentData, title: e.target.value })}
                                                    placeholder="Nhập tiêu đề trang..."
                                                    className="text-xl font-bold"
                                                />
                                            </div>

                                            {isAboutPage && (
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Tiêu đề phụ (Subtitle)</label>
                                                    <Input
                                                        value={contentData.subtitle}
                                                        onChange={e => setContentData({ ...contentData, subtitle: e.target.value })}
                                                        placeholder="Nhập tiêu đề phụ..."
                                                    />
                                                </div>
                                            )}

                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Nội dung trang</label>
                                                    <Badge variant="default" className="text-[10px] font-mono">WYSIWYG Editor</Badge>
                                                </div>

                                                <RichTextEditor
                                                    value={contentData.content}
                                                    onChange={content => setContentData({ ...contentData, content })}
                                                    placeholder="Soạn thảo nội dung giới thiệu/chính sách tại đây..."
                                                />
                                            </div>
                                        </Card>
                                    )}

                                    {/* Images Tab - About Page Only */}
                                    {isAboutPage && activeTab === 'images' && (
                                        <Card className="p-6 space-y-6">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
                                                    <ImageIcon className="w-5 h-5 text-brand" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-800">Quản lý hình ảnh</h3>
                                                    <p className="text-sm text-slate-500">Thiết lập hình ảnh cho các section của trang About</p>
                                                </div>
                                            </div>

                                            {/* Hero Image */}
                                            <div className="space-y-4 p-5 bg-slate-50 rounded-2xl border border-slate-200">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="primary" className="text-xs">Hero Section</Badge>
                                                    <span className="text-sm font-semibold text-slate-700">Hình nền đầu trang</span>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-semibold text-slate-500">URL hình ảnh</label>
                                                        <Input
                                                            value={contentData.heroImage.url}
                                                            onChange={e => setContentData({
                                                                ...contentData,
                                                                heroImage: { ...contentData.heroImage, url: e.target.value }
                                                            })}
                                                            placeholder="https://..."
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-semibold text-slate-500">Alt text (SEO)</label>
                                                        <Input
                                                            value={contentData.heroImage.alt}
                                                            onChange={e => setContentData({
                                                                ...contentData,
                                                                heroImage: { ...contentData.heroImage, alt: e.target.value }
                                                            })}
                                                            placeholder="Mô tả hình ảnh..."
                                                        />
                                                    </div>
                                                </div>
                                                {contentData.heroImage.url && (
                                                    <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-200">
                                                        <img
                                                            src={contentData.heroImage.url}
                                                            alt={contentData.heroImage.alt}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/800x450/e2e8f0/94a3b8?text=Image+Error'; }}
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Side Image */}
                                            <div className="space-y-4 p-5 bg-slate-50 rounded-2xl border border-slate-200">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="primary" className="text-xs">Side Card</Badge>
                                                    <span className="text-sm font-semibold text-slate-700">Hình ảnh sidebar</span>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-semibold text-slate-500">URL hình ảnh</label>
                                                        <Input
                                                            value={contentData.sideImage.url}
                                                            onChange={e => setContentData({
                                                                ...contentData,
                                                                sideImage: { ...contentData.sideImage, url: e.target.value }
                                                            })}
                                                            placeholder="https://..."
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-semibold text-slate-500">Alt text (SEO)</label>
                                                        <Input
                                                            value={contentData.sideImage.alt}
                                                            onChange={e => setContentData({
                                                                ...contentData,
                                                                sideImage: { ...contentData.sideImage, alt: e.target.value }
                                                            })}
                                                            placeholder="Mô tả hình ảnh..."
                                                        />
                                                    </div>
                                                </div>
                                                {contentData.sideImage.url && (
                                                    <div className="relative aspect-[4/5] max-w-xs rounded-xl overflow-hidden bg-slate-200">
                                                        <img
                                                            src={contentData.sideImage.url}
                                                            alt={contentData.sideImage.alt}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x500/e2e8f0/94a3b8?text=Image+Error'; }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </Card>
                                    )}

                                    {/* Stats & Commitments Tab - About Page Only */}
                                    {isAboutPage && activeTab === 'stats' && (
                                        <div className="space-y-6">
                                            {/* Stats Section */}
                                            <Card className="p-6 space-y-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
                                                            <BarChart3 className="w-5 h-5 text-brand" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-slate-800">Thống kê (Stats)</h3>
                                                            <p className="text-sm text-slate-500">Các con số nổi bật hiển thị trên trang</p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={addStat}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <Plus size={16} />
                                                        Thêm
                                                    </Button>
                                                </div>

                                                <div className="space-y-4">
                                                    {contentData.stats.map((stat, index) => (
                                                        <div key={index} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                                                <div className="md:col-span-4 space-y-2">
                                                                    <label className="text-xs font-semibold text-slate-500">Nhãn</label>
                                                                    <Input
                                                                        value={stat.label}
                                                                        onChange={e => updateStat(index, 'label', e.target.value)}
                                                                        placeholder="VD: Khách hàng"
                                                                    />
                                                                </div>
                                                                <div className="md:col-span-3 space-y-2">
                                                                    <label className="text-xs font-semibold text-slate-500">Giá trị</label>
                                                                    <Input
                                                                        value={stat.value}
                                                                        onChange={e => updateStat(index, 'value', e.target.value)}
                                                                        placeholder="VD: 50K+"
                                                                    />
                                                                </div>
                                                                <div className="md:col-span-2 space-y-2">
                                                                    <label className="text-xs font-semibold text-slate-500">Icon</label>
                                                                    <select
                                                                        value={stat.icon}
                                                                        onChange={e => updateStat(index, 'icon', e.target.value)}
                                                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
                                                                    >
                                                                        {AVAILABLE_ICONS.map(icon => (
                                                                            <option key={icon.value} value={icon.value}>{icon.label}</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                                <div className="md:col-span-2 space-y-2">
                                                                    <label className="text-xs font-semibold text-slate-500">Màu sắc</label>
                                                                    <select
                                                                        value={stat.color}
                                                                        onChange={e => updateStat(index, 'color', e.target.value)}
                                                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
                                                                    >
                                                                        {COLOR_OPTIONS.map(color => (
                                                                            <option key={color.value} value={color.value}>{color.label}</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                                <div className="md:col-span-1">
                                                                    <button
                                                                        onClick={() => removeStat(index)}
                                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                                    >
                                                                        <Trash2 size={18} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {contentData.stats.length === 0 && (
                                                        <div className="text-center py-8 text-slate-400">
                                                            <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                                            <p>Chưa có thống kê nào. Click &quot;Thêm&quot; để tạo.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </Card>

                                            {/* Commitments Section */}
                                            <Card className="p-6 space-y-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
                                                            <Award className="w-5 h-5 text-brand" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-slate-800">Cam kết (Commitments)</h3>
                                                            <p className="text-sm text-slate-500">Các cam kết hiển thị trong khối Cam kết vàng</p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={addCommitment}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <Plus size={16} />
                                                        Thêm
                                                    </Button>
                                                </div>

                                                <div className="space-y-3">
                                                    {contentData.commitments.map((commitment, index) => (
                                                        <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                                                            <GripVertical className="text-slate-300" size={18} />
                                                            <Input
                                                                value={commitment.text}
                                                                onChange={e => updateCommitment(index, e.target.value)}
                                                                placeholder="Nhập nội dung cam kết..."
                                                                className="flex-1"
                                                            />
                                                            <button
                                                                onClick={() => removeCommitment(index)}
                                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    {contentData.commitments.length === 0 && (
                                                        <div className="text-center py-8 text-slate-400">
                                                            <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                                            <p>Chưa có cam kết nào. Click &quot;Thêm&quot; để tạo.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </Card>
                                        </div>
                                    )}

                                    {/* SEO Tab */}
                                    {(activeTab === 'seo' || !isAboutPage) && (
                                        <Card className="p-6">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
                                                    <Search className="w-5 h-5 text-brand" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-800">Cấu hình SEO</h3>
                                                    <p className="text-sm text-slate-500">Tối ưu hóa công cụ tìm kiếm</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-slate-500 uppercase">Meta Description</label>
                                                    <Textarea
                                                        value={contentData.metadata.description}
                                                        onChange={e => setContentData({
                                                            ...contentData,
                                                            metadata: { ...contentData.metadata, description: e.target.value }
                                                        })}
                                                        rows={4}
                                                        placeholder="Tóm tắt ngắn gọn cho Google..."
                                                    />
                                                    <p className="text-xs text-slate-400">
                                                        {contentData.metadata.description.length}/160 ký tự khuyến nghị
                                                    </p>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-slate-500 uppercase">Keywords (phân cách bằng dấu phẩy)</label>
                                                    <Textarea
                                                        value={contentData.metadata.keywords}
                                                        onChange={e => setContentData({
                                                            ...contentData,
                                                            metadata: { ...contentData.metadata, keywords: e.target.value }
                                                        })}
                                                        rows={4}
                                                        placeholder="VD: hat dinh duong, chinh sach doi tra, go nuts..."
                                                    />
                                                </div>
                                            </div>
                                        </Card>
                                    )}
                                </>
                            ) : (
                                <Card className="p-8 min-h-[500px] bg-slate-50">
                                    <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-4">
                                        <h2 className="text-2xl font-bold text-slate-800">Xem trước trang</h2>
                                        <Badge variant="default" className="text-xs">Preview Mode</Badge>
                                    </div>

                                    {/* Preview Hero */}
                                    {isAboutPage && (
                                        <div className="relative h-48 bg-slate-900 rounded-2xl overflow-hidden mb-6">
                                            {contentData.heroImage.url && (
                                                <img
                                                    src={contentData.heroImage.url}
                                                    alt=""
                                                    className="absolute inset-0 w-full h-full object-cover opacity-40"
                                                />
                                            )}
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="text-center">
                                                    <h1 className="text-3xl font-black text-white mb-2">
                                                        {contentData.title || 'Tiêu đề trang'}
                                                    </h1>
                                                    <p className="text-slate-300">
                                                        {contentData.subtitle || 'Tiêu đề phụ...'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Preview Stats */}
                                    {isAboutPage && contentData.stats.length > 0 && (
                                        <div className="grid grid-cols-4 gap-4 mb-6">
                                            {contentData.stats.map((stat, i) => (
                                                <div key={i} className="bg-white p-4 rounded-xl text-center shadow-sm">
                                                    <div className="text-2xl font-black text-slate-900">{stat.value || '0'}</div>
                                                    <div className="text-xs text-slate-500">{stat.label || 'Label'}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Preview Content */}
                                    <h1 className="text-3xl font-black text-slate-900 mb-6 pb-4 border-b-4 border-brand inline-block">
                                        {contentData.title}
                                    </h1>
                                    <div
                                        className="prose prose-slate max-w-none prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-8 prose-p:text-slate-600 prose-li:text-slate-600 admin-page-preview"
                                        dangerouslySetInnerHTML={{ __html: contentData.content || '<p class="text-slate-400 italic">Chưa có nội dung...</p>' }}
                                    />

                                    {/* Preview Commitments */}
                                    {isAboutPage && contentData.commitments.length > 0 && (
                                        <div className="mt-8 p-6 bg-slate-900 rounded-2xl text-white">
                                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                                <Award className="text-brand" /> Cam kết
                                            </h3>
                                            <ul className="space-y-2">
                                                {contentData.commitments.map((c, i) => (
                                                    <li key={i} className="flex items-center gap-2 text-slate-300">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-brand" />
                                                        {c.text || 'Cam kết...'}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <style jsx>{`
                                        .admin-page-preview :global(h2) {
                                            font-size: 1.875rem;
                                            font-weight: 900;
                                            margin-top: 2rem;
                                            margin-bottom: 1.5rem;
                                            color: #0f172a;
                                        }
                                        .admin-page-preview :global(p) {
                                            margin-bottom: 1.5rem;
                                        }
                                        .admin-page-preview :global(ul) {
                                            margin-bottom: 2rem;
                                            list-style: none;
                                            padding: 0;
                                        }
                                        .admin-page-preview :global(li) {
                                            position: relative;
                                            padding-left: 1.5rem;
                                            margin-bottom: 0.75rem;
                                            color: #475569;
                                        }
                                        .admin-page-preview :global(li::before) {
                                            content: "";
                                            position: absolute;
                                            left: 0;
                                            top: 0.7rem;
                                            width: 0.5rem;
                                            height: 0.5rem;
                                            background-color: #E3E846;
                                            border-radius: 999px;
                                        }
                                    `}</style>
                                </Card>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
