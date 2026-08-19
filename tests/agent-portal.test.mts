import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { isCollaboratorAccount } from '../src/lib/account-role.ts';

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('collaborator identity is consistent across every supported account field', () => {
    assert.equal(isCollaboratorAccount({ roleType: 'collaborator' }), true);
    assert.equal(isCollaboratorAccount({ saleType: 'collaborator' }), true);
    assert.equal(isCollaboratorAccount({ affiliateLevel: 'collaborator' }), true);
    assert.equal(isCollaboratorAccount({ role: 'sale', saleType: 'agent' }), false);
});

test('collaborators are redirected away from the agent portal using current database identity', async () => {
    const [agentLayout, collaboratorLayout, accountPage] = await Promise.all([
        read('src/app/agent/layout.tsx'),
        read('src/app/collaborator/layout.tsx'),
        read('src/app/account/page.tsx'),
    ]);

    assert.match(agentLayout, /isCollaboratorAccount\(user\)[\s\S]*router\.replace\('\/collaborator'\)/);
    assert.match(collaboratorLayout, /isCollaboratorAccount\(user\)/);
    assert.match(accountPage, /Bảng điều khiển Cộng tác viên/);
});

test('every collaborator creation and approval flow persists the complete identity', async () => {
    const sources = await Promise.all([
        read('src/app/api/admin/users/[id]/approve-sale/route.ts'),
        read('src/app/api/staff/collaborators/route.ts'),
        read('src/app/api/agent/collaborators/route.ts'),
        read('src/app/api/affiliate/register/route.ts'),
    ]);

    for (const source of sources) {
        assert.match(source, /roleType[\s\S]{0,80}collaborator/);
        assert.match(source, /saleType[\s\S]{0,80}collaborator/);
        assert.match(source, /affiliateLevel[\s\S]{0,80}collaborator/);
    }
});

test('agent commission navigation has a real page and authenticated API', async () => {
    const [layout, page, api] = await Promise.all([
        read('src/app/agent/layout.tsx'),
        read('src/app/agent/commissions/page.tsx'),
        read('src/app/api/agent/commissions/route.ts'),
    ]);
    assert.match(layout, /href: '\/agent\/commissions'/);
    assert.match(page, /fetch\('\/api\/agent\/commissions'/);
    assert.match(api, /affiliateId: agent\._id/);
    assert.match(api, /invalidOrderStatuses/);
});

test('agent collaborator management is scoped to the signed-in agent', async () => {
    const [layout, page, api] = await Promise.all([
        read('src/app/agent/layout.tsx'),
        read('src/app/agent/collaborators/page.tsx'),
        read('src/app/api/agent/collaborators/route.ts'),
    ]);
    assert.match(layout, /href: '\/agent\/collaborators'/);
    assert.match(page, /fetch\('\/api\/agent\/collaborators'/);
    assert.match(api, /parentStaff: agent!?\._id/);
    assert.match(api, /sendAccountCredentialsEmail/);
    assert.doesNotMatch(layout, /href="\/staff"/);
});

test('collaborator commission menu no longer points at a missing route', async () => {
    const [layout, page] = await Promise.all([
        read('src/app/collaborator/layout.tsx'),
        read('src/app/collaborator/commissions/page.tsx'),
    ]);
    assert.match(layout, /href: '\/collaborator\/commissions'/);
    assert.match(page, /agent\/commissions\/page/);
    assert.doesNotMatch(layout, /href="\/staff"/);
});

test('collaborators can manage only customers attributed to their own referral identity', async () => {
    const [layout, page, detailPage, listApi, detailApi, permissions] = await Promise.all([
        read('src/app/collaborator/layout.tsx'),
        read('src/app/collaborator/customers/page.tsx'),
        read('src/app/collaborator/customers/[id]/page.tsx'),
        read('src/app/api/collaborator/customers/route.ts'),
        read('src/app/api/collaborator/customers/[id]/route.ts'),
        read('src/lib/auth-permissions.ts'),
    ]);

    assert.match(layout, /href: '\/collaborator\/customers'/);
    assert.match(page, /\/api\/collaborator\/customers\?search=/);
    assert.match(page, /\/collaborator\/customers\/\$\{customer\._id\}/);
    assert.match(detailPage, /\/api\/collaborator\/customers\/\$\{id\}/);
    assert.match(listApi, /referrer: auth\.user\._id/);
    assert.match(detailApi, /referrer: auth\.user\._id/);
    assert.match(detailApi, /includeVouchers: false/);
    assert.match(permissions, /requireCollaboratorAuth/);
    assert.doesNotMatch(listApi, /parentStaff: auth\.user\._id/);
});

test('agent dashboard never falls back to fabricated sales data', async () => {
    const dashboard = await read('src/app/agent/page.tsx');
    assert.doesNotMatch(dashboard, /mockStats/);
    assert.match(dashboard, /setLoadError/);
});

test('agent account actions are functional and referral links use the active public origin', async () => {
    const [layout, dashboard, changePasswordApi] = await Promise.all([
        read('src/app/agent/layout.tsx'),
        read('src/app/agent/page.tsx'),
        read('src/app/api/auth/change-password/route.ts'),
    ]);

    assert.match(layout, /Đổi mật khẩu/);
    assert.match(layout, /await logout\(\)/);
    assert.match(layout, /ChangePasswordModal/);
    assert.match(changePasswordApi, /bcrypt\.compare\(currentPassword, user\.password\)/);
    assert.match(changePasswordApi, /bcrypt\.hash\(newPassword, 10\)/);
    assert.match(dashboard, /setSiteOrigin\(window\.location\.origin\)/);
    assert.match(dashboard, /\?ref=\$\{encodeURIComponent\(displayStats\.referralCode\)\}/);
    assert.doesNotMatch(dashboard, /generateReferralLink/);
});

test('admin commission user detail opens the existing user detail route', async () => {
    const page = await read('src/app/admin/commission/users/page.tsx');
    assert.match(page, /href={`\/admin\/users\/\${user\._id}`}/);
    assert.doesNotMatch(page, /\/admin\/commission\/users\/\${user\._id}/);
    assert.doesNotMatch(page, /Tăng 12%/);
});

test('admin can convert an account into a functional collaborator login', async () => {
    const [adminUserPage, roleApi, loginApi, loginPage] = await Promise.all([
        read('src/app/admin/users/[id]/page.tsx'),
        read('src/app/api/admin/users/[id]/route.ts'),
        read('src/app/api/auth/login/route.ts'),
        read('src/app/login/page.tsx'),
    ]);

    assert.match(adminUserPage, /Chuyển thành Cộng tác viên/);
    assert.match(adminUserPage, /handleRoleChange\('collaborator'\)/);
    assert.match(roleApi, /targetRole === 'collaborator'/);
    assert.match(roleApi, /updateData\.roleType = 'collaborator'/);
    assert.match(roleApi, /updateData\.affiliateLevel = 'collaborator'/);
    assert.match(roleApi, /updateData\.saleType = 'collaborator'/);
    assert.match(roleApi, /createUniqueReferralCode/);
    assert.match(loginApi, /affiliateLevel: user\.affiliateLevel/);
    assert.match(loginPage, /new URLSearchParams\(window\.location\.search\)\.get\('redirect'\)/);
    assert.match(loginPage, /!requestedRedirect\.startsWith\('\/\/'\)/);
});
