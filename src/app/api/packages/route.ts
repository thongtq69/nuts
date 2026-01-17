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

export async function PUT(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { id, ...updateData } = body;

        if (!id) {
            return NextResponse.json({ message: 'Package ID is required' }, { status: 400 });
        }

        const pkg = await SubscriptionPackage.findByIdAndUpdate(id, updateData, { new: true });

        if (!pkg) {
            return NextResponse.json({ message: 'Package not found' }, { status: 404 });
        }

        return NextResponse.json(pkg);
    } catch (error) {
        console.error('Error updating package:', error);
        return NextResponse.json({ message: 'Error updating package' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const id = body.id;

        if (!id) {
            return NextResponse.json({ message: 'Package ID is required' }, { status: 400 });
        }

        const pkg = await SubscriptionPackage.findByIdAndDelete(id);

        if (!pkg) {
            return NextResponse.json({ message: 'Package not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Package deleted successfully' });
    } catch (error) {
        console.error('Error deleting package:', error);
        return NextResponse.json({ message: 'Error deleting package' }, { status: 500 });
    }
}
