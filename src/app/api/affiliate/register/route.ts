import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { encodeAffiliateId } from '@/lib/affiliate';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const decoded = await verifyToken(req);

        if (!decoded) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const user = await User.findById(decoded.id);
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Check if already affiliate (role 'sale' or has referralCode)
        if (user.role === 'sale' && user.referralCode) {
            return NextResponse.json({ message: 'Bạn đã là Đại lý/CTV' }, { status: 400 });
        }

        // Generate unique referral code: UPPERCASE, 6-8 chars
        // e.g., MINH123 or Random
        // Ideally user wants to customize, but for auto-register let's start with auto-gen or taking input.
        // Prompt says: [HỆ THỐNG] Tạo... Mã giới thiệu riêng (VD: "MINH123")
        // Let's allow custom code or fallback to Name + Random.

        const body = await req.json().catch(() => ({}));
        let refCode = body.referralCode;

        if (refCode) {
            // Validate custom code
            refCode = refCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
            if (refCode.length < 4 || refCode.length > 10) {
                return NextResponse.json({ message: 'Mã giới thiệu phải từ 4-10 ký tự chữ và số' }, { status: 400 });
            }
            // Check existence
            const existing = await User.findOne({ referralCode: refCode });
            if (existing) {
                return NextResponse.json({ message: 'Mã giới thiệu này đã được sử dụng' }, { status: 400 });
            }
        } else {
            // Auto generate based on name
            const namePart = user.name.split(' ').pop()?.toUpperCase().replace(/[^A-Z]/g, '') || 'USER';
            const randomPart = Math.floor(100 + Math.random() * 900); // 3 digits
            refCode = `${namePart}${randomPart}`;

            // Allow retry if collision (unlikely but safe)
            while (await User.findOne({ referralCode: refCode })) {
                const r = Math.floor(1000 + Math.random() * 9000);
                refCode = `${namePart}${r}`;
            }
        }

        user.role = 'sale'; // Upgrade to sale/affiliate
        user.referralCode = refCode;
        
        // Generate encoded affiliate code
        if (user._id && !user.encodedAffiliateCode) {
            user.encodedAffiliateCode = encodeAffiliateId(user._id.toString());
        }
        
        user.walletBalance = 0;
        user.totalCommission = 0;

        await user.save();

        return NextResponse.json({
            message: 'Đăng ký CTV thành công',
            referralCode: refCode,
            encodedAffiliateCode: user.encodedAffiliateCode
        });

    } catch (error) {
        console.error('Affiliate register error:', error);
        return NextResponse.json({ message: 'Lỗi hệ thống' }, { status: 500 });
    }
}
