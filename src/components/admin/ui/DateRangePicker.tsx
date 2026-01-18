import React, { useState } from 'react';
import { Calendar, X, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

interface DateRange {
    startDate: Date | null;
    endDate: Date | null;
}

 interface DateRangePickerProps {
    value?: DateRange;
    onChange: (range: DateRange) => void;
    presets?: Array<{ label: string; value: () => DateRange }>;
    onClose?: () => void;
    isOpen?: boolean;
    position?: 'left' | 'right';
}

export const DateRangePicker = ({
    value,
    onChange,
    onClose,
    isOpen = false,
    position = 'left',
}: DateRangePickerProps) => {
    const [currentViewDate, setCurrentViewDate] = useState<Date>(new Date());
    const [view, setView] = useState<'start' | 'end'>('start');

    const defaultPresets = [
        {
            label: 'Hôm nay',
            value: () => {
                const today = new Date();
                return { startDate: today, endDate: today };
            },
        },
        {
            label: 'Hôm qua',
            value: () => {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                return { startDate: yesterday, endDate: yesterday };
            },
        },
        {
            label: '7 ngày qua',
            value: () => {
                const end = new Date();
                const start = new Date();
                start.setDate(start.getDate() - 7);
                return { startDate: start, endDate: end };
            },
        },
        {
            label: '30 ngày qua',
            value: () => {
                const end = new Date();
                const start = new Date();
                start.setDate(start.getDate() - 30);
                return { startDate: start, endDate: end };
            },
        },
        {
            label: 'Tháng này',
            value: () => {
                const now = new Date();
                const start = new Date(now.getFullYear(), now.getMonth(), 1);
                const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                return { startDate: start, endDate: end };
            },
        },
        {
            label: 'Tháng trước',
            value: () => {
                const now = new Date();
                const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const end = new Date(now.getFullYear(), now.getMonth(), 0);
                return { startDate: start, endDate: end };
            },
        },
        {
            label: 'Năm nay',
            value: () => {
                const now = new Date();
                const start = new Date(now.getFullYear(), 0, 1);
                const end = new Date(now.getFullYear() + 1, 0, 0);
                return { startDate: start, endDate: end };
            },
        },
    ];

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const lastDayOfMonth = new Date(year, month + 1, 0);
        return lastDayOfMonth.getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        return firstDay.getDay();
    };

    const handleDateClick = (date: Date) => {
        const selectedDate = new Date(date);
        selectedDate.setHours(0, 0, 0, 0);

        if (view === 'start') {
            const endDate = value?.endDate || new Date();
            if (selectedDate > endDate) {
                onChange({ startDate: selectedDate, endDate: selectedDate });
            } else {
                onChange({ startDate: selectedDate, endDate: value?.endDate || null });
            }
            setView('end');
        } else {
            const startDate = value?.startDate || new Date();
            if (selectedDate < startDate) {
                onChange({ startDate: selectedDate, endDate: selectedDate });
            } else {
                onChange({ startDate: value?.startDate || null, endDate: selectedDate });
            }
        }
    };

    const handlePresetClick = (preset: { label: string; value: () => DateRange }) => {
        const range = preset.value();
        onChange(range);
        onClose?.();
    };

    const handleReset = () => {
        onChange({ startDate: null, endDate: null });
        onClose?.();
    };

    const handlePreviousMonth = () => {
        setCurrentViewDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() - 1);
            return newDate;
        });
    };

    const handleNextMonth = () => {
        setCurrentViewDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + 1);
            return newDate;
        });
    };

    const formatDisplayDate = (date: Date | null) => {
        if (!date) return 'Chưa chọn';
        return new Date(date).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentViewDate);
        const firstDayOfWeek = getFirstDayOfMonth(currentViewDate);
        const calendarDays = [];

        for (let i = 0; i < firstDayOfWeek; i++) {
            calendarDays.push({ day: null, date: null });
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentViewDate.getFullYear(), currentViewDate.getMonth(), day);
            calendarDays.push({ day, date });
        }

        const monthNames = [
            'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
            'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
        ];

        return (
            <div className="bg-white rounded-xl border border-slate-200 shadow-lg">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50 rounded-t-xl">
                    <button
                        onClick={handlePreviousMonth}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <ChevronLeft size={18} className="text-slate-600" />
                    </button>

                    <span className="font-semibold text-slate-700">
                        {monthNames[currentViewDate.getMonth()]} {currentViewDate.getFullYear()}
                    </span>

                    <button
                        onClick={handleNextMonth}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <ChevronRight size={18} className="text-slate-600" />
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-0">
                    {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
                        <div
                            key={day}
                            className="text-center py-2 text-xs font-semibold text-slate-500 bg-slate-50"
                        >
                            {day}
                        </div>
                    ))}

                    {calendarDays.map((item, index) => {
                        const isSelected = item.date && (
                            (view === 'start' && value?.startDate &&
                                new Date(item.date).toDateString() === new Date(value.startDate).toDateString()) ||
                            (view === 'end' && value?.endDate &&
                                new Date(item.date).toDateString() === new Date(value.endDate).toDateString())
                        );

                        const isInRange = item.date && value?.startDate && value?.endDate &&
                            new Date(item.date) >= new Date(value.startDate) &&
                            new Date(item.date) <= new Date(value.endDate);

                        const isToday = item.date &&
                            new Date(item.date).toDateString() === new Date().toDateString();

                        return (
                            <button
                                key={index}
                                onClick={() => item.date && handleDateClick(item.date)}
                                disabled={!item.date}
                                className={`
                                    h-10 flex items-center justify-center text-sm rounded-lg transition-all
                                    ${isSelected
                                        ? 'bg-brand text-white font-semibold'
                                        : isInRange
                                            ? 'bg-brand-light/30 text-brand'
                                            : isToday
                                                ? 'bg-brand-light/20 text-brand font-semibold'
                                                : 'hover:bg-slate-100 text-slate-700'
                                    }
                                    ${!item.date ? 'cursor-default' : 'cursor-pointer'}
                                `}
                            >
                                {item.day}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="relative z-50">
            <div className={`absolute top-full mt-2 ${position === 'right' ? 'right-0' : 'left-0'} w-80`}>
                <div className="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-200">
                        <div className="flex items-center justify-between gap-2 mb-3">
                            <div className="flex-1">
                                <label className="block text-xs font-medium text-slate-600 mb-1">
                                    Từ ngày
                                </label>
                                <div className="text-sm font-semibold text-brand">
                                    {formatDisplayDate(value?.startDate || null)}
                                </div>
                            </div>

                            <Calendar
                                size={16}
                                className="text-slate-400 mt-4 cursor-pointer"
                                onClick={() => setView('start')}
                            />
                        </div>

                        <div className="flex items-center justify-between gap-2">
                            <div className="flex-1">
                                <label className="block text-xs font-medium text-slate-600 mb-1">
                                    Đến ngày
                                </label>
                                <div className="text-sm font-semibold text-brand">
                                    {formatDisplayDate(value?.endDate || null)}
                                </div>
                            </div>

                            <Calendar
                                size={16}
                                className="text-slate-400 mt-4 cursor-pointer"
                                onClick={() => setView('end')}
                            />
                        </div>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {renderCalendar()}
                    </div>

                    <div className="p-3 bg-slate-50 border-t border-slate-200">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                            {defaultPresets.slice(0, 4).map((preset) => (
                                <Button
                                    key={preset.label}
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handlePresetClick(preset)}
                                    className="text-xs"
                                >
                                    {preset.label}
                                </Button>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {defaultPresets.slice(4).map((preset) => (
                                <Button
                                    key={preset.label}
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handlePresetClick(preset)}
                                    className="text-xs"
                                >
                                    {preset.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-between p-3 border-t border-slate-200">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleReset}
                        >
                            Đặt lại
                        </Button>

                        <button
                            onClick={onClose}
                            className="flex items-center gap-1 text-slate-600 hover:text-slate-800 font-medium text-sm transition-colors"
                        >
                            <X size={16} />
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
