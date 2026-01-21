import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { sendSaleApprovedEmail } from '@/lib/email';
import { encodeAffiliateId } from '@/lib/affiliate';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;

        const user = await User.findById(id);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (user.saleApplicationStatus !== 'pending') {
            return NextResponse.json({ error: 'No pending application' }, { status: 400 });
        }

        user.role = 'sale';
        user.saleApplicationStatus = 'approved';
        user.saleApprovedAt = new Date();

        // Generate Referal Code if not exists
        if (!user.referralCode) {
            // Generate GN + 6 random alphanumeric characters
            const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            user.referralCode = `GN${randomCode}`;
        }

        // Generate encoded affiliate code if not exists
        if (!user.encodedAffiliateCode && user._id) {
            user.encodedAffiliateCode = encodeAffiliateId(user._id.toString());
        }

        await user.save();

        // Send approval email
        try {
            await sendSaleApprovedEmail(user.email, user.name, user.referralCode);
        } catch (emailError) {
            console.error('Failed to send approval email:', emailError);
        }

        return NextResponse.json({ message: 'Sale application approved', user });
    } catch (error) {
        console.error('Error approving sale:', error);
        return NextResponse.json({ error: 'Failed to approve sale' }, { status: 500 });
    }
}
