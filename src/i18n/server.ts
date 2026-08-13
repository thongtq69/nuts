import 'server-only';

import { headers } from 'next/headers';
import { LOCALE_HEADER, Locale, normalizeLocale } from './config';

export async function getRequestLocale(): Promise<Locale> {
    const requestHeaders = await headers();
    return normalizeLocale(requestHeaders.get(LOCALE_HEADER));
}

export function getUrlLocale(request: Request): Locale {
    const { searchParams } = new URL(request.url);
    return normalizeLocale(searchParams.get('locale'));
}

