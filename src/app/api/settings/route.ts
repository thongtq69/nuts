import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SiteSettings from '@/models/SiteSettings';

// GET - Public endpoint to get site settings
export async function GET() {
    try {
        await dbConnect();
        
        // Get or create default settings
        let settings = await SiteSettings.findOne();
        
        if (!settings) {
            settings = await SiteSettings.create({});
        }
        
        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ message: 'Error fetching settings' }, { status: 500 });
    }
}

// PUT - Admin endpoint to update settings
export async function PUT(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        
        // Get or create settings
        let settings = await SiteSettings.findOne();
        
        if (!settings) {
            settings = await SiteSettings.create(body);
        } else {
            settings = await SiteSettings.findOneAndUpdate({}, body, { new: true });
        }
        
        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json({ message: 'Error updating settings' }, { status: 500 });
    }
}
