import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import UserVoucher from '@/models/UserVoucher';
import PartnerMembership from '@/models/PartnerMembership';
import { buildPartnerVoucherCode, type PartnerMembershipPayload, verifyPartnerSignature } from '@/lib/partner-membership';

export async function POST(request: Request) {
  const secret = process.env.MEMBERSHIP_PARTNER_SECRET;
  if (!secret) return NextResponse.json({ message: 'Partner sync chưa được cấu hình' }, { status: 503 });

  const rawBody = await request.text();
  const signature = request.headers.get('x-partner-signature') || '';
  if (!verifyPartnerSignature(rawBody, signature, secret)) {
    return NextResponse.json({ message: 'Chữ ký không hợp lệ' }, { status: 401 });
  }

  let payload: PartnerMembershipPayload;
  try { payload = JSON.parse(rawBody); } catch {
    return NextResponse.json({ message: 'Payload không hợp lệ' }, { status: 400 });
  }
  const startsAt = new Date(payload.startsAt);
  const expiresAt = new Date(payload.expiresAt);
  if (!['gonuts', 'chillpop'].includes(payload.sourceBrand) || !payload.externalMembershipId || !payload.packageName || Number.isNaN(startsAt.getTime()) || Number.isNaN(expiresAt.getTime()) || expiresAt <= startsAt || (!payload.email && !payload.phone)) {
    return NextResponse.json({ message: 'Thiếu dữ liệu hội viên bắt buộc' }, { status: 400 });
  }

  await dbConnect();
  const user = await User.findOne({
    $or: [
      ...(payload.email ? [{ email: payload.email.toLowerCase().trim() }] : []),
      ...(payload.phone ? [{ phone: payload.phone.trim() }] : []),
    ],
  });
  if (!user) return NextResponse.json({ message: 'Chưa có tài khoản trùng email hoặc số điện thoại' }, { status: 404 });

  const membership = await PartnerMembership.findOneAndUpdate(
    { sourceBrand: payload.sourceBrand, externalMembershipId: payload.externalMembershipId },
    { $set: {
      userId: user._id,
      externalPackageName: payload.packageName,
      discountType: payload.discountType,
      discountValue: Math.max(0, Number(payload.discountValue) || 0),
      maxDiscount: Math.max(0, Number(payload.maxDiscount) || 0),
      minOrderValue: Math.max(0, Number(payload.minOrderValue) || 0),
      startsAt,
      expiresAt,
      isActive: expiresAt > new Date(),
    } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  const code = buildPartnerVoucherCode(payload.sourceBrand, payload.externalMembershipId);
  await UserVoucher.findOneAndUpdate(
    { code },
    { $set: {
      userId: user._id,
      discountType: payload.discountType,
      discountValue: Math.max(0, Number(payload.discountValue) || 0),
      maxDiscount: Math.max(0, Number(payload.maxDiscount) || 0),
      minOrderValue: Math.max(0, Number(payload.minOrderValue) || 0),
      expiresAt,
      isUsed: false,
      isUnlimited: true,
      source: 'partner',
      partnerMembershipId: membership._id,
    } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  return NextResponse.json({ synced: true, voucherCode: code, expiresAt });
}
