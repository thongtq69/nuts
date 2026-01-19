import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import AffiliateCommission from '@/models/AffiliateCommission';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { dryRun } = await req.json().catch(() => ({ dryRun: true }));

        const results = {
            ordersChecked: 0,
            ordersFixed: 0,
            commissionsChecked: 0,
            commissionsFixed: 0,
            errors: [] as string[]
        };

        // Find all orders with commissionStatus that doesn't match actual commission status
        const orders = await Order.find({
            commissionStatus: 'pending',
            status: { $in: ['completed', 'delivered'] }
        });

        results.ordersChecked = orders.length;

        for (const order of orders) {
            try {
                // Find all commissions for this order
                const commissions = await AffiliateCommission.find({ orderId: order._id });
                
                if (commissions.length === 0) {
                    continue;
                }

                // Check if all commissions are approved
                const allApproved = commissions.every(c => c.status === 'approved');
                const allRejected = commissions.every(c => c.status === 'rejected');

                let shouldUpdate = false;
                let newStatus: 'pending' | 'approved' | 'cancelled' = order.commissionStatus as 'pending' | 'approved' | 'cancelled';

                if (allApproved && order.commissionStatus !== 'approved') {
                    newStatus = 'approved';
                    shouldUpdate = true;
                } else if (allRejected && order.commissionStatus !== 'cancelled') {
                    newStatus = 'cancelled';
                    shouldUpdate = true;
                }

                if (shouldUpdate) {
                    if (!dryRun) {
                        order.commissionStatus = newStatus;
                        await order.save();
                    }
                    results.ordersFixed++;
                    results.errors.push(`Order ${order._id.toString().slice(-6)}: Updated commissionStatus from '${order.commissionStatus}' to '${newStatus}'`);
                }
            } catch (err: any) {
                results.errors.push(`Order ${order._id}: ${err.message}`);
            }
        }

        // Fix orders where commissionStatus is undefined but should be approved
        const undefinedStatusOrders = await Order.find({
            commissionStatus: { $exists: false },
            status: { $in: ['completed', 'delivered'] }
        });

        for (const order of undefinedStatusOrders) {
            const commissions = await AffiliateCommission.find({ orderId: order._id });
            
            if (commissions.length > 0) {
                const allApproved = commissions.every(c => c.status === 'approved');
                
                if (allApproved && !dryRun) {
                    order.commissionStatus = 'approved';
                    await order.save();
                    results.ordersFixed++;
                    results.errors.push(`Order ${order._id.toString().slice(-6)}: Set commissionStatus to 'approved' (was undefined)`);
                }
            }
        }

        // Fix commissionAmount field for orders with collaborator + staff commissions
        const ordersWithCommissions = await Order.find({
            commissionAmount: { $gt: 0 },
            referrer: { $exists: true }
        });

        for (const order of ordersWithCommissions) {
            try {
                const commissions = await AffiliateCommission.find({ 
                    orderId: order._id,
                    affiliateId: order.referrer
                });

                if (commissions.length === 1) {
                    const correctAmount = commissions[0].commissionAmount;
                    if (order.commissionAmount !== correctAmount) {
                        if (!dryRun) {
                            order.commissionAmount = correctAmount;
                            await order.save();
                        }
                        results.errors.push(`Order ${order._id.toString().slice(-6)}: Fixed commissionAmount from ${order.commissionAmount} to ${correctAmount}`);
                    }
                }
            } catch (err: any) {
                results.errors.push(`Order ${order._id}: ${err.message}`);
            }
        }

        return NextResponse.json({
            success: true,
            dryRun,
            ...results,
            message: dryRun 
                ? `Dry run complete. Would fix ${results.ordersFixed} orders.` 
                : `Fixed ${results.ordersFixed} orders successfully.`
        });
    } catch (error) {
        console.error('Migration error:', error);
        return NextResponse.json(
            { message: 'Migration failed', error: String(error) },
            { status: 500 }
        );
    }
}
