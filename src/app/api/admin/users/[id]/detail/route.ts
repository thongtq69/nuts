import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';
import UserVoucher from '@/models/UserVoucher';
import UserMembership from '@/models/UserMembership';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;

        // Lấy thông tin user
        const user = await User.findById(id);
        if (!user) {
            return NextResponse.json({ error: 'Không tìm thấy người dùng' }, { status: 404 });
        }

        // Lấy thống kê đơn hàng
        const orderStats = await Order.aggregate([
            { $match: { userId: user._id } },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalSpent: { $sum: '$total' }
                }
            }
        ]);

        // Lấy đơn hàng gần đây
        const recentOrders = await Order.find({ userId: user._id })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('_id total status createdAt');

        // Lấy voucher
        const vouchers = await UserVoucher.find({ userId: user._id })
            .select('code discountValue discountType isUsed createdAt');

        // Lấy gói hội viên
        const membershipPackages = await UserMembership.find({ userId: user._id })
            .populate('packageId', 'name price')
            .select('packageId startDate endDate isActive');

        // Tổng hợp dữ liệu
        const stats = orderStats[0] || { totalOrders: 0, totalSpent: 0 };
        
        const userDetail = {
            ...user.toObject(),
            totalOrders: stats.totalOrders,
            totalSpent: stats.totalSpent,
            recentOrders,
            vouchers,
            membershipPackages
        };

        return NextResponse.json(userDetail);
    } catch (error) {
        console.error('Error fetching user detail:', error);
        return NextResponse.json({ error: 'Lỗi khi lấy thông tin người dùng' }, { status: 500 });
    }
}