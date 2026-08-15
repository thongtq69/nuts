import { after, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';
import { sendAccountCredentialsEmail } from '@/lib/email';
import { notifyAdminOfNewAccount } from '@/lib/admin-email-notifications';
type AgentAccount = {
    _id: string;
    role: string;
    saleType?: string | null;
    affiliateLevel?: string;
    referralCode?: string;
    staffCode?: string;
};

async function getCurrentAgent() {
    try {
        const token = (await cookies()).get('token')?.value;
        if (!token) return null;
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'fallback_secret_change_me',
        ) as JwtPayload;
        if (!decoded.id) return null;
        await dbConnect();
        return User.findById(decoded.id);
    } catch {
        return null;
    }
}

function canManageCollaborators(user: AgentAccount | null): user is AgentAccount {
    return user?.role === 'sale' &&
        user?.saleType !== 'collaborator' &&
        user?.affiliateLevel !== 'collaborator';
}

async function createUniqueCode(agent: AgentAccount) {
    const rawBase = agent.referralCode || agent.staffCode || `DL${String(agent._id).slice(-6)}`;
    const base = String(rawBase).replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const existingCount = await User.countDocuments({
        parentStaff: agent._id,
        affiliateLevel: 'collaborator',
    });

    for (let index = existingCount + 1; index < existingCount + 1000; index += 1) {
        const code = `${base}-CTV${String(index).padStart(3, '0')}`;
        if (!await User.exists({ referralCode: code })) return code;
    }
    throw new Error('Không thể tạo mã cộng tác viên duy nhất');
}

export async function GET() {
    try {
        const agent = await getCurrentAgent();
        if (!canManageCollaborators(agent)) {
            return NextResponse.json({ message: 'Không có quyền truy cập' }, { status: 403 });
        }

        const collaborators = await User.find({
            parentStaff: agent!._id,
            affiliateLevel: 'collaborator',
            isActive: { $ne: false },
        }).select('name email phone referralCode walletBalance totalCommission createdAt').sort({ createdAt: -1 }).lean();

        const result = await Promise.all(collaborators.map(async (collaborator) => {
            const orders = await Order.find({ referrer: collaborator._id })
                .select('totalAmount status')
                .lean();
            const validOrders = orders.filter((order) => !['cancelled', 'canceled', 'refunded', 'returned']
                .includes(String(order.status || '').toLowerCase()));
            return {
                id: String(collaborator._id),
                name: collaborator.name,
                email: collaborator.email,
                phone: collaborator.phone || '',
                code: collaborator.referralCode || '',
                walletBalance: Number(collaborator.walletBalance || 0),
                totalCommission: Number(collaborator.totalCommission || 0),
                orders: validOrders.length,
                revenue: validOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0),
                createdAt: collaborator.createdAt,
            };
        }));

        return NextResponse.json(result);
    } catch (error) {
        console.error('Get agent collaborators error:', error);
        return NextResponse.json({ message: 'Không thể tải danh sách cộng tác viên' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const agent = await getCurrentAgent();
        if (!canManageCollaborators(agent)) {
            return NextResponse.json({ message: 'Không có quyền tạo cộng tác viên' }, { status: 403 });
        }

        const body = await request.json();
        const name = String(body.name || '').trim();
        const email = String(body.email || '').trim().toLowerCase();
        const phone = String(body.phone || '').trim();
        const password = String(body.password || '');

        if (!name || !email || !password) {
            return NextResponse.json({ message: 'Vui lòng nhập họ tên, email và mật khẩu' }, { status: 400 });
        }
        if (password.length < 6) {
            return NextResponse.json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' }, { status: 400 });
        }
        if (await User.exists({ email })) {
            return NextResponse.json({ message: 'Email đã được sử dụng' }, { status: 409 });
        }

        const code = await createUniqueCode(agent);
        const collaborator = await User.create({
            name,
            email,
            phone,
            password: await bcrypt.hash(password, 10),
            role: 'sale',
            roleType: 'collaborator',
            saleType: 'collaborator',
            parentStaff: agent!._id,
            affiliateLevel: 'collaborator',
            referralCode: code,
            walletBalance: 0,
            totalCommission: 0,
            isActive: true,
        });
        after(() => notifyAdminOfNewAccount(String(collaborator._id)));
        await User.findByIdAndUpdate(agent!._id, { $inc: { collaboratorCount: 1 } });

        let emailSent = true;
        try {
            await sendAccountCredentialsEmail(email, name, password, 'Tài khoản cộng tác viên');
        } catch (emailError) {
            emailSent = false;
            console.error('Send collaborator credentials error:', emailError);
        }

        return NextResponse.json({
            message: 'Tạo cộng tác viên thành công',
            collaborator: { id: String(collaborator._id), name, email, code },
            emailSent,
        }, { status: 201 });
    } catch (error) {
        console.error('Create agent collaborator error:', error);
        return NextResponse.json({ message: 'Không thể tạo cộng tác viên' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const agent = await getCurrentAgent();
        if (!canManageCollaborators(agent)) {
            return NextResponse.json({ message: 'Không có quyền thực hiện' }, { status: 403 });
        }
        const { collaboratorId } = await request.json();
        const collaborator = await User.findOne({
            _id: collaboratorId,
            parentStaff: agent!._id,
            affiliateLevel: 'collaborator',
            isActive: { $ne: false },
        });
        if (!collaborator) {
            return NextResponse.json({ message: 'Không tìm thấy cộng tác viên' }, { status: 404 });
        }

        collaborator.isActive = false;
        collaborator.deletedAt = new Date();
        await collaborator.save();
        await User.findByIdAndUpdate(agent!._id, { $inc: { collaboratorCount: -1 } });
        return NextResponse.json({ message: 'Đã vô hiệu hóa cộng tác viên' });
    } catch (error) {
        console.error('Disable agent collaborator error:', error);
        return NextResponse.json({ message: 'Không thể vô hiệu hóa cộng tác viên' }, { status: 500 });
    }
}
