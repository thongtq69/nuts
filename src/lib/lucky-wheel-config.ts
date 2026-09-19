export interface LuckyWheelSegmentConfig {
    label: string;
    value: number;
    color: string;
}

export interface LuckyWheelMilestoneRewardConfig {
    value: number;
    count: number;
}

export const DEFAULT_WHEEL_SEGMENTS: LuckyWheelSegmentConfig[] = [
    { label: 'Chúc may mắn', value: 0, color: '#fff7db' },
    { label: '1.000đ', value: 1_000, color: '#f6bd4b' },
    { label: '5.000đ', value: 5_000, color: '#e96f65' },
    { label: '10.000đ', value: 10_000, color: '#8bbd75' },
    { label: '50.000đ', value: 50_000, color: '#73a9d8' },
    { label: '100.000đ', value: 100_000, color: '#b68ad6' },
];

export const DEFAULT_REGULAR_SPIN_PRIZES = [0, 1_000, 0, 5_000, 0];
export const DEFAULT_TOP_UP_OPTIONS = [10_000, 20_000, 50_000, 100_000];
export const DEFAULT_WHEEL_TERMS = [
    'Chỉ thành viên đã đăng nhập mới được tham gia.',
    'Lượt quay chỉ được cộng từ giao dịch nạp riêng cho vòng quay; mua hàng không được quy đổi thành lượt.',
    'Không thể dùng tiền thưởng để mua thêm lượt quay.',
    'Tiền thưởng có thể dùng mua hàng hoặc gửi yêu cầu rút về tài khoản ngân hàng.',
];
export const DEFAULT_MILESTONE_REWARDS: LuckyWheelMilestoneRewardConfig[] = [
    { value: 100_000, count: 10 },
    { value: 50_000, count: 5 },
];

export const DEFAULT_WHEEL_COPY = {
    campaignName: 'Vòng quay may mắn Go Nuts',
    memberBadgeText: 'Thành viên Go Nuts',
    introText: 'Nạp 10.000đ nhận 5 lượt quay. Tiền thưởng được cộng thẳng vào tài khoản để rút hoặc dùng khi mua hàng.',
    inactiveMessage: 'Chương trình hiện đang tạm dừng.',
    spinButtonText: 'Quay ngay',
    totalWinningsLabel: 'Tổng tiền đã trúng',
    balanceLabel: 'Số dư thưởng',
    topUpTitle: 'Nạp lượt chơi',
    withdrawalTitle: 'Rút tiền thưởng',
    termsTitle: 'Thể lệ tham gia',
    historyTitle: 'Lịch sử gần đây',
};
