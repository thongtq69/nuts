import { BetaAnalyticsDataClient } from '@google-analytics/data';
import {
    Users,
    Eye,
    Clock,
    Laptop2,
    AlertCircle,
    Globe,
    Search,
    Monitor,
    Smartphone,
    Tablet,
    ArrowUpRight,
    MapPin,
    Navigation,
    Layers
} from 'lucide-react';

const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
const credentialsStr = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

let analyticsDataClient: BetaAnalyticsDataClient | null = null;

if (propertyId && credentialsStr) {
    try {
        let cleanStr = credentialsStr.trim();
        if (cleanStr.startsWith("'") && cleanStr.endsWith("'")) cleanStr = cleanStr.slice(1, -1);
        if (cleanStr.startsWith('"') && cleanStr.endsWith('"')) cleanStr = cleanStr.slice(1, -1);

        const credentials = JSON.parse(cleanStr);
        if (credentials.private_key) {
            credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
        }

        analyticsDataClient = new BetaAnalyticsDataClient({ credentials });
    } catch (e) {
        console.error("Invalid GA4 Credentials", e);
    }
}

async function fetchGA4DetailedData() {
    if (!analyticsDataClient || !propertyId) return null;

    try {
        // 1. Overview Metrics
        const [overviewResponse] = await analyticsDataClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }],
            metrics: [
                { name: 'activeUsers' },
                { name: 'screenPageViews' },
                { name: 'averageSessionDuration' },
                { name: 'bounceRate' }
            ],
        });

        // 2. Top Pages
        const [pagesResponse] = await analyticsDataClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }],
            dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
            metrics: [{ name: 'screenPageViews' }],
            limit: 10,
        });

        // 3. Traffic Sources
        const [sourceResponse] = await analyticsDataClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }],
            dimensions: [{ name: 'sessionSource' }],
            metrics: [{ name: 'activeUsers' }],
            limit: 5,
        });

        // 4. Device Categories
        const [deviceResponse] = await analyticsDataClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }],
            dimensions: [{ name: 'deviceCategory' }],
            metrics: [{ name: 'activeUsers' }],
        });

        // 5. Geographic (City)
        const [geoResponse] = await analyticsDataClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }],
            dimensions: [{ name: 'city' }],
            metrics: [{ name: 'activeUsers' }],
            limit: 5,
        });

        const metrics = overviewResponse.rows?.[0]?.metricValues || [];

        return {
            overview: {
                activeUsers: metrics[0]?.value || '0',
                pageViews: metrics[1]?.value || '0',
                avgDuration: metrics[2]?.value ? Math.floor(parseFloat(metrics[2].value) / 60) + 'm ' + (parseFloat(metrics[2].value) % 60).toFixed(0) + 's' : '0s',
                bounceRate: metrics[3]?.value ? (parseFloat(metrics[3].value) * 100).toFixed(1) + '%' : '0%',
            },
            topPages: pagesResponse.rows?.map(row => ({
                path: row.dimensionValues?.[0]?.value,
                title: row.dimensionValues?.[1]?.value,
                views: row.metricValues?.[0]?.value
            })) || [],
            sources: sourceResponse.rows?.map(row => ({
                source: row.dimensionValues?.[0]?.value,
                users: row.metricValues?.[0]?.value
            })) || [],
            devices: deviceResponse.rows?.map(row => ({
                category: row.dimensionValues?.[0]?.value,
                users: row.metricValues?.[0]?.value
            })) || [],
            locations: geoResponse.rows?.map(row => ({
                city: row.dimensionValues?.[0]?.value,
                users: row.metricValues?.[0]?.value
            })) || []
        };
    } catch (e) {
        console.error("GA4 Fetch Detail Error", e);
        return null;
    }
}

export default async function GA4Dashboard() {
    const data = await fetchGA4DetailedData();
    const isMock = !data;

    const display = data || {
        overview: { activeUsers: '1,245', pageViews: '5,842', avgDuration: '1m 24s', bounceRate: '43.2%' },
        topPages: [
            { path: '/', title: 'Trang chủ | Go Nuts', views: '2,450' },
            { path: '/products', title: 'Sản phẩm | Go Nuts', views: '1,120' },
            { path: '/news/macca-uc', title: 'Tác dụng của Macca Úc', views: '450' },
        ],
        sources: [
            { source: 'google', users: '840' },
            { source: '(direct)', users: '310' },
            { source: 'facebook.com', users: '95' },
        ],
        devices: [
            { category: 'mobile', users: '980' },
            { category: 'desktop', users: '240' },
            { category: 'tablet', users: '25' },
        ],
        locations: [
            { city: 'Ho Chi Minh City', users: '520' },
            { city: 'Hanoi', users: '410' },
            { city: 'Da Nang', users: '120' },
        ]
    };

    return (
        <div className="space-y-6">
            {/* Warning if Mock */}
            {isMock && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                    <p className="text-sm font-medium text-amber-800">
                        Đang hiển thị dữ liệu mô phỏng. Hãy cấu hình GA4 đúng cách để xem chi tiết.
                    </p>
                </div>
            )}

            {/* Top Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard title="Người dùng hoạt động" value={display.overview.activeUsers} icon={Users} color="blue" />
                <MetricCard title="Tổng lượt xem trang" value={display.overview.pageViews} icon={Eye} color="emerald" />
                <MetricCard title="Thời gian trung bình" value={display.overview.avgDuration} icon={Clock} color="amber" />
                <MetricCard title="Tỷ lệ thoát" value={display.overview.bounceRate} icon={Layers} color="purple" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Content */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <Navigation className="w-5 h-5 text-slate-400" />
                        <h3 className="text-lg font-bold text-slate-900">Trang được xem nhiều nhất</h3>
                    </div>
                    <div className="space-y-4">
                        {display.topPages.map((page, i) => (
                            <div key={i} className="flex items-center justify-between group">
                                <div className="flex-1 min-w-0 pr-4">
                                    <p className="text-sm font-semibold text-slate-800 truncate">{page.title}</p>
                                    <p className="text-xs text-slate-500 truncate">{page.path}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-black text-slate-900">{page.views}</span>
                                    <p className="text-[10px] text-slate-400 uppercase font-black">Views</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Traffic Grid */}
                <div className="grid grid-cols-1 gap-6">
                    {/* Sources */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <Search className="w-5 h-5 text-slate-400" />
                            <h3 className="text-lg font-bold text-slate-900">Nguồn truy cập</h3>
                        </div>
                        <div className="space-y-3">
                            {display.sources.map((s, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-bold text-slate-700">{s.source}</span>
                                        <span className="text-slate-500">{s.users} users</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                        <div
                                            className="bg-brand h-full rounded-full transition-all duration-1000"
                                            style={{ width: `${(parseInt(s.users as string) / display.sources.reduce((a, b) => a + parseInt(b.users as string), 0)) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Geography & Devices */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-emerald-500" /> Vị trí (TP)
                            </h4>
                            <div className="space-y-3">
                                {display.locations.map((loc, i) => (
                                    <div key={i} className="flex justify-between text-xs">
                                        <span className="font-semibold text-slate-600">{loc.city === '(not set)' ? 'Khác' : loc.city}</span>
                                        <span className="font-black text-slate-900">{loc.users}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Monitor className="w-4 h-4 text-blue-500" /> Thiết bị
                            </h4>
                            <div className="space-y-3">
                                {display.devices.map((d, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            {d.category === 'mobile' ? <Smartphone size={14} /> : d.category === 'desktop' ? <Monitor size={14} /> : <Tablet size={14} />}
                                            <span className="font-semibold text-slate-600 capitalize">{d.category}</span>
                                        </div>
                                        <span className="font-black text-slate-900">{d.users}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ title, value, icon: Icon, color }: any) {
    const colors: any = {
        blue: 'text-blue-600 bg-blue-50',
        emerald: 'text-emerald-600 bg-emerald-50',
        amber: 'text-amber-600 bg-amber-50',
        purple: 'text-purple-600 bg-purple-50',
    };
    return (
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${colors[color]}`}>
                <Icon size={20} />
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
            <h4 className="text-2xl font-black text-slate-900">{value}</h4>
        </div>
    );
}
