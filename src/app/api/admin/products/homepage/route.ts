import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { getAuthUser, hasPermission, requireAdminAuth } from '@/lib/auth-permissions';
import {
    HOMEPAGE_SECTION_CONFIG,
    HomepageSelectionError,
    type HomepageSection,
    normalizeHomepageSelection,
} from '@/lib/homepage-products';

export const dynamic = 'force-dynamic';

async function requireHomepageProductAccess() {
    const auth = await requireAdminAuth();
    if (auth.error) {
        return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    const user = await getAuthUser();
    if (!user || !hasPermission(user, 'products:edit')) {
        return NextResponse.json(
            { message: 'Bạn không có quyền chỉnh sửa sản phẩm trang chủ' },
            { status: 403 },
        );
    }

    return null;
}

function legacyFilter(section: HomepageSection) {
    const config = HOMEPAGE_SECTION_CONFIG[section];

    if (config.linkedOnly) {
        return { isLinkedProduct: true };
    }

    return {
        tags: config.legacyTag,
        isLinkedProduct: { $ne: true },
    };
}

export async function GET() {
    try {
        const accessError = await requireHomepageProductAccess();
        if (accessError) return accessError;

        await dbConnect();

        const products = await Product.find({})
            .select('name image currentPrice category tags isLinkedProduct linkedCategory sortOrder stockStatus createdAt showOnHomepageBestSeller showOnHomepageNew showOnHomepagePromo showOnHomepageLinked')
            .sort({ sortOrder: -1, createdAt: -1 })
            .lean();

        const sections = await Promise.all(
            (Object.keys(HOMEPAGE_SECTION_CONFIG) as HomepageSection[]).map(async section => {
                const config = HOMEPAGE_SECTION_CONFIG[section];
                const configured = Boolean(await Product.exists({ [config.field]: { $exists: true } }));
                const selectedProducts = await Product.find(
                    configured
                        ? { [config.field]: true }
                        : legacyFilter(section),
                )
                    .sort({ sortOrder: -1, createdAt: -1 })
                    .limit(config.limit)
                    .select('_id')
                    .lean();

                return [section, {
                    configured,
                    limit: config.limit,
                    label: config.label,
                    productIds: selectedProducts.map(product => product._id.toString()),
                }] as const;
            }),
        );

        return NextResponse.json({
            products: products.map(product => ({
                ...product,
                _id: product._id.toString(),
                id: product._id.toString(),
            })),
            sections: Object.fromEntries(sections),
        });
    } catch (error) {
        console.error('Failed to load homepage product configuration:', error);
        return NextResponse.json(
            { message: 'Không thể tải cấu hình sản phẩm trang chủ' },
            { status: 500 },
        );
    }
}

export async function PATCH(request: Request) {
    try {
        const accessError = await requireHomepageProductAccess();
        if (accessError) return accessError;

        await dbConnect();
        const body = await request.json();
        const { section, productIds } = normalizeHomepageSelection(body.section, body.productIds);
        const config = HOMEPAGE_SECTION_CONFIG[section];

        if (productIds.some(id => !mongoose.Types.ObjectId.isValid(id))) {
            throw new HomepageSelectionError('Danh sách có mã sản phẩm không hợp lệ');
        }

        const objectIds = productIds.map(id => new mongoose.Types.ObjectId(id));
        const eligibleFilter = config.linkedOnly
            ? { _id: { $in: objectIds }, isLinkedProduct: true }
            : { _id: { $in: objectIds }, isLinkedProduct: { $ne: true } };
        const eligibleCount = await Product.countDocuments(eligibleFilter);

        if (eligibleCount !== objectIds.length) {
            throw new HomepageSelectionError(
                config.linkedOnly
                    ? 'Chỉ sản phẩm liên kết mới được chọn vào nhóm này'
                    : 'Sản phẩm liên kết không thể đưa vào nhóm sản phẩm thường',
            );
        }

        await Product.updateMany(
            {},
            [
                {
                    $set: {
                        [config.field]: { $in: ['$_id', objectIds] },
                    },
                },
            ],
            { updatePipeline: true },
        );

        return NextResponse.json({
            message: `Đã cập nhật ${config.label} trên trang chủ`,
            section,
            productIds,
        });
    } catch (error) {
        if (error instanceof HomepageSelectionError) {
            return NextResponse.json({ message: error.message }, { status: 400 });
        }

        console.error('Failed to update homepage products:', error);
        return NextResponse.json(
            { message: 'Không thể cập nhật sản phẩm trang chủ' },
            { status: 500 },
        );
    }
}
