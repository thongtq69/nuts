import { createHash, createHmac, timingSafeEqual } from 'crypto';

export type PartnerMembershipPayload = {
  sourceBrand: 'gonuts' | 'chillpop';
  externalMembershipId: string;
  packageName: string;
  email?: string;
  phone?: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  maxDiscount?: number;
  minOrderValue?: number;
  startsAt: string;
  expiresAt: string;
};

export function signPartnerPayload(rawBody: string, secret: string) {
  return createHmac('sha256', secret).update(rawBody).digest('hex');
}

export function verifyPartnerSignature(rawBody: string, signature: string, secret: string) {
  const expected = signPartnerPayload(rawBody, secret);
  const actualBuffer = Buffer.from(signature || '', 'utf8');
  const expectedBuffer = Buffer.from(expected, 'utf8');
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

export function buildPartnerVoucherCode(sourceBrand: string, externalMembershipId: string) {
  const digest = createHash('sha256').update(`${sourceBrand}:${externalMembershipId}`).digest('hex').slice(0, 10).toUpperCase();
  return `${sourceBrand === 'gonuts' ? 'GN' : 'CP'}VIP${digest}`;
}

export async function sendMembershipToPartner(payload: PartnerMembershipPayload) {
  const endpoint = process.env.MEMBERSHIP_PARTNER_SYNC_URL;
  const secret = process.env.MEMBERSHIP_PARTNER_SECRET;
  if (!endpoint || !secret) return { skipped: true };

  const body = JSON.stringify(payload);
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-partner-signature': signPartnerPayload(body, secret),
    },
    body,
  });
  if (!response.ok) throw new Error(`Partner membership sync failed (${response.status})`);
  return response.json();
}
