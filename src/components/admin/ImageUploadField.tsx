'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, ImageIcon, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface ImageUploadFieldProps {
    label: string;
    value: { url: string; alt: string };
    onChange: (value: { url: string; alt: string }) => void;
    folder?: string;
    aspectRatio?: string;
    placeholder?: string;
}

export default function ImageUploadField({
    label,
    value,
    onChange,
    folder = 'gonuts/pages',
    aspectRatio = '16:9',
    placeholder = 'Tải ảnh lên hoặc nhập URL'
}: ImageUploadFieldProps) {
    const [uploading, setUploading] = useState(false);
    const [previewError, setPreviewError] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const toast = useToast();

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Vui lòng chọn file ảnh (PNG, JPG, GIF)');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error('Kích thước file không được vượt quá 10MB');
            return;
        }

        try {
            setUploading(true);
            setPreviewError(false);

            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', folder);
            formData.append('type', 'page_content');

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                onChange({
                    ...value,
                    url: result.data.url,
                    alt: value.alt || file.name.split('.')[0]
                });
                toast.success('Tải ảnh lên thành công!');
            } else {
                toast.error(result.message || 'Tải ảnh thất bại');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Lỗi khi tải ảnh lên');
        } finally {
            setUploading(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleClear = () => {
        onChange({ url: '', alt: '' });
        setPreviewError(false);
    };

    const handleUrlChange = (url: string) => {
        onChange({ ...value, url });
        setPreviewError(false);
    };

    const handleAltChange = (alt: string) => {
        onChange({ ...value, alt });
    };

    return (
        <div className="space-y-4">
            {/* Label */}
            <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700">{label}</label>
                {value.url && (
                    <button
                        onClick={handleClear}
                        className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 px-2 py-1 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <X className="w-3 h-3" /> Xóa ảnh
                    </button>
                )}
            </div>

            {/* Upload Area */}
            {!value.url ? (
                <div className="relative">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        disabled={uploading}
                        className="hidden"
                        id={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
                    />
                    <label
                        htmlFor={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
                        className={`flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 hover:border-brand/50 transition-all cursor-pointer min-h-[200px] ${uploading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {uploading ? (
                            <>
                                <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center">
                                    <Loader2 className="w-6 h-6 text-brand animate-spin" />
                                </div>
                                <div className="text-center">
                                    <p className="text-slate-700 font-medium">Đang tải ảnh lên...</p>
                                    <p className="text-slate-400 text-sm">Vui lòng đợi trong giây lát</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center">
                                    <Upload className="w-6 h-6 text-brand" />
                                </div>
                                <div className="text-center">
                                    <p className="text-slate-700 font-medium">{placeholder}</p>
                                    <p className="text-slate-400 text-sm mt-1">PNG, JPG, GIF tối đa 10MB</p>
                                </div>
                            </>
                        )}
                    </label>
                </div>
            ) : (
                <div className="space-y-3">
                    {/* Preview */}
                    <div className={`relative rounded-xl overflow-hidden bg-slate-100 border border-slate-200 ${aspectRatio === '16:9' ? 'aspect-video' : aspectRatio === '4:5' ? 'aspect-[4/5]' : 'aspect-video'}`}>
                        {!previewError ? (
                            <img
                                src={value.url}
                                alt={value.alt}
                                className="w-full h-full object-cover"
                                onError={() => setPreviewError(true)}
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                <ImageIcon className="w-12 h-12 mb-2" />
                                <p className="text-sm">Không thể tải ảnh xem trước</p>
                            </div>
                        )}

                        {/* Success Badge */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-lg shadow-lg">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Đã tải lên
                        </div>

                        {/* Change Button */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            disabled={uploading}
                            className="hidden"
                            id={`file-upload-change-${label.replace(/\s+/g, '-').toLowerCase()}`}
                        />
                        <label
                            htmlFor={`file-upload-change-${label.replace(/\s+/g, '-').toLowerCase()}`}
                            className="absolute bottom-3 right-3 px-4 py-2 bg-white/90 backdrop-blur-sm text-slate-700 text-sm font-semibold rounded-lg shadow-lg hover:bg-white cursor-pointer transition-all"
                        >
                            {uploading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" /> Đang tải...
                                </span>
                            ) : (
                                'Đổi ảnh'
                            )}
                        </label>
                    </div>

                    {/* URL Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-500">URL ảnh</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={value.url}
                                onChange={(e) => handleUrlChange(e.target.value)}
                                placeholder="https://..."
                                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Alt Text Input */}
            <div className="space-y-2">
                <label className="text-xs font-medium text-slate-500">Alt text (SEO & Accessibility)</label>
                <input
                    type="text"
                    value={value.alt}
                    onChange={(e) => handleAltChange(e.target.value)}
                    placeholder="Mô tả ngắn về nội dung ảnh..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                />
            </div>
        </div>
    );
}
