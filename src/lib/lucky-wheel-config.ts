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
    { label: 'Chúc may mắn', value: 0, color: '#ffe89a' },
    { label: '1.000đ', value: 1_000, color: '#90d7f0' },
    { label: '5.000đ', value: 5_000, color: '#ffaea5' },
    { label: '10.000đ', value: 10_000, color: '#a7e3ca' },
    { label: '50.000đ', value: 50_000, color: '#bfc2f4' },
    { label: '100.000đ', value: 100_000, color: '#f7c1df' },
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
    campaignName: 'Bánh xe quà tặng GO NUTS',
    memberBadgeText: 'Góc quà vui Go Nuts',
    introText: 'Mỗi lượt mở ra một bất ngờ nhỏ. Quà nhận được sẽ được lưu ngay vào tài khoản của bạn.',
    inactiveMessage: 'Chương trình hiện đang tạm dừng.',
    spinButtonText: 'Mở quà',
    totalWinningsLabel: 'Tổng quà đã nhận',
    balanceLabel: 'Ví quà của bạn',
    topUpTitle: 'Nạp lượt chơi',
    withdrawalTitle: 'Rút tiền thưởng',
    termsTitle: 'Thể lệ tham gia',
    historyTitle: 'Hoạt động trong giờ',
};
