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

test('admin commission user detail opens the existing user detail route', async () => {
    const page = await read('src/app/admin/commission/users/page.tsx');
    assert.match(page, /href={`\/admin\/users\/\${user\._id}`}/);
    assert.doesNotMatch(page, /\/admin\/commission\/users\/\${user\._id}/);
    assert.doesNotMatch(page, /Tăng 12%/);
});
