import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPartnerVoucherCode, signPartnerPayload, verifyPartnerSignature } from '../src/lib/partner-membership.ts';

test('partner signature accepts original payload and rejects tampering', () => {
    const body = JSON.stringify({ sourceBrand: 'chillpop', discountValue: 10 });
    const signature = signPartnerPayload(body, 'shared-secret');
    assert.equal(verifyPartnerSignature(body, signature, 'shared-secret'), true);
    assert.equal(verifyPartnerSignature(`${body} `, signature, 'shared-secret'), false);
    assert.equal(verifyPartnerSignature(body, 'bad', 'shared-secret'), false);
});

test('partner voucher codes are deterministic and brand-specific', () => {
    const gonuts = buildPartnerVoucherCode('gonuts', 'membership-123');
    const chillpop = buildPartnerVoucherCode('chillpop', 'membership-123');
    assert.match(gonuts, /^GNVIP[A-F0-9]{10}$/);
    assert.match(chillpop, /^CPVIP[A-F0-9]{10}$/);
    assert.notEqual(gonuts, chillpop);
});
