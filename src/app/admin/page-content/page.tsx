'use client';

import { useState, useEffect } from 'react';
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
    Eye
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { Button, Card, Input, Textarea, Badge } from '@/components/admin/ui';

const PAGES = [
    { slug: 'about-us', title: 'Về Go Nuts', icon: Info, description: 'Trang giới thiệu câu chuyện thương hiệu, giá trị cốt lõi.' },
    { slug: 'return-policy', title: 'Chính sách đổi trả', icon: History, description: 'Các quy định về điều kiện đổi trả sản phẩm.' },
    { slug: 'privacy-policy', title: 'Chính sách bảo mật', icon: Shield, description: 'Cam kết bảo mật thông tin khách hàng.' },
    { slug: 'terms', title: 'Điều khoản sử dụng', icon: FileCheck, description: 'Các điều khoản khi mua hàng và sử dụng website.' },
    { slug: 'shipping-policy', title: 'Chính sách vận chuyển', icon: Truck, description: 'Thời gian, chi phí và phương thức giao nhận.' }
];

export default function AdminPageContent() {
    const [selectedPage, setSelectedPage] = useState(PAGES[0]);
    const [contentData, setContentData] = useState({
        title: '',
        content: '',
        metadata: {
            description: '',
            keywords: ''
        }
    });
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isPreview, setIsPreview] = useState(false);

    const toast = useToast();

    useEffect(() => {
        fetchPageContent(selectedPage.slug);
    }, [selectedPage]);

    const fetchPageContent = async (slug: string) => {
        setFetching(true);
        try {
            const res = await fetch(`/api/page-content/${slug}`);
            if (res.ok) {
                const data = await res.json();
                setContentData({
                    title: data.title || '',
                    content: data.content || '',
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
            const processedData = {
                ...contentData,
                metadata: {
                    ...contentData.metadata,
                    keywords: contentData.metadata.keywords.split(',').map(k => k.trim()).filter(Boolean)
                }
            };

            const res = await fetch(`/api/page-content/${selectedPage.slug}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(processedData),
            });

            if (res.ok) {
                toast.success('Đã lưu nội dung trang thành công');
            } else {
                toast.error('Lỗi khi lưu dữ liệu');
            }
        } catch (error) {
            toast.error('Lỗi kết nối');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <BookOpen className="text-brand" size={32} />
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
                        <Eye size={20} />
                        {isPreview ? 'Chế độ sửa' : 'Xem nhanh'}
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 shadow-lg shadow-brand/20"
                    >
                        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
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
                                Slug: <span className="font-mono bg-slate-200 px-1 rounded">{selectedPage.slug}</span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-9">
                    {fetching ? (
                        <Card className="h-96 flex flex-col items-center justify-center">
                            <Loader2 className="w-10 h-10 animate-spin text-brand mb-4" />
                            <p className="text-slate-500 font-medium font-inter">Đang tải nội dung...</p>
                        </Card>
                    ) : (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            {/* Editor Card */}
                            {!isPreview ? (
                                <>
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

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Nội dung trang (HTML)</label>
                                                <Badge variant="default" className="text-[10px] font-mono">Rich Content Editor</Badge>
                                            </div>
                                            <div className="relative group">
                                                <Textarea
                                                    value={contentData.content}
                                                    onChange={e => setContentData({ ...contentData, content: e.target.value })}
                                                    rows={15}
                                                    placeholder="Sử dụng HTML để định dạng nội dung..."
                                                    className="font-mono text-sm leading-relaxed focus:ring-brand/30 transition-all border-2"
                                                />
                                                <div className="absolute bottom-4 right-4 text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Dùng các thẻ &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;
                                                </div>
                                            </div>
                                        </div>
                                    </Card>

                                    {/* SEO Settings */}
                                    <Card className="p-6">
                                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                            <Search size={20} className="text-brand" />
                                            Cấu hình SEO cho trang
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase">Meta Description</label>
                                                <Textarea
                                                    value={contentData.metadata.description}
                                                    onChange={e => setContentData({
                                                        ...contentData,
                                                        metadata: { ...contentData.metadata, description: e.target.value }
                                                    })}
                                                    rows={3}
                                                    placeholder="Tóm tắt ngắn gọn cho Google..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase">Keywords (phân cách bằng dấu phẩy)</label>
                                                <Textarea
                                                    value={contentData.metadata.keywords}
                                                    onChange={e => setContentData({
                                                        ...contentData,
                                                        metadata: { ...contentData.metadata, keywords: e.target.value }
                                                    })}
                                                    rows={3}
                                                    placeholder="VD: hat dinh duong, chinh sach doi tra, go nuts..."
                                                />
                                            </div>
                                        </div>
                                    </Card>
                                </>
                            ) : (
                                <Card className="p-8 min-h-[500px] bg-slate-50">
                                    <h1 className="text-4xl font-black text-slate-900 mb-8 border-b-4 border-brand pb-4 inline-block">
                                        {contentData.title}
                                    </h1>
                                    <div
                                        className="prose prose-slate max-w-none prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-8 prose-p:text-slate-600 prose-li:text-slate-600"
                                        dangerouslySetInnerHTML={{ __html: contentData.content }}
                                    />
                                </Card>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
