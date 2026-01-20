'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface StaffStats {
    totalCommission: number;
    walletBalance: number;
    totalCollaborators: number;
    totalOrders: number;
    teamRevenue: number;
    pendingCommission: number;
    thisMonthRevenue: number;
    lastMonthRevenue: number;
    commissionData: { date: string; commission: number }[];
    recentCollaborators: {
        id: string;
        name: string;
        code: string;
        orders: number;
        revenue: number;
        status: 'active' | 'inactive';
        createdAt: string;
    }[];
}

export default function StaffDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState<StaffStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'earnings'>('overview');

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/staff/stats');
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            } else {
                setStats(mockStats);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
            setStats(mockStats);
        } finally {
            setLoading(false);
        }
    };

    const mockStats: StaffStats = {
        totalCommission: 2500000,
        walletBalance: 1200000,
        totalCollaborators: 5,
        totalOrders: 42,
        teamRevenue: 25000000,
        pendingCommission: 350000,
        thisMonthRevenue: 8500000,
        lastMonthRevenue: 7200000,
        commissionData: [
            { date: '13/01', commission: 180000 },
            { date: '14/01', commission: 320000 },
            { date: '15/01', commission: 280000 },
            { date: '16/01', commission: 450000 },
            { date: '17/01', commission: 380000 },
            { date: '18/01', commission: 520000 },
            { date: '19/01', commission: 410000 },
        ],
        recentCollaborators: [
            { id: '1', name: 'Nguyen Thi Huong', code: 'NV001-CTV1', orders: 15, revenue: 12500000, status: 'active', createdAt: '2026-01-10' },
            { id: '2', name: 'Tran Van Minh', code: 'NV001-CTV2', orders: 8, revenue: 5200000, status: 'active', createdAt: '2026-01-12' },
            { id: '3', name: 'Le Thi Lan', code: 'NV001-CTV3', orders: 12, revenue: 9800000, status: 'inactive', createdAt: '2026-01-15' },
        ]
    };

    const displayStats = stats || mockStats;
    const referralCode = (user as any)?.referralCode || (user as any)?.staffCode || 'STAFF001';
    const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price);
    const formatDate = (date: string) => new Date(date).toLocaleDateString('vi-VN');

    const copyLink = () => {
        const link = `${window.location.origin}?ref=${referralCode}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const growthPercent = displayStats.lastMonthRevenue > 0 
        ? Math.round(((displayStats.thisMonthRevenue - displayStats.lastMonthRevenue) / displayStats.lastMonthRevenue) * 100)
        : 0;

    // Calculate max for chart
    const maxCommission = Math.max(...displayStats.commissionData.map(d => d.commission));

    if (loading) {
        return (
            <div className="staff-dashboard">
                <div className="staff-loading">
                    <div className="staff-loading-spinner"></div>
                    <p>Dang tai du lieu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="staff-dashboard">
            {/* Top Navigation */}
            <div className="staff-topbar">
                <div className="staff-topbar-left">
                    <div className="staff-avatar">
                        {user?.name?.charAt(0) || 'S'}
                    </div>
                    <div className="staff-user-info">
                        <span className="staff-greeting">Xin chao</span>
                        <h2 className="staff-username">{user?.name || 'Nhan vien'}</h2>
                    </div>
                </div>
                <div className="staff-topbar-right">
                    <button onClick={fetchStats} className="staff-refresh-btn">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Referral Code Banner */}
            <div className="staff-referral-banner">
                <div className="staff-referral-content">
                    <div className="staff-referral-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                        </svg>
                    </div>
                    <div className="staff-referral-info">
                        <span className="staff-referral-label">Ma gioi thieu cua ban</span>
                        <span className="staff-referral-code">{referralCode}</span>
                    </div>
                </div>
                <button onClick={copyLink} className={`staff-copy-btn ${copied ? 'copied' : ''}`}>
                    {copied ? 'Da sao chep!' : 'Sao chep link'}
                </button>
            </div>

            {/* Stats Grid - New Design */}
            <div className="staff-stats-grid">
                <div className="staff-stat-card stat-wallet">
                    <div className="staff-stat-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
                            <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
                            <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z"/>
                        </svg>
                    </div>
                    <div className="staff-stat-content">
                        <span className="staff-stat-value">{formatPrice(displayStats.walletBalance)}d</span>
                        <span className="staff-stat-label">So du vi</span>
                    </div>
                    <div className="staff-stat-badge positive">+12%</div>
                </div>

                <div className="staff-stat-card stat-commission">
                    <div className="staff-stat-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="1" x2="12" y2="23"/>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                        </svg>
                    </div>
                    <div className="staff-stat-content">
                        <span className="staff-stat-value">{formatPrice(displayStats.totalCommission)}d</span>
                        <span className="staff-stat-label">Tong hoa hong</span>
                    </div>
                    <div className="staff-stat-badge positive">+8%</div>
                </div>

                <div className="staff-stat-card stat-team">
                    <div className="staff-stat-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                    </div>
                    <div className="staff-stat-content">
                        <span className="staff-stat-value">{displayStats.totalCollaborators}</span>
                        <span className="staff-stat-label">Cong tac vien</span>
                    </div>
                    <Link href="/staff/collaborators" className="staff-stat-link">Quan ly →</Link>
                </div>

                <div className="staff-stat-card stat-orders">
                    <div className="staff-stat-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="9" cy="21" r="1"/>
                            <circle cx="20" cy="21" r="1"/>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                        </svg>
                    </div>
                    <div className="staff-stat-content">
                        <span className="staff-stat-value">{displayStats.totalOrders}</span>
                        <span className="staff-stat-label">Don hang team</span>
                    </div>
                    <div className="staff-stat-badge positive">+5</div>
                </div>
            </div>

            {/* Revenue Overview Card */}
            <div className="staff-revenue-card">
                <div className="staff-revenue-header">
                    <h3>Doanh thu thang nay</h3>
                    <span className={`staff-growth ${growthPercent >= 0 ? 'positive' : 'negative'}`}>
                        {growthPercent >= 0 ? '↑' : '↓'} {Math.abs(growthPercent)}% so voi thang truoc
                    </span>
                </div>
                <div className="staff-revenue-amount">
                    {formatPrice(displayStats.thisMonthRevenue)}d
                </div>
                <div className="staff-revenue-chart">
                    {displayStats.commissionData.map((item, index) => (
                        <div key={index} className="staff-chart-bar-wrapper">
                            <div 
                                className="staff-chart-bar"
                                style={{ height: `${(item.commission / maxCommission) * 100}%` }}
                            >
                                <span className="staff-chart-tooltip">{formatPrice(item.commission)}d</span>
                            </div>
                            <span className="staff-chart-label">{item.date}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Team Revenue Summary */}
            <div className="staff-team-revenue">
                <div className="staff-team-revenue-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                        <polyline points="17 6 23 6 23 12"/>
                    </svg>
                </div>
                <div className="staff-team-revenue-info">
                    <span className="staff-team-revenue-label">Tong doanh thu doi nhom</span>
                    <span className="staff-team-revenue-value">{formatPrice(displayStats.teamRevenue)}d</span>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="staff-actions">
                <h3 className="staff-section-title">Thao tac nhanh</h3>
                <div className="staff-actions-grid">
                    <Link href="/staff/collaborators?action=create" className="staff-action-card action-primary">
                        <div className="staff-action-icon">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                <circle cx="8.5" cy="7" r="4"/>
                                <line x1="20" y1="8" x2="20" y2="14"/>
                                <line x1="23" y1="11" x2="17" y2="11"/>
                            </svg>
                        </div>
                        <span className="staff-action-text">Tao CTV moi</span>
                    </Link>

                    <Link href="/staff/commissions" className="staff-action-card action-success">
                        <div className="staff-action-icon">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                                <line x1="1" y1="10" x2="23" y2="10"/>
                            </svg>
                        </div>
                        <span className="staff-action-text">Xem hoa hong</span>
                    </Link>

                    <Link href="/staff/collaborators" className="staff-action-card">
                        <div className="staff-action-icon">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                <circle cx="9" cy="7" r="4"/>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                        </div>
                        <span className="staff-action-text">Quan ly CTV</span>
                    </Link>

                    <Link href="/staff/orders" className="staff-action-card">
                        <div className="staff-action-icon">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                                <line x1="16" y1="13" x2="8" y2="13"/>
                                <line x1="16" y1="17" x2="8" y2="17"/>
                            </svg>
                        </div>
                        <span className="staff-action-text">Don hang</span>
                    </Link>
                </div>
            </div>

            {/* Collaborators List */}
            <div className="staff-collaborators">
                <div className="staff-collaborators-header">
                    <h3 className="staff-section-title">Cong tac vien</h3>
                    <Link href="/staff/collaborators" className="staff-view-all">Xem tat ca →</Link>
                </div>

                {displayStats.recentCollaborators.length === 0 ? (
                    <div className="staff-empty-state">
                        <div className="staff-empty-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                <circle cx="9" cy="7" r="4"/>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                        </div>
                        <p>Chua co cong tac vien nao</p>
                        <Link href="/staff/collaborators?action=create" className="staff-create-btn">
                            + Tao CTV dau tien
                        </Link>
                    </div>
                ) : (
                    <div className="staff-collaborators-list">
                        {displayStats.recentCollaborators.map((collab) => (
                            <div key={collab.id} className="staff-collaborator-item">
                                <div className="staff-collaborator-avatar">
                                    {collab.name.charAt(0)}
                                </div>
                                <div className="staff-collaborator-info">
                                    <span className="staff-collaborator-name">{collab.name}</span>
                                    <span className="staff-collaborator-code">{collab.code}</span>
                                </div>
                                <div className="staff-collaborator-stats">
                                    <div className="staff-collaborator-stat">
                                        <span className="staff-collaborator-stat-value">{collab.orders}</span>
                                        <span className="staff-collaborator-stat-label">don</span>
                                    </div>
                                    <div className="staff-collaborator-stat">
                                        <span className="staff-collaborator-stat-value">{formatPrice(collab.revenue)}d</span>
                                        <span className="staff-collaborator-stat-label">doanh thu</span>
                                    </div>
                                </div>
                                <span className={`staff-collaborator-status ${collab.status}`}>
                                    {collab.status === 'active' ? 'Hoat dong' : 'Tam dung'}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style jsx>{`
                .staff-dashboard {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                    background: #f8f6f3;
                    min-height: 100vh;
                }

                .staff-loading {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 60vh;
                    gap: 16px;
                    color: #9C7043;
                }

                .staff-loading-spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid #E3C88D;
                    border-top-color: #9C7043;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                /* Top Bar */
                .staff-topbar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 20px;
                }

                .staff-topbar-left {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .staff-avatar {
                    width: 48px;
                    height: 48px;
                    background: linear-gradient(135deg, #9C7043, #E3C88D);
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 700;
                    font-size: 18px;
                }

                .staff-user-info {
                    display: flex;
                    flex-direction: column;
                }

                .staff-greeting {
                    font-size: 12px;
                    color: #888;
                }

                .staff-username {
                    font-size: 18px;
                    font-weight: 700;
                    color: #333;
                    margin: 0;
                }

                .staff-refresh-btn {
                    width: 42px;
                    height: 42px;
                    background: white;
                    border: none;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: #666;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
                    transition: all 0.2s;
                }

                .staff-refresh-btn:hover {
                    background: #9C7043;
                    color: white;
                }

                /* Referral Banner */
                .staff-referral-banner {
                    background: linear-gradient(135deg, #9C7043 0%, #B8956F 50%, #E3C88D 100%);
                    border-radius: 16px;
                    padding: 16px 20px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 16px;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                }

                .staff-referral-content {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .staff-referral-icon {
                    width: 44px;
                    height: 44px;
                    background: rgba(255,255,255,0.2);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                }

                .staff-referral-info {
                    display: flex;
                    flex-direction: column;
                }

                .staff-referral-label {
                    font-size: 12px;
                    color: rgba(255,255,255,0.8);
                }

                .staff-referral-code {
                    font-size: 18px;
                    font-weight: 700;
                    color: white;
                    font-family: monospace;
                }

                .staff-copy-btn {
                    padding: 10px 20px;
                    background: white;
                    border: none;
                    border-radius: 10px;
                    font-weight: 600;
                    color: #9C7043;
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                }

                .staff-copy-btn:hover {
                    transform: scale(1.02);
                }

                .staff-copy-btn.copied {
                    background: #10b981;
                    color: white;
                }

                /* Stats Grid */
                .staff-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                    margin-bottom: 20px;
                }

                .staff-stat-card {
                    background: white;
                    border-radius: 16px;
                    padding: 16px;
                    position: relative;
                    box-shadow: 0 2px 12px rgba(0,0,0,0.04);
                }

                .staff-stat-icon {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 12px;
                }

                .stat-wallet .staff-stat-icon { background: #d1fae5; color: #059669; }
                .stat-commission .staff-stat-icon { background: #fef3c7; color: #9C7043; }
                .stat-team .staff-stat-icon { background: #ede9fe; color: #7c3aed; }
                .stat-orders .staff-stat-icon { background: #ffedd5; color: #ea580c; }

                .staff-stat-content {
                    display: flex;
                    flex-direction: column;
                }

                .staff-stat-value {
                    font-size: 20px;
                    font-weight: 800;
                    color: #1f2937;
                }

                .staff-stat-label {
                    font-size: 13px;
                    color: #6b7280;
                    margin-top: 2px;
                }

                .staff-stat-badge {
                    position: absolute;
                    top: 16px;
                    right: 16px;
                    padding: 4px 8px;
                    border-radius: 8px;
                    font-size: 11px;
                    font-weight: 600;
                }

                .staff-stat-badge.positive {
                    background: #d1fae5;
                    color: #059669;
                }

                .staff-stat-link {
                    display: inline-block;
                    margin-top: 8px;
                    font-size: 13px;
                    color: #7c3aed;
                    font-weight: 600;
                    text-decoration: none;
                }

                /* Revenue Card */
                .staff-revenue-card {
                    background: white;
                    border-radius: 20px;
                    padding: 20px;
                    margin-bottom: 20px;
                    box-shadow: 0 2px 12px rgba(0,0,0,0.04);
                }

                .staff-revenue-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }

                .staff-revenue-header h3 {
                    font-size: 14px;
                    color: #6b7280;
                    font-weight: 500;
                    margin: 0;
                }

                .staff-growth {
                    font-size: 12px;
                    font-weight: 600;
                    padding: 4px 10px;
                    border-radius: 8px;
                }

                .staff-growth.positive {
                    background: #d1fae5;
                    color: #059669;
                }

                .staff-growth.negative {
                    background: #fee2e2;
                    color: #dc2626;
                }

                .staff-revenue-amount {
                    font-size: 32px;
                    font-weight: 800;
                    color: #1f2937;
                    margin-bottom: 20px;
                }

                .staff-revenue-chart {
                    display: flex;
                    align-items: flex-end;
                    justify-content: space-between;
                    height: 120px;
                    gap: 8px;
                    padding-top: 10px;
                }

                .staff-chart-bar-wrapper {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    height: 100%;
                }

                .staff-chart-bar {
                    width: 100%;
                    max-width: 40px;
                    background: linear-gradient(to top, #9C7043, #E3C88D);
                    border-radius: 6px 6px 0 0;
                    position: relative;
                    cursor: pointer;
                    transition: all 0.2s;
                    margin-top: auto;
                }

                .staff-chart-bar:hover {
                    opacity: 0.8;
                }

                .staff-chart-tooltip {
                    display: none;
                    position: absolute;
                    bottom: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #1f2937;
                    color: white;
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-size: 11px;
                    white-space: nowrap;
                    margin-bottom: 4px;
                }

                .staff-chart-bar:hover .staff-chart-tooltip {
                    display: block;
                }

                .staff-chart-label {
                    font-size: 11px;
                    color: #9ca3af;
                    margin-top: 8px;
                }

                /* Team Revenue */
                .staff-team-revenue {
                    background: linear-gradient(135deg, #1f2937, #374151);
                    border-radius: 16px;
                    padding: 20px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: 20px;
                }

                .staff-team-revenue-icon {
                    width: 56px;
                    height: 56px;
                    background: linear-gradient(135deg, #E3C88D, #9C7043);
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                }

                .staff-team-revenue-info {
                    display: flex;
                    flex-direction: column;
                }

                .staff-team-revenue-label {
                    font-size: 13px;
                    color: #9ca3af;
                }

                .staff-team-revenue-value {
                    font-size: 26px;
                    font-weight: 800;
                    background: linear-gradient(90deg, #E3C88D, #fbbf24);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                /* Actions */
                .staff-actions {
                    margin-bottom: 20px;
                }

                .staff-section-title {
                    font-size: 16px;
                    font-weight: 700;
                    color: #1f2937;
                    margin: 0 0 12px 0;
                }

                .staff-actions-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                }

                .staff-action-card {
                    background: white;
                    border-radius: 14px;
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                    text-decoration: none;
                    transition: all 0.2s;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                }

                .staff-action-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(0,0,0,0.1);
                }

                .staff-action-card.action-primary {
                    background: linear-gradient(135deg, #9C7043, #B8956F);
                }

                .staff-action-card.action-primary .staff-action-icon,
                .staff-action-card.action-primary .staff-action-text {
                    color: white;
                }

                .staff-action-card.action-success {
                    background: linear-gradient(135deg, #059669, #10b981);
                }

                .staff-action-card.action-success .staff-action-icon,
                .staff-action-card.action-success .staff-action-text {
                    color: white;
                }

                .staff-action-icon {
                    width: 48px;
                    height: 48px;
                    background: #f3f4f6;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #4b5563;
                }

                .staff-action-card.action-primary .staff-action-icon,
                .staff-action-card.action-success .staff-action-icon {
                    background: rgba(255,255,255,0.2);
                }

                .staff-action-text {
                    font-size: 13px;
                    font-weight: 600;
                    color: #374151;
                }

                /* Collaborators */
                .staff-collaborators {
                    background: white;
                    border-radius: 20px;
                    padding: 20px;
                    box-shadow: 0 2px 12px rgba(0,0,0,0.04);
                }

                .staff-collaborators-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                }

                .staff-view-all {
                    font-size: 13px;
                    color: #9C7043;
                    font-weight: 600;
                    text-decoration: none;
                }

                .staff-empty-state {
                    text-align: center;
                    padding: 40px 20px;
                }

                .staff-empty-icon {
                    width: 80px;
                    height: 80px;
                    background: #fef3c7;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 16px;
                    color: #9C7043;
                }

                .staff-empty-state p {
                    color: #6b7280;
                    margin-bottom: 16px;
                }

                .staff-create-btn {
                    display: inline-block;
                    padding: 12px 24px;
                    background: #9C7043;
                    color: white;
                    border-radius: 12px;
                    font-weight: 600;
                    text-decoration: none;
                    transition: all 0.2s;
                }

                .staff-create-btn:hover {
                    background: #7d5a36;
                }

                .staff-collaborators-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .staff-collaborator-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    background: #f9fafb;
                    border-radius: 12px;
                    transition: all 0.2s;
                }

                .staff-collaborator-item:hover {
                    background: #f3f4f6;
                }

                .staff-collaborator-avatar {
                    width: 44px;
                    height: 44px;
                    background: linear-gradient(135deg, #9C7043, #E3C88D);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 700;
                    font-size: 16px;
                    flex-shrink: 0;
                }

                .staff-collaborator-info {
                    flex: 1;
                    min-width: 0;
                }

                .staff-collaborator-name {
                    display: block;
                    font-weight: 600;
                    color: #1f2937;
                    font-size: 14px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .staff-collaborator-code {
                    display: block;
                    font-size: 12px;
                    color: #6b7280;
                    font-family: monospace;
                }

                .staff-collaborator-stats {
                    display: flex;
                    gap: 16px;
                }

                .staff-collaborator-stat {
                    text-align: right;
                }

                .staff-collaborator-stat-value {
                    display: block;
                    font-weight: 700;
                    color: #059669;
                    font-size: 13px;
                }

                .staff-collaborator-stat-label {
                    font-size: 11px;
                    color: #9ca3af;
                }

                .staff-collaborator-status {
                    padding: 4px 10px;
                    border-radius: 8px;
                    font-size: 11px;
                    font-weight: 600;
                    flex-shrink: 0;
                }

                .staff-collaborator-status.active {
                    background: #d1fae5;
                    color: #059669;
                }

                .staff-collaborator-status.inactive {
                    background: #f3f4f6;
                    color: #6b7280;
                }

                /* Responsive */
                @media (max-width: 480px) {
                    .staff-dashboard {
                        padding: 16px;
                    }

                    .staff-stats-grid {
                        grid-template-columns: 1fr;
                    }

                    .staff-referral-banner {
                        flex-direction: column;
                        align-items: stretch;
                    }

                    .staff-copy-btn {
                        width: 100%;
                        text-align: center;
                    }

                    .staff-collaborator-stats {
                        display: none;
                    }

                    .staff-revenue-amount {
                        font-size: 26px;
                    }
                }
            `}</style>
        </div>
    );
}
