export interface ProductPersistenceErrorDetails {
    status: number;
    message: string;
}

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    return '';
}

function getErrorCode(error: unknown): number | undefined {
    if (typeof error !== 'object' || error === null || !('code' in error)) {
        return undefined;
    }

    const code = Number((error as { code?: unknown }).code);
    return Number.isFinite(code) ? code : undefined;
}

export function describeProductPersistenceError(
    error: unknown,
    action: 'create' | 'update',
): ProductPersistenceErrorDetails {
    const rawMessage = getErrorMessage(error);
    const normalizedMessage = rawMessage.toLowerCase();

    if (
        normalizedMessage.includes('over your space quota') ||
        normalizedMessage.includes('writes are blocked on your cluster')
    ) {
        return {
            status: 507,
            message: 'Cơ sở dữ liệu đã đầy nên chưa thể lưu sản phẩm. Vui lòng liên hệ quản trị hệ thống.',
        };
    }

    if (getErrorCode(error) === 11000) {
        return {
            status: 409,
            message: 'Mã SKU hoặc thông tin duy nhất của sản phẩm đã tồn tại.',
        };
    }

    if (normalizedMessage.includes('validation failed')) {
        return {
            status: 400,
            message: 'Thông tin sản phẩm chưa hợp lệ. Vui lòng kiểm tra lại các trường đã nhập.',
        };
    }

    return {
        status: 500,
        message: action === 'create'
            ? 'Không thể tạo sản phẩm. Vui lòng thử lại.'
            : 'Không thể cập nhật sản phẩm. Vui lòng thử lại.',
    };
}
