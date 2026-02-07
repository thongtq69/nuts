// Seed default commission tiers
// Run with: npx tsx scripts/seed-tiers.ts

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';


const defaultTiers = [
    {
        name: 'bronze',
        displayName: 'Đồng',
        description: 'Cấp bậc khởi đầu cho tất cả CTV mới',
        color: '#CD7F32',
        icon: '🥉',
        requirements: {
            minMonthlySales: 0,
            minMonthlyOrders: 0,
            minTeamSize: 0,
            minTeamSales: 0,
            consecutiveMonths: 1
        },
        commissionRates: {
            directSale: 5,
            teamSaleL1: 0,
            teamSaleL2: 0
        },
        benefits: {
            bonusPerOrder: 0,
            monthlyBonus: 0,
            freeShipping: false,
            prioritySupport: false,
            discountPercent: 0
        },
        order: 1,
        isActive: true,
        isDefault: true
    },
    {
        name: 'silver',
        displayName: 'Bạc',
        description: 'Đạt được khi có doanh số ổn định',
        color: '#C0C0C0',
        icon: '🥈',
        requirements: {
            minMonthlySales: 10000000,
            minMonthlyOrders: 20,
            minTeamSize: 0,
            minTeamSales: 0,
            consecutiveMonths: 1
        },
        commissionRates: {
            directSale: 7,
            teamSaleL1: 1,
            teamSaleL2: 0
        },
        benefits: {
            bonusPerOrder: 5000,
            monthlyBonus: 0,
            freeShipping: false,
            prioritySupport: false,
            discountPercent: 5
        },
        order: 2,
        isActive: true,
        isDefault: false
    },
    {
        name: 'gold',
        displayName: 'Vàng',
        description: 'Cấp bậc cho CTV có kinh nghiệm',
        color: '#FFD700',
        icon: '🥇',
        requirements: {
            minMonthlySales: 30000000,
            minMonthlyOrders: 50,
            minTeamSize: 3,
            minTeamSales: 10000000,
            consecutiveMonths: 2
        },
        commissionRates: {
            directSale: 10,
            teamSaleL1: 2,
            teamSaleL2: 0.5
        },
        benefits: {
            bonusPerOrder: 10000,
            monthlyBonus: 500000,
            freeShipping: true,
            prioritySupport: false,
            discountPercent: 10
        },
        order: 3,
        isActive: true,
        isDefault: false
    },
    {
        name: 'platinum',
        displayName: 'Bạch Kim',
        description: 'Cấp bậc cao cấp cho leader team',
        color: '#E5E4E2',
        icon: '💎',
        requirements: {
            minMonthlySales: 70000000,
            minMonthlyOrders: 100,
            minTeamSize: 10,
            minTeamSales: 50000000,
            consecutiveMonths: 3
        },
        commissionRates: {
            directSale: 12,
            teamSaleL1: 3,
            teamSaleL2: 1
        },
        benefits: {
            bonusPerOrder: 15000,
            monthlyBonus: 2000000,
            freeShipping: true,
            prioritySupport: true,
            discountPercent: 15
        },
        order: 4,
        isActive: true,
        isDefault: false
    },
    {
        name: 'diamond',
        displayName: 'Kim Cương',
        description: 'Cấp bậc cao nhất cho top performer',
        color: '#B9F2FF',
        icon: '👑',
        requirements: {
            minMonthlySales: 150000000,
            minMonthlyOrders: 200,
            minTeamSize: 25,
            minTeamSales: 200000000,
            consecutiveMonths: 3
        },
        commissionRates: {
            directSale: 15,
            teamSaleL1: 4,
            teamSaleL2: 1.5
        },
        benefits: {
            bonusPerOrder: 20000,
            monthlyBonus: 5000000,
            freeShipping: true,
            prioritySupport: true,
            discountPercent: 20
        },
        order: 5,
        isActive: true,
        isDefault: false
    }
];

async function seedTiers() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected!');

        const collection = mongoose.connection.db.collection('commissiontiers');

        // Delete existing tiers
        const deleteResult = await collection.deleteMany({});
        console.log(`Deleted ${deleteResult.deletedCount} existing tiers`);

        // Insert default tiers
        const insertResult = await collection.insertMany(defaultTiers);
        console.log(`Inserted ${insertResult.insertedCount} default tiers`);

        console.log('\n✅ Commission tiers seeded successfully!');
        console.log('Tiers created:');
        defaultTiers.forEach((tier, i) => {
            console.log(`  ${i + 1}. ${tier.icon} ${tier.displayName} - ${tier.commissionRates.directSale}% direct`);
        });

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error seeding tiers:', error);
        process.exit(1);
    }
}

seedTiers();
