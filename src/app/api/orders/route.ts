import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import Product from '@/models/Product';
import UserVoucher from '@/models/UserVoucher';
import VoucherRewardRule from '@/models/VoucherRewardRule';
import AffiliateSettings from '@/models/AffiliateSettings';
import AffiliateCommission from '@/models/AffiliateCommission';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { sendOrderConfirmationEmail } from '@/lib/email';

async function getUserId() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (!token) return null;

        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_change_me');
        return decoded.id;
    } catch {
        return null;
    }
}

interface OrderItem {
    productId: string;
    name: string;
    quantity: number;
    price: number;
    originalPrice?: number;
    image?: string;
    isAgent?: boolean;
}

function calculateFinalPrice(
    product: any,
    quantity: number,
    isAgent: boolean,
    settings: any
): { finalPrice: number; discountAmount: number; discountType: string } {
    const originalPrice = product.currentPrice;
    let finalPrice = originalPrice;
    let totalDiscount = 0;
    let discountType = 'none';

    if (isAgent && settings.agentDiscountEnabled) {
        const agentDiscount = originalPrice * (settings.agentDiscountPercent / 100);
        finalPrice = originalPrice - agentDiscount;
        totalDiscount = agentDiscount;
        discountType = 'agent';
    }

    if (settings.bulkDiscountEnabled && product.bulkPricing && product.bulkPricing.length > 0) {
        const sortedTiers = [...product.bulkPricing].sort((a: any, b: any) => b.minQuantity - a.minQuantity);
        const applicableTier = sortedTiers.find((tier: any) => quantity >= tier.minQuantity);

        if (applicableTier) {
            const bulkDiscount = finalPrice * (applicableTier.discountPercent / 100);
            finalPrice = finalPrice - bulkDiscount;
            totalDiscount = (originalPrice - finalPrice);
            discountType = discountType === 'agent' ? 'agent+bulk' : 'bulk';
        }
    }

    return {
        finalPrice: Math.round(finalPrice),
        discountAmount: Math.round(totalDiscount),
        discountType
    };
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { items, shippingInfo, paymentMethod, shippingFee, note, voucherCode } = body;
        const userId = await getUserId();

        if (!shippingInfo?.address) {
            return NextResponse.json(
                { message: 'Địa chỉ giao hàng là bắt buộc' },
                { status: 400 }
            );
        }

        // Bắt buộc email cho khách vãng lai
        if (!userId && !shippingInfo?.email) {
            return NextResponse.json(
                { message: 'Vui lòng nhập email để nhận thông tin đơn hàng' },
                { status: 400 }
            );
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json(
                { message: 'Đơn hàng phải có ít nhất 1 sản phẩm' },
                { status: 400 }
            );
        }

        const cookieStore = await cookies();

        const user = userId ? await User.findById(userId) : null;
        const isAgent = user?.role === 'sale';
        const affiliateSettings = await AffiliateSettings.findOne();
        const settings = affiliateSettings || {
            agentDiscountEnabled: true,
            agentDiscountPercent: 10,
            bulkDiscountEnabled: true,
            defaultCommissionRate: 10
        };

        let discountAmount = 0;
        let appliedVoucherId = undefined;

        if (voucherCode) {
            const voucher = await UserVoucher.findOne({ code: voucherCode, isUsed: false });
            if (!voucher) {
                return NextResponse.json({ message: 'Voucher không hợp lệ hoặc đã sử dụng' }, { status: 400 });
            }
            if (new Date(voucher.expiresAt) < new Date()) {
                return NextResponse.json({ message: 'Voucher đã hết hạn' }, { status: 400 });
            }
            if (voucher.userId && voucher.userId.toString() !== userId) {
                return NextResponse.json({ message: 'Voucher không thuộc về bạn' }, { status: 400 });
            }
            appliedVoucherId = voucher._id;
        }

        const processedItems: OrderItem[] = [];
        let itemsTotal = 0;
        let totalOriginalAmount = 0;
        let totalAgentSavings = 0;

        for (const item of items as OrderItem[]) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return NextResponse.json({ message: `Sản phẩm ${item.name} không tồn tại` }, { status: 400 });
            }

            // Kiểm tra tồn kho
            if (product.stockStatus === 'out_of_stock') {
                return NextResponse.json({ message: `Sản phẩm ${item.name} đã hết hàng` }, { status: 400 });
            }

            // Kiểm tra số lượng tồn kho
            if (typeof product.stock === 'number' && product.stock < item.quantity) {
                return NextResponse.json({
                    message: `Sản phẩm ${item.name} chỉ còn ${product.stock} sản phẩm trong kho`
                }, { status: 400 });
            }

            const { finalPrice, discountAmount: itemDiscount, discountType } = calculateFinalPrice(
                product,
                item.quantity,
                isAgent,
                settings
            );

            processedItems.push({
                ...item,
                price: finalPrice,
                originalPrice: product.currentPrice,
                isAgent
            });

            itemsTotal += finalPrice * item.quantity;
            totalOriginalAmount += product.currentPrice * item.quantity;
            totalAgentSavings += itemDiscount * item.quantity;
        }

        if (voucherCode) {
            const voucher = await UserVoucher.findById(appliedVoucherId);
            if (voucher) {
                const voucherValue = voucher.discountType === 'percent'
                    ? Math.round(itemsTotal * (voucher.discountValue / 100))
                    : voucher.discountValue;

                const maxDiscount = voucher.maxDiscount > 0 ? voucher.maxDiscount : voucherValue;
                discountAmount = Math.min(voucherValue, maxDiscount);
            }
        }

        const finalTotal = Math.max(0, itemsTotal + shippingFee - discountAmount);

        const refCode = cookieStore.get('gonuts_ref')?.value;
        let referrerId: any = undefined;
        let staffId: any = undefined;
        let commissionAmount = 0;
        let commissionStatus: any = undefined;
        let totalCommissionAmount = 0; // For storing total commission (CTV + Staff)

        if (refCode) {
            const referrerUser = await User.findOne({ referralCode: refCode });
            if (referrerUser && referrerUser._id.toString() !== userId) {
                referrerId = referrerUser._id;
                if (referrerUser.affiliateLevel === 'collaborator' && referrerUser.parentStaff) {
                    staffId = referrerUser.parentStaff;
                }
            }
        }
        if (!referrerId && userId && user?.referrer) {
            referrerId = user.referrer;
            const referrerUser = await User.findById(user.referrer);
            if (referrerUser?.affiliateLevel === 'collaborator' && referrerUser.parentStaff) {
                staffId = referrerUser.parentStaff;
            }
        }

        if (referrerId) {
            const referrerUser = await User.findById(referrerId);
            const defaultRate = settings.defaultCommissionRate ?? 10;
            let referrerRate = referrerUser?.commissionRateOverride ?? defaultRate;
            let staffRate = 0;

            if (referrerUser?.affiliateLevel === 'collaborator' && staffId) {
                const staffUser = await User.findById(staffId);
                staffRate = staffUser?.staffCommissionRate ?? 2;
            }

            const revenueBase = Math.max(0, itemsTotal - discountAmount);

            if (revenueBase > 0) {
                if (referrerUser?.affiliateLevel === 'collaborator') {
                    const collabCommission = Math.round(revenueBase * (referrerRate / 100));
                    const staffCommission = Math.round(revenueBase * (staffRate / 100));
                    commissionAmount = collabCommission; // Only store CTV's commission
                    totalCommissionAmount = collabCommission + staffCommission; // Store total for reference
                } else {
                    commissionAmount = Math.round(revenueBase * (referrerRate / 100));
                    totalCommissionAmount = commissionAmount;
                }
                commissionStatus = 'pending';
            }
        }

        const order = await Order.create({
            user: userId || undefined,
            shippingInfo,
            items: processedItems,
            paymentMethod,
            shippingFee,
            totalAmount: finalTotal,
            note,
            referrer: referrerId,
            commissionAmount,
            commissionStatus,
            originalTotalAmount: totalOriginalAmount,
            agentSavings: totalAgentSavings,
            isAgentOrder: isAgent,
            paymentRef: body.paymentReference
        });

        // Cập nhật tồn kho sau khi đặt hàng thành công
        for (const item of processedItems) {
            const product = await Product.findById(item.productId);
            if (product && typeof product.stock === 'number') {
                product.stock = Math.max(0, product.stock - item.quantity);
                // Cập nhật stock status dựa trên số lượng mới
                if (product.stock === 0) {
                    product.stockStatus = 'out_of_stock';
                } else if (product.stock <= 10) {
                    product.stockStatus = 'low_stock';
                }
                await product.save();
            }
        }

        if (appliedVoucherId) {
            await UserVoucher.findByIdAndUpdate(appliedVoucherId, {
                isUsed: true,
                usedAt: new Date(),
                orderId: order._id
            });
        }

        const commissionRecords = [];
        if (commissionAmount > 0 && referrerId) {
            const referrerUser = await User.findById(referrerId);
            const defaultRate = settings.defaultCommissionRate ?? 10;
            const revenueBase = Math.max(0, itemsTotal - discountAmount);

            if (referrerUser?.affiliateLevel === 'collaborator' && staffId) {
                const collabRate = referrerUser?.commissionRateOverride ?? defaultRate;
                const collabCommission = Math.round(revenueBase * (collabRate / 100));

                const collabComm = await AffiliateCommission.create({
                    affiliateId: referrerId,
                    orderId: order._id,
                    orderValue: revenueBase,
                    commissionRate: collabRate,
                    commissionAmount: collabCommission,
                    status: 'pending',
                    note: voucherCode ? `Collaborator commission - Order with voucher ${voucherCode}` : 'Collaborator commission'
                });
                commissionRecords.push(collabComm);

                const staffUser = await User.findById(staffId);
                const staffRate = staffUser?.staffCommissionRate ?? 2;
                const staffCommission = Math.round(revenueBase * (staffRate / 100));

                const staffComm = await AffiliateCommission.create({
                    affiliateId: staffId,
                    orderId: order._id,
                    orderValue: revenueBase,
                    commissionRate: staffRate,
                    commissionAmount: staffCommission,
                    status: 'pending',
                    note: voucherCode ? `Staff override from collaborator - Order with voucher ${voucherCode}` : 'Staff override from collaborator'
                });
                commissionRecords.push(staffComm);
            } else {
                const rate = referrerUser?.commissionRateOverride ?? defaultRate;
                const comm = await AffiliateCommission.create({
                    affiliateId: referrerId,
                    orderId: order._id,
                    orderValue: revenueBase,
                    commissionRate: rate,
                    commissionAmount: commissionAmount,
                    status: 'pending',
                    note: voucherCode ? `Order with voucher ${voucherCode}` : ''
                });
                commissionRecords.push(comm);
            }

            if (commissionRecords.length > 0) {
                await Order.findByIdAndUpdate(order._id, { commissionId: commissionRecords[0]._id });
            }
        }

        if (shippingInfo.email || (userId && user)) {
            try {
                const email = shippingInfo.email || user?.email;
                if (email) {
                    await sendOrderConfirmationEmail(email, {
                        orderId: order._id.toString().slice(-6).toUpperCase(),
                        customerName: shippingInfo.fullName,
                        items: processedItems.map((item: any) => ({
                            name: item.name,
                            quantity: item.quantity,
                            price: item.price
                        })),
                        shippingFee,
                        discount: discountAmount,
                        totalAmount: finalTotal,
                        shippingAddress: `${shippingInfo.address}, ${shippingInfo.ward || ''}, ${shippingInfo.district}, ${shippingInfo.city}`,
                        paymentMethod
                    });
                }
            } catch (emailError) {
                console.error('Failed to send order confirmation email:', emailError);
            }
        }

        if (userId && finalTotal > 0) {
            try {
                const rewardRules = await VoucherRewardRule.find({ isActive: true })
                    .sort({ minOrderValue: -1 })
                    .lean();

                const matchingRule = rewardRules.find(rule => finalTotal >= rule.minOrderValue);

                if (matchingRule) {
                    const timestamp = Date.now().toString(36).toUpperCase();
                    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
                    const voucherCode = `REWARD${timestamp}${random}`;

                    const expiresAt = new Date();
                    expiresAt.setDate(expiresAt.getDate() + (matchingRule.validityDays || 90));

                    await UserVoucher.create({
                        userId,
                        code: voucherCode,
                        discountType: 'fixed',
                        discountValue: matchingRule.voucherValue,
                        maxDiscount: matchingRule.voucherValue,
                        minOrderValue: matchingRule.minOrderForVoucher || 0,
                        expiresAt,
                        isUsed: false,
                        source: 'order_reward',
                        sourceId: order._id,
                        extensionFee: matchingRule.extensionFee,
                        extensionDays: matchingRule.extensionDays || 90,
                        maxExtensions: matchingRule.maxExtensions || 1,
                        extensionCount: 0,
                    });
                }
            } catch (voucherError) {
                console.error('Failed to create reward voucher:', voucherError);
            }
        }

        return NextResponse.json(order, { status: 201 });
    } catch (error) {
        console.error('Create order error:', error);
        return NextResponse.json(
            { message: 'Lỗi khi tạo đơn hàng' },
            { status: 500 }
        );
    }
}

// GET orders for current user
export async function GET(req: Request) {
    try {
        await dbConnect();
        const userId = await getUserId();

        if (!userId) {
            return NextResponse.json(
                { message: 'Vui lòng đăng nhập' },
                { status: 401 }
            );
        }

        const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
        return NextResponse.json(orders);
    } catch (error) {
        console.error('Get orders error:', error);
        return NextResponse.json(
            { message: 'Lỗi server' },
            { status: 500 }
        );
    }
}
