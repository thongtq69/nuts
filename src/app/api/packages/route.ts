import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SubscriptionPackage from '@/models/SubscriptionPackage';
import { getUrlLocale } from '@/i18n/server';
import { localizePackage } from '@/lib/localized-content';
// Since we don't have NextAuth, we rely on our own token. 
// For now, I'll assume public GET, protected POST (Admin).

export async function GET(request: Request) {
    try {
        await dbConnect();
        const packages = await SubscriptionPackage.find({}).sort({ price: 1 }).lean();
        const locale = getUrlLocale(request);
        return NextResponse.json(packages.map(pkg =>
            localizePackage(pkg, locale)
        ));
    } catch {
        return NextResponse.json({ message: 'Error fetching packages' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const pkg = await SubscriptionPackage.create(body);
        return NextResponse.json(pkg.toObject(), { status: 201 });
    } catch (error) {
        console.error('Error creating package:', error);
        return NextResponse.json({ message: 'Error creating package', error: String(error) }, { status: 500 });
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

        const pkg = await SubscriptionPackage.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        ).lean();

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

        const pkg = await SubscriptionPackage.findByIdAndDelete(id).lean();

        if (!pkg) {
            return NextResponse.json({ message: 'Package not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Package deleted successfully' });
    } catch (error) {
        console.error('Error deleting package:', error);
        return NextResponse.json({ message: 'Error deleting package' }, { status: 500 });
    }
}
