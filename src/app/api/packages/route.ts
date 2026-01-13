import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SubscriptionPackage from '@/models/SubscriptionPackage';
import { getServerSession } from '@/lib/auth'; // Assuming we have auth helper, or use headers
// Since we don't have NextAuth, we rely on our own token. 
// For now, I'll assume public GET, protected POST (Admin).

export async function GET() {
    try {
        await dbConnect();
        const packages = await SubscriptionPackage.find({}).sort({ price: 1 });
        return NextResponse.json(packages);
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching packages' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        // TODO: meaningful auth check here. For now allowing creation for demo/seeding.
        const body = await req.json();
        const pkg = await SubscriptionPackage.create(body);
        return NextResponse.json(pkg, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Error creating package' }, { status: 500 });
    }
}
