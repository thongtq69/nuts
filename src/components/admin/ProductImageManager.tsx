'use client';

import { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Trash2, Plus } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { usePrompt } from '@/context/PromptContext';

interface ProductImage {
    url: string;
    _id?: string;
}

interface ProductImageManagerProps {
    productId: string;
    productName: string;
    initialImages: string[];
    onClose: () => void;
    onUpdate: (images: string[]) => void;
}

export default function ProductImageManager({ 
    productId, 
    productName, 
    initialImages, 
    onClose, 
    onUpdate 
}: ProductImageManagerProps) {
    const [images, setImages] = useState<string[]>(initialImages || []);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
    const [selectedFileCount, setSelectedFileCount] = useState<number>(0);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const toast = useToast();
    const prompt = usePrompt();

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) {
            setSelectedFileCount(0);
            return;
        }

        setSelectedFileCount(files.length);
        setUploading(true);
        setUploadProgress({ current: 0, total: files.length });
        const uploadedUrls: string[] = [];
        let successCount = 0;
        let errorCount = 0;

        try {
            for (let i = 0; i < files.length; i++) {
                setUploadProgress({ current: i + 1, total: files.length });
                
                const file = files[i];
                const formData = new FormData();
                formData.append('file', file);
                formData.append('folder', 'gonuts/products/gallery');
                formData.append('type', 'gallery');

                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });

                if (res.ok) {
                    const data = await res.json();
                    uploadedUrls.push(data.url);
                    successCount++;
                } else {
                    errorCount++;
                }
            }

            // Update state once with all uploaded URLs
            if (uploadedUrls.length > 0) {
                setImages(prev => [...prev, ...uploadedUrls]);
                setSuccessMessage(`✅ Đã tải lên ${uploadedUrls.length} ảnh thành công!`);
                setTimeout(() => setSuccessMessage(null), 3000);
            }
            setUploadProgress(null);
            setSelectedFileCount(0);

            // Show result message
            if (successCount > 0 && errorCount === 0) {
                // Silent success - images will be visible
            } else if (successCount > 0 && errorCount > 0) {
                toast.warning('Tải ảnh chưa hoàn tất', `Đã tải lên ${successCount} ảnh, ${errorCount} ảnh thất bại.`);
            } else if (errorCount > 0) {
                toast.error('Tải ảnh thất bại', 'Tất cả ảnh đều thất bại. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Lỗi khi tải ảnh lên', 'Vui lòng thử lại.');
        } finally {
            setUploading(false);
            setUploadProgress(null);
            setSelectedFileCount(0);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemoveImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/products/${productId}/images`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ images })
            });

            if (res.ok) {
                onUpdate(images);
                onClose();
            } else {
                const data = await res.json();
                toast.error('Lỗi khi lưu ảnh', data.message || 'Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Save error:', error);
            toast.error('Lỗi khi lưu ảnh', 'Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddByUrl = () => {
        prompt({
            title: 'Thêm ảnh bằng URL',
            description: 'Nhập URL ảnh:',
            placeholder: 'https://...'
        }).then((url) => {
            if (url) {
                setImages(prev => [...prev, url]);
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Quản lý ảnh sản phẩm</h2>
                        <p className="text-sm text-gray-500 mt-1">{productName}</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 overflow-y-auto max-h-[60vh]">
                    {/* Success Message */}
                    {successMessage && (
                        <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                                <span className="text-emerald-600">✓</span>
                            </div>
                            <span className="text-emerald-800 font-medium">{successMessage}</span>
                        </div>
                    )}

                    {/* Upload Buttons */}
                    <div className="flex gap-3 mb-6">
                        <div className="flex-1">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleUpload}
                                className="hidden"
                                id="image-upload-input"
                            />
                            <label
                                htmlFor="image-upload-input"
                                className={`flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-brand to-brand-light text-white rounded-xl hover:shadow-lg hover:shadow-brand/25 transition-all cursor-pointer ${
                                    uploading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {uploading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>
                                            {uploadProgress 
                                                ? `Đang tải ${uploadProgress.current}/${uploadProgress.total} ảnh...`
                                                : 'Đang tải...'}
                                        </span>
                                    </>
                                ) : selectedFileCount > 0 ? (
                                    <>
                                        <Upload size={20} />
                                        <span className="font-medium">Tải lên {selectedFileCount} ảnh đã chọn</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload size={20} />
                                        <span className="font-medium">Tải ảnh từ thiết bị</span>
                                    </>
                                )}
                            </label>
                            <p className="text-xs text-gray-500 mt-2 text-center">
                                {selectedFileCount > 0 
                                    ? `✅ Đã chọn ${selectedFileCount} ảnh - Click để tải lên`
                                    : '💡 Có thể chọn nhiều ảnh cùng lúc (Ctrl + Click)'}
                            </p>
                        </div>
                        <button
                            onClick={handleAddByUrl}
                            className="flex items-center gap-2 px-6 py-4 border-2 border-dashed border-gray-300 text-gray-600 rounded-xl hover:border-brand hover:text-brand transition-all"
                        >
                            <Plus size={20} />
                            <span>Thêm từ URL</span>
                        </button>
                    </div>

                    {/* Images Grid */}
                    {images.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ImageIcon size={32} className="text-gray-400" />
                            </div>
                            <p className="text-gray-500 font-medium">Chưa có ảnh phụ nào</p>
                            <p className="text-sm text-gray-400 mt-1">Tải lên hoặc thêm ảnh từ URL để hiển thị trong gallery sản phẩm</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                            {images.map((url, index) => (
                                <div 
                                    key={index}
                                    className="relative group aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-200"
                                >
                                    <img
                                        src={url}
                                        alt={`Ảnh ${index + 1}`}
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/assets/images/product1.jpg';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => handleRemoveImage(index)}
                                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                        <span className="text-white text-xs font-medium">
                                            Ảnh {index + 1}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Info */}
                    <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                        <p className="text-sm text-amber-800">
                            💡 <strong>Lưu ý:</strong> Ảnh đầu tiên trong danh sách sẽ là ảnh chính của sản phẩm. 
                            Kéo thả để sắp xếp lại thứ tự ảnh.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-6 py-2.5 bg-brand text-white font-medium rounded-xl hover:bg-brand/90 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Đang lưu...</span>
                            </>
                        ) : (
                            'Lưu thay đổi'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
