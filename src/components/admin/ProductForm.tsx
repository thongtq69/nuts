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
                alert('Failed to save product');
            }
        } catch (error) {
            console.error(error);
            alert('Error saving product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="product-form">
            <div className="form-group">
                <label>Product Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Current Price</label>
                    <input type="number" name="currentPrice" value={formData.currentPrice} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Original Price</label>
                    <input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange} />
                </div>
            </div>

            <div className="form-group">
                <label>Category</label>
                <select name="category" value={formData.category} onChange={handleChange} required>
                    <option value="">Select Category</option>
                    <option value="Jars">Jars</option>
                    <option value="Bags">Bags</option>
                    <option value="Nuts">Nuts</option>
                    <option value="Berries">Berries</option>
                    <option value="Seeds">Seeds</option>
                </select>
            </div>

            <div className="form-group">
                <label>Tags (comma separated)</label>
                <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="best-seller, new, promo" />
            </div>

            <div className="form-group">
                <label>Image</label>
                <div className="image-upload-container">
                    <input
                        type="text"
                        name="image"
                        value={formData.image}
                        onChange={handleChange}
                        placeholder="Image URL"
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

                                try {
                                    setLoading(true);
                                    const res = await fetch('/api/upload', {
                                        method: 'POST',
                                        body: uploadData
                                    });

                                    if (res.ok) {
                                        const data = await res.json();
                                        setFormData(prev => ({ ...prev, image: data.url }));
                                    } else {
                                        alert('Upload failed');
                                    }
                                } catch (err) {
                                    console.error(err);
                                    alert('Error uploading image');
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
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product')}
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
                    border-color: #3498db;
                }
                .form-actions { margin-top: 30px; }
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
