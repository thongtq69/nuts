'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, RotateCcw, ZoomIn, ZoomOut, Move, Crop } from 'lucide-react';

interface ImageCropperProps {
    imageUrl: string;
    onCrop: (croppedImageUrl: string) => void;
    onCancel: () => void;
    aspectRatio?: number; // 3:1 = 3
}

export default function ImageCropper({
    imageUrl,
    onCrop,
    onCancel,
    aspectRatio = 3
}: ImageCropperProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [canCrop, setCanCrop] = useState(true); // Can we export from canvas? (CORS related)
    const [isUploading, setIsUploading] = useState(false);
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
    const [zoomInput, setZoomInput] = useState('100');

    // Device pixel ratio for high-DPI displays
    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;

    // Responsive crop area size
    const getCropAreaSize = () => {
        if (typeof window !== 'undefined') {
            const screenWidth = window.innerWidth;
            if (screenWidth < 640) { // Mobile
                return { width: Math.min(screenWidth - 80, 480), height: Math.min((screenWidth - 80) / 3, 160) };
            } else if (screenWidth < 1024) { // Tablet
                return { width: 540, height: 180 };
            }
        }
        return { width: 600, height: 200 }; // Desktop
    };

    const [cropArea] = useState(getCropAreaSize());

    // Load image và tính toán kích thước
    useEffect(() => {
        const imgElement = imageRef.current;
        if (!imgElement) return;

        setImageLoaded(false);
        setImageError(false);
        setCanCrop(true); // Reset canCrop state

        // Kiểm tra xem có phải URL Cloudinary không - không cần cache buster
        const isCloudinaryUrl = imageUrl.includes('cloudinary.com') || imageUrl.includes('res.cloudinary');
        const isBlobUrl = imageUrl.startsWith('blob:');
        const isDataUrl = imageUrl.startsWith('data:');

        // Chỉ thêm cache buster cho URL không phải Cloudinary/blob/data
        let finalUrl = imageUrl;
        if (!isCloudinaryUrl && !isBlobUrl && !isDataUrl) {
            const cacheBuster = imageUrl.includes('?') ? `&t=${Date.now()}` : `?t=${Date.now()}`;
            finalUrl = imageUrl + cacheBuster;
        }

        const handleImageLoad = () => {
            setImageDimensions({ width: imgElement.naturalWidth, height: imgElement.naturalHeight });

            // Tính toán scale và position ban đầu
            const scaleX = cropArea.width / imgElement.naturalWidth;
            const scaleY = cropArea.height / imgElement.naturalHeight;
            const initialScale = Math.max(scaleX, scaleY);

            setScale(initialScale);
            setPosition({ x: 0, y: 0 });
            setZoomInput(Math.round(initialScale * 100).toString());
            setImageLoaded(true);
        };

        const handleImageError = () => {
            // Nếu lỗi với crossOrigin, thử lại không có crossOrigin (chỉ cho preview)
            if (imgElement.crossOrigin === 'anonymous') {
                console.log('⚠️ CORS error detected, retrying without crossOrigin...');
                imgElement.crossOrigin = '';
                imgElement.src = ''; // Reset src
                setCanCrop(false); // Ảnh không có CORS access, không thể crop
                // Retry với URL gốc (không cache buster)
                setTimeout(() => {
                    imgElement.src = imageUrl;
                }, 100);
            } else {
                // Thực sự lỗi - không thể tải ảnh
                console.error('❌ Failed to load image:', imageUrl);
                setImageError(true);
                setImageLoaded(false);
            }
        };

        imgElement.onload = handleImageLoad;
        imgElement.onerror = handleImageError;

        // Thử tải với crossOrigin="anonymous" trước (cần cho canvas CORS)
        // Nếu thất bại, sẽ retry không có crossOrigin trong handleImageError
        imgElement.crossOrigin = 'anonymous';
        imgElement.src = finalUrl;
    }, [imageUrl, cropArea]);

    // Vẽ ảnh lên canvas với high DPI support
    const drawImage = useCallback(() => {
        const canvas = canvasRef.current;
        const img = imageRef.current;
        if (!canvas || !img || !imageLoaded) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Reset transform và scale cho high DPI
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Fill white background first (prevents black borders)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, cropArea.width, cropArea.height);

        // Enable high quality image smoothing for preview
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Tính toán vị trí và kích thước ảnh
        const scaledWidth = imageDimensions.width * scale;
        const scaledHeight = imageDimensions.height * scale;

        const x = (cropArea.width - scaledWidth) / 2 + position.x;
        const y = (cropArea.height - scaledHeight) / 2 + position.y;

        // Vẽ ảnh với chất lượng cao
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
    }, [imageLoaded, scale, position, imageDimensions, cropArea, dpr]);

    // Redraw khi có thay đổi
    useEffect(() => {
        drawImage();
    }, [drawImage]);

    // Handle mouse events cho drag
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        e.preventDefault();

        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;

        // Giới hạn di chuyển để ảnh không ra khỏi crop area
        const scaledWidth = imageDimensions.width * scale;
        const scaledHeight = imageDimensions.height * scale;

        // Horizontally: center if smaller, clamp boundaries if larger
        const maxX = scaledWidth > cropArea.width ? (scaledWidth - cropArea.width) / 2 : 0;

        // Vertically: allow dragging within the "slack" if smaller, clamp boundaries if larger
        const maxY = Math.abs(scaledHeight - cropArea.height) / 2;

        const clampedX = Math.max(-maxX, Math.min(maxX, newX));
        const clampedY = Math.max(-maxY, Math.min(maxY, newY));

        setPosition({ x: clampedX, y: clampedY });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Add global mouse events for better drag experience
    useEffect(() => {
        if (isDragging) {
            const handleGlobalMouseMove = (e: MouseEvent) => {
                const newX = e.clientX - dragStart.x;
                const newY = e.clientY - dragStart.y;

                const scaledWidth = imageDimensions.width * scale;
                const scaledHeight = imageDimensions.height * scale;

                const maxX = scaledWidth > cropArea.width ? (scaledWidth - cropArea.width) / 2 : 0;
                const maxY = Math.abs(scaledHeight - cropArea.height) / 2;

                const clampedX = Math.max(-maxX, Math.min(maxX, newX));
                const clampedY = Math.max(-maxY, Math.min(maxY, newY));

                setPosition({ x: clampedX, y: clampedY });
            };

            const handleGlobalMouseUp = () => {
                setIsDragging(false);
            };

            document.addEventListener('mousemove', handleGlobalMouseMove);
            document.addEventListener('mouseup', handleGlobalMouseUp);

            return () => {
                document.removeEventListener('mousemove', handleGlobalMouseMove);
                document.removeEventListener('mouseup', handleGlobalMouseUp);
            };
        }
    }, [isDragging, dragStart, scale, imageDimensions, cropArea, setPosition]); // Added setPosition to dependencies

    // Touch events for mobile support
    const handleTouchStart = (e: React.TouchEvent) => {
        e.preventDefault();
        const touch = e.touches[0];
        setIsDragging(true);
        setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;
        e.preventDefault();

        const touch = e.touches[0];
        const newX = touch.clientX - dragStart.x;
        const newY = touch.clientY - dragStart.y;

        const scaledWidth = imageDimensions.width * scale;
        const scaledHeight = imageDimensions.height * scale;

        const maxX = scaledWidth > cropArea.width ? (scaledWidth - cropArea.width) / 2 : 0;
        const maxY = Math.abs(scaledHeight - cropArea.height) / 2;

        const clampedX = Math.max(-maxX, Math.min(maxX, newX));
        const clampedY = Math.max(-maxY, Math.min(maxY, newY));

        setPosition({ x: clampedX, y: clampedY });
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    // Handle zoom
    const handleZoom = useCallback((delta: number) => {
        const newScale = Math.max(0.01, Math.min(3, scale + delta));
        setScale(newScale);
        setZoomInput(Math.round(newScale * 100).toString());
    }, [scale]);

    // Reset về vị trí ban đầu
    const handleReset = useCallback(() => {
        const scaleX = cropArea.width / imageDimensions.width;
        const scaleY = cropArea.height / imageDimensions.height;
        const initialScale = Math.max(scaleX, scaleY);

        setScale(initialScale);
        setPosition({ x: 0, y: 0 });
        setZoomInput(Math.round(initialScale * 100).toString());
    }, [cropArea, imageDimensions]);

    // Crop và export ảnh - VẼ TRỰC TIẾP TỪ ẢNH GỐC để giữ chất lượng cao
    const handleCropImage = useCallback(() => {
        try {
            console.log('🎞️ Starting crop process...');
            const img = imageRef.current;
            if (!img || !imageLoaded) {
                console.error('❌ Image not ready for cropping');
                return;
            }

            // Tạo canvas với kích thước output phù hợp (2000px width là tối ưu cho banner)
            const finalCanvas = document.createElement('canvas');
            const finalWidth = 2000;
            const finalHeight = Math.round(finalWidth / aspectRatio);

            console.log(`📐 Output dimensions: ${finalWidth}x${finalHeight}`);
            finalCanvas.width = finalWidth;
            finalCanvas.height = finalHeight;

            const finalCtx = finalCanvas.getContext('2d');
            if (!finalCtx) return;

            // Fill white background first (prevents black borders)
            finalCtx.fillStyle = '#FFFFFF';
            finalCtx.fillRect(0, 0, finalWidth, finalHeight);

            // Tính toán tỉ lệ scale từ preview canvas sang output canvas
            const outputScale = finalWidth / cropArea.width;

            // Tính toán kích thước ảnh trên canvas output với tỉ lệ cao
            const scaledWidthOnOutput = imageDimensions.width * scale * outputScale;
            const scaledHeightOnOutput = imageDimensions.height * scale * outputScale;

            // Tính vị trí ảnh trên canvas output
            const xOnOutput = (finalWidth - scaledWidthOnOutput) / 2 + (position.x * outputScale);
            const yOnOutput = (finalHeight - scaledHeightOnOutput) / 2 + (position.y * outputScale);

            // Bật image smoothing chất lượng cao
            finalCtx.imageSmoothingEnabled = true;
            finalCtx.imageSmoothingQuality = 'high';

            // Vẽ ảnh trực tiếp từ ảnh gốc lên canvas output với đầy đủ độ phân giải
            console.log('🎨 Drawing final image to hidden canvas...');
            try {
                finalCtx.drawImage(
                    img,
                    0, 0, img.naturalWidth, img.naturalHeight, // Source: toàn bộ ảnh gốc
                    xOnOutput, yOnOutput, scaledWidthOnOutput, scaledHeightOnOutput // Dest: vị trí và kích thước trên output
                );
            } catch (drawError) {
                console.error('❌ Canvas Draw Error (Possibly CORS):', drawError);
                alert('Lỗi khi vẽ ảnh: ' + (drawError instanceof Error ? drawError.message : 'Dung lượng quá lớn hoặc lỗi bảo mật CORS'));
                return;
            }

            // Convert sang base64 và upload lên Cloudinary
            finalCanvas.toBlob(async (blob) => {
                if (blob) {
                    try {
                        setIsUploading(true);
                        // Convert blob to base64
                        const reader = new FileReader();
                        reader.onload = async () => {
                            const base64Data = reader.result as string;

                            // Upload to Cloudinary
                            const response = await fetch('/api/upload', {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    imageData: base64Data,
                                    folder: 'gonuts/banners',
                                    type: 'banner',
                                    filename: `cropped_${Date.now()}`
                                })
                            });

                            const result = await response.json();

                            if (result.success) {
                                console.log('✅ Image uploaded to Cloudinary:', result.data.url);
                                onCrop(result.data.url);
                            } else {
                                console.error('❌ Upload failed:', result.message);
                                // Fallback to blob URL
                                const croppedUrl = URL.createObjectURL(blob);
                                onCrop(croppedUrl);
                            }
                            setIsUploading(false);
                        };
                        reader.readAsDataURL(blob);
                    } catch (error) {
                        console.error('❌ Error uploading to Cloudinary:', error);
                        // Fallback to blob URL
                        const croppedUrl = URL.createObjectURL(blob);
                        onCrop(croppedUrl);
                        setIsUploading(false);
                    }
                } else {
                    console.error('❌ Failed to generate blob from canvas');
                    alert('Không thể tạo file ảnh từ canvas.');
                }
            }, 'image/jpeg', 0.9);
        } catch (err) {
            console.error('❌ Unexpected error in handleCropImage:', err);
            alert('Lỗi không xác định: ' + (err instanceof Error ? err.message : 'Vui lòng thử lại'));
        }
    }, [aspectRatio, cropArea, onCrop, scale, position, imageDimensions, imageLoaded]);

    // Keyboard support
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!imageLoaded || imageError) return;

            // Không chạy phím tắt nếu đang gõ trong input
            if (document.activeElement?.tagName === 'INPUT') return;

            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    setPosition(prev => ({ ...prev, x: prev.x - 10 }));
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    setPosition(prev => ({ ...prev, x: prev.x + 10 }));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setPosition(prev => ({ ...prev, y: prev.y - 10 }));
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    setPosition(prev => ({ ...prev, y: prev.y + 10 }));
                    break;
                case '+':
                case '=':
                    e.preventDefault();
                    handleZoom(0.1);
                    break;
                case '-':
                    e.preventDefault();
                    handleZoom(-0.1);
                    break;
                case 'r':
                case 'R':
                    e.preventDefault();
                    handleReset();
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (imageLoaded && !imageError && !isUploading) {
                        handleCropImage();
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    onCancel();
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [imageLoaded, imageError, onCancel, handleZoom, handleReset, handleCropImage, isUploading]); // Added isUploading to dependencies

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col cropper-modal">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Crop className="w-6 h-6" />
                            <div>
                                <h2 className="text-xl font-bold">Chỉnh sửa Banner</h2>
                                <p className="text-blue-100 text-sm">Khuyến nghị: Tỉ lệ {aspectRatio}:1 (VD: 2000x{Math.round(2000 / aspectRatio)}px) để hiển thị tốt nhất</p>
                            </div>
                        </div>
                        <button
                            onClick={onCancel}
                            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 overflow-y-auto">
                    <div className="text-center mb-4">
                        <p className="text-gray-600">Ảnh sẽ được tự động cắt và điều chỉnh về đúng tỉ lệ. Kéo thả để di chuyển, sử dụng thanh trượt để zoom.</p>
                    </div>

                    {/* Crop Area */}
                    <div className="flex justify-center mb-6">
                        <div
                            ref={containerRef}
                            className="relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-100 cropper-container flex-shrink-0"
                            style={{ width: cropArea.width, height: cropArea.height }}
                        >
                            {!imageLoaded && !imageError && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        <div className="text-sm text-gray-600">Đang tải ảnh...</div>
                                    </div>
                                </div>
                            )}

                            {imageError && (
                                <div className="absolute inset-0 flex items-center justify-center bg-red-50">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-8 h-8 text-red-500">❌</div>
                                        <div className="text-sm text-red-600">Không thể tải ảnh</div>
                                    </div>
                                </div>
                            )}

                            <canvas
                                ref={canvasRef}
                                width={cropArea.width * dpr}
                                height={cropArea.height * dpr}
                                className={`${isDragging ? 'cursor-grabbing' : 'cursor-grab'} ${!imageLoaded ? 'opacity-0' : 'opacity-100'}`}
                                style={{
                                    width: cropArea.width,
                                    height: cropArea.height,
                                    userSelect: 'none',
                                    touchAction: 'none'
                                }}
                                onMouseDown={handleMouseDown}
                                onMouseLeave={handleMouseUp}
                                onTouchStart={handleTouchStart}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleTouchEnd}
                            />

                            {/* Grid overlay */}
                            <div className="absolute inset-0 pointer-events-none cropper-grid">
                                <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                                    {Array.from({ length: 9 }).map((_, i) => (
                                        <div key={i} className="border border-white border-opacity-50"></div>
                                    ))}
                                </div>
                            </div>

                            {/* Tỉ lệ indicator */}
                            <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                                Tỉ lệ {aspectRatio}:1
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="space-y-4">
                        {/* Zoom Control */}
                        <div className="flex items-center gap-4">
                            <ZoomOut className="w-5 h-5 text-gray-500" />
                            <div className="flex-1">
                                <input
                                    type="range"
                                    min="0.1"
                                    max="3"
                                    step="0.1"
                                    value={scale}
                                    onChange={(e) => {
                                        const newScale = parseFloat(e.target.value);
                                        setScale(newScale);
                                        setZoomInput(Math.round(newScale * 100).toString());
                                    }}
                                    disabled={!imageLoaded || imageError}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>
                            <ZoomIn className="w-5 h-5 text-gray-500" />
                            <div className="flex items-center bg-gray-100 rounded-lg px-2 py-1 border border-slate-200 focus-within:border-blue-500 transition-colors">
                                <input
                                    type="number"
                                    min="1"
                                    max="300"
                                    value={zoomInput}
                                    onChange={(e) => {
                                        const valStr = e.target.value;
                                        setZoomInput(valStr);
                                        const valNum = parseInt(valStr);
                                        if (!isNaN(valNum)) {
                                            setScale(Math.max(0.01, Math.min(3, valNum / 100)));
                                        }
                                    }}
                                    onBlur={() => {
                                        // Sync lại nếu bỏ trống hoặc giá trị không hợp lệ
                                        setZoomInput(Math.round(scale * 100).toString());
                                    }}
                                    className="w-12 bg-transparent text-sm font-bold text-center outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <span className="text-xs font-bold text-slate-400">%</span>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex items-center justify-center gap-4">
                            <button
                                onClick={() => handleZoom(-0.2)}
                                disabled={!imageLoaded || imageError}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ZoomOut className="w-4 h-4" />
                                Thu nhỏ
                            </button>

                            <button
                                onClick={handleReset}
                                disabled={!imageLoaded || imageError}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Đặt lại
                            </button>

                            <button
                                onClick={() => handleZoom(0.2)}
                                disabled={!imageLoaded || imageError}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ZoomIn className="w-4 h-4" />
                                Phóng to
                            </button>
                        </div>

                        {/* Instructions */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <Move className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div className="text-sm text-blue-700">
                                    <p className="font-medium mb-1">Hướng dẫn sử dụng:</p>
                                    <ul className="space-y-1 text-xs">
                                        <li>• <strong>Kéo thả</strong> để di chuyển ảnh trong khung</li>
                                        <li>• <strong>Thanh trượt</strong> để phóng to/thu nhỏ ảnh</li>
                                        <li>• <strong>Phím mũi tên</strong> để di chuyển chính xác</li>
                                        <li>• <strong>+/- hoặc =/-</strong> để zoom in/out</li>
                                        <li>• <strong>R</strong> để đặt lại, <strong>Enter</strong> để áp dụng, <strong>Esc</strong> để hủy</li>
                                        <li>• Ảnh sẽ được xuất với chất lượng cao (3000x{Math.round(3000 / aspectRatio)}px)</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 p-6 bg-gray-50 flex-shrink-0">
                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-black font-medium py-3 px-6 rounded-lg transition-all"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleCropImage}
                            disabled={!imageLoaded || imageError || isUploading}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2"
                        >
                            {isUploading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Đang lưu...</span>
                                </>
                            ) : (
                                imageError ? 'Không thể áp dụng' : 'Áp dụng & Lưu'
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Hidden image for loading - completely hidden */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                ref={imageRef}
                crossOrigin="anonymous"
                style={{ display: 'none', position: 'absolute', left: '-9999px', top: '-9999px' }}
                alt="Crop source"
            />
        </div>
    );
}