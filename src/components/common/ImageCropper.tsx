'use client';

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, ZoomIn, ZoomOut, Check, RotateCcw } from 'lucide-react';
import { getCroppedImg } from '@/lib/image-utils';

interface ImageCropperProps {
    image: string;
    aspect?: number;
    onCropComplete: (croppedImage: Blob) => void;
    onCancel: () => void;
    title?: string;
}

export default function ImageCropper({
    image,
    aspect = 16 / 9,
    onCropComplete,
    onCancel,
    title = 'Điều chỉnh ảnh'
}: ImageCropperProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const onCropChange = (crop: { x: number; y: number }) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom: number) => {
        setZoom(zoom);
    };

    const onCropCompleteInternal = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async () => {
        try {
            setIsProcessing(true);
            const croppedImage = await getCroppedImg(
                image,
                croppedAreaPixels,
                rotation
            );
            if (croppedImage) {
                onCropComplete(croppedImage);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex flex-col bg-slate-900/95 backdrop-blur-md animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-white/5 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                    <h2 className="text-xl font-bold text-white uppercase tracking-tight">{title}</h2>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#E3E846] text-black font-bold rounded-full hover:bg-[#c9ce3e] transition-all shadow-xl shadow-[#E3E846]/20 disabled:opacity-50"
                >
                    {isProcessing ? (
                        <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    ) : (
                        <Check size={20} />
                    )}
                    <span>Áp dụng</span>
                </button>
            </div>

            {/* Cropper Area */}
            <div className="relative flex-1 bg-black/40">
                <Cropper
                    image={image}
                    crop={crop}
                    zoom={zoom}
                    rotation={rotation}
                    aspect={aspect}
                    onCropChange={onCropChange}
                    onZoomChange={onZoomChange}
                    onCropComplete={onCropCompleteInternal}
                    classes={{
                        containerClassName: 'bg-transparent',
                        mediaClassName: 'shadow-2xl',
                        cropAreaClassName: 'border-2 border-white/50 shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]'
                    }}
                />
            </div>

            {/* Footer Controls */}
            <div className="bg-white/5 border-t border-white/10 p-6 space-y-6">
                <div className="max-w-md mx-auto space-y-6">
                    {/* Zoom Slider */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-white/50 text-sm font-medium uppercase tracking-wider">
                            <span className="flex items-center gap-2"><ZoomOut size={14} /> Thu nhỏ</span>
                            <span className="flex items-center gap-2">Phóng to <ZoomIn size={14} /></span>
                        </div>
                        <input
                            type="range"
                            min={1}
                            max={3}
                            step={0.1}
                            value={zoom}
                            onChange={(e) => onZoomChange(Number(e.target.value))}
                            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#E3E846]"
                        />
                    </div>

                    {/* Rotation Control */}
                    <div className="flex items-center justify-center gap-4">
                        <button
                            onClick={() => setRotation((prev) => (prev - 90) % 360)}
                            className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all border border-white/10 active:scale-95"
                            title="Xoay trái"
                        >
                            <RotateCcw size={20} className="scale-x-[-1]" />
                        </button>
                        <button
                            onClick={() => setRotation((prev) => (prev + 90) % 360)}
                            className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all border border-white/10 active:scale-95"
                            title="Xoay phải"
                        >
                            <RotateCcw size={20} />
                        </button>
                        <button
                            onClick={() => {
                                setCrop({ x: 0, y: 0 });
                                setZoom(1);
                                setRotation(0);
                            }}
                            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-2xl transition-all border border-white/10 active:scale-95"
                        >
                            Đặt lại
                        </button>
                    </div>

                    <p className="text-center text-white/40 text-xs italic">
                        Kéo để di chuyển • Sử dụng thanh trượt để phóng to
                    </p>
                </div>
            </div>

            <style jsx>{`
                input[type='range']::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 24px;
                    height: 24px;
                    background: #E3E846;
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 0 10px rgba(227, 232, 70, 0.4);
                }
            `}</style>
        </div>
    );
}
