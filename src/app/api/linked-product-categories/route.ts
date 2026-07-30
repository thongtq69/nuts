import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import LinkedProductCategory from '@/models/LinkedProductCategory';
import { createLinkedMenuSlug, normalizeLinkedMenuName } from '@/lib/linked-product-menu';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function requireAdmin(request: Request): Promise<NextResponse | null> {
    const user = await verifyToken(request);
    if (!user || user.role !== 'admin') {
        return NextResponse.json(
            { message: 'Bạn không có quyền quản lý danh mục liên kết.' },
            { status: 403 },
        );
    }
    return null;
}

function parseSortOrder(value: unknown): number {
    const number = Number(value);
    return Number.isFinite(number) ? Math.round(number) : 0;
}

async function createUniqueCategorySlug(name: string, ignoredId?: string): Promise<string> {
    const base = createLinkedMenuSlug(name) || 'danh-muc';
    let slug = base;
    let suffix = 2;

    while (await LinkedProductCategory.exists({
        slug,
        ...(ignoredId ? { _id: { $ne: ignoredId } } : {}),
    })) {
        slug = `${base}-${suffix}`;
        suffix += 1;
    }

    return slug;
}

function createUniqueSubmenuSlug(
    name: string,
    existingSlugs: string[],
    currentSlug?: string,
): string {
    const base = createLinkedMenuSlug(name) || 'submenu';
    const used = new Set(existingSlugs.filter(slug => slug !== currentSlug));
    let slug = base;
    let suffix = 2;

    while (used.has(slug)) {
        slug = `${base}-${suffix}`;
        suffix += 1;
    }

    return slug;
}

export async function GET(request: Request) {
    try {
        await dbConnect();
        const includeInactive = new URL(request.url).searchParams.get('includeInactive') === '1';
        const filter = includeInactive ? {} : { isActive: true };
        const categories = await LinkedProductCategory.find(filter)
            .sort({ sortOrder: -1, name: 1 })
            .lean();

        const result = categories.map(category => ({
            ...category,
            _id: category._id.toString(),
            submenus: category.submenus
                .filter(submenu => includeInactive || submenu.isActive)
                .sort((a, b) => b.sortOrder - a.sortOrder || a.name.localeCompare(b.name, 'vi'))
                .map(submenu => ({
                    ...submenu,
                    _id: submenu._id.toString(),
                })),
        }));

        return NextResponse.json(result);
    } catch (error) {
        console.error('Failed to fetch linked product categories:', error);
        return NextResponse.json(
            { message: 'Không thể tải danh mục sản phẩm liên kết.' },
            { status: 500 },
        );
    }
}

export async function POST(request: Request) {
    try {
        const unauthorizedResponse = await requireAdmin(request);
        if (unauthorizedResponse) return unauthorizedResponse;
        await dbConnect();
        const body = await request.json();
        const type = body.type === 'submenu' ? 'submenu' : 'category';
        const name = normalizeLinkedMenuName(body.name);

        if (!name) {
            return NextResponse.json({ message: 'Tên danh mục không được để trống.' }, { status: 400 });
        }

        if (type === 'category') {
            const duplicate = await LinkedProductCategory.findOne({
                name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
            }).lean();
            if (duplicate) {
                return NextResponse.json({ message: 'Danh mục này đã tồn tại.' }, { status: 409 });
            }

            const category = await LinkedProductCategory.create({
                name,
                slug: await createUniqueCategorySlug(name),
                sortOrder: parseSortOrder(body.sortOrder),
                isActive: body.isActive !== false,
                submenus: [],
            });
            return NextResponse.json(category, { status: 201 });
        }

        const category = await LinkedProductCategory.findById(body.categoryId);
        if (!category) {
            return NextResponse.json({ message: 'Không tìm thấy danh mục cha.' }, { status: 404 });
        }
        if (category.submenus.some(submenu => submenu.name.toLocaleLowerCase('vi') === name.toLocaleLowerCase('vi'))) {
            return NextResponse.json({ message: 'Submenu này đã tồn tại trong danh mục.' }, { status: 409 });
        }

        category.submenus.push({
            name,
            slug: createUniqueSubmenuSlug(name, category.submenus.map(submenu => submenu.slug)),
            sortOrder: parseSortOrder(body.sortOrder),
            isActive: body.isActive !== false,
        } as never);
        await category.save();

        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        console.error('Failed to create linked product category:', error);
        return NextResponse.json(
            { message: 'Không thể tạo danh mục sản phẩm liên kết.' },
            { status: 500 },
        );
    }
}

export async function PUT(request: Request) {
    try {
        const unauthorizedResponse = await requireAdmin(request);
        if (unauthorizedResponse) return unauthorizedResponse;
        await dbConnect();
        const body = await request.json();
        const category = await LinkedProductCategory.findById(body.categoryId);
        if (!category) {
            return NextResponse.json({ message: 'Không tìm thấy danh mục.' }, { status: 404 });
        }

        const name = normalizeLinkedMenuName(body.name);
        if (!name) {
            return NextResponse.json({ message: 'Tên danh mục không được để trống.' }, { status: 400 });
        }

        if (body.type === 'submenu') {
            const submenu = category.submenus.find(
                item => item._id.toString() === String(body.submenuId),
            );
            if (!submenu) {
                return NextResponse.json({ message: 'Không tìm thấy submenu.' }, { status: 404 });
            }
            const duplicate = category.submenus.some(item =>
                item._id.toString() !== submenu._id.toString() &&
                item.name.toLocaleLowerCase('vi') === name.toLocaleLowerCase('vi')
            );
            if (duplicate) {
                return NextResponse.json({ message: 'Submenu này đã tồn tại trong danh mục.' }, { status: 409 });
            }

            submenu.name = name;
            submenu.slug = createUniqueSubmenuSlug(
                name,
                category.submenus.map(item => item.slug),
                submenu.slug,
            );
            submenu.sortOrder = parseSortOrder(body.sortOrder);
            submenu.isActive = body.isActive !== false;
            await Product.updateMany(
                { linkedMenuSubmenuId: submenu._id },
                { $set: { linkedCategory: name } },
            );
        } else {
            category.name = name;
            category.slug = await createUniqueCategorySlug(name, category._id.toString());
            category.sortOrder = parseSortOrder(body.sortOrder);
            category.isActive = body.isActive !== false;
            await Product.updateMany(
                { linkedMenuCategoryId: category._id },
                { $set: { linkedMenuCategory: name } },
            );
        }

        await category.save();
        return NextResponse.json(category);
    } catch (error) {
        console.error('Failed to update linked product category:', error);
        return NextResponse.json(
            { message: 'Không thể cập nhật danh mục sản phẩm liên kết.' },
            { status: 500 },
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const unauthorizedResponse = await requireAdmin(request);
        if (unauthorizedResponse) return unauthorizedResponse;
        await dbConnect();
        const body = await request.json();
        const category = await LinkedProductCategory.findById(body.categoryId);
        if (!category) {
            return NextResponse.json({ message: 'Không tìm thấy danh mục.' }, { status: 404 });
        }

        if (body.type === 'submenu') {
            const productCount = await Product.countDocuments({
                linkedMenuSubmenuId: body.submenuId,
            });
            if (productCount > 0) {
                return NextResponse.json({
                    message: `Submenu đang được sử dụng bởi ${productCount} sản phẩm. Hãy chuyển sản phẩm sang mục khác trước.`,
                }, { status: 409 });
            }

            category.submenus = category.submenus.filter(
                submenu => submenu._id.toString() !== String(body.submenuId),
            );
            await category.save();
        } else {
            const productCount = await Product.countDocuments({
                linkedMenuCategoryId: body.categoryId,
            });
            if (productCount > 0) {
                return NextResponse.json({
                    message: `Danh mục đang được sử dụng bởi ${productCount} sản phẩm. Hãy chuyển sản phẩm sang mục khác trước.`,
                }, { status: 409 });
            }

            await category.deleteOne();
        }

        return NextResponse.json({ message: 'Đã xóa danh mục.' });
    } catch (error) {
        console.error('Failed to delete linked product category:', error);
        return NextResponse.json(
            { message: 'Không thể xóa danh mục sản phẩm liên kết.' },
            { status: 500 },
        );
    }
}
