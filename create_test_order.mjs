
import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://nuts:123123a@cluster0.0rpbkdx.mongodb.net/gonuts?retryWrites=true&w=majority&appName=Cluster0';

async function createTestOrder() {
    try {
        await mongoose.connect(MONGODB_URI);
        const db = mongoose.connection.db;
        const ordersCollection = db.collection('orders');

        const now = new Date();
        const newOrder = {
            orderType: 'product',
            shippingInfo: {
                fullName: 'ACB Test User',
                phone: '0901234567',
                email: 'test@gonuts.vn',
                address: '123 Nguyễn Huệ',
                city: 'Thành phố Hồ Chí Minh',
                district: 'Quận 1',
                ward: 'Phường Bến Nghé'
            },
            items: [
                {
                    productId: '696dc026e2858429b1bc0fac',
                    name: 'Hạt điều vỏ lụa rang muối',
                    quantity: 1,
                    price: 350000,
                    originalPrice: 350000,
                    image: 'https://res.cloudinary.com/du6no35fj/image/upload/v1768800931/gonuts/products/product_1768800930045.jpg',
                    isAgent: false
                }
            ],
            paymentMethod: 'banking',
            paymentStatus: 'pending',
            shippingFee: 22200,
            totalAmount: 372200,
            status: 'pending',
            note: 'Đơn test ACB callback',
            commissionAmount: 0,
            commissionStatus: 'pending',
            originalTotalAmount: 350000,
            agentSavings: 0,
            isAgentOrder: false,
            createdAt: now,
            updatedAt: now
        };

        const result = await ordersCollection.insertOne(newOrder);
        const orderId = result.insertedId.toString();
        const suffix = orderId.slice(-6).toUpperCase();
        const paymentRef = `GO${suffix}`;

        // Cập nhật paymentRef
        await ordersCollection.updateOne(
            { _id: result.insertedId },
            { $set: { paymentRef: paymentRef } }
        );

        console.log('=== ĐƠN HÀNG TEST ĐÃ TẠO ===');
        console.log(`Order ID: ${orderId}`);
        console.log(`Mã đơn hiển thị: #${suffix}`);
        console.log(`Payment Ref: ${paymentRef}`);
        console.log(`Số tiền: 372,200đ`);
        console.log(`Nội dung chuyển khoản: THANH TOAN DON HANG ${paymentRef}`);
        console.log('================================');

        await mongoose.disconnect();
    } catch (error) {
        console.error(error);
    }
}

createTestOrder();
