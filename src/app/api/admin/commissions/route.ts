import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import AffiliateCommission from '@/models/AffiliateCommission';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const commissions = await AffiliateCommission.find()
            .populate('affiliateId', 'name email referralCode')
            .populate('orderId', 'totalAmount status createdAt')
            .sort({ createdAt: -1 });

        return NextResponse.json(commissions);
    } catch (error) {
        return NextResponse.json({ message: 'Error' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        await dbConnect();
        const { id, status } = await req.json();

        if (!['pending', 'approved', 'rejected', 'paid'].includes(status)) {
            return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
        }

        const comm = await AffiliateCommission.findByIdAndUpdate(id, { status }, { new: true });

        // Update User wallet if approved/paid? 
        // Logic: 
        // - If approved: Add to walletBalance? Or wait for paid?
        // - Usually: "Approved" means "Valid commission, waiting for payout". "Paid" means "Money sent".
        // Let's say: Approved -> Adds to Wallet (Available for withdrawal). Paid -> Deducted from Wallet? Or just status mark.
        // Let's keep it simple: Approved -> Add to wallet. Paid -> Just status info.

        // Actually, let's update Wallet only when "Approved"
        /*
        if (status === 'approved' && comm) {
            await User.findByIdAndUpdate(comm.affiliateId, { 
                $inc: { walletBalance: comm.commissionAmount, totalCommission: comm.commissionAmount } 
            });
        }
        */
        // Implementing full logic requires careful transaction handling or checks. 
        // For now just status update.

        return NextResponse.json(comm);
    } catch (error) {
        return NextResponse.json({ message: 'Error' }, { status: 500 });
    }
}
