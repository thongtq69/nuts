import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { verifyReturnUrl } from '@/lib/vnpay';

// VNPay IPN (Instant Payment Notification) handler
export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        
        const searchParams = req.nextUrl.searchParams;
        const vnpParams: Record<string, string> = {};
        
        searchParams.forEach((value, key) => {
            vnpParams[key] = value;
        });

        // Verify checksum
        const isValid = verifyReturnUrl(vnpParams);
        
        if (!isValid) {
            return NextResponse.json({ RspCode: '97', Message: 'Invalid Checksum' });
        }

        const orderId = vnpParams['vnp_TxnRef'];
        const rspCode = vnpParams['vnp_ResponseCode'];
        const transactionNo = vnpParams['vnp_TransactionNo'];
        const amount = parseInt(vnpParams['vnp_Amount']) / 100;

        const order = await Order.findById(orderId);

        if (!order) {
            return NextResponse.json({ RspCode: '01', Message: 'Order not found' });
        }

        // Check if order amount matches
        if (order.totalAmount !== amount) {
            return NextResponse.json({ RspCode: '04', Message: 'Invalid Amount' });
        }

        // Check if order already processed
        if (order.paymentStatus === 'completed') {
            return NextResponse.json({ RspCode: '02', Message: 'Order already confirmed' });
        }

        // Update order based on response code
        if (rspCode === '00') {
            order.paymentStatus = 'completed';
            order.status = 'processing';
            order.vnpayTransactionNo = transactionNo;
            await order.save();
            
            return NextResponse.json({ RspCode: '00', Message: 'Confirm Success' });
        } else {
            order.paymentStatus = 'failed';
            order.status = 'cancelled';
            await order.save();
            
            return NextResponse.json({ RspCode: '00', Message: 'Confirm Success' });
        }
    } catch (error) {
        console.error('VNPay IPN error:', error);
        return NextResponse.json({ RspCode: '99', Message: 'Unknown error' });
    }
}
