import mongoose, { Schema, Model } from 'mongoose';

export interface IProductFeature {
    title: string;
    description: string;
    icon: 'truck' | 'refresh' | 'shield';
    enabled: boolean;
}

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

    // Product Features/Commitments
    productFeatures: IProductFeature[];
    supportHotline: string;

    // Other
    logoUrl: string;
    siteName: string;

    // Products Page Banner
    productsBannerUrl: string;
    productsBannerEnabled: boolean;

    // Home Page Large Promo Banner
    homePromoBannerUrl: string;
    homePromoBannerTitle: string;
    homePromoBannerButtonText: string;
    homePromoBannerButtonLink: string;
    homePromoBannerNote: string;
    homePromoBannerEnabled: boolean;

    updatedAt?: Date;
}

const ProductFeatureSchema = new Schema<IProductFeature>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, enum: ['truck', 'refresh', 'shield'], default: 'truck' },
    enabled: { type: Boolean, default: true }
}, { _id: false });

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

        productFeatures: {
            type: [ProductFeatureSchema],
            default: [
                { title: 'Giao hàng toàn quốc', description: 'Miễn phí đơn từ 500.000đ', icon: 'truck', enabled: true },
                { title: 'Đổi trả trong 7 ngày', description: 'Nếu sản phẩm lỗi từ nhà sản xuất', icon: 'refresh', enabled: true },
                { title: 'Đảm bảo chất lượng', description: 'Sản phẩm chính hãng 100%', icon: 'shield', enabled: true }
            ]
        },
        supportHotline: { type: String, default: '096 118 5753' },

        logoUrl: { type: String, default: '/assets/images/logo.png' },
        siteName: { type: String, default: 'Go Nuts' },

        // Products Page Banner
        productsBannerUrl: { type: String, default: '/assets/images/slide1.jpg' },
        productsBannerEnabled: { type: Boolean, default: true },

        // Home Page Large Promo Banner
        homePromoBannerUrl: { type: String, default: '/assets/images/promotion.png' },
        homePromoBannerTitle: { type: String, default: "WIN RAHUL DRAVID'S<br />AUTOGRAPHED MERCHANDISE" },
        homePromoBannerButtonText: { type: String, default: 'BUY MORE, WIN MORE' },
        homePromoBannerButtonLink: { type: String, default: '#' },
        homePromoBannerNote: { type: String, default: '*Jersey & Miniature Bat' },
        homePromoBannerEnabled: { type: Boolean, default: true },
    },
    {
        timestamps: true,
    }
);

const SiteSettings: Model<ISiteSettings> = mongoose.models.SiteSettings || mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema);

export default SiteSettings;
