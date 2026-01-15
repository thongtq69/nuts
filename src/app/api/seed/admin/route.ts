import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        await dbConnect();

        const email = 'admin@gonuts.com';
        const password = 'Admin123!';

        let user = await User.findOne({ email });

        if (user) {
            // Update to admin role if not already
            if (user.role !== 'admin') {
                user.role = 'admin';
                await user.save();
                return NextResponse.json({ message: 'User exists, updated role to admin', email });
            }
            return NextResponse.json({ message: 'Admin user already exists', email });
        }

        // Create new admin user
        const hashedPassword = await bcrypt.hash(password, 10);

        user = await User.create({
            name: 'GoNuts Admin',
            email,
            password: hashedPassword,
            role: 'admin',
            phone: '0901234567',
            address: '123 Admin St, HCM City',
            city: 'Hồ Chí Minh',
            district: 'Quận 1'
        });

        return NextResponse.json({
            message: 'Admin user created successfully',
            email,
            password: 'Admin123!'
        });

    } catch (error: any) {
        console.error('Seed error:', error);
        return NextResponse.json(
            { message: 'Error seeding admin', error: error.message },
            { status: 500 }
        );
    }
}
