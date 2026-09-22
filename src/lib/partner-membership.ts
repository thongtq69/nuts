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
