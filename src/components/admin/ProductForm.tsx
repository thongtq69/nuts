'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProductFormProps {
    initialData?: any;
    isEdit?: boolean;
}

export default function ProductForm({ initialData = {}, isEdit = false }: ProductFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: initialData.name || '',
        image: initialData.image || '',
        currentPrice: initialData.currentPrice || 0,
        originalPrice: initialData.originalPrice || 0,
        category: initialData.category || '',
        description: initialData.description || '',
        tags: (initialData.tags || []).join(', '),
        badgeText: initialData.badgeText || '',
        badgeColor: initialData.badgeColor || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const method = isEdit ? 'PUT' : 'POST';
            const url = isEdit ? `/api/products/${initialData._id || initialData.id}` : '/api/products';

            // Process tags
            const processedData = {
                ...formData,
                tags: formData.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
                currentPrice: Number(formData.currentPrice),
                originalPrice: Number(formData.originalPrice)
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(processedData),
            });

            if (res.ok) {
                router.push('/admin/products');
                router.refresh();
            } else {
                alert('Lỗi khi lưu sản phẩm');
            }
        } catch (error) {
            console.error(error);
            alert('Lỗi khi lưu sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="product-form">
            <div className="form-group">
                <label>Tên sản phẩm</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Giá hiện tại</label>
                    <input type="number" name="currentPrice" value={formData.currentPrice} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Giá gốc</label>
                    <input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange} />
                </div>
            </div>

            <div className="form-group">
                <label>Danh mục</label>
                <select name="category" value={formData.category} onChange={handleChange} required>
                    <option value="">Chọn danh mục</option>
                    <option value="Jars">Hũ</option>
                    <option value="Bags">Túi</option>
                    <option value="Nuts">Hạt</option>
                    <option value="Berries">Quả mọng</option>
                    <option value="Seeds">Hạt giống</option>
                </select>
            </div>

            <div className="form-group">
                <label>Thẻ (phân cách bằng dấu phẩy)</label>
                <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="bán-chạy, mới, khuyến-mãi" />
            </div>

            <div className="form-group">
                <label>Hình ảnh</label>
                <div className="image-upload-container">
                    <input
                        type="text"
                        name="image"
                        value={formData.image}
                        onChange={handleChange}
                        placeholder="URL hình ảnh"
                        required
                    />
                    <div className="file-input-wrapper">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;

                                const uploadData = new FormData();
                                uploadData.append('file', file);
                                uploadData.append('folder', 'gonuts/products');
                                uploadData.append('type', 'product');

                                try {
                                    setLoading(true);
                                    const res = await fetch('/api/upload', {
                                        method: 'POST',
                                        body: uploadData
                                    });

                                    if (res.ok) {
                                        const data = await res.json();
                                        setFormData(prev => ({ ...prev, image: data.url }));
                                        console.log('✅ Product image uploaded to Cloudinary:', data.url);
                                    } else {
                                        const errorData = await res.json();
                                        alert('Tải lên thất bại: ' + (errorData.message || 'Unknown error'));
                                    }
                                } catch (err) {
                                    console.error(err);
                                    alert('Lỗi khi tải lên hình ảnh');
                                } finally {
                                    setLoading(false);
                                }
                            }}
                        />
                        <span className="upload-btn-text">Upload from Device</span>
                    </div>
                </div>
                {formData.image && (
                    <div className="image-preview" style={{ marginTop: '10px' }}>
                        <img src={formData.image} alt="Preview" style={{ maxHeight: '200px', borderRadius: '4px' }} />
                    </div>
                )}
            </div>

            <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={4} />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Badge Text</label>
                    <input type="text" name="badgeText" value={formData.badgeText} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Badge Color</label>
                    <select name="badgeColor" value={formData.badgeColor} onChange={handleChange}>
                        <option value="">None</option>
                        <option value="red">Red</option>
                        <option value="green">Green</option>
                        <option value="pink">Pink</option>
                    </select>
                </div>
            </div>

            <div className="form-actions">
                <button 
                    type="submit" 
                    className="create-product-btn" 
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <div className="loading-spinner"></div>
                            Đang lưu...
                        </>
                    ) : (
                        <>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                {isEdit ? (
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                ) : (
                                    <path d="M12 5v14M5 12h14" />
                                )}
                                {isEdit && <path d="m18.5 2.5-7 7L8 13l3.5-3.5 7-7z" />}
                            </svg>
                            {isEdit ? 'Cập nhật sản phẩm' : 'Tạo sản phẩm'}
                        </>
                    )}
                </button>
            </div>

            <style jsx>{`
                .product-form {
                    max-width: 800px;
                    background: #fff;
                    padding: 30px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }
                .form-group { margin-bottom: 20px; }
                .form-row { display: flex; gap: 20px; }
                .form-row .form-group { flex: 1; }
                label { display: block; margin-bottom: 8px; font-weight: 500; color: #555; }
                input, select, textarea {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 14px;
                }
                input:focus, select:focus, textarea:focus {
                    outline: none;
                    border-color: #9C7043;
                }
                .form-actions { 
                    margin-top: 30px; 
                    text-align: center;
                }
                .create-product-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 32px;
                    background: linear-gradient(135deg, #9C7043 0%, #7d5a36 100%);
                    color: #fff;
                    border: none;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 12px rgba(156, 112, 68, 0.3);
                    min-width: 200px;
                    justify-content: center;
                }
                .create-product-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(156, 112, 68, 0.4);
                    background: linear-gradient(135deg, #7d5a36 0%, #5d4329 100%);
                }
                .create-product-btn:active:not(:disabled) {
                    transform: translateY(0);
                }
                .create-product-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                    transform: none;
                }
                .loading-spinner {
                    width: 20px;
                    height: 20px;
                    border: 2px solid transparent;
                    border-top: 2px solid currentColor;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .image-upload-container {
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                }
                .file-input-wrapper {
                    position: relative;
                    overflow: hidden;
                    display: inline-block;
                }
                .file-input-wrapper input[type=file] {
                    font-size: 100px;
                    position: absolute;
                    left: 0;
                    top: 0;
                    opacity: 0;
                    cursor: pointer;
                }
                .upload-btn-text {
                    display: inline-block;
                    padding: 10px 15px;
                    background: #f1f1f1;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                }
                .upload-btn-text:hover {
                    background: #e1e1e1;
                }
            `}</style>
        </form>
    );
}
