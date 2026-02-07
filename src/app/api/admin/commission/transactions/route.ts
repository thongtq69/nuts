import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import CommissionTransaction from '@/models/CommissionTransaction';
import User from '@/models/User';
import mongoose from 'mongoose';

// GET - List transactions with filtering
export async function GET(request: NextRequest) {
    try {
        const session = await verifyToken();
        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Chưa đăng nhập' },
                { status: 401 }
            );
        }

        await dbConnect();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const status = searchParams.get('status');
        const type = searchParams.get('type');
        const userId = searchParams.get('userId');
        const year = searchParams.get('year');
        const month = searchParams.get('month');

        // Build query
        const query: any = {};

        // If not admin, only show own transactions
        if (session.role !== 'admin') {
            query.userId = new mongoose.Types.ObjectId(session.id);
        } else if (userId) {
            query.userId = new mongoose.Types.ObjectId(userId);
        }

        if (status) query.status = status;
        if (type) query.commissionType = type;
        if (year) query.periodYear = parseInt(year);
        if (month) query.periodMonth = parseInt(month);

        const skip = (page - 1) * limit;

        const [transactions, total, stats] = await Promise.all([
            CommissionTransaction.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            CommissionTransaction.countDocuments(query),
            CommissionTransaction.aggregate([
                { $match: session.role === 'admin' ? {} : { userId: new mongoose.Types.ObjectId(session.id) } },
                {
                    $group: {
                        _id: '$status',
                        total: { $sum: '$commissionAmount' },
                        count: { $sum: 1 }
                    }
                }
            ])
        ]);

        // Format stats
        const formattedStats = {
            pending: { total: 0, count: 0 },
            approved: { total: 0, count: 0 },
            paid: { total: 0, count: 0 },
            cancelled: { total: 0, count: 0 }
        };

        stats.forEach((s: any) => {
            if (formattedStats[s._id as keyof typeof formattedStats]) {
                formattedStats[s._id as keyof typeof formattedStats] = {
                    total: s.total,
                    count: s.count
                };
            }
        });

        return NextResponse.json({
            success: true,
            data: transactions,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            },
            stats: formattedStats
        });
    } catch (error: any) {
        console.error('Error fetching commission transactions:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Lỗi khi lấy danh sách giao dịch' },
            { status: 500 }
        );
    }
}

// POST - Bulk operations (approve, reject, pay)
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
        const { action, transactionIds, paymentInfo, reason } = body;

        if (!action || !transactionIds || !Array.isArray(transactionIds)) {
            return NextResponse.json(
                { success: false, error: 'Thiếu thông tin action hoặc transactionIds' },
                { status: 400 }
            );
        }

        const objectIds = transactionIds.map((id: string) => new mongoose.Types.ObjectId(id));

        let result: any;

        switch (action) {
            case 'approve':
                result = await CommissionTransaction.updateMany(
                    { _id: { $in: objectIds }, status: 'pending' },
                    {
                        status: 'approved',
                        approvedBy: new mongoose.Types.ObjectId(session.id),
                        approvedByName: 'Admin',
                        approvedAt: new Date()
                    }
                );
                break;

            case 'reject':
                result = await CommissionTransaction.updateMany(
                    { _id: { $in: objectIds }, status: 'pending' },
                    {
                        status: 'rejected',
                        approvedBy: new mongoose.Types.ObjectId(session.id),
                        approvedByName: 'Admin',
                        approvedAt: new Date(),
                        rejectedReason: reason || 'Bị từ chối bởi admin'
                    }
                );
                break;

            case 'pay':
                if (!paymentInfo?.method || !paymentInfo?.reference) {
                    return NextResponse.json(
                        { success: false, error: 'Thiếu thông tin thanh toán' },
                        { status: 400 }
                    );
                }

                result = await CommissionTransaction.updateMany(
                    { _id: { $in: objectIds }, status: 'approved' },
                    {
                        status: 'paid',
                        paidAt: new Date(),
                        paymentMethod: paymentInfo.method,
                        paymentReference: paymentInfo.reference,
                        paymentBatch: paymentInfo.batch
                    }
                );

                // Update user wallet balances
                const paidTransactions = await CommissionTransaction.find({
                    _id: { $in: objectIds },
                    status: 'paid'
                });

                for (const tx of paidTransactions) {
                    await User.findByIdAndUpdate(tx.userId, {
                        $inc: { totalCommission: tx.commissionAmount }
                    });
                }
                break;

            case 'cancel':
                result = await CommissionTransaction.updateMany(
                    { _id: { $in: objectIds }, status: { $in: ['pending', 'approved'] } },
                    {
                        status: 'cancelled',
                        internalNotes: reason || 'Đã hủy bởi admin'
                    }
                );
                break;

            default:
                return NextResponse.json(
                    { success: false, error: 'Action không hợp lệ' },
                    { status: 400 }
                );
        }

        return NextResponse.json({
            success: true,
            message: `Đã ${action} ${result.modifiedCount} giao dịch`,
            modifiedCount: result.modifiedCount
        });
    } catch (error: any) {
        console.error('Error processing commission transactions:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Lỗi khi xử lý giao dịch' },
            { status: 500 }
        );
    }
}
