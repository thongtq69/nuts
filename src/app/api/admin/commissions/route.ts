import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import AffiliateCommission from '@/models/AffiliateCommission';
import User from '@/models/User';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const commissions = await AffiliateCommission.find()
            .populate('affiliateId', 'name email referralCode')
            .populate('orderId', 'totalAmount status createdAt')
            .sort({ createdAt: -1 });

        return NextResponse.json(commissions);
    } catch (error) {
        console.error('Error fetching commissions:', error);
        return NextResponse.json({ message: 'Error fetching commissions' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        await dbConnect();
        const { id, status } = await req.json();

        if (!['pending', 'approved', 'rejected', 'paid'].includes(status)) {
            return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
        }

        const comm = await AffiliateCommission.findById(id);
        if (!comm) {
            return NextResponse.json({ message: 'Commission not found' }, { status: 404 });
        }

        const previousStatus = comm.status;
        
        // Update status
        comm.status = status;
        await comm.save();

        // Update User wallet when status changes
        if (status === 'approved' && previousStatus === 'pending') {
            // Add to wallet when approved
            await User.findByIdAndUpdate(comm.affiliateId, {
                $inc: { walletBalance: comm.commissionAmount, totalCommission: comm.commissionAmount }
            });
            console.log(`✅ Commission ${id} approved: +${comm.commissionAmount}đ to wallet`);
        } else if (status === 'rejected' && previousStatus === 'pending') {
            // Commission rejected - no wallet update
            console.log(`❌ Commission ${id} rejected: no wallet update`);
        } else if (status === 'paid') {
            // Mark as paid - just status update (money already in wallet from approved)
            console.log(`💰 Commission ${id} marked as paid`);
        }

        return NextResponse.json(comm);
    } catch (error) {
        console.error('Error updating commission:', error);
        return NextResponse.json({ message: 'Error updating commission' }, { status: 500 });
    }
}
