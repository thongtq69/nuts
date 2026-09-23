'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowDownToLine, ArrowUpFromLine, Banknote, CheckCircle2, Clock3, Coins, Gift, History, RefreshCw, ShieldCheck, Smile, Star, WalletCards, X } from 'lucide-react';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';
import BankInfoDisplay from '@/components/payment/BankInfoDisplay';
import BankCombobox from '@/components/payment/BankCombobox';
import SpinResultCelebration from '@/components/lucky-wheel/SpinResultCelebration';
import {
    CookieFriendIllustration,
    CupcakeIllustration,
    PlayfulJoyBanner,
    RainbowCloudIllustration,
} from '@/components/lucky-wheel/PlayfulWheelDecorations';
import ProgressiveListControls from '@/components/common/ProgressiveListControls';
import { useAuth } from '@/context/AuthContext';
import { DEFAULT_WHEEL_SEGMENTS } from '@/lib/lucky-wheel-config';
import { isInCurrentLuckyWheelHistoryWindow, millisecondsUntilNextLuckyWheelHistoryReset } from '@/lib/lucky-wheel-history';

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
const toneWheelColor = (color: string) => {
    const normalized = color.trim().replace('#', '');
    if (!/^[\da-f]{6}$/i.test(normalized)) return color;
    const neutral = [190, 181, 168];
    const source = [0, 2, 4].map(offset => Number.parseInt(normalized.slice(offset, offset + 2), 16));
    return `rgb(${source.map((channel, index) => Math.round(channel * .62 + neutral[index] * .38)).join(',')})`;
};

export default function LuckyWheelPage() {
    const { user, loading: authLoading } = useAuth();
    const [data, setData] = useState<WheelData | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
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
    const [visibleHistoryCount, setVisibleHistoryCount] = useState(5);
    const [visibleMoneyCount, setVisibleMoneyCount] = useState(5);
    const [moneyTab, setMoneyTab] = useState<'top-up' | 'withdrawal'>('top-up');
    const [historyClock, setHistoryClock] = useState(() => Date.now());

    const load = useCallback(async () => {
        if (!user) return;
        setLoadError('');
        try {
            const response = await fetch('/api/lucky-wheel', { cache: 'no-store' });
            if (!response.ok) {
                const result = await response.json().catch(() => null);
                throw new Error(result?.message || 'Không thể tải dữ liệu vòng quay.');
            }
            const result: WheelData = await response.json();
            setData(result);
            setTopUpAmount(current => result.campaign.topUpOptions.includes(current) ? current : result.campaign.topUpOptions[0] || result.campaign.minimumTopUp);
            setWithdrawForm(current => ({ ...current, amount: result.campaign.minimumWithdrawal }));
        } catch (error) {
            setLoadError(error instanceof Error ? error.message : 'Không thể tải dữ liệu vòng quay.');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => { void load(); }, [load]);

    useEffect(() => {
        if (user?.role === 'admin') return;
        let interval = 0;
        const resetAtNextHour = window.setTimeout(() => {
            setHistoryClock(Date.now());
            setVisibleHistoryCount(5);
            setVisibleMoneyCount(5);
            void load();
            interval = window.setInterval(() => {
                setHistoryClock(Date.now());
                setVisibleHistoryCount(5);
                setVisibleMoneyCount(5);
                void load();
            }, 60 * 60 * 1_000);
        }, millisecondsUntilNextLuckyWheelHistoryReset());
        return () => {
            window.clearTimeout(resetAtNextHour);
            if (interval) window.clearInterval(interval);
        };
    }, [load, user?.role]);

    useEffect(() => {
        if (!topUp || topUp.status !== 'pending') return;
        let active = true;
        let timer = 0;
        const checkTopUp = async () => {
            try {
                const response = await fetch(`/api/lucky-wheel/top-up/${topUp.paymentRef}`, { cache: 'no-store' });
                const result = await response.json().catch(() => null);
                if (!active) return;
                if (response.ok && result?.topUp?.status === 'paid') {
                    setTopUp(result.topUp);
                    setMessage(`Nạp tiền thành công! Bạn đã nhận ${result.topUp.spins} lượt quay.`);
                    setMessageTone('success');
                    await load();
                    return;
                }
                timer = window.setTimeout(checkTopUp, response.ok ? 2_000 : 5_000);
            } catch (error) {
                console.error('Lucky wheel top-up status check failed:', error);
                if (active) timer = window.setTimeout(checkTopUp, 5_000);
            }
        };
        void checkTopUp();
        return () => {
            active = false;
            if (timer) window.clearTimeout(timer);
        };
    }, [topUp, load]);

    const segments = data?.campaign.wheelSegments?.length === 6 ? data.campaign.wheelSegments : DEFAULT_WHEEL_SEGMENTS;
    const wheelBackground = useMemo(() => {
        const angle = 360 / segments.length;
        return `conic-gradient(${segments.map((segment, index) => `${toneWheelColor(segment.color)} ${index * angle}deg ${index * angle + angle}deg`).join(',')})`;
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
        return [...topUps, ...withdrawals]
            .filter(item => data?.campaign.adminTestMode || isInCurrentLuckyWheelHistoryWindow(item.createdAt, new Date(historyClock)))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [data?.campaign.adminTestMode, data?.topUps, data?.withdrawals, historyClock]);

    const visibleScopeSpinHistory = useMemo(
        () => (data?.history || []).filter(item => data?.campaign.adminTestMode || isInCurrentLuckyWheelHistoryWindow(item.createdAt, new Date(historyClock))),
        [data?.campaign.adminTestMode, data?.history, historyClock],
    );

    const selectedMoneyHistory = useMemo(
        () => moneyHistory.filter(item => moneyTab === 'top-up' ? item.type === 'Nạp tiền' : item.type === 'Rút tiền'),
        [moneyHistory, moneyTab],
    );

    useEffect(() => { setVisibleMoneyCount(5); }, [moneyTab]);

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
    if (!user) return <main><Header /><Navbar /><Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Bánh xe quà tặng' }]} /><section className="mx-auto max-w-xl px-5 py-20 text-center"><Gift className="mx-auto mb-5 text-[#42a9c7]" size={52}/><h1 className="whitespace-nowrap text-[clamp(1rem,4vw,1.875rem)] font-black tracking-tight text-[#28415f]">Bánh xe quà tặng GO NUTS</h1><p className="mt-4 text-slate-600">Vui lòng đăng ký thành viên hoặc đăng nhập để tham gia góc quà vui.</p><Link href="/login" className="mt-7 inline-flex rounded-full bg-[#4fb3d2] px-7 py-3 font-bold text-white shadow-[0_5px_0_#2e829e]">Đăng nhập ngay</Link></section><Footer /></main>;
    if (!data) return <main className="min-h-screen bg-[#fffaf0]"><Header /><Navbar /><Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Vòng quay may mắn' }]} /><section className="mx-auto grid min-h-[55vh] max-w-xl place-items-center px-5 py-16"><div className="w-full rounded-[28px] border border-amber-200 bg-white p-7 text-center shadow-xl sm:p-10"><RefreshCw className="mx-auto text-amber-600" size={42}/><h1 className="mt-4 text-2xl font-black text-[#2c2119]">Chưa tải được vòng quay</h1><p className="mt-3 text-sm leading-6 text-slate-600">{loadError || 'Kết nối tạm thời chưa ổn định. Dữ liệu cũ sẽ không được hiển thị thành số 0.'}</p><button onClick={() => { setLoading(true); void load(); }} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#2c2119] px-6 py-3 font-bold text-white transition hover:bg-[#9c7043]"><RefreshCw size={17}/> Tải lại dữ liệu</button></div></section><Footer /></main>;

    const visibleSpinHistory = visibleScopeSpinHistory.slice(0, visibleHistoryCount);
    const visibleMoneyHistory = selectedMoneyHistory.slice(0, visibleMoneyCount);
    const displayCampaignName = data.campaign.name === 'Vòng quay may mắn GO NUTS' ? 'Bánh xe quà tặng GO NUTS' : data.campaign.name;
    const displayMemberBadge = data.campaign.memberBadgeText === 'Thành viên Go Nuts' ? 'Góc quà vui Go Nuts' : data.campaign.memberBadgeText;
    const displayIntro = data.campaign.introText === 'Nạp 10.000đ nhận 5 lượt quay. Tiền thưởng được cộng thẳng vào tài khoản để rút hoặc dùng khi mua hàng.'
        ? 'Mỗi lượt mở ra một bất ngờ nhỏ. Quà nhận được sẽ được lưu ngay vào tài khoản của bạn.'
        : data.campaign.introText;

    return <main className="min-h-screen overflow-x-hidden bg-[#fffaf0]"><Header /><Navbar /><Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Bánh xe quà tặng' }]} />
        <section className="relative overflow-hidden pb-16 pt-5 sm:pb-24 sm:pt-8"><div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_50%_0%,rgba(235,191,91,.3),transparent_70%)]" /><div className="pointer-events-none absolute -right-28 top-80 h-80 w-80 rounded-full bg-emerald-100/45 blur-3xl" /><div className="relative mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl text-center"><div className="inline-flex max-w-full items-center gap-2 rounded-full border-2 border-[#ffd66b] bg-[#fff9d9] px-3.5 py-2 text-[10px] font-extrabold uppercase tracking-[.16em] text-[#76521f] shadow-[0_5px_0_#f4c957] sm:px-4 sm:text-xs sm:tracking-[.2em]"><Star className="shrink-0 fill-[#ffd75e] text-[#e5a91d]" size={15}/> <span className="truncate">{displayMemberBadge}</span></div><h1 className={`mt-5 font-black leading-[1.08] tracking-tight text-[#28415f] sm:mt-6 ${displayCampaignName === 'Bánh xe quà tặng GO NUTS' ? 'whitespace-nowrap text-[clamp(1rem,4vw,3.4rem)]' : 'text-[2rem] sm:text-5xl lg:text-[3.4rem]'}`}>{displayCampaignName}</h1><p className="mx-auto mt-3 max-w-2xl text-[15px] leading-6 text-[#58708a] sm:mt-4 sm:text-base sm:leading-7">{displayIntro}</p><PlayfulJoyBanner/></div>
            {!data?.campaign.active && <div className="mx-auto mt-7 max-w-2xl rounded-2xl border border-amber-300 bg-amber-100 p-4 text-center font-semibold text-amber-900">{data?.campaign.inactiveMessage}</div>}
            {message && <div className={`mx-auto mt-7 flex max-w-2xl items-center justify-center gap-2 rounded-2xl border p-4 text-center font-bold ${messageTone === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}><CheckCircle2 size={20}/>{message}</div>}
            <div className="mt-8 grid items-start gap-5 sm:mt-10 sm:gap-7 lg:grid-cols-[minmax(0,1.08fr)_minmax(340px,.92fr)]">
                <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-[linear-gradient(145deg,#24282b,#15181a)] p-4 shadow-[0_24px_70px_rgba(87,56,24,.25)] sm:rounded-[36px] sm:p-9 lg:sticky lg:top-5"><div className="absolute -left-16 -top-16 h-52 w-52 rounded-full bg-[#b49a74]/10 blur-3xl" /><div className="absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-[#67736d]/10 blur-3xl" /><div className="relative mx-auto aspect-square max-w-[530px]"><div className="absolute left-1/2 top-[-3px] z-30 -translate-x-1/2"><div className="h-0 w-0 border-l-[14px] border-r-[14px] border-t-[30px] border-l-transparent border-r-transparent border-t-white drop-shadow-lg sm:border-l-[18px] sm:border-r-[18px] sm:border-t-[38px]" /></div><div className="absolute inset-1 rounded-full bg-[#765d47] shadow-[0_0_0_4px_#c4aa7d,0_0_0_9px_#342a22,0_18px_35px_rgba(0,0,0,.38)] sm:shadow-[0_0_0_6px_#c4aa7d,0_0_0_11px_#342a22,0_20px_40px_rgba(0,0,0,.4)]" /><div className="absolute inset-[11px] overflow-hidden rounded-full transition-transform duration-[3400ms] ease-[cubic-bezier(.12,.67,.12,1)] sm:inset-4" style={{ transform: `rotate(${rotation}deg)`, background: `radial-gradient(circle at 48% 38%, rgba(255,255,255,.18), transparent 60%), ${wheelBackground}` }}><div className="absolute inset-2 rounded-full border border-white/65 shadow-[inset_0_0_32px_rgba(75,43,13,.12)] sm:inset-3" />{segments.map((segment, index) => {
                    const segmentAngle = 360 / segments.length;
                    return <div key={`divider-${segment.label}`} className="absolute left-1/2 top-1/2 z-[1] h-1/2 w-px origin-bottom bg-white/45" style={{ transform: `translate(-50%, -100%) rotate(${index * segmentAngle}deg)` }} />;
                })}{segments.map((segment, index) => {
                    const segmentAngle = 360 / segments.length;
                    const angleDegrees = index * segmentAngle + segmentAngle / 2;
                    const angle = (angleDegrees * Math.PI) / 180;
                    const labelRotation = angleDegrees - 90;
                    return <div data-wheel-prize key={segment.label} className="absolute z-10 flex w-[31%] items-center justify-center text-center text-[clamp(9px,2.7vw,13px)] font-extrabold uppercase leading-[1.08] tracking-[.025em] text-[#262422] [text-shadow:0_1px_0_rgba(255,255,255,.55)] sm:text-[clamp(13px,1.65vw,17px)]" style={{ left: `${50 + Math.sin(angle) * 32.5}%`, top: `${50 - Math.cos(angle) * 32.5}%`, transform: `translate(-50%, -50%) rotate(${labelRotation}deg)` }}><span>{segment.label}</span></div>;
                })}</div><button onClick={spin} disabled={spinning || (!data?.campaign.adminTestMode && (!data?.campaign.active || !data?.account.availableSpins))} className="absolute left-1/2 top-1/2 z-20 grid h-[78px] w-[78px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-[5px] border-[#e7dcc9] bg-[linear-gradient(145deg,#5c493a,#2c2926)] px-2 text-center text-[11px] font-black uppercase leading-tight text-white shadow-[0_10px_26px_rgba(0,0,0,.35),inset_0_1px_3px_rgba(255,255,255,.18),0_0_0_3px_rgba(80,64,49,.35)] transition hover:scale-105 disabled:cursor-not-allowed disabled:grayscale sm:h-28 sm:w-28 sm:border-[6px] sm:text-base"><span>{spinning ? 'ĐANG QUAY' : data?.campaign.spinButtonText}</span></button></div>{!data?.campaign.adminTestMode && <p className="relative mt-6 text-center text-sm font-semibold text-[#d7d0c5] sm:mt-8"><Smile className="mr-1 inline text-[#dcc69e]" size={19}/> Bạn còn <strong className="text-xl text-[#dcc69e]">{data?.account.availableSpins || 0}</strong> lượt vui</p>}</div>
                <div className="space-y-4 sm:space-y-5"><div className="grid grid-cols-2 gap-3 sm:gap-4"><div className="min-w-0 rounded-[22px] border-2 border-[#ffe19a] bg-[#fff9dd] p-4 shadow-[0_8px_0_#f4da96] sm:rounded-3xl sm:p-5"><Coins className="text-[#e79d1d]"/><p className="mt-3 text-xs leading-5 text-[#7c6a46] sm:mt-4 sm:text-sm">{data?.campaign.totalWinningsLabel}</p><p className="mt-1 break-words text-xl font-black text-[#5c4931] sm:text-2xl">{money(data?.account.lifetimeWinnings || 0)}</p></div><div className="min-w-0 rounded-[22px] border-2 border-[#aee9d5] bg-[#eafff7] p-4 shadow-[0_8px_0_#b8ead9] sm:rounded-3xl sm:p-5"><WalletCards className="text-[#21a47b]"/><p className="mt-3 text-xs leading-5 text-[#34846b] sm:mt-4 sm:text-sm">{data?.campaign.balanceLabel}</p><p className="mt-1 break-words text-xl font-black text-[#16765b] sm:text-2xl">{money(data?.account.prizeBalance || 0)}</p>{Boolean(data?.account.pendingWithdrawal) && <p className="mt-1 text-[11px] leading-4 text-[#34846b] sm:text-xs">Khả dụng: {money(data?.account.availablePrizeBalance || 0)}<br/>Chờ duyệt: {money(data?.account.pendingWithdrawal || 0)}</p>}</div></div><div className="rounded-[26px] border-2 border-[#badff4] bg-white p-5 shadow-[0_10px_0_#dceff8] sm:rounded-3xl sm:p-6"><div className="flex items-center justify-between gap-3"><div><p className="text-[11px] font-bold uppercase tracking-widest text-[#3888ad] sm:text-xs">{data?.campaign.topUpTitle}</p><h2 className="mt-1 text-lg font-black text-[#28415f] sm:text-xl">{money(data?.campaign.minimumTopUp || 0)} = {data?.campaign.spinsPerTopUpUnit} lượt</h2></div><Banknote className="shrink-0 text-[#4fa8c8]" size={30}/></div><div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">{data?.campaign.topUpOptions.map(amount => <button key={amount} onClick={() => setTopUpAmount(amount)} className={`rounded-xl border-2 px-2 py-3 text-sm font-bold transition ${topUpAmount === amount ? 'border-[#4fa8c8] bg-[#5bb8d3] text-white shadow-[0_4px_0_#368ba9]' : 'border-[#cfe9f5] bg-[#f5fcff] text-[#35657b] hover:border-[#7cc7df]'}`}>{amount >= 1000 && amount % 1000 === 0 ? `${amount / 1000}K` : money(amount)}</button>)}</div><button onClick={createTopUp} disabled={creatingTopUp || !data?.campaign.active} className="mt-4 w-full rounded-xl bg-[linear-gradient(135deg,#4fb3d2,#36a3c6)] px-4 py-3.5 text-sm font-bold text-white shadow-[0_5px_0_#2e829e] transition hover:-translate-y-0.5 disabled:opacity-50 sm:px-5 sm:text-base">{creatingTopUp ? 'Đang tạo mã QR...' : `Nạp ${money(topUpAmount)} · Nhận ${(topUpAmount / (data?.campaign.minimumTopUp || 1)) * (data?.campaign.spinsPerTopUpUnit || 0)} lượt`}</button></div><button onClick={() => setWithdrawOpen(true)} className="group flex w-full items-center justify-between rounded-[26px] border-2 border-[#ffd5cf] bg-[#fff8f6] p-4 text-left shadow-[0_8px_0_#f8ddd8] transition hover:-translate-y-0.5 hover:border-[#ff9d8f] sm:rounded-3xl sm:p-5"><span className="flex min-w-0 items-center gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#ffe9e5] text-[#df7164]"><ArrowDownToLine/></span><span className="min-w-0"><strong className="block truncate text-[#5b3d43]">{data?.campaign.withdrawalTitle}</strong><small className="text-xs text-[#8e7377] sm:text-sm">Tối thiểu {money(data?.campaign.minimumWithdrawal || 0)}/lần</small></span></span><span className="text-xl text-[#df7164] transition group-hover:translate-x-1">›</span></button></div>
            </div>
            <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-6 lg:grid-cols-2">
                <section className="relative overflow-hidden rounded-[26px] border-2 border-[#bdebdc] bg-white p-5 shadow-[0_9px_0_#d8f2e9] sm:rounded-3xl sm:p-6">
                    <CookieFriendIllustration className="pointer-events-none absolute -bottom-8 -right-6 w-28 rotate-12 opacity-[.14]"/>
                    <h2 className="relative flex items-center gap-2 text-lg font-black text-[#294b48]"><ShieldCheck className="shrink-0 text-[#2baa82]"/> {data?.campaign.termsTitle}</h2>
                    <ul className="relative mt-4 space-y-3 text-sm leading-6 text-[#58716e]">{data?.campaign.terms.map((term, index) => <li key={`${term}-${index}`} className="flex gap-2.5"><CheckCircle2 className="mt-1 shrink-0 text-[#37be91]" size={15}/><span>{term}</span></li>)}</ul>
                </section>
                <section className="relative overflow-hidden rounded-[26px] border-2 border-[#f9d9a0] bg-white p-5 shadow-[0_9px_0_#f6e8c7] sm:rounded-3xl sm:p-6">
                    <CupcakeIllustration className="pointer-events-none absolute -bottom-7 -right-4 w-28 -rotate-6 opacity-[.13]"/>
                    <div className="relative flex flex-wrap items-center justify-between gap-2"><h2 className="flex items-center gap-2 text-lg font-black text-[#4d495f]"><History className="shrink-0 text-[#ef9f37]"/> {data.campaign.adminTestMode ? 'Toàn bộ hoạt động' : data.campaign.historyTitle}</h2><span className="rounded-full bg-[#fff6d8] px-3 py-1 text-[11px] font-bold text-[#8c671e]">{data.campaign.adminTestMode ? 'Lưu đầy đủ cho Admin' : 'Tự làm mới mỗi giờ'}</span></div>
                    <div className="relative mt-4 max-h-64 space-y-2 overflow-auto pr-1">{!visibleScopeSpinHistory.length ? <p className="rounded-2xl bg-[#fffaf0] p-5 text-center text-sm text-slate-500">{data.campaign.adminTestMode ? 'Chưa có lượt nào.' : 'Chưa có lượt trong giờ này.'}</p> : visibleSpinHistory.map(item => <div key={item._id || item.requestId} className="flex flex-col gap-2 rounded-2xl bg-[#fffaf0] px-4 py-3 text-sm min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between"><span className="text-xs text-slate-500 sm:text-sm">{item.isTest && <b className="mr-2 rounded bg-blue-100 px-2 py-1 text-[10px] text-blue-700">TEST</b>}{item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : ''}</span><strong className={item.isTest ? 'text-blue-700' : item.prizeValue ? 'text-emerald-600' : 'text-slate-500'}>{item.prizeValue ? `${item.isTest ? '' : '+'}${money(item.prizeValue)}` : 'Chúc may mắn'}</strong></div>)}</div>
                    <ProgressiveListControls total={visibleScopeSpinHistory.length} visible={visibleHistoryCount} step={5} onVisibleChange={setVisibleHistoryCount} className="relative mt-3 px-0 pb-0"/>
                </section>
                <section className="relative overflow-hidden rounded-[26px] border-2 border-[#c8e6f6] bg-white p-5 shadow-[0_9px_0_#dcedf6] sm:rounded-3xl sm:p-6 lg:col-span-2">
                    <RainbowCloudIllustration className="pointer-events-none absolute -bottom-4 -right-6 hidden w-44 opacity-[.13] sm:block"/>
                    <div className="relative flex flex-wrap items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-lg font-black text-[#304c67]"><WalletCards className="shrink-0 text-[#4aa9cb]"/> Hoạt động tài khoản</h2><span className="rounded-full bg-[#eaf8ff] px-3 py-1 text-[11px] font-bold text-[#397b98]">{data.campaign.adminTestMode ? 'Hiển thị toàn bộ lịch sử' : 'Chỉ hiển thị trong giờ hiện tại'}</span></div>
                    <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl bg-[#f2f8fb] p-1.5" role="tablist" aria-label="Chọn loại giao dịch">
                        <button type="button" role="tab" aria-selected={moneyTab === 'top-up'} onClick={() => setMoneyTab('top-up')} className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-black transition ${moneyTab === 'top-up' ? 'bg-white text-[#2185aa] shadow-sm' : 'text-slate-500 hover:text-[#2185aa]'}`}><ArrowUpFromLine size={17}/> Nạp tiền</button>
                        <button type="button" role="tab" aria-selected={moneyTab === 'withdrawal'} onClick={() => setMoneyTab('withdrawal')} className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-black transition ${moneyTab === 'withdrawal' ? 'bg-white text-[#db6e62] shadow-sm' : 'text-slate-500 hover:text-[#db6e62]'}`}><ArrowDownToLine size={17}/> Rút tiền</button>
                    </div>
                    <div className="mt-4 space-y-3 md:hidden">{selectedMoneyHistory.length ? visibleMoneyHistory.map(item => <article key={`mobile-${item.type}-${item.id}`} className="rounded-2xl border border-[#dcecf4] bg-[#fbfeff] p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-black text-[#304c67]">{item.type}</p><p className="mt-1 text-xs text-slate-500">{new Date(item.createdAt).toLocaleString('vi-VN')}</p></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${item.status === 'success' ? 'bg-emerald-100 text-emerald-700' : item.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{item.status === 'success' ? 'Thành công' : item.status === 'rejected' ? 'Từ chối' : 'Đang xử lý'}</span></div><div className="mt-4 flex items-end justify-between gap-3 border-t border-[#dcecf4] pt-3"><div className="min-w-0"><p className="text-[11px] uppercase tracking-wide text-slate-400">Nội dung</p><code className="mt-1 block truncate text-xs font-bold text-slate-700">{item.reference}</code>{item.detail && <p className={`mt-1 text-xs ${item.status === 'rejected' ? 'text-red-600' : 'text-slate-500'}`}>{item.detail}</p>}</div><strong className="shrink-0 text-base text-[#315f77]">{money(item.amount)}</strong></div></article>) : <p className="rounded-2xl bg-[#f6fbfd] p-5 text-center text-sm text-slate-500">Chưa có giao dịch {moneyTab === 'top-up' ? 'nạp tiền' : 'rút tiền'} trong giờ này.</p>}</div>
                    <div className="mt-4 hidden overflow-x-auto md:block"><table className="w-full min-w-[720px] text-left text-sm"><thead><tr className="border-b text-slate-500"><th className="py-3 pr-4">Thời gian</th><th className="py-3 pr-4">Giao dịch</th><th className="py-3 pr-4">Số tiền</th><th className="py-3 pr-4">Nội dung</th><th className="py-3">Trạng thái</th></tr></thead><tbody>{selectedMoneyHistory.length ? visibleMoneyHistory.map(item => <tr key={`${item.type}-${item.id}`} className="border-b border-[#e0edf3]"><td className="py-3 pr-4 text-slate-500">{new Date(item.createdAt).toLocaleString('vi-VN')}</td><td className="py-3 pr-4 font-bold">{item.type}</td><td className="py-3 pr-4 font-black">{money(item.amount)}</td><td className="py-3 pr-4"><code className="font-bold">{item.reference}</code>{item.detail && <p className={`mt-1 text-xs ${item.status === 'rejected' ? 'text-red-600' : 'text-slate-500'}`}>{item.detail}</p>}</td><td className="py-3"><span className={`rounded-full px-3 py-1 text-xs font-bold ${item.status === 'success' ? 'bg-emerald-100 text-emerald-700' : item.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{item.status === 'success' ? 'Thành công' : item.status === 'rejected' ? 'Từ chối' : 'Đang xử lý'}</span></td></tr>) : <tr><td colSpan={5} className="py-6 text-center text-slate-500">Chưa có giao dịch {moneyTab === 'top-up' ? 'nạp tiền' : 'rút tiền'} trong giờ này.</td></tr>}</tbody></table></div>
                    <ProgressiveListControls total={selectedMoneyHistory.length} visible={visibleMoneyCount} step={5} onVisibleChange={setVisibleMoneyCount} className="mt-3 px-0 pb-0"/>
                </section>
            </div>
        </div></section>
        {topUp && <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/65 p-0 backdrop-blur-sm sm:grid sm:place-items-center sm:p-4"><div className="max-h-[94dvh] w-full max-w-2xl overflow-auto rounded-t-[28px] bg-white p-5 shadow-2xl sm:max-h-[92vh] sm:rounded-3xl sm:p-7"><div className="mb-5 flex items-start justify-between gap-4"><div><p className="text-[11px] font-bold uppercase tracking-widest text-[#9c7043] sm:text-xs">Nạp lượt vòng quay</p><h2 className="mt-1 text-xl font-black sm:text-2xl">Quét mã để thanh toán</h2></div><button aria-label="Đóng" onClick={() => setTopUp(null)} className="shrink-0 rounded-full bg-slate-100 p-2"><X/></button></div>{topUp.status === 'paid' ? <div className="rounded-2xl bg-emerald-50 p-6 text-center text-emerald-800 sm:p-8"><CheckCircle2 className="mx-auto mb-3" size={52}/><h3 className="text-xl font-black">Thanh toán thành công</h3><p className="mt-2">{topUp.spins} lượt chơi đã được tự động cộng vào tài khoản.</p></div> : <><BankInfoDisplay amount={topUp.amount} description={topUp.paymentRef}/><div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-blue-50 p-3 text-center text-xs font-semibold text-blue-700 sm:text-sm"><Clock3 className="shrink-0" size={17}/> Tự động xác nhận ngay khi ACB ghi nhận giao dịch</div></>}</div></div>}
        {withdrawOpen && <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/65 p-0 backdrop-blur-sm sm:grid sm:place-items-center sm:p-4"><div className="max-h-[94dvh] w-full max-w-lg overflow-auto rounded-t-[28px] bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-6"><div className="flex items-center justify-between gap-4"><h2 className="text-xl font-black sm:text-2xl">{data?.campaign.withdrawalTitle}</h2><button aria-label="Đóng" onClick={() => setWithdrawOpen(false)} className="shrink-0 rounded-full bg-slate-100 p-2"><X/></button></div><div className="mt-4 rounded-2xl bg-emerald-50 p-4"><p className="text-sm text-emerald-800">Số dư khả dụng</p><strong className="mt-1 block text-2xl text-emerald-700">{money(data?.account.availablePrizeBalance || 0)}</strong></div><p className="mt-3 text-xs leading-5 text-slate-500">Tiền chỉ bị trừ khỏi tài khoản sau khi Admin duyệt lệnh rút thành công. Nội dung đối chiếu sẽ được hệ thống tự tạo khi gửi lệnh.</p><div className="mt-5 space-y-4"><label className="block text-sm font-semibold">Số tiền<input type="number" min={data?.campaign.minimumWithdrawal || 100000} step={1000} value={withdrawForm.amount} onChange={event => setWithdrawForm({...withdrawForm, amount: Number(event.target.value)})} className="mt-1 w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-[#9c7043] focus:ring-2 focus:ring-[#9c7043]/15"/></label><div className="block text-sm font-semibold">Ngân hàng<BankCombobox value={withdrawForm.bankName} onChange={bankName => setWithdrawForm(current => ({ ...current, bankName }))} disabled={submittingWithdrawal}/></div><label className="block text-sm font-semibold">Số tài khoản<input inputMode="numeric" value={withdrawForm.accountNumber} onChange={event => setWithdrawForm({...withdrawForm, accountNumber: event.target.value.replace(/\D/g, '')})} className="mt-1 w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-[#9c7043] focus:ring-2 focus:ring-[#9c7043]/15"/></label><label className="block text-sm font-semibold">Họ tên chủ tài khoản<input value={withdrawForm.accountName} onChange={event => setWithdrawForm({...withdrawForm, accountName: event.target.value})} className="mt-1 w-full rounded-xl border border-slate-300 p-3 uppercase outline-none focus:border-[#9c7043] focus:ring-2 focus:ring-[#9c7043]/15"/></label><button onClick={requestWithdrawal} disabled={submittingWithdrawal || !withdrawForm.bankName || withdrawForm.accountNumber.length < 6 || !withdrawForm.accountName.trim()} className="w-full rounded-xl bg-[#2c2119] px-5 py-3.5 font-bold text-white shadow-lg transition hover:bg-[#9c7043] disabled:cursor-not-allowed disabled:opacity-50">{submittingWithdrawal ? 'Đang gửi...' : 'Gửi lệnh rút tiền'}</button></div></div></div>}
        {spinResult && <SpinResultCelebration prize={spinResult.prize} isTest={spinResult.isTest} onClose={() => setSpinResult(null)} />}
        <Footer />
    </main>;
}
