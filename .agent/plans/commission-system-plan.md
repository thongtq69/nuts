# Kế hoạch Xây dựng Hệ thống Quản lý Hoa hồng & KPI

## 📋 Tổng quan

Hệ thống quản lý hoa hồng đa tầng với tính năng:
- Setting hoa hồng cá nhân cho từng user (NV, CTV, DL)
- Setting hoa hồng theo nhóm/team
- Tự động tăng hoa hồng khi đạt KPI
- Báo cáo chi tiết và tracking

---

## 🎯 Phase 1: Thiết kế Database Schema (Tuần 1-2)

### 1.1. User Roles & Hierarchy

```typescript
// Mở rộng User Model
interface IUser {
  // ... existing fields
  role: 'admin' | 'staff' | 'agent' | 'collaborator' | 'customer';
  
  // Commission settings
  commissionTier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  personalCommissionRate?: number; // % hoa hồng cá nhân
  overrideGroupCommission?: boolean; // Ghi đè hoa hồng nhóm
  
  // Hierarchy
  managerId?: mongoose.Types.ObjectId; // Người quản lý trực tiếp
  teamId?: mongoose.Types.ObjectId; // Nhóm/Team
  referralCode: string; // Mã giới thiệu
  
  // KPI tracking
  currentMonthSales: number;
  currentMonthOrders: number;
  totalSales: number;
  totalOrders: number;
  
  // Dates
  joinedAt: Date;
  lastPromotionAt?: Date;
}
```

### 1.2. Commission Tier Model

```typescript
// models/CommissionTier.ts
interface ICommissionTier {
  name: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  displayName: string; // "Đồng", "Bạc", "Vàng", "Bạch Kim", "Kim Cương"
  color: string; // Badge color
  icon: string;
  
  // Requirements to achieve this tier
  requirements: {
    minMonthlySales?: number; // Doanh số tháng tối thiểu
    minMonthlyOrders?: number; // Số đơn hàng tối thiểu
    minTeamSize?: number; // Số lượng CTV trong team
    minTeamSales?: number; // Doanh số team tối thiểu
    consecutiveMonths?: number; // Số tháng duy trì liên tiếp
  };
  
  // Commission rates
  commissionRates: {
    directSale: number; // % từ đơn hàng trực tiếp
    teamSale: number; // % từ đơn hàng của team (level 1)
    teamLevel2Sale?: number; // % từ đơn của CTV cấp 2
  };
  
  // Benefits
  benefits: {
    bonusPerOrder?: number; // Thưởng cố định mỗi đơn
    monthlyBonus?: number; // Thưởng cố định hàng tháng
    freeShipping?: boolean;
    prioritySupport?: boolean;
  };
  
  // Metadata
  order: number; // Thứ tự cấp bậc (1-5)
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### 1.3. Team Model

```typescript
// models/Team.ts
interface ITeam {
  name: string;
  description?: string;
  
  // Leader
  leaderId: mongoose.Types.ObjectId; // User ID của team leader
  
  // Members
  members: {
    userId: mongoose.Types.ObjectId;
    joinedAt: Date;
    role: 'leader' | 'member';
    status: 'active' | 'inactive';
  }[];
  
  // Team settings
  teamCommissionRate?: number; // Hoa hồng chung cho team (nếu có)
  autoAcceptMembers: boolean;
  
  // Performance
  currentMonthSales: number;
  currentMonthOrders: number;
  totalSales: number;
  totalOrders: number;
  
  // Metadata
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}
```

### 1.4. Commission Transaction Model

```typescript
// models/CommissionTransaction.ts
interface ICommissionTransaction {
  // Recipient
  userId: mongoose.Types.ObjectId;
  userName: string;
  userRole: string;
  
  // Source
  orderId: mongoose.Types.ObjectId;
  orderNumber: string;
  orderTotal: number;
  
  // Commission details
  commissionType: 'direct_sale' | 'team_sale_l1' | 'team_sale_l2' | 'bonus' | 'kpi_bonus';
  commissionRate: number; // %
  commissionAmount: number; // Số tiền
  
  // Source user (nếu là hoa hồng từ team)
  sourceUserId?: mongoose.Types.ObjectId;
  sourceUserName?: string;
  
  // Tier at time of transaction
  tierAtTransaction: string;
  
  // Payment status
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  paidAt?: Date;
  paymentMethod?: string;
  paymentReference?: string;
  
  // Notes
  notes?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}
```

### 1.5. KPI Target Model

```typescript
// models/KPITarget.ts
interface IKPITarget {
  // Period
  year: number;
  month: number;
  quarter?: number;
  
  // Target for specific user/team
  targetType: 'user' | 'team' | 'tier' | 'global';
  targetId?: mongoose.Types.ObjectId; // userId hoặc teamId
  tierName?: string; // Nếu là target cho tier
  
  // Targets
  targets: {
    salesTarget?: number;
    ordersTarget?: number;
    newCustomersTarget?: number;
    teamGrowthTarget?: number; // Số CTV mới
  };
  
  // Rewards when achieved
  rewards: {
    bonusAmount?: number;
    commissionBoost?: number; // % tăng thêm
    promotionToTier?: string; // Tự động thăng hạng
    specialGift?: string;
  };
  
  // Achievement tracking
  currentSales: number;
  currentOrders: number;
  currentNewCustomers: number;
  currentTeamGrowth: number;
  
  achievementPercentage: number; // %
  isAchieved: boolean;
  achievedAt?: Date;
  
  // Metadata
  status: 'active' | 'completed' | 'cancelled';
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🔧 Phase 2: Business Logic & Services (Tuần 3-4)

### 2.1. Commission Calculation Service

```typescript
// lib/commissionService.ts

class CommissionService {
  
  /**
   * Tính hoa hồng khi có đơn hàng mới
   */
  async calculateCommission(order: IOrder): Promise<void> {
    // 1. Tính hoa hồng cho người bán trực tiếp
    await this.calculateDirectCommission(order);
    
    // 2. Tính hoa hồng cho team leader (nếu có)
    await this.calculateTeamCommission(order);
    
    // 3. Tính hoa hồng cấp 2 (nếu có)
    await this.calculateLevel2Commission(order);
    
    // 4. Cập nhật KPI
    await this.updateKPIMetrics(order);
    
    // 5. Kiểm tra thăng hạng
    await this.checkTierPromotion(order.userId);
  }
  
  /**
   * Hoa hồng trực tiếp
   */
  private async calculateDirectCommission(order: IOrder) {
    const user = await User.findById(order.userId);
    if (!user) return;
    
    // Lấy tier hiện tại
    const tier = await CommissionTier.findOne({ name: user.commissionTier });
    
    // Dùng commission cá nhân hoặc commission của tier
    const rate = user.personalCommissionRate ?? tier.commissionRates.directSale;
    
    const commissionAmount = order.totalAmount * (rate / 100);
    
    // Tạo transaction
    await CommissionTransaction.create({
      userId: user._id,
      userName: user.name,
      userRole: user.role,
      orderId: order._id,
      orderNumber: order.orderNumber,
      orderTotal: order.totalAmount,
      commissionType: 'direct_sale',
      commissionRate: rate,
      commissionAmount,
      tierAtTransaction: user.commissionTier,
      status: 'pending'
    });
  }
  
  /**
   * Hoa hồng team (cấp 1)
   */
  private async calculateTeamCommission(order: IOrder) {
    const user = await User.findById(order.userId).populate('managerId');
    if (!user || !user.managerId) return;
    
    const manager = user.managerId;
    const tier = await CommissionTier.findOne({ name: manager.commissionTier });
    
    const rate = tier.commissionRates.teamSale;
    const commissionAmount = order.totalAmount * (rate / 100);
    
    await CommissionTransaction.create({
      userId: manager._id,
      userName: manager.name,
      userRole: manager.role,
      orderId: order._id,
      orderNumber: order.orderNumber,
      orderTotal: order.totalAmount,
      commissionType: 'team_sale_l1',
      commissionRate: rate,
      commissionAmount,
      sourceUserId: user._id,
      sourceUserName: user.name,
      tierAtTransaction: manager.commissionTier,
      status: 'pending'
    });
  }
  
  /**
   * Kiểm tra và thăng hạng tự động
   */
  private async checkTierPromotion(userId: mongoose.Types.ObjectId) {
    const user = await User.findById(userId);
    if (!user) return;
    
    const currentTier = await CommissionTier.findOne({ name: user.commissionTier });
    const nextTiers = await CommissionTier.find({
      order: { $gt: currentTier.order },
      isActive: true
    }).sort({ order: 1 });
    
    for (const tier of nextTiers) {
      const meetsRequirements = await this.checkTierRequirements(user, tier);
      
      if (meetsRequirements) {
        // Thăng hạng
        user.commissionTier = tier.name;
        user.lastPromotionAt = new Date();
        await user.save();
        
        // Gửi thông báo
        await this.sendPromotionNotification(user, tier);
        
        // Tạo bonus transaction (nếu có)
        if (tier.benefits.monthlyBonus) {
          await CommissionTransaction.create({
            userId: user._id,
            userName: user.name,
            userRole: user.role,
            commissionType: 'kpi_bonus',
            commissionAmount: tier.benefits.monthlyBonus,
            tierAtTransaction: tier.name,
            status: 'pending',
            notes: `Thưởng thăng hạng lên ${tier.displayName}`
          });
        }
        
        break; // Chỉ thăng 1 bậc mỗi lần
      }
    }
  }
  
  /**
   * Kiểm tra điều kiện tier
   */
  private async checkTierRequirements(user: IUser, tier: ICommissionTier): Promise<boolean> {
    const reqs = tier.requirements;
    
    // Kiểm tra doanh số tháng
    if (reqs.minMonthlySales && user.currentMonthSales < reqs.minMonthlySales) {
      return false;
    }
    
    // Kiểm tra số đơn hàng
    if (reqs.minMonthlyOrders && user.currentMonthOrders < reqs.minMonthlyOrders) {
      return false;
    }
    
    // Kiểm tra team size
    if (reqs.minTeamSize) {
      const teamSize = await User.countDocuments({ managerId: user._id, status: 'active' });
      if (teamSize < reqs.minTeamSize) return false;
    }
    
    // Kiểm tra team sales
    if (reqs.minTeamSales) {
      const teamMembers = await User.find({ managerId: user._id });
      const teamSales = teamMembers.reduce((sum, m) => sum + m.currentMonthSales, 0);
      if (teamSales < reqs.minTeamSales) return false;
    }
    
    return true;
  }
  
  /**
   * Cập nhật metrics KPI
   */
  private async updateKPIMetrics(order: IOrder) {
    // Cập nhật cho user
    await User.findByIdAndUpdate(order.userId, {
      $inc: {
        currentMonthSales: order.totalAmount,
        currentMonthOrders: 1,
        totalSales: order.totalAmount,
        totalOrders: 1
      }
    });
    
    // Cập nhật cho team (nếu có)
    const user = await User.findById(order.userId);
    if (user.teamId) {
      await Team.findByIdAndUpdate(user.teamId, {
        $inc: {
          currentMonthSales: order.totalAmount,
          currentMonthOrders: 1,
          totalSales: order.totalAmount,
          totalOrders: 1
        }
      });
    }
    
    // Cập nhật KPI targets
    await this.updateKPITargets(order);
  }
}
```

### 2.2. KPI Service

```typescript
// lib/kpiService.ts

class KPIService {
  
  /**
   * Reset KPI hàng tháng (chạy bằng cron job)
   */
  async resetMonthlyKPI() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    // Reset user metrics
    await User.updateMany({}, {
      currentMonthSales: 0,
      currentMonthOrders: 0
    });
    
    // Reset team metrics
    await Team.updateMany({}, {
      currentMonthSales: 0,
      currentMonthOrders: 0
    });
    
    // Archive old KPI targets
    await KPITarget.updateMany(
      { year, month: month - 1, status: 'active' },
      { status: 'completed' }
    );
    
    // Create new monthly targets từ templates
    await this.createMonthlyTargets(year, month);
  }
  
  /**
   * Tạo KPI targets cho tháng mới
   */
  async createMonthlyTargets(year: number, month: number) {
    // Tạo target cho từng tier
    const tiers = await CommissionTier.find({ isActive: true });
    
    for (const tier of tiers) {
      await KPITarget.create({
        year,
        month,
        targetType: 'tier',
        tierName: tier.name,
        targets: {
          salesTarget: tier.requirements.minMonthlySales,
          ordersTarget: tier.requirements.minMonthlyOrders,
        },
        rewards: {
          bonusAmount: tier.benefits.monthlyBonus,
          promotionToTier: this.getNextTier(tier.name)
        },
        status: 'active'
      });
    }
  }
  
  /**
   * Báo cáo KPI cho user
   */
  async getUserKPIReport(userId: string, year: number, month: number) {
    const user = await User.findById(userId);
    const target = await KPITarget.findOne({
      targetType: 'user',
      targetId: userId,
      year,
      month
    });
    
    return {
      user: {
        name: user.name,
        tier: user.commissionTier,
        currentSales: user.currentMonthSales,
        currentOrders: user.currentMonthOrders
      },
      target: target ? {
        salesTarget: target.targets.salesTarget,
        ordersTarget: target.targets.ordersTarget,
        salesProgress: (user.currentMonthSales / target.targets.salesTarget) * 100,
        ordersProgress: (user.currentMonthOrders / target.targets.ordersTarget) * 100,
        isAchieved: target.isAchieved
      } : null,
      nextTier: await this.getNextTierInfo(user.commissionTier),
      teamPerformance: await this.getTeamPerformance(userId)
    };
  }
}
```

---

## 🎨 Phase 3: Admin UI (Tuần 5-6)

### 3.1. Commission Tiers Management

**Trang:** `/admin/commission/tiers`

Chức năng:
- List tất cả tiers
- CRUD operations
- Drag & drop để sắp xếp order
- Preview badge/icon
- Thiết lập requirements & rewards

### 3.2. User Commission Settings

**Trang:** `/admin/users/[id]/commission`

Chức năng:
- Xem tier hiện tại
- Override commission cá nhân
- Xem lịch sử thăng hạng
- Xem danh sách team members
- Gán vào team
- Xem KPI performance

### 3.3. Commission Transactions

**Trang:** `/admin/commission/transactions`

Chức năng:
- List tất cả transactions
- Filter: status, type, user, date range
- Bulk approve
- Export to Excel
- Payment processing

### 3.4. KPI Management

**Trang:** `/admin/kpi`

Chức năng:
- Xem tổng quan KPI tháng
- Leaderboard
- Create/edit targets
- Track progress
- Send notifications

---

## 👤 Phase 4: User Dashboard (Tuần 7)

### 4.1. My Commission Dashboard

**Trang:** `/dashboard/commission`

Widgets:
- Current tier badge
- This month earnings
- Pending commissions
- Team performance
- Progress to next tier
- Transaction history

### 4.2. My Team

**Trang:** `/dashboard/team`

Chức năng:
- List team members
- Invite new members (referral link)
- View team sales
- Team leaderboard

---

## 🔄 Phase 5: Automation & Cron Jobs (Tuần 8)

### 5.1. Daily Jobs

- Update KPI metrics
- Check tier promotions
- Send performance notifications

### 5.2. Monthly Jobs

- Reset monthly KPI
- Generate commission reports
- Process payments
- Archive old data

### 5.3. Weekly Jobs

- Send performance summary
- Leaderboard updates
- Team notifications

---

## 📊 Phase 6: Reports & Analytics (Tuần 9-10)

### 6.1. Commission Reports

- Total commissions paid
- By tier breakdown
- By user/team
- Trend analysis

### 6.2. KPI Reports

- Achievement rates
- Top performers
- Team comparisons
- Growth metrics

### 6.3. Export Features

- Excel export
- PDF reports
- Email schedules

---

## 🚀 Implementation Priority

### Priority 1 (Must Have - Phase 1-3)
✅ Database schema
✅ Basic commission calculation
✅ Tier management
✅ User commission settings
✅ Transaction management

### Priority 2 (Should Have - Phase 4-5)
- User dashboard
- Team management
- Automated tier promotion
- Cron jobs
- Notifications

### Priority 3 (Nice to Have - Phase 6)
- Advanced analytics
- Custom reports
- Predictive analytics
- Gamification features

---

## 🔧 Technical Stack

**Backend:**
- Next.js API Routes
- MongoDB + Mongoose
- Node-cron (scheduled jobs)

**Frontend:**
- React/Next.js
- Recharts (charts)
- Tailwind CSS
- Framer Motion (animations)

**Additional:**
- Bull Queue (job processing)
- Redis (caching)
- SendGrid (notifications)

---

## 📱 API Endpoints

### Commission Management

```
POST   /api/commission/calculate          - Calculate commission for order
GET    /api/commission/transactions       - List transactions
PATCH  /api/commission/transactions/:id   - Update transaction status
POST   /api/commission/bulk-approve       - Bulk approve
GET    /api/commission/stats              - Commission statistics
```

### Tier Management

```
GET    /api/commission/tiers              - List tiers
POST   /api/commission/tiers              - Create tier
PUT    /api/commission/tiers/:id          - Update tier
DELETE /api/commission/tiers/:id          - Delete tier
POST   /api/commission/tiers/reorder      - Reorder tiers
```

### KPI Management

```
GET    /api/kpi/targets                   - List targets
POST   /api/kpi/targets                   - Create target
GET    /api/kpi/report/:userId            - User KPI report
GET    /api/kpi/leaderboard               - Leaderboard
POST   /api/kpi/reset-monthly             - Reset monthly KPI
```

### User/Team

```
GET    /api/users/:id/commission          - User commission info
PATCH  /api/users/:id/commission          - Update commission settings
GET    /api/users/:id/team                - User's team
POST   /api/teams                         - Create team
GET    /api/teams/:id/members             - Team members
```

---

## ⚠️ Considerations

1. **Security:**
   - Role-based access control
   - Audit logs cho mọi thay đổi commission
   - Prevent manual manipulation

2. **Performance:**
   - Index cho queries
   - Cache tier data
   - Batch processing cho bulk operations

3. **Scalability:**
   - Queue system cho commission calculation
   - Separate DB cho historical data
   - Sharding nếu cần

4. **Data Integrity:**
   - Transaction locks
   - Validation rules
   - Rollback mechanisms

5. **User Experience:**
   - Real-time updates
   - Progress notifications
   - Mobile responsive

---

## 📈 Success Metrics

- Commission calculation accuracy: 100%
- Auto-promotion success rate: >95%
- KPI achievement rate
- User engagement (dashboard visits)
- Team growth rate
- System uptime: 99.9%

---

## 🎯 Next Steps

1. **Review & Approve Plan** ← YOU ARE HERE
2. Create database migrations
3. Implement core services
4. Build admin UI
5. Testing & QA
6. User training
7. Phased rollout

---

## 📝 Notes

- Hệ thống này có thể customize theo nghiệp vụ cụ thể
- Có thể thêm nhiều levels hơn (L3, L4...)
- Có thể tích hợp với hệ thống ERP nếu cần
- Cần legal review cho cơ chế đa cấp (tùy khu vực)
