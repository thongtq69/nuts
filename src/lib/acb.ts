/* eslint-disable @typescript-eslint/no-explicit-any */
import { randomUUID } from 'crypto';

const AUTH_URL = process.env.ACB_AUTH_URL!;
const API_BASE = process.env.ACB_API_BASE!;
const CLIENT_ID = process.env.ACB_CLIENT_ID!;
const CLIENT_SECRET = process.env.ACB_CLIENT_SECRET!;
const PROVIDER_ID = process.env.ACB_PROVIDER_ID!;
const TPP_ID = process.env.ACB_TPP_ID || process.env.ACB_OWNER_NUMBER || PROVIDER_ID;

let cachedToken: { value: string; expiresAt: number } | null = null;

async function fetchToken(): Promise<{ value: string; expiresAt: number }> {
    const body = new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'client_credentials',
        scope: 'soba-api',
    });

    const res = await fetch(AUTH_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
        },
        body,
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`ACB auth failed: HTTP ${res.status} ${text}`);
    }

    const json = await res.json();
    // expires_in is in seconds (despite docs saying ms — verified via JWT exp claim)
    const expiresAt = Date.now() + (json.expires_in - 60) * 1000;
    return { value: json.access_token, expiresAt };
}

export async function getAcbToken(): Promise<string> {
    if (cachedToken && cachedToken.expiresAt > Date.now()) {
        return cachedToken.value;
    }
    cachedToken = await fetchToken();
    return cachedToken.value;
}

export async function acbRequest<T = any>(
    path: string,
    options: { method?: 'GET' | 'POST'; query?: Record<string, string>; body?: any; service?: string } = {}
): Promise<T> {
    const { method = 'GET', query, body, service = 'account-information' } = options;
    const token = await getAcbToken();
    const url = new URL(`${API_BASE}${path}`);
    if (query) for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);

    const res = await fetch(url, {
        method,
        headers: {
            'Authorization': `Bearer ${token}`,
            'X-Client-ID': CLIENT_ID,
            'X-Provider-ID': PROVIDER_ID,
            'X-Request-ID': randomUUID(),
            'X-Service': service,
            'Accept': 'application/json',
            ...(body ? { 'Content-Type': 'application/json' } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    const text = await res.text();
    let json: any;
    try { json = text ? JSON.parse(text) : {}; } catch { json = { raw: text }; }

    if (!res.ok) {
        throw new Error(`ACB ${method} ${path} failed: HTTP ${res.status} ${text}`);
    }
    return json as T;
}

export interface AcbBalance {
    requestId: string;
    status: { code: string; error: string; message: string };
    data: { current_balance: number; available_balance: number; currency: string };
}

export async function getAcbBalance(accountNumber: string): Promise<AcbBalance> {
    return acbRequest<AcbBalance>('/customers/account/v1/balances', {
        query: { account_number: accountNumber },
    });
}

export interface AcbTransactionHistoryItem {
    account?: string | number;
    remitterName?: string | null;
    remitterAccountNumber?: string | null;
    issuerBankName?: string | null;
    transactionCode?: string | number;
    transactionDate?: string;
    transactionType?: string;
    transactionSource?: string;
    transactionAmount?: number;
    transactionDescription?: string;
    traceNumber?: string;
    virtualAccount?: string | null;
    beneficiaryName?: string | null;
    beneficiaryBankName?: string | null;
    beneficiaryAccount?: string | number | null;
    transactionStatus?: string;
    debitOrCredit?: string;
    transactionTraceNumber?: string | null;
    partnerCustomerCode?: string | null;
}

export interface AcbTransactionHistoryResponse {
    responseDateTime?: string;
    responseStatus?: {
        responseCode?: string;
        responseMessage?: string;
    };
    responseData?: {
        transactions?: AcbTransactionHistoryItem[];
        pagination?: {
            page?: number;
            size?: number;
            totalPage?: number;
            totalRecord?: number;
        };
    };
}

function formatAcbRequestDateTime(date = new Date()): string {
    return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

export async function getAcbTransactionHistory(params: {
    accountNumber: string;
    fromDate: string;
    toDate: string;
    page?: number;
    size?: number;
}): Promise<AcbTransactionHistoryResponse> {
    const token = await getAcbToken();
    const url = new URL(`${API_BASE}/accounts/transactions/v2/transaction-history`);
    url.searchParams.set('account', params.accountNumber);
    url.searchParams.set('fromDate', params.fromDate);
    url.searchParams.set('toDate', params.toDate);
    url.searchParams.set('page', String(params.page || 1));
    url.searchParams.set('size', String(params.size || 100));

    const res = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'X-Client-ID': CLIENT_ID,
            'Request-ID': randomUUID(),
            'X-Service': 'statement',
            'Provider-ID': PROVIDER_ID,
            'TPP-ID': TPP_ID,
            'Request-DateTime': formatAcbRequestDateTime(),
            'Accept': 'application/json',
        },
    });

    const text = await res.text();
    let json: any;
    try { json = text ? JSON.parse(text) : {}; } catch { json = { raw: text }; }

    if (!res.ok) {
        throw new Error(`ACB transaction history failed: HTTP ${res.status} ${text}`);
    }

    return json as AcbTransactionHistoryResponse;
}

export function clearAcbTokenCache() {
    cachedToken = null;
}
