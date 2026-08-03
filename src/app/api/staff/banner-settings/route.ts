import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SiteSettings from '@/models/SiteSettings';
import { requireStaffAuth } from '@/lib/auth-permissions';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DEFAULT_BANNER_SETTINGS = {
    productsBannerUrl: '/assets/images/gonuts-banner-member.png',
    productsBannerEnabled: true,
    homePromoBannerUrl: '/assets/images/gonuts-banner-member.png',
    homePromoBannerTitle: 'TẶNG VOUCHER 50.000 VNĐ<br />KHI ĐĂNG KÝ THÀNH VIÊN',
    homePromoBannerButtonText: 'ĐĂNG KÝ NGAY',
    homePromoBannerButtonLink: '/register',
    homePromoBannerNote: '*Áp dụng cho đơn hàng từ 300.000đ',
    homePromoBannerEnabled: true,
};

type BannerSettingKey = keyof typeof DEFAULT_BANNER_SETTINGS;

function pickBannerSettings(settings: Record<string, unknown> | null | undefined) {
    return (Object.keys(DEFAULT_BANNER_SETTINGS) as BannerSettingKey[]).reduce(
        (result, key) => {
            const value = settings?.[key];
            result[key] = (typeof value === typeof DEFAULT_BANNER_SETTINGS[key]
                ? value
                : DEFAULT_BANNER_SETTINGS[key]) as never;
            return result;
        },
        { ...DEFAULT_BANNER_SETTINGS },
    );
}

function normalizeText(value: unknown, maxLength: number) {
    return typeof value === 'string' ? value.trim().slice(0, maxLength) : undefined;
}

function normalizeBannerUpdate(body: Record<string, unknown>) {
    const update: Partial<typeof DEFAULT_BANNER_SETTINGS> = {};

    if (typeof body.productsBannerEnabled === 'boolean') update.productsBannerEnabled = body.productsBannerEnabled;
    if (typeof body.homePromoBannerEnabled === 'boolean') update.homePromoBannerEnabled = body.homePromoBannerEnabled;

    const productsBannerUrl = normalizeText(body.productsBannerUrl, 2_000);
    const homePromoBannerUrl = normalizeText(body.homePromoBannerUrl, 2_000);
    const homePromoBannerTitle = normalizeText(body.homePromoBannerTitle, 300);
    const homePromoBannerButtonText = normalizeText(body.homePromoBannerButtonText, 100);
    const homePromoBannerButtonLink = normalizeText(body.homePromoBannerButtonLink, 2_000);
    const homePromoBannerNote = normalizeText(body.homePromoBannerNote, 300);

    if (productsBannerUrl !== undefined) update.productsBannerUrl = productsBannerUrl;
    if (homePromoBannerUrl !== undefined) update.homePromoBannerUrl = homePromoBannerUrl;
    if (homePromoBannerTitle !== undefined) update.homePromoBannerTitle = homePromoBannerTitle;
    if (homePromoBannerButtonText !== undefined) update.homePromoBannerButtonText = homePromoBannerButtonText;
    if (homePromoBannerButtonLink !== undefined) update.homePromoBannerButtonLink = homePromoBannerButtonLink;
    if (homePromoBannerNote !== undefined) update.homePromoBannerNote = homePromoBannerNote;

    return update;
}

async function authorize() {
    const auth = await requireStaffAuth();
    if (!auth.user) {
        return NextResponse.json({ error: auth.error }, { status: 401 });
    }
    return null;
}

export async function GET() {
    try {
        const authError = await authorize();
        if (authError) return authError;

        await dbConnect();
        const settings = await SiteSettings.findOne().sort({ updatedAt: -1 }).lean();
        return NextResponse.json(pickBannerSettings(settings as Record<string, unknown> | null), {
            headers: { 'Cache-Control': 'no-store, max-age=0' },
        });
    } catch (error) {
        console.error('Error fetching staff banner settings:', error);
        return NextResponse.json({ error: 'Không thể tải cấu hình banner' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const authError = await authorize();
        if (authError) return authError;

        const body = await request.json();
        const update = normalizeBannerUpdate(body);
        if (Object.keys(update).length === 0) {
            return NextResponse.json({ error: 'Không có nội dung banner hợp lệ để cập nhật' }, { status: 400 });
        }

        await dbConnect();
        const latest = await SiteSettings.findOne().sort({ updatedAt: -1 }).select('_id').lean();
        const settings = await SiteSettings.findOneAndUpdate(
            latest ? { _id: latest._id } : {},
            { $set: { ...update, updatedAt: new Date() } },
            { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
        ).lean();

        return NextResponse.json({
            success: true,
            message: 'Đã lưu cấu hình banner',
            settings: pickBannerSettings(settings as unknown as Record<string, unknown>),
        });
    } catch (error) {
        console.error('Error updating staff banner settings:', error);
        return NextResponse.json({ error: 'Không thể lưu cấu hình banner' }, { status: 500 });
    }
}
