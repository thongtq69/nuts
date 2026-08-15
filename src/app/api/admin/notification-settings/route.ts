import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { requireAdminAuth } from '@/lib/auth-permissions';
import {
    DEFAULT_ADMIN_NOTIFICATION_PREFERENCES,
    normalizeAdminNotificationPreferences,
    normalizeNotificationEmails,
} from '@/lib/admin-notification-settings';
import AdminNotificationSettings from '@/models/AdminNotificationSettings';
import SiteSettings from '@/models/SiteSettings';

export const dynamic = 'force-dynamic';

async function defaultRecipients() {
    const siteSettings = await SiteSettings.findOne().sort({ updatedAt: -1 }).select('email').lean();
    return normalizeNotificationEmails([
        siteSettings?.email,
        process.env.GMAIL_USER,
    ]);
}

export async function GET() {
    const auth = await requireAdminAuth();
    if (!auth.user) {
        return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    await dbConnect();
    const existing = await AdminNotificationSettings.findOne({ key: 'default' }).lean();
    if (existing) {
        return NextResponse.json(normalizeAdminNotificationPreferences(existing));
    }

    return NextResponse.json({
        ...DEFAULT_ADMIN_NOTIFICATION_PREFERENCES,
        recipients: await defaultRecipients(),
    });
}

export async function PUT(request: Request) {
    const auth = await requireAdminAuth();
    if (!auth.user) {
        return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Dữ liệu gửi lên không hợp lệ' }, { status: 400 });
    }

    const raw = body && typeof body === 'object'
        ? body as Record<string, unknown>
        : {};
    const rawEmails = Array.isArray(raw.recipients)
        ? raw.recipients
        : typeof raw.recipients === 'string'
            ? raw.recipients.split(/[\n,;]+/)
            : [];
    const nonEmptyEmails = rawEmails.map(item => String(item || '').trim()).filter(Boolean);
    const uniqueRawEmails = new Set(nonEmptyEmails.map(email => email.toLowerCase()));
    const recipients = normalizeNotificationEmails(nonEmptyEmails);

    if (uniqueRawEmails.size > 10) {
        return NextResponse.json({ error: 'Chỉ được nhập tối đa 10 email nhận thông báo' }, { status: 400 });
    }
    if (recipients.length !== uniqueRawEmails.size) {
        return NextResponse.json({ error: 'Có email nhận thông báo không hợp lệ' }, { status: 400 });
    }
    if (recipients.length === 0) {
        return NextResponse.json({ error: 'Vui lòng nhập ít nhất một email nhận thông báo' }, { status: 400 });
    }
    await dbConnect();
    const preferences = normalizeAdminNotificationPreferences({
        recipients,
        notifyNewAccount: raw.notifyNewAccount !== false,
        notifyNewOrder: raw.notifyNewOrder !== false,
    });
    const settings = await AdminNotificationSettings.findOneAndUpdate(
        { key: 'default' },
        { $set: { ...preferences, updatedBy: auth.user._id } },
        { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
    );

    return NextResponse.json({
        success: true,
        message: 'Đã lưu cấu hình email thông báo',
        settings: normalizeAdminNotificationPreferences(settings),
    });
}
