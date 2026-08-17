import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('change-password API verifies the current password, persists the new hash and signs out', async () => {
    const api = await read('src/app/api/auth/change-password/route.ts');

    assert.match(api, /requireAuth\(\)/);
    assert.match(api, /bcrypt\.compare\(currentPassword, user\.password\)/);
    assert.match(api, /bcrypt\.hash\(newPassword, 10\)/);
    assert.match(api, /clearAuthCookie/);
});

test('admin account menu exposes functional change-password and logout actions', async () => {
    const header = await read('src/components/admin/Header.tsx');

    assert.match(header, /ChangePasswordModal/);
    assert.match(header, /setIsChangePasswordOpen\(true\)/);
    assert.match(header, /await logout\(\)/);
    assert.match(header, /Đổi mật khẩu/);
    assert.match(header, /Đăng xuất/);
});

test('staff, agent and collaborator layouts expose security actions on every portal page', async () => {
    const [staff, agent, collaborator] = await Promise.all([
        read('src/app/staff/layout.tsx'),
        read('src/app/agent/layout.tsx'),
        read('src/app/collaborator/layout.tsx'),
    ]);

    for (const layout of [staff, agent, collaborator]) {
        assert.match(layout, /ChangePasswordModal/);
        assert.match(layout, /await logout\(\)/);
        assert.match(layout, /Đổi mật khẩu/);
        assert.match(layout, /Đăng xuất/);
    }
});

test('all customer account pages expose change-password and logout actions', async () => {
    const pages = await Promise.all([
        read('src/app/account/page.tsx'),
        read('src/app/account/membership/page.tsx'),
        read('src/app/account/vouchers/page.tsx'),
    ]);

    for (const page of pages) {
        assert.match(page, /ChangePasswordModal/);
        assert.match(page, /logout/);
        assert.match(page, /Đổi mật khẩu/);
        assert.match(page, /Đăng xuất/);
    }
});

