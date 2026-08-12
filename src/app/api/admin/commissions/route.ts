import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { requireAdminAuth } from '@/lib/auth-permissions';
import {
    canTransitionLegacyCommission,
    getLegacyCommissionIntegrity,
    type LegacyCommissionStatus,
} from '@/lib/legacy-commission';
import AffiliateCommission from '@/models/AffiliateCommission';
import Order from '@/models/Order';
import User from '@/models/User';

const ACTIVE_COMMISSION_QUERY = {
    $or: [
        { archivedAt: { $exists: false } },
        { archivedAt: null },
    ],
};

export async function GET() {
    try {
        const auth = await requireAdminAuth();
        if (!auth.user) {
            return NextResponse.json({ error: auth.error }, { status: 401 });
        }

        await dbConnect();
        const commissions = await AffiliateCommission.find(ACTIVE_COMMISSION_QUERY)
            .populate('affiliateId', 'name email referralCode')
            .populate('orderId', 'totalAmount status createdAt')
            .sort({ createdAt: -1 })
            .lean();

        const result = commissions.map((commission) => {
            const integrityStatus = getLegacyCommissionIntegrity(
                Boolean(commission.affiliateId),
                Boolean(commission.orderId),
            );

            return {
                ...commission,
                integrityStatus,
                requiresReconciliation:
                    integrityStatus !== 'valid' || Boolean(commission.requiresReconciliation),
            };
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching commissions:', error);
        return NextResponse.json({ message: 'Error fetching commissions' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    let session: mongoose.ClientSession | null = null;

    try {
        const auth = await requireAdminAuth();
        if (!auth.user) {
            return NextResponse.json({ error: auth.error }, { status: 401 });
        }

        await dbConnect();
        const { id, status, reason } = await req.json() as {
            id?: string;
            status?: LegacyCommissionStatus;
            reason?: string;
        };

        if (!id || !mongoose.isValidObjectId(id)) {
            return NextResponse.json({ message: 'Commission ID không hợp lệ' }, { status: 400 });
        }

        if (!status || !['approved', 'rejected', 'paid'].includes(status)) {
            return NextResponse.json({ message: 'Trạng thái không hợp lệ' }, { status: 400 });
        }

        const commission = await AffiliateCommission.findOne({
            _id: id,
            ...ACTIVE_COMMISSION_QUERY,
        });
        if (!commission) {
            return NextResponse.json({ message: 'Không tìm thấy hoa hồng' }, { status: 404 });
        }

        if (!canTransitionLegacyCommission(commission.status, status)) {
            return NextResponse.json(
                { message: `Không thể chuyển trạng thái từ ${commission.status} sang ${status}` },
                { status: 409 },
            );
        }

        const [affiliate, order] = await Promise.all([
            User.findById(commission.affiliateId.toString())
                .select('_id name email referralCode')
                .lean(),
            Order.findById(commission.orderId).select('_id status totalAmount createdAt').lean(),
        ]);
        const integrityStatus = getLegacyCommissionIntegrity(Boolean(affiliate), Boolean(order));

        if (integrityStatus !== 'valid') {
            await AffiliateCommission.updateOne(
                { _id: commission._id },
                {
                    $set: {
                        integrityStatus,
                        integrityCheckedAt: new Date(),
                        requiresReconciliation: true,
                    },
                },
            );

            return NextResponse.json(
                {
                    message: 'Bản ghi bị mất liên kết. Hãy đối soát trước khi thay đổi trạng thái.',
                    integrityStatus,
                },
                { status: 409 },
            );
        }

        const mongoSession = await mongoose.startSession();
        session = mongoSession;
        let updatedCommission = commission;

        await mongoSession.withTransaction(async () => {
            const current = await AffiliateCommission.findOne({
                _id: id,
                status: commission.status,
                ...ACTIVE_COMMISSION_QUERY,
            }).session(mongoSession);

            if (!current) {
                throw new Error('COMMISSION_CHANGED');
            }

            if (status === 'approved') {
                const walletResult = await User.updateOne(
                    { _id: current.affiliateId.toString() },
                    {
                        $inc: {
                            walletBalance: current.commissionAmount,
                            totalCommission: current.commissionAmount,
                        },
                    },
                    { session: mongoSession },
                );

                if (walletResult.matchedCount !== 1) {
                    throw new Error('AFFILIATE_UNAVAILABLE');
                }

                current.approvedAt = new Date();
            }

            if (status === 'paid') {
                current.paidAt = new Date();
            }

            if (status === 'rejected' && reason?.trim()) {
                current.note = [current.note, `Từ chối: ${reason.trim()}`]
                    .filter(Boolean)
                    .join(' | ');
            }

            current.status = status;
            current.integrityStatus = 'valid';
            current.integrityCheckedAt = new Date();
            current.requiresReconciliation = false;
            await current.save({ session: mongoSession });
            updatedCommission = current;
        });

        return NextResponse.json(updatedCommission);
    } catch (error) {
        if (error instanceof Error && error.message === 'COMMISSION_CHANGED') {
            return NextResponse.json(
                { message: 'Hoa hồng vừa được cập nhật ở nơi khác. Vui lòng tải lại trang.' },
                { status: 409 },
            );
        }
        if (error instanceof Error && error.message === 'AFFILIATE_UNAVAILABLE') {
            return NextResponse.json(
                { message: 'Tài khoản nhận hoa hồng không còn tồn tại.' },
                { status: 409 },
            );
        }

        console.error('Error updating commission:', error);
        return NextResponse.json({ message: 'Error updating commission' }, { status: 500 });
    } finally {
        await session?.endSession();
    }
}
