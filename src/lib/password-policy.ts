export const MIN_PASSWORD_LENGTH = 6;
export const MAX_PASSWORD_LENGTH = 128;

export function getNewPasswordValidationError(newPassword: string, currentPassword?: string): string | null {
    if (newPassword.length < MIN_PASSWORD_LENGTH || newPassword.length > MAX_PASSWORD_LENGTH) {
        return `Mật khẩu mới phải có từ ${MIN_PASSWORD_LENGTH} đến ${MAX_PASSWORD_LENGTH} ký tự`;
    }

    if (currentPassword !== undefined && currentPassword === newPassword) {
        return 'Mật khẩu mới phải khác mật khẩu hiện tại';
    }

    return null;
}
