import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { requireAdminAuth, getAuthUser, hasPermission } from '@/lib/auth-permissions';

// DELETE - Xóa sản phẩm (Admin only)
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Kiểm tra xác thực admin và quyền xóa sản phẩm
        const auth = await requireAdminAuth();
        if (auth.error) {
            return NextResponse.json(
                { message: auth.error },
                { status: 401 }
            );
        }

        // Kiểm tra quyền products:delete
        const user = await getAuthUser();
        if (!user || !hasPermission(user, 'products:delete')) {
            return NextResponse.json(
                { message: 'Forbidden: Missing permission to delete products' },
                { status: 403 }
            );
        }

        await dbConnect();
        const { id } = await params;

        // Kiểm tra sản phẩm tồn tại
        const product = await Product.findById(id);
        if (!product) {
            return NextResponse.json(
                { message: 'Không tìm thấy sản phẩm' },
                { status: 404 }
            );
        }

        // Xóa sản phẩm
        await Product.findByIdAndDelete(id);

        return NextResponse.json({
            message: 'Đã xóa sản phẩm thành công',
            deletedProduct: {
                id: product._id.toString(),
                name: product.name
            }
        });
    } catch (error: any) {
        console.error('Error deleting product:', error);
        return NextResponse.json(
            { message: 'Lỗi khi xóa sản phẩm', error: error.message },
            { status: 500 }
        );
    }
}

// GET - Lấy chi tiết sản phẩm (Admin only)
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Kiểm tra xác thực admin
        const auth = await requireAdminAuth();
        if (auth.error) {
            return NextResponse.json(
                { message: auth.error },
                { status: 401 }
            );
        }

        await dbConnect();
        const { id } = await params;

        const product = await Product.findById(id).lean();

        if (!product) {
            return NextResponse.json(
                { message: 'Không tìm thấy sản phẩm' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            ...product,
            _id: product._id.toString(),
            id: product._id.toString()
        });
    } catch (error: any) {
        console.error('Error fetching product:', error);
        return NextResponse.json(
            { message: 'Lỗi khi lấy thông tin sản phẩm', error: error.message },
            { status: 500 }
        );
    }
}

// PUT - Cập nhật sản phẩm (Admin only)
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Kiểm tra xác thực admin
        const auth = await requireAdminAuth();
        if (auth.error) {
            return NextResponse.json(
                { message: auth.error },
                { status: 401 }
            );
        }

        // Kiểm tra quyền products:edit
        const user = await getAuthUser();
        if (!user || !hasPermission(user, 'products:edit')) {
            return NextResponse.json(
                { message: 'Forbidden: Missing permission to edit products' },
                { status: 403 }
            );
        }

        await dbConnect();
        const { id } = await params;
        const body = await request.json();

        const product = await Product.findByIdAndUpdate(
            id,
            body,
            { new: true, runValidators: true }
        );

        if (!product) {
            return NextResponse.json(
                { message: 'Không tìm thấy sản phẩm' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'Cập nhật sản phẩm thành công',
            product: {
                id: product._id.toString(),
                ...product.toObject()
            }
        });
    } catch (error: any) {
        console.error('Error updating product:', error);
        return NextResponse.json(
            { message: 'Lỗi khi cập nhật sản phẩm', error: error.message },
            { status: 500 }
        );
    }
}
