import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { Users, Eye, Clock, Laptop2, AlertCircle } from 'lucide-react';

const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
const credentialsStr = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

let analyticsDataClient: BetaAnalyticsDataClient | null = null;

if (propertyId && credentialsStr) {
    try {
        const credentials = JSON.parse(credentialsStr);
        analyticsDataClient = new BetaAnalyticsDataClient({ credentials });
    } catch (e) {
        console.error("Invalid GOOGLE_APPLICATION_CREDENTIALS_JSON format");
    }
}

async function fetchGA4Data() {
    if (!analyticsDataClient || !propertyId) {
        return null; // Return null if not configured
    }

    try {
        const [response] = await analyticsDataClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }],
            metrics: [
                { name: 'activeUsers' },
                { name: 'screenPageViews' },
                { name: 'averageSessionDuration' },
                { name: 'bounceRate' }
            ],
        });

        const row = response.rows?.[0];
        if (!row || !row.metricValues) return null;

        return {
            activeUsers: row.metricValues[0].value,
            pageViews: row.metricValues[1].value,
            avgSessionDuration: row.metricValues[2].value ? parseFloat(row.metricValues[2].value).toFixed(2) + 's' : '0s',
            bounceRate: row.metricValues[3].value ? (parseFloat(row.metricValues[3].value) * 100).toFixed(1) + '%' : '0%',
        };
    } catch (error) {
        console.error("Failed to fetch GA4 data:", error);
        return null;
    }
}

export default async function GA4Dashboard() {
    const gaData = await fetchGA4Data();
    const isMock = !gaData;

    // Dummy data in case credentials are not provided
    const displayData = gaData || {
        activeUsers: '1,245',
        pageViews: '5,842',
        avgSessionDuration: '1m 24s',
        bounceRate: '43.2%',
    };

    return (
        <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mt-8 relative overflow-hidden">
            {isMock && (
                <div className="absolute inset-x-0 top-0 bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center gap-2 justify-center z-10">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-700">
                        Đang hiển thị dữ liệu mẫu. Hãy thiết lập <strong>GOOGLE_ANALYTICS_PROPERTY_ID</strong> và <strong>GOOGLE_APPLICATION_CREDENTIALS_JSON</strong> trong .env.local để xem dữ liệu thật.
                    </span>
                </div>
            )}

            <div className={`mt-4 ${isMock ? 'pt-6' : ''}`}>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Google Analytics (28 ngày qua)</h2>
                        <p className="text-sm text-slate-500">Thống kê lưu lượng truy cập trực tiếp từ GA4</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-3 text-slate-600">
                            <Users className="w-5 h-5 text-blue-500" />
                            <span className="font-semibold">Người dùng HĐ</span>
                        </div>
                        <p className="text-3xl font-black text-slate-900">{displayData.activeUsers}</p>
                    </div>

                    <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-3 text-slate-600">
                            <Eye className="w-5 h-5 text-emerald-500" />
                            <span className="font-semibold">Lượt xem trang</span>
                        </div>
                        <p className="text-3xl font-black text-slate-900">{displayData.pageViews}</p>
                    </div>

                    <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-3 text-slate-600">
                            <Clock className="w-5 h-5 text-amber-500" />
                            <span className="font-semibold">T/G trung bình</span>
                        </div>
                        <p className="text-3xl font-black text-slate-900">{displayData.avgSessionDuration}</p>
                    </div>

                    <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-3 text-slate-600">
                            <Laptop2 className="w-5 h-5 text-purple-500" />
                            <span className="font-semibold">Tỷ lệ thoát</span>
                        </div>
                        <p className="text-3xl font-black text-slate-900">{displayData.bounceRate}</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
