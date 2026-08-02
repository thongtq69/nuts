export interface PayrollInputs {
    baseSalary: number;
    kpiTarget: number;
    commissionRate: number;
    revenue: number;
}
export interface PayrollAmounts extends PayrollInputs {
    achievementPercentage: number;
    kpiShortfallPercentage: number;
    earnedBaseSalary: number;
    excessRevenue: number;
    commissionAmount: number;
    totalSalary: number;
}

function nonNegative(value: number): number {
    const normalized = Number(value);
    return Number.isFinite(normalized) ? Math.max(0, normalized) : 0;
}

export function calculatePayrollAmounts(input: PayrollInputs): PayrollAmounts {
    const baseSalary = nonNegative(input.baseSalary);
    const kpiTarget = nonNegative(input.kpiTarget);
    const commissionRate = nonNegative(input.commissionRate);
    const revenue = nonNegative(input.revenue);

    const achievementRatio = kpiTarget > 0 ? revenue / kpiTarget : 0;
    const achievementPercentage = Math.round(achievementRatio * 10000) / 100;
    const kpiShortfallPercentage = Math.max(0, Math.round((100 - achievementPercentage) * 100) / 100);
    const earnedBaseSalary = Math.round(baseSalary * Math.min(achievementRatio, 1));
    const excessRevenue = Math.max(0, Math.round(revenue - kpiTarget));
    const commissionAmount = kpiTarget > 0
        ? Math.round(excessRevenue * (commissionRate / 100))
        : 0;

    return {
        baseSalary,
        kpiTarget,
        commissionRate,
        revenue,
        achievementPercentage,
        kpiShortfallPercentage,
        earnedBaseSalary,
        excessRevenue,
        commissionAmount,
        totalSalary: earnedBaseSalary + commissionAmount,
    };
}
