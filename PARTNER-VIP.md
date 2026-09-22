# GoNuts × ChillPop VIP sync

Production requires the same `MEMBERSHIP_PARTNER_SECRET` on both deployments.

- GoNuts: `MEMBERSHIP_PARTNER_SYNC_URL=https://kem-mocha.vercel.app/api/membership/partner-sync`
- ChillPop: `MEMBERSHIP_PARTNER_SYNC_URL=https://gonuts.vn/api/membership/partner-sync`

Membership activation sends a signed HMAC-SHA256 payload to the partner. The receiving site matches an existing customer by normalized email or phone and upserts a reusable partner voucher that expires with the source membership.
