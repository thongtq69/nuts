import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { requireAdminAuth } from '@/lib/auth-permissions';
import { drawLuckyWheelMilestone, getLuckyWheelAdminSummary, grantLuckyWheelSpinsForCompletedOrder, getLuckyWheelSettings } from '@/lib/lucky-wheel';
import Order from '@/models/Order';
import mongoose from 'mongoose';

export async function GET() {
    const { user } = await requireAdminAuth();
    if (!user) return NextResponse.json({ message: 'Không có quyền truy cập' }, { status: 401 });
    return NextResponse.json(await getLuckyWheelAdminSummary());
}

export async function PATCH(request: Request) {
    const { user } = await requireAdminAuth();
    if (!user) return NextResponse.json({ message: 'Không có quyền truy cập' }, { status: 401 });
    const body = await request.json();
    const legalApprovalReference = String(body.legalApprovalReference || '').trim();
    if (body.enabled && !legalApprovalReference) {
        return NextResponse.json({ message: 'Phải nhập số/xác nhận đăng ký khuyến mại trước khi kích hoạt.' }, { status: 400 });
    }
    if (body.campaignStartAt && body.campaignEndAt && new Date(body.campaignStartAt) >= new Date(body.campaignEndAt)) {
        return NextResponse.json({ message: 'Thời gian kết thúc phải sau thời gian bắt đầu.' }, { status: 400 });
    }
    const settings = await getLuckyWheelSettings();
    settings.enabled = Boolean(body.enabled);
    settings.legalApprovalReference = legalApprovalReference;
    settings.campaignName = String(body.campaignName || 'Vòng quay tri ân khách hàng').trim();
    settings.campaignStartAt = body.campaignStartAt ? new Date(body.campaignStartAt) : undefined;
    settings.campaignEndAt = body.campaignEndAt ? new Date(body.campaignEndAt) : undefined;
    settings.updatedBy = new mongoose.Types.ObjectId(user._id);
    await settings.save();
    return NextResponse.json({ message: settings.enabled ? 'Đã kích hoạt chương trình' : 'Đã lưu ở trạng thái tạm dừng', settings });
}

export async function POST(request: Request) {
    const { user } = await requireAdminAuth();
    if (!user) return NextResponse.json({ message: 'Không có quyền truy cập' }, { status: 401 });
    const { action } = await request.json();
    try {
        if (action === 'draw') {
            const milestone = await drawLuckyWheelMilestone(user._id);
            return NextResponse.json({ message: 'Đã quay thưởng mốc doanh thu và cấp voucher cho 15 khách hàng.', milestone });
        }
        if (action === 'reconcile') {
            await dbConnect();
            const settings = await getLuckyWheelSettings();
            if (!settings.enabled || !settings.legalApprovalReference) {
                return NextResponse.json({ message: 'Chỉ đồng bộ sau khi chương trình đã được kích hoạt hợp lệ.' }, { status: 409 });
            }
            const query: Record<string, unknown> = {
                orderType: { $ne: 'membership' },
                status: { $in: ['completed', 'delivered'] },
                totalAmount: { $gte: settings.qualifyingOrderMinimum },
                user: { $exists: true, $ne: null },
            };
            const createdAt: Record<string, Date> = {};
            if (settings.campaignStartAt) createdAt.$gte = settings.campaignStartAt;
            if (settings.campaignEndAt) createdAt.$lte = settings.campaignEndAt;
            if (Object.keys(createdAt).length) query.createdAt = createdAt;
            const orders = await Order.find(query).select('_id').lean();
            let granted = 0;
            for (const order of orders) {
                const outcome = await grantLuckyWheelSpinsForCompletedOrder(String(order._id));
                if (outcome.granted) granted += 1;
            }
            return NextResponse.json({ message: `Đã đồng bộ ${granted} đơn mới, các đơn đã cấp trước đó được giữ nguyên.`, granted });
        }
        return NextResponse.json({ message: 'Thao tác không hợp lệ' }, { status: 400 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : '';
        const messages: Record<string, string> = {
            CAMPAIGN_INACTIVE: 'Chương trình chưa hoạt động.',
            MILESTONE_NOT_REACHED: 'Chưa đạt mốc doanh thu tiếp theo.',
            NOT_ENOUGH_CUSTOMERS: 'Cần ít nhất 15 khách hàng hợp lệ để quay thưởng.',
        };
        return NextResponse.json({ message: messages[errorMessage] || 'Không thể thực hiện thao tác.' }, { status: 409 });
    }
}
