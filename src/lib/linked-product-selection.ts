import LinkedProductCategory from '@/models/LinkedProductCategory';
import { ProductPayloadError } from '@/lib/product-payload';

export async function resolveLinkedProductSelection(
    payload: Record<string, unknown>,
): Promise<Record<string, unknown>> {
    if (payload.isLinkedProduct !== true) {
        return {
            ...payload,
            linkedMenuCategoryId: undefined,
            linkedMenuSubmenuId: undefined,
            linkedMenuCategory: '',
            linkedCategory: '',
        };
    }

    const categoryId = String(payload.linkedMenuCategoryId || '');
    const submenuId = String(payload.linkedMenuSubmenuId || '');

    if (!categoryId || !submenuId) {
        throw new ProductPayloadError(
            'Sản phẩm liên kết phải chọn đầy đủ danh mục và submenu.',
        );
    }

    const category = await LinkedProductCategory.findOne({
        _id: categoryId,
        'submenus._id': submenuId,
    });
    const submenu = category?.submenus.find(item => item._id.toString() === submenuId);

    if (!category || !submenu) {
        throw new ProductPayloadError(
            'Danh mục hoặc submenu sản phẩm liên kết không còn tồn tại.',
        );
    }

    if (!category.isActive || !submenu.isActive) {
        throw new ProductPayloadError(
            'Danh mục hoặc submenu sản phẩm liên kết đang bị tắt.',
        );
    }

    return {
        ...payload,
        linkedMenuCategoryId: category._id,
        linkedMenuSubmenuId: submenu._id,
        linkedMenuCategory: category.name,
        linkedCategory: submenu.name,
    };
}
