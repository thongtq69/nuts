export interface VietnamBank {
    code: string;
    shortName: string;
    name: string;
    bin: string;
    logo: string;
}

// Danh sách ngân hàng nhận chuyển khoản tại Việt Nam, đối chiếu với VietQR/NAPAS.
// Ví điện tử và công ty tài chính không có tài khoản ngân hàng nhận tiền bị loại khỏi danh sách.
export const VIETNAM_BANKS: VietnamBank[] = [
    { code: 'ICB', shortName: 'VietinBank', name: 'Ngân hàng TMCP Công thương Việt Nam', bin: '970415', logo: 'https://cdn.vietqr.io/img/ICB.png' },
    { code: 'VCB', shortName: 'Vietcombank', name: 'Ngân hàng TMCP Ngoại thương Việt Nam', bin: '970436', logo: 'https://cdn.vietqr.io/img/VCB.png' },
    { code: 'BIDV', shortName: 'BIDV', name: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam', bin: '970418', logo: 'https://cdn.vietqr.io/img/BIDV.png' },
    { code: 'VBA', shortName: 'Agribank', name: 'Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam', bin: '970405', logo: 'https://cdn.vietqr.io/img/VBA.png' },
    { code: 'OCB', shortName: 'OCB', name: 'Ngân hàng TMCP Phương Đông', bin: '970448', logo: 'https://cdn.vietqr.io/img/OCB.png' },
    { code: 'MB', shortName: 'MBBank', name: 'Ngân hàng TMCP Quân đội', bin: '970422', logo: 'https://cdn.vietqr.io/img/MB.png' },
    { code: 'TCB', shortName: 'Techcombank', name: 'Ngân hàng TMCP Kỹ thương Việt Nam', bin: '970407', logo: 'https://cdn.vietqr.io/img/TCB.png' },
    { code: 'ACB', shortName: 'ACB', name: 'Ngân hàng TMCP Á Châu', bin: '970416', logo: 'https://cdn.vietqr.io/img/ACB.png' },
    { code: 'VPB', shortName: 'VPBank', name: 'Ngân hàng TMCP Việt Nam Thịnh Vượng', bin: '970432', logo: 'https://cdn.vietqr.io/img/VPB.png' },
    { code: 'TPB', shortName: 'TPBank', name: 'Ngân hàng TMCP Tiên Phong', bin: '970423', logo: 'https://cdn.vietqr.io/img/TPB.png' },
    { code: 'STB', shortName: 'Sacombank', name: 'Ngân hàng TMCP Sài Gòn Thương Tín', bin: '970403', logo: 'https://cdn.vietqr.io/img/STB.png' },
    { code: 'HDB', shortName: 'HDBank', name: 'Ngân hàng TMCP Phát triển Thành phố Hồ Chí Minh', bin: '970437', logo: 'https://cdn.vietqr.io/img/HDB.png' },
    { code: 'VCCB', shortName: 'VietCapitalBank', name: 'Ngân hàng TMCP Bản Việt', bin: '970454', logo: 'https://cdn.vietqr.io/img/VCCB.png' },
    { code: 'SCB', shortName: 'SCB', name: 'Ngân hàng TMCP Sài Gòn', bin: '970429', logo: 'https://cdn.vietqr.io/img/SCB.png' },
    { code: 'VIB', shortName: 'VIB', name: 'Ngân hàng TMCP Quốc tế Việt Nam', bin: '970441', logo: 'https://cdn.vietqr.io/img/VIB.png' },
    { code: 'SHB', shortName: 'SHB', name: 'Ngân hàng TMCP Sài Gòn - Hà Nội', bin: '970443', logo: 'https://cdn.vietqr.io/img/SHB.png' },
    { code: 'EIB', shortName: 'Eximbank', name: 'Ngân hàng TMCP Xuất Nhập khẩu Việt Nam', bin: '970431', logo: 'https://cdn.vietqr.io/img/EIB.png' },
    { code: 'MSB', shortName: 'MSB', name: 'Ngân hàng TMCP Hàng Hải Việt Nam', bin: '970426', logo: 'https://cdn.vietqr.io/img/MSB.png' },
    { code: 'CAKE', shortName: 'CAKE', name: 'Ngân hàng số CAKE by VPBank', bin: '546034', logo: 'https://cdn.vietqr.io/img/CAKE.png' },
    { code: 'Ubank', shortName: 'Ubank', name: 'Ngân hàng số Ubank by VPBank', bin: '546035', logo: 'https://cdn.vietqr.io/img/UBANK.png' },
    { code: 'TIMO', shortName: 'Timo', name: 'Ngân hàng số Timo by BVBank', bin: '963388', logo: 'https://vietqr.net/portal-service/resources/icons/TIMO.png' },
    { code: 'SGICB', shortName: 'SaigonBank', name: 'Ngân hàng TMCP Sài Gòn Công Thương', bin: '970400', logo: 'https://cdn.vietqr.io/img/SGICB.png' },
    { code: 'BAB', shortName: 'BacABank', name: 'Ngân hàng TMCP Bắc Á', bin: '970409', logo: 'https://cdn.vietqr.io/img/BAB.png' },
    { code: 'PVDB', shortName: 'PVcomBank Pay', name: 'Ngân hàng số PVcomBank Pay', bin: '971133', logo: 'https://cdn.vietqr.io/img/PVCB.png' },
    { code: 'PVCB', shortName: 'PVcomBank', name: 'Ngân hàng TMCP Đại Chúng Việt Nam', bin: '970412', logo: 'https://cdn.vietqr.io/img/PVCB.png' },
    { code: 'MBV', shortName: 'MBV', name: 'Ngân hàng TNHH MTV Việt Nam Hiện Đại', bin: '970414', logo: 'https://cdn.vietqr.io/img/MBV.png' },
    { code: 'NCB', shortName: 'NCB', name: 'Ngân hàng TMCP Quốc Dân', bin: '970419', logo: 'https://cdn.vietqr.io/img/NCB.png' },
    { code: 'SHBVN', shortName: 'ShinhanBank', name: 'Ngân hàng TNHH MTV Shinhan Việt Nam', bin: '970424', logo: 'https://cdn.vietqr.io/img/SHBVN.png' },
    { code: 'ABB', shortName: 'ABBANK', name: 'Ngân hàng TMCP An Bình', bin: '970425', logo: 'https://cdn.vietqr.io/img/ABB.png' },
    { code: 'VAB', shortName: 'VietABank', name: 'Ngân hàng TMCP Việt Á', bin: '970427', logo: 'https://cdn.vietqr.io/img/VAB.png' },
    { code: 'NAB', shortName: 'NamABank', name: 'Ngân hàng TMCP Nam Á', bin: '970428', logo: 'https://cdn.vietqr.io/img/NAB.png' },
    { code: 'PGB', shortName: 'PGBank', name: 'Ngân hàng TMCP Thịnh vượng và Phát triển', bin: '970430', logo: 'https://cdn.vietqr.io/img/PGB.png' },
    { code: 'VIETBANK', shortName: 'VietBank', name: 'Ngân hàng TMCP Việt Nam Thương Tín', bin: '970433', logo: 'https://cdn.vietqr.io/img/VIETBANK.png' },
    { code: 'BVB', shortName: 'BaoVietBank', name: 'Ngân hàng TMCP Bảo Việt', bin: '970438', logo: 'https://cdn.vietqr.io/img/BVB.png' },
    { code: 'SEAB', shortName: 'SeABank', name: 'Ngân hàng TMCP Đông Nam Á', bin: '970440', logo: 'https://cdn.vietqr.io/img/SEAB.png' },
    { code: 'COOPBANK', shortName: 'COOPBANK', name: 'Ngân hàng Hợp tác xã Việt Nam', bin: '970446', logo: 'https://cdn.vietqr.io/img/COOPBANK.png' },
    { code: 'LPB', shortName: 'LPBank', name: 'Ngân hàng TMCP Lộc Phát Việt Nam', bin: '970449', logo: 'https://cdn.vietqr.io/img/LPB.png' },
    { code: 'KLB', shortName: 'KienLongBank', name: 'Ngân hàng TMCP Kiên Long', bin: '970452', logo: 'https://cdn.vietqr.io/img/KLB.png' },
    { code: 'KBank', shortName: 'KBank', name: 'Ngân hàng Đại chúng TNHH Kasikornbank', bin: '668888', logo: 'https://cdn.vietqr.io/img/KBANK.png' },
    { code: 'HLBVN', shortName: 'HongLeong', name: 'Ngân hàng TNHH MTV Hong Leong Việt Nam', bin: '970442', logo: 'https://cdn.vietqr.io/img/HLBVN.png' },
    { code: 'KEBHANAHN', shortName: 'KEB Hana Hà Nội', name: 'Ngân hàng KEB Hana - Chi nhánh Hà Nội', bin: '970467', logo: 'https://cdn.vietqr.io/img/KEBHANAHN.png' },
    { code: 'KEBHANAHCM', shortName: 'KEB Hana HCM', name: 'Ngân hàng KEB Hana - Chi nhánh TP. Hồ Chí Minh', bin: '970466', logo: 'https://cdn.vietqr.io/img/KEBHANAHCM.png' },
    { code: 'CITIBANK', shortName: 'Citibank', name: 'Ngân hàng Citibank, N.A. - Chi nhánh Hà Nội', bin: '533948', logo: 'https://cdn.vietqr.io/img/CITIBANK.png' },
    { code: 'CBB', shortName: 'CBBank', name: 'Ngân hàng Thương mại TNHH MTV Xây dựng Việt Nam', bin: '970444', logo: 'https://cdn.vietqr.io/img/CBB.png' },
    { code: 'CIMB', shortName: 'CIMB', name: 'Ngân hàng TNHH MTV CIMB Việt Nam', bin: '422589', logo: 'https://cdn.vietqr.io/img/CIMB.png' },
    { code: 'DBS', shortName: 'DBSBank', name: 'DBS Bank Ltd - Chi nhánh TP. Hồ Chí Minh', bin: '796500', logo: 'https://cdn.vietqr.io/img/DBS.png' },
    { code: 'Vikki', shortName: 'Vikki', name: 'Ngân hàng TNHH MTV Số Vikki', bin: '970406', logo: 'https://cdn.vietqr.io/img/Vikki.png' },
    { code: 'VBSP', shortName: 'VBSP', name: 'Ngân hàng Chính sách Xã hội', bin: '999888', logo: 'https://cdn.vietqr.io/img/VBSP.png' },
    { code: 'GPB', shortName: 'GPBank', name: 'Ngân hàng Thương mại TNHH MTV Dầu Khí Toàn Cầu', bin: '970408', logo: 'https://cdn.vietqr.io/img/GPB.png' },
    { code: 'KBHCM', shortName: 'Kookmin HCM', name: 'Ngân hàng Kookmin - Chi nhánh TP. Hồ Chí Minh', bin: '970463', logo: 'https://cdn.vietqr.io/img/KBHCM.png' },
    { code: 'KBHN', shortName: 'Kookmin Hà Nội', name: 'Ngân hàng Kookmin - Chi nhánh Hà Nội', bin: '970462', logo: 'https://cdn.vietqr.io/img/KBHN.png' },
    { code: 'WVN', shortName: 'Woori', name: 'Ngân hàng TNHH MTV Woori Việt Nam', bin: '970457', logo: 'https://cdn.vietqr.io/img/WVN.png' },
    { code: 'VRB', shortName: 'VRB', name: 'Ngân hàng Liên doanh Việt - Nga', bin: '970421', logo: 'https://cdn.vietqr.io/img/VRB.png' },
    { code: 'HSBC', shortName: 'HSBC', name: 'Ngân hàng TNHH MTV HSBC Việt Nam', bin: '458761', logo: 'https://cdn.vietqr.io/img/HSBC.png' },
    { code: 'IBK - HN', shortName: 'IBK Hà Nội', name: 'Ngân hàng Công nghiệp Hàn Quốc - Chi nhánh Hà Nội', bin: '970455', logo: 'https://cdn.vietqr.io/img/IBK.png' },
    { code: 'IBK - HCM', shortName: 'IBK HCM', name: 'Ngân hàng Công nghiệp Hàn Quốc - Chi nhánh TP. Hồ Chí Minh', bin: '970456', logo: 'https://cdn.vietqr.io/img/IBK.png' },
    { code: 'IVB', shortName: 'IndovinaBank', name: 'Ngân hàng TNHH Indovina', bin: '970434', logo: 'https://cdn.vietqr.io/img/IVB.png' },
    { code: 'UOB', shortName: 'UOB', name: 'Ngân hàng United Overseas - Chi nhánh TP. Hồ Chí Minh', bin: '970458', logo: 'https://cdn.vietqr.io/img/UOB.png' },
    { code: 'NHB HN', shortName: 'Nonghyup', name: 'Ngân hàng Nonghyup - Chi nhánh Hà Nội', bin: '801011', logo: 'https://cdn.vietqr.io/img/NHB.png' },
    { code: 'SCVN', shortName: 'Standard Chartered', name: 'Ngân hàng TNHH MTV Standard Chartered Việt Nam', bin: '970410', logo: 'https://cdn.vietqr.io/img/SCVN.png' },
    { code: 'PBVN', shortName: 'PublicBank', name: 'Ngân hàng TNHH MTV Public Việt Nam', bin: '970439', logo: 'https://cdn.vietqr.io/img/PBVN.png' },
];

export function normalizeBankSearch(value: string) {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
}

export function searchVietnamBanks(query: string, limit = VIETNAM_BANKS.length) {
    const normalized = normalizeBankSearch(query);
    if (!normalized) return VIETNAM_BANKS.slice(0, limit);
    return VIETNAM_BANKS
        .filter(bank => normalizeBankSearch(`${bank.shortName} ${bank.code} ${bank.name} ${bank.bin}`).includes(normalized))
        .slice(0, limit);
}

export function findVietnamBank(value: string) {
    const normalized = normalizeBankSearch(value);
    return VIETNAM_BANKS.find(bank => [bank.shortName, bank.code, bank.name, bank.bin].some(item => normalizeBankSearch(item) === normalized));
}
