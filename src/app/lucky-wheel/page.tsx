'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowDownToLine, Banknote, CheckCircle2, Clock3, Coins, Gift, History, RefreshCw, ShieldCheck, Sparkles, WalletCards, X } from 'lucide-react';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';
import BankInfoDisplay from '@/components/payment/BankInfoDisplay';
import SpinResultCelebration from '@/components/lucky-wheel/SpinResultCelebration';
import { useAuth } from '@/context/AuthContext';
import { DEFAULT_WHEEL_SEGMENTS } from '@/lib/lucky-wheel-config';

interface SpinHistoryItem { _id?: string; requestId: string; prizeValue: number; isTest?: boolean; createdAt?: string }
interface TopUp { _id: string; paymentRef: string; amount: number; spins: number; status: 'pending' | 'paid' | 'expired'; createdAt: string }
interface Withdrawal { _id: string; amount: number; status: 'pending' | 'paid' | 'rejected'; payoutReference?: string; bankTransactionId?: string; bankVerifiedAt?: string; rejectionReason?: string; createdAt: string }
interface SpinResult { prize: number; isTest: boolean }
interface WheelData {
    campaign: {
        name: string;
        memberBadgeText: string;
        introText: string;
        inactiveMessage: string;
        spinButtonText: string;
        totalWinningsLabel: string;
        balanceLabel: string;
        topUpTitle: string;
        withdrawalTitle: string;
        termsTitle: string;
        historyTitle: string;
        adminTestMode: boolean;
        active: boolean;
        minimumTopUp: number;
        spinsPerTopUpUnit: number;
        minimumWithdrawal: number;
        topUpOptions: number[];
        wheelSegments: { label: string; value: number; color: string }[];
        terms: string[];
    };
    account: { availableSpins: number; prizeBalance: number; availablePrizeBalance: number; pendingWithdrawal: number; lifetimeWinnings: number };
    history: SpinHistoryItem[];
    topUps: TopUp[];
    withdrawals: Withdrawal[];
}

const money = (value: number) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;

export default function LuckyWheelPage() {
    const { user, loading: authLoading } = useAuth();
    const [data, setData] = useState<WheelData | null>(null);
    const [loading, setLoading] = useState(true);
    const [spinning, setSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [message, setMessage] = useState('');
    const [messageTone, setMessageTone] = useState<'success' | 'error'>('success');
    const [spinResult, setSpinResult] = useState<SpinResult | null>(null);
    const [topUpAmount, setTopUpAmount] = useState(10_000);
    const [topUp, setTopUp] = useState<TopUp | null>(null);
    const [creatingTopUp, setCreatingTopUp] = useState(false);
    const [withdrawOpen, setWithdrawOpen] = useState(false);
    const [withdrawForm, setWithdrawForm] = useState({ amount: 100_000, bankName: '', accountNumber: '', accountName: '' });
    const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false);

    const load = useCallback(async () => {
        if (!user) return;
        const response = await fetch('/api/lucky-wheel', { cache: 'no-store' });
        if (response.ok) {
            const result: WheelData = await response.json();
            setData(result);
            setTopUpAmount(current => result.campaign.topUpOptions.includes(current) ? current : result.campaign.topUpOptions[0] || result.campaign.minimumTopUp);
            setWithdrawForm(current => ({ ...current, amount: result.campaign.minimumWithdrawal }));
        }
        setLoading(false);
    }, [user]);

    // Loading is asynchronous; state updates happen after the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { void load(); }, [load]);

    useEffect(() => {
        if (!topUp || topUp.status !== 'pending') return;
        const timer = window.setInterval(async () => {
            const response = await fetch(`/api/lucky-wheel/top-up/${topUp.paymentRef}`, { cache: 'no-store' });
            if (!response.ok) return;
            const result = await response.json();
            if (result.topUp?.status === 'paid') {
                setTopUp(result.topUp);
                setMessage(`Nạp tiền thành công! Bạn đã nhận ${result.topUp.spins} lượt quay.`);
                setMessageTone('success');
                await load();
            }
        }, 5_000);
        return () => window.clearInterval(timer);
    }, [topUp, load]);

    const segments = data?.campaign.wheelSegments?.length === 6 ? data.campaign.wheelSegments : DEFAULT_WHEEL_SEGMENTS;
    const wheelBackground = useMemo(() => {
        const angle = 360 / segments.length;
        return `conic-gradient(${segments.map((segment, index) => `${segment.color} ${index * angle}deg ${index * angle + angle}deg`).join(',')})`;
    }, [segments]);
    const moneyHistory = useMemo(() => {
        const topUps = (data?.topUps || []).map(item => ({
            id: item._id,
            type: 'Nạp tiền' as const,
            amount: item.amount,
            reference: item.paymentRef,
            createdAt: item.createdAt,
            status: item.status === 'paid' ? 'success' as const : item.status === 'expired' ? 'rejected' as const : 'pending' as const,
            detail: item.status === 'expired' ? 'Giao dịch hết hạn hoặc chưa thanh toán' : '',
        }));
        const withdrawals = (data?.withdrawals || []).map(item => ({
            id: item._id,
            type: 'Rút tiền' as const,
            amount: item.amount,
            reference: item.payoutReference || 'Đang tạo mã',
            createdAt: item.createdAt,
            status: item.status === 'paid' ? 'success' as const : item.status === 'rejected' ? 'rejected' as const : 'pending' as const,
            detail: item.rejectionReason || (item.bankTransactionId ? `Mã GD: ${item.bankTransactionId}` : ''),
        }));
        return [...topUps, ...withdrawals].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [data?.topUps, data?.withdrawals]);

    const spin = async () => {
        const adminTestMode = Boolean(data?.campaign.adminTestMode);
        if (spinning || (!adminTestMode && (!data?.campaign.active || data.account.availableSpins < 1))) return;
        setSpinning(true); setMessage(''); setMessageTone('success'); setSpinResult(null);
        const response = await fetch('/api/lucky-wheel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ requestId: crypto.randomUUID().replaceAll('-', '') }) });
        const outcome = await response.json();
        if (!response.ok) { setMessage(outcome.message || 'Không thể quay lúc này.'); setMessageTone('error'); setSpinning(false); return; }
        const prize = Number(outcome.spin.prizeValue || 0);
        const selected = Math.max(0, segments.findIndex(item => item.value === prize));
        const segmentAngle = 360 / segments.length;
        setRotation(previous => previous + 1800 + (360 - (selected * segmentAngle + segmentAngle / 2)) - (previous % 360));
        window.setTimeout(() => {
            void load();
            setSpinResult({ prize, isTest: Boolean(outcome.adminTestMode) });
            setSpinning(false);
        }, 3600);
    };

    const createTopUp = async () => {
        setCreatingTopUp(true);
        const response = await fetch('/api/lucky-wheel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'top-up', amount: topUpAmount }) });
        const result = await response.json();
        if (response.ok) setTopUp(result.topUp); else { setMessage(result.message || 'Không thể tạo giao dịch nạp tiền.'); setMessageTone('error'); }
        setCreatingTopUp(false);
    };

    const requestWithdrawal = async () => {
        setSubmittingWithdrawal(true);
        const response = await fetch('/api/lucky-wheel/withdraw', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(withdrawForm) });
        const result = await response.json();
        setMessage(result.message);
        setMessageTone(result.withdrawal?.status === 'rejected' || !response.ok ? 'error' : 'success');
        if (response.ok) { setWithdrawOpen(false); await load(); }
        setSubmittingWithdrawal(false);
    };

    if (authLoading || (user && loading)) return <main><Header /><Navbar /><div className="grid min-h-[60vh] place-items-center text-[#795432]"><RefreshCw className="animate-spin" /></div><Footer /></main>;
    if (!user) return <main><Header /><Navbar /><Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Vòng quay may mắn' }]} /><section className="mx-auto max-w-xl px-5 py-20 text-center"><Gift className="mx-auto mb-5 text-[#9c7043]" size={52}/><h1 className="text-3xl font-black">Vòng quay may mắn Go Nuts</h1><p className="mt-4 text-slate-600">Vui lòng đăng ký thành viên hoặc đăng nhập để nạp lượt và tham gia.</p><Link href="/login" className="mt-7 inline-flex rounded-full bg-[#9c7043] px-7 py-3 font-bold text-white">Đăng nhập ngay</Link></section><Footer /></main>;

    return <main className="min-h-screen bg-[#fffaf0]"><Header /><Navbar /><Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Vòng quay may mắn' }]} />
        <section className="relative overflow-hidden pb-20 pt-7"><div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_50%_0%,rgba(235,191,91,.26),transparent_70%)]" /><div className="relative mx-auto max-w-6xl px-4">
            <div className="mx-auto max-w-3xl text-center"><div className="inline-flex items-center gap-2 rounded-full border border-[#d9bd7c] bg-white/80 px-4 py-2 text-xs font-extrabold uppercase tracking-[.2em] text-[#8b6039]"><Sparkles size={15}/> {data?.campaign.memberBadgeText}</div><h1 className="mt-5 text-4xl font-black tracking-tight text-[#282019] sm:text-5xl">{data?.campaign.name}</h1><p className="mx-auto mt-4 max-w-xl text-base leading-7 text-[#765f4b]">{data?.campaign.introText}</p></div>
            {!data?.campaign.active && <div className="mx-auto mt-7 max-w-2xl rounded-2xl border border-amber-300 bg-amber-100 p-4 text-center font-semibold text-amber-900">{data?.campaign.inactiveMessage}</div>}
            {data?.campaign.adminTestMode && <div className="mx-auto mt-5 max-w-2xl rounded-2xl border border-blue-200 bg-blue-50 p-4 text-center font-semibold text-blue-800">Chế độ test Admin: quay không giới hạn, không cần nạp, không trừ lượt và không cộng tiền thưởng thật.</div>}
            {message && <div className={`mx-auto mt-7 flex max-w-2xl items-center justify-center gap-2 rounded-2xl border p-4 text-center font-bold ${messageTone === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}><CheckCircle2 size={20}/>{message}</div>}
            <div className="mt-10 grid items-start gap-7 lg:grid-cols-[1.08fr_.92fr]">
                <div className="relative overflow-hidden rounded-[32px] bg-[linear-gradient(145deg,#332318,#17130f)] p-5 shadow-[0_24px_70px_rgba(87,56,24,.25)] sm:p-10"><div className="absolute -left-16 -top-16 h-52 w-52 rounded-full bg-[#d6a441]/20 blur-3xl" /><div className="relative mx-auto aspect-square max-w-[500px]"><div className="absolute left-1/2 top-[-5px] z-30 -translate-x-1/2"><div className="h-0 w-0 border-l-[18px] border-r-[18px] border-t-[38px] border-l-transparent border-r-transparent border-t-white drop-shadow-lg" /></div><div className="absolute inset-1 rounded-full bg-[#8a5c2c] shadow-[0_0_0_7px_#e8c761,0_0_0_11px_#694019,0_20px_40px_rgba(0,0,0,.45)]" /><div className="absolute inset-4 rounded-full transition-transform duration-[3400ms] ease-[cubic-bezier(.12,.67,.12,1)]" style={{ transform: `rotate(${rotation}deg)`, background: wheelBackground }}><div className="absolute inset-3 rounded-full border border-white/60" />{segments.map((segment, index) => {
                    const angle = ((index * (360 / segments.length) + (180 / segments.length)) * Math.PI) / 180;
                    return <div key={segment.label} className="absolute z-10 flex min-h-9 w-[27%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border border-white/70 bg-white/85 px-1.5 py-1 text-center text-[10px] font-black leading-tight text-[#35281d] shadow-[0_3px_10px_rgba(65,38,17,.2)] sm:min-h-11 sm:text-[13px]" style={{ left: `${50 + Math.sin(angle) * 33}%`, top: `${50 - Math.cos(angle) * 33}%` }}>{segment.label}</div>;
                })}</div><button onClick={spin} disabled={spinning || (!data?.campaign.adminTestMode && (!data?.campaign.active || !data?.account.availableSpins))} className="absolute left-1/2 top-1/2 z-20 grid h-24 w-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-[6px] border-white bg-[linear-gradient(145deg,#f0c75f,#bd7a2c)] px-2 text-center text-sm font-black leading-tight text-[#2f2117] shadow-[0_10px_30px_rgba(0,0,0,.4),inset_0_2px_4px_rgba(255,255,255,.8)] transition hover:scale-105 disabled:cursor-not-allowed disabled:grayscale sm:h-28 sm:w-28 sm:text-base"><span>{spinning ? 'ĐANG QUAY' : data?.campaign.spinButtonText}</span></button></div><p className="relative mt-7 text-center text-sm font-semibold text-[#e9d9bd]">{data?.campaign.adminTestMode ? <strong className="text-[#f6ca62]">Admin được quay test không giới hạn</strong> : <>Bạn còn <strong className="text-xl text-[#f6ca62]">{data?.account.availableSpins || 0}</strong> lượt quay</>}</p></div>
                <div className="space-y-5"><div className="grid grid-cols-2 gap-4"><div className="rounded-3xl border border-[#eadcc8] bg-white p-5 shadow-sm"><Coins className="text-[#c8872d]"/><p className="mt-4 text-sm text-slate-500">{data?.campaign.totalWinningsLabel}</p><p className="mt-1 text-2xl font-black text-[#6b4425]">{money(data?.account.lifetimeWinnings || 0)}</p></div><div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm"><WalletCards className="text-emerald-600"/><p className="mt-4 text-sm text-emerald-700">{data?.campaign.balanceLabel}</p><p className="mt-1 text-2xl font-black text-emerald-700">{money(data?.account.prizeBalance || 0)}</p>{Boolean(data?.account.pendingWithdrawal) && <p className="mt-1 text-xs text-emerald-700">Khả dụng: {money(data?.account.availablePrizeBalance || 0)} · Chờ duyệt rút: {money(data?.account.pendingWithdrawal || 0)}</p>}</div></div><div className="rounded-3xl border border-[#eadcc8] bg-white p-6 shadow-sm"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-[#a16d35]">{data?.campaign.topUpTitle}</p><h2 className="mt-1 text-xl font-black text-[#33271e]">{money(data?.campaign.minimumTopUp || 0)} = {data?.campaign.spinsPerTopUpUnit} lượt</h2></div><Banknote className="text-[#b7823f]" size={32}/></div><div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">{data?.campaign.topUpOptions.map(amount => <button key={amount} onClick={() => setTopUpAmount(amount)} className={`rounded-xl border px-2 py-3 text-sm font-bold ${topUpAmount === amount ? 'border-[#9c7043] bg-[#9c7043] text-white' : 'border-[#e7dac7] bg-[#fffaf2] text-[#62472f]'}`}>{amount >= 1000 && amount % 1000 === 0 ? `${amount / 1000}K` : money(amount)}</button>)}</div><button onClick={createTopUp} disabled={creatingTopUp || !data?.campaign.active} className="mt-4 w-full rounded-xl bg-[#2c2119] px-5 py-3.5 font-bold text-white transition hover:bg-[#9c7043] disabled:opacity-50">{creatingTopUp ? 'Đang tạo mã QR...' : `Nạp ${money(topUpAmount)} · Nhận ${(topUpAmount / (data?.campaign.minimumTopUp || 1)) * (data?.campaign.spinsPerTopUpUnit || 0)} lượt`}</button></div><button onClick={() => setWithdrawOpen(true)} className="flex w-full items-center justify-between rounded-3xl border border-[#eadcc8] bg-white p-5 text-left shadow-sm transition hover:border-[#9c7043]"><span className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#fff3dc] text-[#a16d35]"><ArrowDownToLine/></span><span><strong className="block text-[#33271e]">{data?.campaign.withdrawalTitle}</strong><small className="text-slate-500">Tối thiểu {money(data?.campaign.minimumWithdrawal || 0)}/lần</small></span></span><span className="text-xl">›</span></button></div>
            </div>
            <div className="mt-8 grid gap-6 lg:grid-cols-2"><section className="rounded-3xl border border-[#eadcc8] bg-white p-6"><h2 className="flex items-center gap-2 text-lg font-black"><ShieldCheck className="text-emerald-600"/> {data?.campaign.termsTitle}</h2><ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">{data?.campaign.terms.map(term => <li key={term}>• {term}</li>)}</ul></section><section className="rounded-3xl border border-[#eadcc8] bg-white p-6"><h2 className="flex items-center gap-2 text-lg font-black"><History className="text-[#a16d35]"/> {data?.campaign.historyTitle}</h2><div className="mt-4 max-h-56 space-y-2 overflow-auto">{!data?.history.length ? <p className="text-sm text-slate-500">Bạn chưa có lượt quay nào.</p> : data.history.map(item => <div key={item._id || item.requestId} className="flex items-center justify-between rounded-xl bg-[#fffaf2] px-4 py-3 text-sm"><span className="text-slate-500">{item.isTest && <b className="mr-2 rounded bg-blue-100 px-2 py-1 text-[10px] text-blue-700">TEST</b>}{item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : ''}</span><strong className={item.isTest ? 'text-blue-700' : item.prizeValue ? 'text-emerald-600' : 'text-slate-500'}>{item.prizeValue ? `${item.isTest ? '' : '+'}${money(item.prizeValue)}` : 'Chúc may mắn'}</strong></div>)}</div></section>
            <section className="rounded-3xl border border-[#eadcc8] bg-white p-6 lg:col-span-2"><h2 className="flex items-center gap-2 text-lg font-black"><ArrowDownToLine className="text-[#a16d35]"/> Lịch sử nạp/rút tiền</h2><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead><tr className="border-b text-slate-500"><th className="py-3 pr-4">Thời gian</th><th className="py-3 pr-4">Giao dịch</th><th className="py-3 pr-4">Số tiền</th><th className="py-3 pr-4">Nội dung</th><th className="py-3">Trạng thái</th></tr></thead><tbody>{moneyHistory.length ? moneyHistory.map(item => <tr key={`${item.type}-${item.id}`} className="border-b border-[#f0e6d7]"><td className="py-3 pr-4 text-slate-500">{new Date(item.createdAt).toLocaleString('vi-VN')}</td><td className="py-3 pr-4 font-bold">{item.type}</td><td className="py-3 pr-4 font-black">{money(item.amount)}</td><td className="py-3 pr-4"><code className="font-bold">{item.reference}</code>{item.detail && <p className={`mt-1 text-xs ${item.status === 'rejected' ? 'text-red-600' : 'text-slate-500'}`}>{item.detail}</p>}</td><td className="py-3"><span className={`rounded-full px-3 py-1 text-xs font-bold ${item.status === 'success' ? 'bg-emerald-100 text-emerald-700' : item.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{item.status === 'success' ? 'Thành công' : item.status === 'rejected' ? 'Từ chối' : 'Đang xử lý'}</span></td></tr>) : <tr><td colSpan={5} className="py-6 text-center text-slate-500">Chưa có giao dịch nạp/rút tiền.</td></tr>}</tbody></table></div></section>
            </div>
        </div></section>
        {topUp && <div className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4"><div className="max-h-[92vh] w-full max-w-2xl overflow-auto rounded-3xl bg-white p-5 sm:p-7"><div className="mb-5 flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-[#9c7043]">Nạp lượt vòng quay</p><h2 className="mt-1 text-2xl font-black">Quét mã để thanh toán</h2></div><button onClick={() => setTopUp(null)} className="rounded-full bg-slate-100 p-2"><X/></button></div>{topUp.status === 'paid' ? <div className="rounded-2xl bg-emerald-50 p-8 text-center text-emerald-800"><CheckCircle2 className="mx-auto mb-3" size={52}/><h3 className="text-xl font-black">Đã nhận thanh toán</h3><p className="mt-2">{topUp.spins} lượt quay đã được cộng vào tài khoản.</p></div> : <><BankInfoDisplay amount={topUp.amount} description={topUp.paymentRef}/><div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-blue-50 p-3 text-sm font-semibold text-blue-700"><Clock3 size={17}/> Hệ thống tự kiểm tra giao dịch mỗi 5 giây</div></>}</div></div>}
        {withdrawOpen && <div className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4"><div className="w-full max-w-lg rounded-3xl bg-white p-6"><div className="flex items-center justify-between"><h2 className="text-2xl font-black">{data?.campaign.withdrawalTitle}</h2><button onClick={() => setWithdrawOpen(false)} className="rounded-full bg-slate-100 p-2"><X/></button></div><p className="mt-2 text-sm text-slate-500">Số dư khả dụng: <strong className="text-emerald-600">{money(data?.account.availablePrizeBalance || 0)}</strong></p><p className="mt-1 text-xs text-slate-500">Tiền chỉ bị trừ khỏi tài khoản sau khi admin duyệt lệnh rút thành công.</p><div className="mt-5 space-y-4"><label className="block text-sm font-semibold">Số tiền<input type="number" min={data?.campaign.minimumWithdrawal || 100000} step={1000} value={withdrawForm.amount} onChange={event => setWithdrawForm({...withdrawForm, amount: Number(event.target.value)})} className="mt-1 w-full rounded-xl border p-3"/></label><label className="block text-sm font-semibold">Ngân hàng<input value={withdrawForm.bankName} onChange={event => setWithdrawForm({...withdrawForm, bankName: event.target.value})} className="mt-1 w-full rounded-xl border p-3" placeholder="Ví dụ: ACB"/></label><label className="block text-sm font-semibold">Số tài khoản<input value={withdrawForm.accountNumber} onChange={event => setWithdrawForm({...withdrawForm, accountNumber: event.target.value.replace(/\D/g, '')})} className="mt-1 w-full rounded-xl border p-3"/></label><label className="block text-sm font-semibold">Họ tên chủ tài khoản<input value={withdrawForm.accountName} onChange={event => setWithdrawForm({...withdrawForm, accountName: event.target.value})} className="mt-1 w-full rounded-xl border p-3"/></label><button onClick={requestWithdrawal} disabled={submittingWithdrawal} className="w-full rounded-xl bg-[#2c2119] px-5 py-3.5 font-bold text-white disabled:opacity-50">{submittingWithdrawal ? 'Đang gửi...' : 'Gửi lệnh rút tiền'}</button></div></div></div>}
        {spinResult && <SpinResultCelebration prize={spinResult.prize} isTest={spinResult.isTest} onClose={() => setSpinResult(null)} />}
        <Footer />
    </main>;
}
