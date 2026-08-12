import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { requireAdminAuth } from '@/lib/auth-permissions';
import { getLegacyCommissionIntegrity } from '@/lib/legacy-commission';
import AffiliateCommission from '@/models/AffiliateCommission';
import LegacyCommissionArchive from '@/models/LegacyCommissionArchive';
import Order from '@/models/Order';
import User from '@/models/User';

const ACTIVE_COMMISSION_QUERY = {
    $or: [
        { archivedAt: { $exists: false } },
        { archivedAt: null },
    ],
};

async function getReconciliationRecords() {
    const commissions = await AffiliateCommission.find(ACTIVE_COMMISSION_QUERY)
        .sort({ createdAt: -1 })
        .lean();

    const [affiliates, orders] = await Promise.all([
        User.find({ _id: { $in: commissions.map(commission => commission.affiliateId.toString()) } })
            .select('_id name email referralCode')
            .lean(),
        Order.find({ _id: { $in: commissions.map(commission => commission.orderId) } })
            .select('_id totalAmount status createdAt')
            .lean(),
    ]);
    const affiliateById = new Map(affiliates.map(affiliate => [affiliate._id.toString(), affiliate]));
    const orderById = new Map(orders.map(order => [order._id.toString(), order]));

    return commissions.map((commission) => {
        const affiliate = affiliateById.get(commission.affiliateId.toString());
        const order = orderById.get(commission.orderId.toString());

        return {
            commission,
            affiliate,
            order,
            integrityStatus: getLegacyCommissionIntegrity(Boolean(affiliate), Boolean(order)),
        };
    });
}

function buildReport(records: Awaited<ReturnType<typeof getReconciliationRecords>>) {
    const orphaned = records.filter(record => record.integrityStatus !== 'valid');

    return {
        generatedAt: new Date().toISOString(),
        total: records.length,
        valid: records.length - orphaned.length,
        orphaned: orphaned.length,
        orphanedAmount: orphaned.reduce(
            (sum, record) => sum + Number(record.commission.commissionAmount || 0),
            0,
        ),
        groups: {
            pending: orphaned.filter(record => record.commission.status === 'pending').length,
            approved: orphaned.filter(record => record.commission.status === 'approved').length,
            paid: orphaned.filter(record => record.commission.status === 'paid').length,
            rejected: orphaned.filter(record => record.commission.status === 'rejected').length,
            missingAffiliate: orphaned.filter(record => (
                record.integrityStatus === 'missing_affiliate'
                || record.integrityStatus === 'missing_both'
            )).length,
            missingOrder: orphaned.filter(record => (
                record.integrityStatus === 'missing_order'
                || record.integrityStatus === 'missing_both'
            )).length,
        },
        confirmation: `ARCHIVE_${orphaned.length}_${orphaned.reduce(
            (sum, record) => sum + Number(record.commission.commissionAmount || 0),
            0,
        )}`,
    };
}

export async function GET() {
    try {
        const auth = await requireAdminAuth();
        if (!auth.user) {
            return NextResponse.json({ error: auth.error }, { status: 401 });
        }

        await dbConnect();
        const records = await getReconciliationRecords();
        return NextResponse.json(buildReport(records));
    } catch (error) {
        console.error('Legacy commission reconciliation report error:', error);
        return NextResponse.json({ error: 'Không thể tạo báo cáo đối soát' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    let session: mongoose.ClientSession | null = null;

    try {
        const auth = await requireAdminAuth();
        if (!auth.user) {
            return NextResponse.json({ error: auth.error }, { status: 401 });
        }

        const body = await req.json() as {
            action?: string;
            confirmation?: string;
            reason?: string;
        };

        if (body.action !== 'archive_orphans') {
            return NextResponse.json({ error: 'Action không hợp lệ' }, { status: 400 });
        }

        await dbConnect();
        const records = await getReconciliationRecords();
        const report = buildReport(records);

        if (body.confirmation !== report.confirmation) {
            return NextResponse.json(
                {
                    error: 'Dữ liệu đã thay đổi hoặc mã xác nhận không đúng. Hãy chạy lại dry-run.',
                    report,
                },
                { status: 409 },
            );
        }

        const orphaned = records.filter(record => record.integrityStatus !== 'valid');
        if (orphaned.length === 0) {
            return NextResponse.json({ message: 'Không có bản ghi mất liên kết', archived: 0 });
        }

        const archivedAt = new Date();
        const archiveReason = body.reason?.trim() || 'Lưu trữ sau đối soát dữ liệu hoa hồng cũ';
        const mongoSession = await mongoose.startSession();
        session = mongoSession;

        await mongoSession.withTransaction(async () => {
            for (const { commission, affiliate, order, integrityStatus } of orphaned) {

                await LegacyCommissionArchive.updateOne(
                    { sourceCommissionId: commission._id },
                    {
                        $setOnInsert: {
                            sourceCommissionId: commission._id,
                            affiliateId: commission.affiliateId,
                            orderId: commission.orderId,
                            orderValue: commission.orderValue,
                            commissionRate: commission.commissionRate,
                            commissionAmount: commission.commissionAmount,
                            status: commission.status,
                            note: commission.note,
                            affiliateSnapshot: {
                                name: affiliate?.name || commission.affiliateName,
                                email: affiliate?.email || commission.affiliateEmail,
                                referralCode: affiliate?.referralCode || commission.affiliateReferralCode,
                            },
                            orderSnapshot: {
                                orderNumber: commission.orderNumber || order?._id?.toString(),
                                totalAmount: order?.totalAmount || commission.orderValue,
                                status: order?.status || commission.orderStatus,
                                createdAt: order?.createdAt,
                            },
                            integrityStatus,
                            archiveReason,
                            sourceCreatedAt: commission.createdAt,
                            sourceUpdatedAt: commission.updatedAt,
                            archivedAt,
                        },
                    },
                    { upsert: true, session: mongoSession },
                );

                const statusUpdate = commission.status === 'pending'
                    ? { status: 'rejected' as const }
                    : {};
                const note = commission.status === 'pending'
                    ? [commission.note, 'Tự động từ chối khi lưu trữ: bản ghi mất liên kết']
                        .filter(Boolean)
                        .join(' | ')
                    : commission.note;

                await AffiliateCommission.updateOne(
                    { _id: commission._id, ...ACTIVE_COMMISSION_QUERY },
                    {
                        $set: {
                            ...statusUpdate,
                            note,
                            integrityStatus,
                            integrityCheckedAt: archivedAt,
                            requiresReconciliation: true,
                            archivedAt,
                            archiveReason,
                        },
                    },
                    { session: mongoSession },
                );
            }
        });

        return NextResponse.json({
            message: `Đã lưu trữ ${orphaned.length} bản ghi mất liên kết`,
            archived: orphaned.length,
            archivedAmount: report.orphanedAmount,
        });
    } catch (error) {
        console.error('Legacy commission archive error:', error);
        return NextResponse.json({ error: 'Không thể lưu trữ dữ liệu hoa hồng cũ' }, { status: 500 });
    } finally {
        await session?.endSession();
    }
}
