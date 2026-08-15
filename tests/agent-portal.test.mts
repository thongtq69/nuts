import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

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
