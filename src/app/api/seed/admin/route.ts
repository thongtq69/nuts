import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const force = searchParams.get('force') === 'true';

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@gonuts.com' });
        
        if (existingAdmin && !force) {
            return NextResponse.json({ 
                message: 'Admin account already exists',
                email: 'admin@gonuts.com',
                note: 'Use ?force=true to reset password'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash('admin123', 10);

        if (existingAdmin && force) {
            // Update existing admin password
            existingAdmin.password = hashedPassword;
            await existingAdmin.save();
            
            return NextResponse.json({ 
                message: 'Admin password reset successfully',
                email: 'admin@gonuts.com',
                password: 'admin123',
                note: 'Please change this password after first login'
            });
        }

        // Create new admin account
        const admin = await User.create({
            name: 'Administrator',
            email: 'admin@gonuts.com',
            password: hashedPassword,
            role: 'admin',
            phone: '0123456789',
        });

        return NextResponse.json({ 
            message: 'Admin account created successfully',
            email: 'admin@gonuts.com',
            password: 'admin123',
            note: 'Please change this password after first login',
            adminId: admin._id
        });
    } catch (error) {
        console.error('Create admin error:', error);
        return NextResponse.json({ 
            error: 'Failed to create admin account', 
            details: (error as Error).message 
        }, { status: 500 });
    }
}
