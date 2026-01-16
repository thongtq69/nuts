import mongoose, { Schema, Model } from 'mongoose';

export interface ISiteSettings {
    _id?: string;
    // Contact Info
    hotline: string;
    zaloLink: string;
    email: string;
    address: string;
    
    // Social Links
    facebookUrl: string;
    instagramUrl: string;
    youtubeUrl: string;
    tiktokUrl: string;
    
    // Promo Banner
    promoText: string;
    promoEnabled: boolean;
    
    // Agent/CTV Links
    agentRegistrationUrl: string;
    ctvRegistrationUrl: string;
    
    // Free Shipping
    freeShippingThreshold: number;
    
    // Other
    logoUrl: string;
    siteName: string;
    
    updatedAt?: Date;
}

const SiteSettingsSchema: Schema<ISiteSettings> = new Schema(
    {
        hotline: { type: String, default: '090xxxxxxx' },
        zaloLink: { type: String, default: '' },
        email: { type: String, default: 'contact@gonuts.vn' },
        address: { type: String, default: '' },
        
        facebookUrl: { type: String, default: '' },
        instagramUrl: { type: String, default: '' },
        youtubeUrl: { type: String, default: '' },
        tiktokUrl: { type: String, default: '' },
        
        promoText: { type: String, default: 'Giảm giá 8% khi mua hàng từ 899 trở lên với mã "SAVER8"' },
        promoEnabled: { type: Boolean, default: true },
        
        agentRegistrationUrl: { type: String, default: '/agent/register' },
        ctvRegistrationUrl: { type: String, default: '/agent/register' },
        
        freeShippingThreshold: { type: Number, default: 500000 },
        
        logoUrl: { type: String, default: '/assets/images/logo.png' },
        siteName: { type: String, default: 'Go Nuts' },
    },
    {
        timestamps: true,
    }
);

const SiteSettings: Model<ISiteSettings> = mongoose.models.SiteSettings || mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema);

export default SiteSettings;
