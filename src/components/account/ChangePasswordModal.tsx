'use client';

import { useEffect, useState } from 'react';
import { KeyRound, LoaderCircle, X } from 'lucide-react';
import PasswordInput from '@/components/common/PasswordInput';
import { useToast } from '@/context/ToastContext';
import {
    MAX_PASSWORD_LENGTH,
    MIN_PASSWORD_LENGTH,
    getNewPasswordValidationError,
} from '@/lib/password-policy';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
    const toast = useToast();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const resetForm = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    const closeModal = () => {
        if (isSubmitting) return;
        resetForm();
        onClose();
    };

    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !isSubmitting) {
                resetForm();
                onClose();
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, isSubmitting, onClose]);

    if (!isOpen) return null;

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error('Mật khẩu chưa khớp', 'Xác nhận mật khẩu mới không chính xác.');
            return;
        }

        const passwordValidationError = getNewPasswordValidationError(newPassword, currentPassword);
        if (passwordValidationError) {
            toast.error('Mật khẩu chưa hợp lệ', passwordValidationError);
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.message || 'Không thể đổi mật khẩu');
            }

            toast.success('Đổi mật khẩu thành công', 'Vui lòng đăng nhập lại bằng mật khẩu mới.');
            window.setTimeout(() => window.location.assign('/login'), 600);
        } catch (error) {
            toast.error(
                'Không thể đổi mật khẩu',
                error instanceof Error ? error.message : 'Vui lòng thử lại.',
            );
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
            onMouseDown={closeModal}
            role="presentation"
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="agent-change-password-title"
                className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
                onMouseDown={(event) => event.stopPropagation()}
            >
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F5EFE6] text-[#9C7044]">
                            <KeyRound size={20} />
                        </div>
                        <div>
                            <h2 id="agent-change-password-title" className="text-lg font-bold text-slate-900">Đổi mật khẩu</h2>
                            <p className="mt-1 text-sm text-slate-500">Bạn sẽ cần đăng nhập lại sau khi đổi thành công.</p>
                        </div>
                    </div>
                    <button type="button" onClick={closeModal} disabled={isSubmitting} aria-label="Đóng" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">
                        <X size={19} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-slate-700">Mật khẩu hiện tại</span>
                        <PasswordInput value={currentPassword} onChange={setCurrentPassword} placeholder="Nhập mật khẩu hiện tại" required disabled={isSubmitting} name="currentPassword" />
                    </label>
                    <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-slate-700">Mật khẩu mới</span>
                        <PasswordInput value={newPassword} onChange={setNewPassword} placeholder={`Từ ${MIN_PASSWORD_LENGTH} đến ${MAX_PASSWORD_LENGTH} ký tự`} required disabled={isSubmitting} name="newPassword" />
                    </label>
                    <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-slate-700">Xác nhận mật khẩu mới</span>
                        <PasswordInput value={confirmPassword} onChange={setConfirmPassword} placeholder="Nhập lại mật khẩu mới" required disabled={isSubmitting} name="confirmPassword" />
                    </label>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={closeModal} disabled={isSubmitting} className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">Hủy</button>
                        <button type="submit" disabled={isSubmitting} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#9C7044] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#7d5a36] disabled:cursor-not-allowed disabled:opacity-60">
                            {isSubmitting && <LoaderCircle size={16} className="animate-spin" />}
                            {isSubmitting ? 'Đang đổi...' : 'Đổi mật khẩu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
