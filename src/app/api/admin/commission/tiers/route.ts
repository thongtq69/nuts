import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import CommissionTier from '@/models/CommissionTier';


// Default commission tiers
const defaultTiers = [
    {
        name: 'bronze',
        displayName: 'Đồng',
        description: 'Cấp bậc khởi đầu cho tất cả CTV mới',
        color: '#CD7F32',
        icon: '🥉',
        requirements: {
            minMonthlySales: 0,
            minMonthlyOrders: 0,
            minTeamSize: 0,
            minTeamSales: 0,
            consecutiveMonths: 1
        },
        commissionRates: {
            directSale: 5,
            teamSaleL1: 0,
            teamSaleL2: 0
        },
        benefits: {
            bonusPerOrder: 0,
            monthlyBonus: 0,
            freeShipping: false,
            prioritySupport: false,
            discountPercent: 0
        },
        order: 1,
        isActive: true,
        isDefault: true
    },
    {
        name: 'silver',
        displayName: 'Bạc',
        description: 'Đạt được khi có doanh số ổn định',
        color: '#C0C0C0',
        icon: '🥈',
        requirements: {
            minMonthlySales: 10000000, // 10 triệu
            minMonthlyOrders: 20,
            minTeamSize: 0,
            minTeamSales: 0,
            consecutiveMonths: 1
        },
        commissionRates: {
            directSale: 7,
            teamSaleL1: 1,
            teamSaleL2: 0
        },
        benefits: {
            bonusPerOrder: 5000,
            monthlyBonus: 0,
            freeShipping: false,
            prioritySupport: false,
            discountPercent: 5
        },
        order: 2,
        isActive: true,
        isDefault: false
    },
    {
        name: 'gold',
        displayName: 'Vàng',
        description: 'Cấp bậc cho CTV có kinh nghiệm',
        color: '#FFD700',
        icon: '🥇',
        requirements: {
            minMonthlySales: 30000000, // 30 triệu
            minMonthlyOrders: 50,
            minTeamSize: 3,
            minTeamSales: 10000000, // 10 triệu từ team
            consecutiveMonths: 2
        },
        commissionRates: {
            directSale: 10,
            teamSaleL1: 2,
            teamSaleL2: 0.5
        },
        benefits: {
            bonusPerOrder: 10000,
            monthlyBonus: 500000,
            freeShipping: true,
            prioritySupport: false,
            discountPercent: 10
        },
        order: 3,
        isActive: true,
        isDefault: false
    },
    {
        name: 'platinum',
        displayName: 'Bạch Kim',
        description: 'Cấp bậc cao cấp cho leader team',
        color: '#E5E4E2',
        icon: '💎',
        requirements: {
            minMonthlySales: 70000000, // 70 triệu
            minMonthlyOrders: 100,
            minTeamSize: 10,
            minTeamSales: 50000000, // 50 triệu từ team
            consecutiveMonths: 3
        },
        commissionRates: {
            directSale: 12,
            teamSaleL1: 3,
            teamSaleL2: 1
        },
        benefits: {
            bonusPerOrder: 15000,
            monthlyBonus: 2000000,
            freeShipping: true,
            prioritySupport: true,
            discountPercent: 15
        },
        order: 4,
        isActive: true,
        isDefault: false
    },
    {
        name: 'diamond',
        displayName: 'Kim Cương',
        description: 'Cấp bậc cao nhất cho top performer',
        color: '#B9F2FF',
        icon: '👑',
        requirements: {
            minMonthlySales: 150000000, // 150 triệu
            minMonthlyOrders: 200,
            minTeamSize: 25,
            minTeamSales: 200000000, // 200 triệu từ team
            consecutiveMonths: 3
        },
        commissionRates: {
            directSale: 15,
            teamSaleL1: 4,
            teamSaleL2: 1.5
        },
        benefits: {
            bonusPerOrder: 20000,
            monthlyBonus: 5000000,
            freeShipping: true,
            prioritySupport: true,
            discountPercent: 20
        },
        order: 5,
        isActive: true,
        isDefault: false
    }
];

// GET - List all tiers
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const activeOnly = searchParams.get('active') === 'true';

        const query: any = {};
        if (activeOnly) {
            query.isActive = true;
        }

        const tiers = await CommissionTier.find(query).sort({ order: 1 });

        return NextResponse.json({ success: true, data: tiers });
    } catch (error: any) {
        console.error('Error fetching commission tiers:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Lỗi khi lấy danh sách cấp bậc' },
            { status: 500 }
        );
    }
}

// POST - Create new tier or seed defaults
export async function POST(request: NextRequest) {
    try {
        const session = await verifyToken();
        if (!session || session.role !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Không có quyền truy cập' },
                { status: 403 }
            );
        }

        await dbConnect();

        const body = await request.json();

        // Check if seeding defaults
        if (body.seedDefaults) {
            const existingCount = await CommissionTier.countDocuments();
            if (existingCount > 0) {
                return NextResponse.json(
                    { success: false, error: 'Đã có dữ liệu cấp bậc. Xóa hết trước khi seed lại.' },
                    { status: 400 }
                );
            }

            await CommissionTier.insertMany(defaultTiers);
            return NextResponse.json({
                success: true,
                message: `Đã tạo ${defaultTiers.length} cấp bậc mặc định`
            });
        }

        // Create single tier
        const tier = await CommissionTier.create(body);

        return NextResponse.json({ success: true, data: tier }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating commission tier:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Lỗi khi tạo cấp bậc' },
            { status: 500 }
        );
    }
}

// PUT - Update tier
export async function PUT(request: NextRequest) {
    try {
        const session = await verifyToken();
        if (!session || session.role !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Không có quyền truy cập' },
                { status: 403 }
            );
        }

        await dbConnect();

        const body = await request.json();
        const { id, ...updateData } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Thiếu ID cấp bậc' },
                { status: 400 }
            );
        }

        const tier = await CommissionTier.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true
        });

        if (!tier) {
            return NextResponse.json(
                { success: false, error: 'Không tìm thấy cấp bậc' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: tier });
    } catch (error: any) {
        console.error('Error updating commission tier:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Lỗi khi cập nhật cấp bậc' },
            { status: 500 }
        );
    }
}

// DELETE - Delete tier
export async function DELETE(request: NextRequest) {
    try {
        const session = await verifyToken();
        if (!session || session.role !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Không có quyền truy cập' },
                { status: 403 }
            );
        }

        await dbConnect();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Thiếu ID cấp bậc' },
                { status: 400 }
            );
        }

        const tier = await CommissionTier.findById(id);
        if (!tier) {
            return NextResponse.json(
                { success: false, error: 'Không tìm thấy cấp bậc' },
                { status: 404 }
            );
        }

        // Don't allow deleting default tier
        if (tier.isDefault) {
            return NextResponse.json(
                { success: false, error: 'Không thể xóa cấp bậc mặc định' },
                { status: 400 }
            );
        }

        await CommissionTier.findByIdAndDelete(id);

        return NextResponse.json({
            success: true,
            message: 'Đã xóa cấp bậc thành công'
        });
    } catch (error: any) {
        console.error('Error deleting commission tier:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Lỗi khi xóa cấp bậc' },
            { status: 500 }
        );
    }
}
