/**
 * Repairs membership orders that were marked "completed" from the admin order
 * list before that screen knew how to activate a package. Those orders kept
 * paymentStatus 'pending', so no UserMembership and no VIP vouchers were ever
 * created and the customer's "Gói hội viên của tôi" tab looked empty.
 *
 * Dry run (default):  npx tsx --env-file=.env scripts/repair-membership-activation.ts
 * Apply the fix:      npx tsx --env-file=.env scripts/repair-membership-activation.ts --apply
 *
 * --apply treats "admin marked this order completed/paid" as confirmation that
 * the money was received, so only run it after checking the list it prints.
 */

import mongoose from 'mongoose';
import dbConnect from '../src/lib/db';
import Order from '../src/models/Order';
import SubscriptionPackage from '../src/models/SubscriptionPackage';
import UserVoucher from '../src/models/UserVoucher';
import { activateMembershipOrder } from '../src/lib/membership-activation';
import { isConfirmedPaymentStatus } from '../src/lib/customer-ownership';
import { buildMembershipVoucherIssuance } from '../src/lib/membership-vouchers';

const APPLY = process.argv.includes('--apply');

async function main() {
    await dbConnect();

    const candidates = await Order.find({
        orderType: 'membership',
        membershipActivatedAt: { $exists: false },
        status: { $in: ['completed', 'delivered', 'paid'] },
    }).sort({ createdAt: -1 });

    if (candidates.length === 0) {
        console.log('Không có đơn gói hội viên nào cần sửa.');
        return;
    }

    console.log(`Tìm thấy ${candidates.length} đơn gói hội viên đã hoàn thành nhưng chưa kích hoạt:\n`);

    for (const order of candidates) {
        const code = String(order._id).slice(-6).toUpperCase();
        const label = `#${code} | ${order.packageInfo?.name || 'Gói hội viên'} | ${Number(order.totalAmount).toLocaleString('vi-VN')}đ`
            + ` | status=${order.status} paymentStatus=${order.paymentStatus}`;

        if (!APPLY) {
            console.log(`  [dry-run] ${label}`);
            continue;
        }

        try {
            if (!isConfirmedPaymentStatus(order.paymentStatus)) {
                order.paymentStatus = 'paid';
                await order.save();
            }

            const pkg = order.packageInfo?.packageId
                ? await SubscriptionPackage.findById(order.packageInfo.packageId)
                : null;
            if (pkg?.isUnlimitedVoucher) {
                const expectedCodes = buildMembershipVoucherIssuance(pkg).length;
                const cleanup = await UserVoucher.deleteMany({
                    sourceOrderId: order._id,
                    source: 'package',
                    sourceIndex: { $gte: expectedCodes },
                });
                if (cleanup.deletedCount > 0) {
                    console.log(`  [dọn dữ liệu cũ] #${code} → xóa ${cleanup.deletedCount} voucher sinh dư`);
                }
            }

            const activation = await activateMembershipOrder(String(order._id));
            console.log(
                `  [đã kích hoạt] ${label} → ${activation.vouchersIssued} mã`
                + (activation.isUnlimitedVoucher ? ' dùng không giới hạn' : ''),
            );
        } catch (error: any) {
            console.error(`  [lỗi] ${label} → ${error?.message || error}`);
        }
    }

    if (!APPLY) {
        console.log('\nChạy lại với --apply để kích hoạt các đơn trên.');
    }
}

main()
    .catch(error => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
