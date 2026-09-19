'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Building2, Check, ChevronsUpDown, Search } from 'lucide-react';
import { findVietnamBank, searchVietnamBanks, VIETNAM_BANKS, type VietnamBank } from '@/lib/vietnam-banks';

interface BankComboboxProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export default function BankCombobox({ value, onChange, disabled = false }: BankComboboxProps) {
    const selectedBank = findVietnamBank(value);
    const [query, setQuery] = useState(selectedBank?.shortName || value);
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const rootRef = useRef<HTMLDivElement>(null);
    const results = useMemo(() => searchVietnamBanks(query, 61), [query]);

    useEffect(() => {
        const close = (event: MouseEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) {
                setOpen(false);
                setQuery(selectedBank?.shortName || value);
            }
        };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, [selectedBank?.shortName, value]);

    const selectBank = (bank: VietnamBank) => {
        onChange(bank.shortName);
        setQuery(bank.shortName);
        setOpen(false);
        setActiveIndex(0);
    };

    return <div ref={rootRef} className="relative mt-1">
        <div className={`flex items-center rounded-xl border bg-white transition focus-within:border-[#9c7043] focus-within:ring-2 focus-within:ring-[#9c7043]/15 ${open ? 'border-[#9c7043]' : 'border-slate-300'}`}>
            <Search className="ml-3 shrink-0 text-slate-400" size={18}/>
            <input
                role="combobox"
                aria-label="Tìm và chọn ngân hàng"
                aria-expanded={open}
                aria-controls="withdrawal-bank-options"
                aria-autocomplete="list"
                autoComplete="off"
                disabled={disabled}
                value={query}
                onFocus={() => setOpen(true)}
                onChange={event => {
                    setQuery(event.target.value);
                    onChange('');
                    setActiveIndex(0);
                    setOpen(true);
                }}
                onKeyDown={event => {
                    if (event.key === 'ArrowDown') {
                        event.preventDefault();
                        setOpen(true);
                        setActiveIndex(index => Math.min(index + 1, results.length - 1));
                    } else if (event.key === 'ArrowUp') {
                        event.preventDefault();
                        setActiveIndex(index => Math.max(index - 1, 0));
                    } else if (event.key === 'Enter' && open && results[activeIndex]) {
                        event.preventDefault();
                        selectBank(results[activeIndex]);
                    } else if (event.key === 'Escape') {
                        setOpen(false);
                        setQuery(selectedBank?.shortName || value);
                    }
                }}
                className="min-w-0 flex-1 bg-transparent px-3 py-3 outline-none disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="Gõ tên hoặc mã ngân hàng..."
            />
            <button type="button" aria-label="Mở danh sách ngân hàng" disabled={disabled} onClick={() => setOpen(current => !current)} className="mr-2 rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"><ChevronsUpDown size={18}/></button>
        </div>
        {selectedBank && <p className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-700"><Check size={13}/> Đã chọn {selectedBank.name}</p>}
        {open && <div id="withdrawal-bank-options" role="listbox" className="absolute z-[120] mt-2 max-h-64 w-full overflow-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-[0_18px_50px_rgba(15,23,42,.18)]">
            <p className="sticky top-0 z-10 bg-white px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">{results.length} / {VIETNAM_BANKS.length} ngân hàng</p>
            {results.length ? results.map((bank, index) => <button
                type="button"
                role="option"
                aria-selected={bank.shortName === value}
                key={`${bank.code}-${bank.bin}`}
                onMouseDown={event => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectBank(bank)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${index === activeIndex ? 'bg-[#fff3dc]' : 'hover:bg-slate-50'}`}
            >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-[#9c7043] shadow-sm"><Building2 size={18}/></span>
                <span className="min-w-0 flex-1"><strong className="block text-sm text-slate-900">{bank.shortName} <span className="font-medium text-slate-400">· {bank.code}</span></strong><span className="block truncate text-xs text-slate-500">{bank.name}</span></span>
                {bank.shortName === value && <Check className="shrink-0 text-emerald-600" size={18}/>} 
            </button>) : <div className="px-4 py-7 text-center"><Building2 className="mx-auto text-slate-300"/><p className="mt-2 text-sm font-semibold text-slate-600">Không tìm thấy ngân hàng</p><p className="mt-1 text-xs text-slate-400">Thử tên viết tắt như ACB, VCB, MB…</p></div>}
        </div>}
    </div>;
}
