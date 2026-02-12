
import dbConnect from './src/lib/db';
import SiteSettings from './src/models/SiteSettings';
import mongoose from 'mongoose';

async function checkSettings() {
    try {
        await dbConnect();
        const settings = await SiteSettings.findOne().sort({ updatedAt: -1 }).lean();
        console.log('--- SITE SETTINGS IN DB ---');
        console.log('productsBannerUrl:', settings?.productsBannerUrl);
        console.log('homePromoBannerUrl:', settings?.homePromoBannerUrl);
        console.log('---------------------------');
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkSettings();
