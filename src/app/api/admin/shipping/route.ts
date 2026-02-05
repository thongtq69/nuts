import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ShippingConfig from '@/models/ShippingConfig';

// GET - Lấy cấu hình vận chuyển
export async function GET() {
    try {
        await dbConnect();
        let config = await ShippingConfig.findOne({});

        if (!config) {
            // Dữ liệu mẫu dựa trên bảng giá Nhất Tín Logistics (Skeleton)
            // Lưu ý: Giá trong ảnh là chưa VAT và phí xăng, nhưng User yêu cầu "đã bao gồm VAT".
            // Ở đây tôi sẽ để giá gốc và logic tính toán sẽ cộng thêm % xăng/VAT nếu cần, 
            // hoặc admin nhập giá đã bao gồm vào đây. 
            // Để linh hoạt, ta sẽ để phụ phí = 0 nếu admin nhập giá cuối.

            const defaultTiers = [
                { name: 'Đến 2kg', minWeight: 0, maxWeight: 2, basePrice: 22200, extraPricePerKg: 0, isDirectMultiplier: false },
                { name: '2kg - 30kg', minWeight: 2, maxWeight: 30, basePrice: 22200, extraPricePerKg: 3400, isDirectMultiplier: false },
                { name: '30kg - 500kg', minWeight: 30, maxWeight: 500, basePrice: 117400, extraPricePerKg: 3000, isDirectMultiplier: false },
                { name: 'Trên 500kg', minWeight: 500, maxWeight: 999999, basePrice: 0, extraPricePerKg: 2000, isDirectMultiplier: true }
            ];

            const defaultConfig = {
                originCity: 'Hà Nội',
                fuelSurchargePercent: 0, // Set to 0 because user said "prices include VAT/fees"
                vatPercent: 0,
                zones: [
                    {
                        name: 'Nội tỉnh 1 (Hà Nội - Nội thành)',
                        provinceNames: ['Thành phố Hà Nội'],
                        tiers: defaultTiers
                    },
                    {
                        name: 'Nội miền 1 (Miền Bắc)',
                        provinceNames: ['Tỉnh Bắc Ninh', 'Tỉnh Hà Nam', 'Tỉnh Hải Dương', 'Thành phố Hải Phòng', 'Tỉnh Hưng Yên', 'Tỉnh Nam Định', 'Tỉnh Ninh Bình', 'Tỉnh Thái Bình', 'Tỉnh Vĩnh Phúc'],
                        tiers: defaultTiers.map(t => ({ ...t, basePrice: t.basePrice + 10000, extraPricePerKg: t.extraPricePerKg + 500 }))
                    }
                ]
            };
            config = await ShippingConfig.create(defaultConfig);
        }

        return NextResponse.json(config);
    } catch (error) {
        console.error('Shipping settings error:', error);
        return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
    }
}

// POST - Cập nhật cấu hình
export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const body = await request.json();

        const config = await ShippingConfig.findOneAndUpdate(
            {},
            { $set: body },
            { upsert: true, new: true }
        );

        return NextResponse.json({ success: true, data: config });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
