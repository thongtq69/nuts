import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserVoucher from '@/models/UserVoucher';
import SubscriptionPackage from '@/models/SubscriptionPackage';
import VoucherRewardRule from '@/models/VoucherRewardRule';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await dbConnect();

        // Aggregate vouchers by source and sourceId
        const groups = await UserVoucher.aggregate([
            {
                $group: {
                    _id: { source: '$source', sourceId: '$sourceId' },
                    count: { $sum: 1 },
                    usedCount: { $sum: { $cond: [{ $eq: ['$isUsed', true] }, 1, 0] } },
                }
            }
        ]);

        // Populate names manually
        const populatedGroups = await Promise.all(groups.map(async (group) => {
            const { source, sourceId } = group._id;
            let name = 'Không xác định';

            if (source === 'manual') {
                name = 'Voucher thủ công';
            } else if (source === 'package') {
                if (sourceId) {
                    try {
                        const pkg = await SubscriptionPackage.findById(sourceId).select('name');
                        name = pkg ? `Gói: ${pkg.name}` : 'Gói đã xóa';
                    } catch {
                        name = 'Gói (Lỗi ID)';
                    }
                } else {
                    name = 'Gói (Không rõ nguồn)';
                }
            } else if (source === 'order_reward' || source === 'campaign') {
                if (sourceId) {
                    try {
                        const rule = await VoucherRewardRule.findById(sourceId).select('name');
                        name = rule ? `Chiến dịch: ${rule.name}` : 'Chiến dịch đã xóa';
                    } catch {
                        name = 'Chiến dịch (Lỗi ID)';
                    }
                } else {
                    name = 'Chiến dịch (Không rõ nguồn)';
                }
            }

            return {
                id: `${source}-${sourceId || 'null'}`, // Unique ID for frontend
                source,
                sourceId,
                name,
                count: group.count,
                usedCount: group.usedCount,
                remainingCount: group.count - group.usedCount,
            };
        }));

        // Sort groups: Manual first, then by name
        populatedGroups.sort((a, b) => {
            if (a.source === 'manual') return -1;
            if (b.source === 'manual') return 1;
            return a.name.localeCompare(b.name);
        });

        return NextResponse.json(populatedGroups);
    } catch (error) {
        console.error('Error fetching voucher groups:', error);
        return NextResponse.json({ error: 'Lỗi lấy nhóm voucher' }, { status: 500 });
    }
}
