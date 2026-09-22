import dbConnect from '@/lib/db';
import SiteSettings from '@/models/SiteSettings';
import { signPartnerPayload, type PartnerMembershipPayload } from '@/lib/partner-membership';

export async function getPartnerMembershipConfig() {
  const environmentSecret = process.env.MEMBERSHIP_PARTNER_SECRET;
  const environmentEndpoint = process.env.MEMBERSHIP_PARTNER_SYNC_URL;
  if (environmentSecret && environmentEndpoint) {
    return { secret: environmentSecret, endpoint: environmentEndpoint };
  }

  await dbConnect();
  const settings = await SiteSettings.findOne()
    .select('+membershipPartnerSecret +membershipPartnerSyncUrl')
    .lean();
  return {
    secret: environmentSecret || settings?.membershipPartnerSecret,
    endpoint: environmentEndpoint || settings?.membershipPartnerSyncUrl,
  };
}

export async function sendMembershipToPartner(payload: PartnerMembershipPayload) {
  const { endpoint, secret } = await getPartnerMembershipConfig();
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
