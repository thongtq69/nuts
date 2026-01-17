import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SubscriptionPackage from '@/models/SubscriptionPackage';

export async function GET() {
    try {
        await dbConnect();

        // Check if packages exist
        const count = await SubscriptionPackage.countDocuments();

        if (count > 0) {
            return NextResponse.json({ message: 'Packages already seeded', count });
        }

        // Seed initial packages
        const packages = [
            {
                name: 'Gói Bronze',
                price: 49000,
                description: 'Gói tiết kiệm cho người mới bắt đầu',
                terms: `Quyền lợi chính:
- Ưu đãi 20% cho tất cả sản phẩm: Tối đa 50.000 VND/đơn hàng
- Áp dụng với 20 mã giảm giá trong 30 ngày

Quyền lợi bổ sung:
- Ưu tiên hỗ trợ khách hàng qua hotline
- Nhận thông báo sớm về các chương trình khuyến mãi

Lưu ý:
- Các quyền lợi Gói hội viên được cấp theo tháng, bất kể bạn mua gói 1 tháng, 6 tháng.
- Mỗi ưu đãi có thể sử dụng trong 30 ngày hoặc 180 ngày từ ngày phát hành mã tại mục "Ưu đãi".

Khu vực áp dụng: Hồ Chí Minh, Hà Nội, Đà Nẵng, Nha Trang, Bình Dương và Huế
- Khuyến mãi không bao gồm phụ phí, khách hàng vui lòng thanh toán đầy đủ khi nhận hàng tại xe.
- Khuyến mãi được áp dụng cho tất cả các phương thức thanh toán, ngoại trừ hình thức thanh toán Thẻ Doanh Nghiệp.`,
                discountType: 'percent',
                discountValue: 20,
                maxDiscount: 50000,
                minOrderValue: 0,
                voucherQuantity: 20,
                validityDays: 30,
            },
            {
                name: 'Gói Silver',
                price: 99000,
                description: 'Gói phổ biến với nhiều ưu đãi hấp dẫn',
                terms: `Quyền lợi chính:
- Ưu đãi 25% cho tất cả sản phẩm: Tối đa 100.000 VND/đơn hàng
- Áp dụng với 30 mã giảm giá trong 60 ngày

Quyền lợi bổ sung:
- Ưu tiên hỗ trợ khách hàng 24/7: Luôn có đội ngũ hỗ trợ mọi lúc bạn cần
- Tổng đài hỗ trợ riêng 24/7 cho hội viên: Luôn có đội ngũ hỗ trợ mọi lúc bạn cần
- Vpoint sẽ được tích x2 với các giao dịch phát sinh sử dụng mã gói Xanh Unlimited hoặc Xanh Unlimited Family

Lưu ý:
- Các quyền lợi Gói hội viên được cấp theo tháng, bất kể bạn mua gói 1 tháng, 6 tháng.
- Mỗi ưu đãi có thể sử dụng trong 60 ngày hoặc 180 ngày từ ngày phát hành mã tại mục "Ưu đãi".

Khu vực áp dụng: Hồ Chí Minh, Hà Nội, Đà Nẵng, Nha Trang, Bình Dương và Huế
- Khuyến mãi không bao gồm phụ phí, khách hàng vui lòng thanh toán đầy đủ khi nhận hàng tại xe.
- Khuyến mãi được áp dụng cho tất cả các phương thức thanh toán, ngoại trừ hình thức thanh toán Thẻ Doanh Nghiệp.`,
                discountType: 'percent',
                discountValue: 25,
                maxDiscount: 100000,
                minOrderValue: 0,
                voucherQuantity: 30,
                validityDays: 60,
            },
            {
                name: 'Gói Gold',
                price: 199000,
                description: 'Gói cao cấp dành cho khách hàng thân thiết',
                terms: `Quyền lợi chính:
- Ưu đãi 30% cho tất cả sản phẩm: Tối đa 200.000 VND/đơn hàng
- Áp dụng với 50 mã giảm giá trong 90 ngày

Quyền lợi bổ sung:
- Ưu tiên hỗ trợ khách hàng VIP: Đội ngũ chăm sóc riêng, thời gian phản hồi nhanh nhất
- Tổng đài hỗ trợ riêng 24/7 cho hội viên: Luôn có đội ngũ hỗ trợ mọi lúc bạn cần
- Vpoint sẽ được tích x3 với các giao dịch phát sinh sử dụng mã gói Xanh Unlimited hoặc Xanh Unlimited Family trong thời gian gói có hiệu lực
- Ưu đãi đặc biệt cho các sự kiện và ngày lễ

Lưu ý:
- Các quyền lợi Gói hội viên được cấp theo tháng, bất kể bạn mua gói 1 tháng, 6 tháng.
- Mỗi ưu đãi có thể sử dụng trong 90 ngày hoặc 180 ngày từ ngày phát hành mã tại mục "Ưu đãi".
- Ưu đãi chưa sử dụng không được cộng dồn sang tháng tiếp theo.

Khu vực áp dụng: Hồ Chí Minh, Hà Nội, Đà Nẵng, Nha Trang, Bình Dương và Huế
- Khuyến mãi không bao gồm phụ phí, khách hàng vui lòng thanh toán đầy đủ khi nhận hàng tại xe.
- Khuyến mãi được áp dụng cho tất cả các phương thức thanh toán, ngoại trừ hình thức thanh toán Thẻ Doanh Nghiệp.
- Khuyến mãi không áp dụng đồng thời với các Chương trình khuyến mãi khác.
- Khuyến mãi sẽ không được hoàn lại hoặc bán cho bên thứ ba.
- Về chính sách nhận được tích điểm Vpoint, không áp dụng thanh toán bằng tài khoản thẻ doanh nghiệp.`,
                discountType: 'percent',
                discountValue: 30,
                maxDiscount: 200000,
                minOrderValue: 0,
                voucherQuantity: 50,
                validityDays: 90,
            },
        ];

        await SubscriptionPackage.insertMany(packages);

        return NextResponse.json({
            message: 'Packages seeded successfully',
            count: packages.length
        }, { status: 201 });
    } catch (error) {
        console.error('Error seeding packages:', error);
        return NextResponse.json({ error: 'Failed to seed packages' }, { status: 500 });
    }
}
