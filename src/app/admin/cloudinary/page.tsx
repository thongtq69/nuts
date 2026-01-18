'use client';

import { useState } from 'react';
import { Cloud, Upload, Image, Trash2, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

export default function CloudinaryManagementPage() {
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState<any>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            setMessage(null);
            setUploadResult(null);

            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'gonuts/test');
            formData.append('type', 'test');

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                setUploadResult(result.data);
                setMessage({ type: 'success', text: 'Upload thành công!' });
            } else {
                setMessage({ type: 'error', text: result.message || 'Upload thất bại' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Lỗi khi upload file' });
        } finally {
            setUploading(false);
        }
    };

    const testCloudinaryConnection = async () => {
        try {
            setMessage(null);
            
            // Test với một ảnh base64 nhỏ
            const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
            
            const response = await fetch('/api/upload', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    imageData: testImageData,
                    folder: 'gonuts/test',
                    type: 'connection_test',
                    filename: 'test'
                })
            });

            const result = await response.json();

            if (result.success) {
                setMessage({ type: 'success', text: 'Kết nối Cloudinary thành công!' });
                setUploadResult(result.data);
            } else {
                setMessage({ type: 'error', text: 'Kết nối thất bại: ' + result.message });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Lỗi khi test kết nối' });
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
                            <Cloud className="h-5 w-5" />
                        </div>
                        Quản lý Cloudinary
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 ml-13">
                        Quản lý và test upload hình ảnh lên Cloudinary
                    </p>
                </div>
                <button
                    onClick={testCloudinaryConnection}
                    className="inline-flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2.5 rounded-xl font-medium transition-all"
                >
                    <RefreshCw className="h-4 w-4" />
                    Test Kết Nối
                </button>
            </div>

            {/* Message */}
            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${
                    message.type === 'success' 
                        ? 'bg-green-50 text-green-800 border border-green-200' 
                        : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                    {message.type === 'success' ? (
                        <CheckCircle className="h-5 w-5" />
                    ) : (
                        <AlertCircle className="h-5 w-5" />
                    )}
                    {message.text}
                </div>
            )}

            {/* Upload Section */}
            <div className="glass-card p-6">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Test Upload File
                </h3>
                
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="hidden"
                        id="file-upload"
                    />
                    <label
                        htmlFor="file-upload"
                        className={`cursor-pointer inline-flex flex-col items-center gap-3 ${
                            uploading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {uploading ? (
                            <RefreshCw className="h-12 w-12 text-slate-400 animate-spin" />
                        ) : (
                            <Image className="h-12 w-12 text-slate-400" />
                        )}
                        <div>
                            <p className="text-lg font-medium text-slate-700">
                                {uploading ? 'Đang upload...' : 'Chọn file để upload'}
                            </p>
                            <p className="text-sm text-slate-500">
                                PNG, JPG, GIF up to 10MB
                            </p>
                        </div>
                    </label>
                </div>
            </div>

            {/* Upload Result */}
            {uploadResult && (
                <div className="glass-card p-6">
                    <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        Kết Quả Upload
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Image Preview */}
                        <div>
                            <h4 className="font-medium text-slate-700 mb-2">Hình ảnh:</h4>
                            <div className="border rounded-lg overflow-hidden">
                                <img
                                    src={uploadResult.url}
                                    alt="Uploaded"
                                    className="w-full h-48 object-cover"
                                />
                            </div>
                        </div>

                        {/* Details */}
                        <div>
                            <h4 className="font-medium text-slate-700 mb-2">Chi tiết:</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-600">URL:</span>
                                    <a 
                                        href={uploadResult.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline max-w-xs truncate"
                                    >
                                        {uploadResult.url}
                                    </a>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Public ID:</span>
                                    <span className="font-mono text-xs">{uploadResult.publicId}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Kích thước:</span>
                                    <span>{uploadResult.width} x {uploadResult.height}px</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Định dạng:</span>
                                    <span className="uppercase">{uploadResult.format}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Dung lượng:</span>
                                    <span>{Math.round(uploadResult.bytes / 1024)} KB</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Configuration Info */}
            <div className="glass-card p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Cấu Hình Cloudinary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-slate-50 p-3 rounded-lg">
                        <div className="font-medium text-slate-700">Cloud Name</div>
                        <div className="text-slate-600 font-mono">du6no35fj</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                        <div className="font-medium text-slate-700">API Key</div>
                        <div className="text-slate-600 font-mono">473628735676585</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                        <div className="font-medium text-slate-700">Folders</div>
                        <div className="text-slate-600">
                            <div>• gonuts/banners</div>
                            <div>• gonuts/products</div>
                            <div>• gonuts/test</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Instructions */}
            <div className="glass-card p-6">
                <h3 className="font-semibold text-slate-800 mb-3">Hướng Dẫn Sử Dụng</h3>
                <div className="space-y-2 text-sm text-slate-600">
                    <p>• <strong>Upload File:</strong> Chọn file ảnh để test upload lên Cloudinary</p>
                    <p>• <strong>Test Kết Nối:</strong> Kiểm tra kết nối với Cloudinary server</p>
                    <p>• <strong>Folders:</strong> Ảnh được tự động phân loại theo folder (banners, products, etc.)</p>
                    <p>• <strong>Tối Ưu:</strong> Cloudinary tự động tối ưu chất lượng và format ảnh</p>
                    <p>• <strong>CDN:</strong> Tất cả ảnh được phục vụ qua CDN toàn cầu của Cloudinary</p>
                </div>
            </div>
        </div>
    );
}