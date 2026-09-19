'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';
import { useAuth } from '@/context/AuthContext';

const labels = ['Quà 1', 'Voucher 1.000đ', 'Quà 3', 'Voucher 5.000đ', 'Quà 5'];

interface SpinHistoryItem { _id?: string; requestId: string; prizeValue: number; createdAt?: string }
interface WheelData {
    campaign: { name: string; active: boolean; qualifyingOrderMinimum: number };
    account: { availableSpins: number; lifetimeVoucherWinnings: number };
    history: SpinHistoryItem[];
}

export default function LuckyWheelPage() {
    const { user, loading: authLoading } = useAuth();
    const [data, setData] = useState<WheelData | null>(null);
    const [loading, setLoading] = useState(true);
    const [spinning, setSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [message, setMessage] = useState('');

    const load = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        const response = await fetch('/api/lucky-wheel', { cache: 'no-store' });
        if (response.ok) setData(await response.json());
        setLoading(false);
    }, [user]);

    // Loading is asynchronous; the state changes happen after the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { void load(); }, [load]);

    const spin = async () => {
        if (spinning || !data?.campaign?.active || data?.account?.availableSpins < 1) return;
        setSpinning(true);
        setMessage('');
        const requestId = crypto.randomUUID().replaceAll('-', '');
        const response = await fetch('/api/lucky-wheel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requestId }),
        });
        const outcome = await response.json();
        if (!response.ok) {
            setMessage(outcome.message || 'Không thể quay lúc này.');
            setSpinning(false);
            return;
        }
        const prize = Number(outcome.spin.prizeValue || 0);
        const selected = (Number(outcome.spin.sequence) - 1) % labels.length;
        const segmentAngle = 360 / labels.length;
        setRotation(previous => previous + 1800 + (360 - (selected * segmentAngle + segmentAngle / 2)));
        window.setTimeout(() => {
            setData(previous => previous ? ({ ...previous, account: outcome.account, history: [outcome.spin, ...(previous.history || [])].slice(0, 20) }) : previous);
            setMessage(prize ? `Bạn đã mở voucher ${prize.toLocaleString('vi-VN')}đ.` : 'Ô quà này không kèm voucher. Hãy mở ô tiếp theo!');
            setSpinning(false);
        }, 3200);
    };

    if (authLoading || (user && loading)) return <main><Header /><Navbar /><div className="min-h-[55vh] grid place-items-center">Đang tải vòng quay...</div><Footer /></main>;
    if (!user) return (
        <main><Header /><Navbar /><Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Vòng quà tri ân' }]} />
            <section className="mx-auto max-w-xl px-5 py-20 text-center"><h1 className="text-3xl font-bold">Vòng quà tri ân cố định</h1><p className="mt-4 text-slate-600">Bạn cần đăng ký thành viên hoặc đăng nhập để nhận và mở các ô quà.</p><Link href="/login" className="mt-7 inline-block rounded-xl bg-amber-500 px-6 py-3 font-bold text-slate-900">Đăng nhập ngay</Link></section><Footer /></main>
    );

    return (
        <main className="bg-amber-50/40"><Header /><Navbar /><Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Vòng quà tri ân' }]} />
            <section className="mx-auto max-w-6xl px-4 py-10">
                <div className="text-center"><p className="font-semibold uppercase tracking-widest text-amber-700">Quyền lợi cố định · Không may rủi</p><h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">{data?.campaign?.name}</h1><p className="mx-auto mt-3 max-w-2xl text-slate-600">Mỗi đơn hàng thật đã hoàn tất từ {Number(data?.campaign?.qualifyingOrderMinimum || 20000).toLocaleString('vi-VN')}đ nhận đúng 5 ô quà theo thứ tự đã công bố. Voucher chỉ dùng mua hàng, không quy đổi thành tiền mặt.</p></div>
                {!data?.campaign?.active && <div className="mx-auto mt-7 max-w-2xl rounded-xl border border-amber-300 bg-amber-100 p-4 text-center font-medium text-amber-900">Chương trình hiện chưa mở. Bạn có thể xem thể lệ và quay lại sau.</div>}
                <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
                    <div className="rounded-3xl bg-slate-900 p-6 text-center shadow-xl sm:p-10">
                        <div className="relative mx-auto aspect-square max-w-[430px]">
                            <div className="absolute left-1/2 top-[-12px] z-10 -translate-x-1/2 text-4xl text-white">▼</div>
                            <div className="h-full w-full rounded-full border-[10px] border-amber-300 shadow-2xl transition-transform duration-[3000ms] ease-out" style={{ transform: `rotate(${rotation}deg)`, background: 'conic-gradient(#f59e0b 0deg 72deg,#fff7ed 72deg 144deg,#fb7185 144deg 216deg,#fef3c7 216deg 288deg,#f59e0b 288deg 360deg)' }}>
                                {labels.map((label, index) => <span key={index} className="absolute left-1/2 top-1/2 w-[42%] origin-left text-left text-xs font-extrabold text-slate-900 sm:text-sm" style={{ transform: `rotate(${index * 72 + 36}deg) translateX(18%)` }}>{label}</span>)}
                            </div>
                            <button onClick={spin} disabled={spinning || !data?.campaign?.active || data?.account?.availableSpins < 1} className="absolute left-1/2 top-1/2 z-20 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-amber-500 text-lg font-black text-slate-900 shadow-lg disabled:cursor-not-allowed disabled:bg-slate-400">{spinning ? 'ĐANG MỞ' : 'MỞ QUÀ'}</button>
                        </div>
                        {message && <p className="mt-6 rounded-xl bg-white/10 p-4 font-bold text-white">{message}</p>}
                    </div>
                    <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-4"><div className="rounded-2xl border bg-white p-5"><p className="text-sm text-slate-500">Lượt còn lại</p><p className="mt-1 text-3xl font-black text-amber-600">{data?.account?.availableSpins || 0}</p></div><div className="rounded-2xl border bg-white p-5"><p className="text-sm text-slate-500">Tổng voucher đã trúng</p><p className="mt-1 text-2xl font-black text-emerald-600">{Number(data?.account?.lifetimeVoucherWinnings || 0).toLocaleString('vi-VN')}đ</p></div></div>
                        <div className="rounded-2xl border bg-white p-6"><h2 className="text-lg font-bold">Thể lệ minh bạch</h2><ul className="mt-3 space-y-2 text-sm text-slate-600"><li>• Một đơn hàng sản phẩm hoàn tất từ 20.000đ nhận đúng 5 ô quà, mỗi đơn chỉ cấp một lần.</li><li>• Thứ tự cố định: không voucher – 1.000đ – không voucher – 5.000đ – không voucher. Không có quay ngẫu nhiên.</li><li>• Voucher có hạn 30 ngày, không chuyển nhượng, không rút tiền và không dùng để mua lượt.</li><li>• Mỗi mốc doanh thu 1 tỷ đồng trao theo bảng xếp hạng mua hàng: 10 voucher 100.000đ và 5 voucher 50.000đ.</li></ul></div>
                        <div className="rounded-2xl border bg-white p-6"><h2 className="font-bold">Lịch sử mở quà</h2><div className="mt-3 max-h-64 space-y-2 overflow-auto">{!data?.history?.length ? <p className="text-sm text-slate-500">Chưa mở ô quà nào.</p> : data.history.map(item => <div key={item._id || item.requestId} className="flex justify-between rounded-lg bg-slate-50 p-3 text-sm"><span>{item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : ''}</span><strong className={item.prizeValue ? 'text-emerald-600' : 'text-slate-500'}>{item.prizeValue ? `Voucher ${Number(item.prizeValue).toLocaleString('vi-VN')}đ` : 'Không kèm voucher'}</strong></div>)}</div></div>
                    </div>
                </div>
            </section><Footer />
        </main>
    );
}
