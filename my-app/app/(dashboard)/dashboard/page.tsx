import { getDashboardAnalytics } from "@/app/actions/dashboard";
import { AlertCircle } from "lucide-react";

const CUISINE_COLORS = [
  "bg-[#D4AF37]",
  "bg-[#22C55E]",
  "bg-[#3B82F6]",
  "bg-[#EF4444]",
  "bg-[#8B5CF6]",
  "bg-[#6366F1]",
];

function formatCurrency(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}k`;
  return `₹${value}`;
}

export default async function DashboardView() {
  const result = await getDashboardAnalytics();

  if (!result.success || !result.data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-red-50 rounded-2xl border border-red-200 mt-10">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-red-700">Failed to load dashboard</h2>
        <p className="text-red-600/80 mt-2 text-center max-w-md">
          {result.error || "An unknown error occurred while fetching analytics."}
        </p>
      </div>
    );
  }

  const {
    totalRevenue,
    activeChefs,
    totalChefs,
    avgBookingValue,
    pendingApproval,
    monthlyBookings,
    peakMonth,
    avgPerMonth,
    ytdTotal,
    cuisineBreakdown,
    locationBreakdown,
    memberStats,
    recentActivity,
  } = result.data;

  const maxBar = Math.max(...monthlyBookings.map((b) => b.value), 1);

  return (
    <div className="bg-[#eeefef] min-h-screen">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
        <div className="bg-white rounded-xl border-2 border-[#d3dbe2] p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500"></div>
          <p className="text-[11px] font-medium text-gray-500 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-800">{formatCurrency(totalRevenue)}</p>
          <p className="text-[10px] text-gray-500 mt-1">from all bookings</p>
        </div>
        <div className="bg-white rounded-xl border-2 border-[#d3dbe2] p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500"></div>
          <p className="text-[11px] font-medium text-gray-500 mb-1">Active Chef</p>
          <p className="text-2xl font-bold text-gray-800">{activeChefs}</p>
          <p className="text-[10px] text-gray-500 mt-1">of {totalChefs} total</p>
        </div>
        <div className="bg-white rounded-xl border-2 border-[#d3dbe2] p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-700"></div>
          <p className="text-[11px] font-medium text-gray-500 mb-1">Avg. booking value</p>
          <p className="text-2xl font-bold text-gray-800">{formatCurrency(avgBookingValue)}</p>
          <p className="text-[10px] text-gray-500 mt-1">per booking</p>
        </div>
        <div className="bg-white rounded-xl border-2 border-[#d3dbe2] p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-red-600"></div>
          <p className="text-[11px] font-medium text-gray-500 mb-1">Pending approval</p>
          <p className="text-2xl font-bold text-gray-800">{pendingApproval}</p>
          <p className="text-[10px] text-gray-500 mt-1">need attention</p>
        </div>
      </div>

      {/* Main Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Middle Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Main Chart Card */}
          <div className="bg-white rounded-xl border-2 border-[#d3dbe2] p-6">
            <h2 className="text-sm font-bold text-gray-800">Monthly bookings</h2>
            <p className="text-[11px] font-medium text-gray-500 mb-8">
              Jan – Dec {new Date().getFullYear()}
            </p>

            {/* Chart */}
            <div className="flex items-end justify-between h-40 px-2 gap-3 md:gap-6 mt-4">
              {monthlyBookings.map((bar, i) => {
                const heightPx = maxBar > 0 ? Math.max((bar.value / maxBar) * 140, bar.value > 0 ? 6 : 3) : 3;
                return (
                  <div key={i} className="flex flex-col items-center flex-1">
                    <span className="text-[10px] font-medium text-gray-600 mb-2">
                      {bar.value || ""}
                    </span>
                    <div
                      className="w-full max-w-[40px] bg-[#FDBA74] rounded-t-md transition-all"
                      style={{ height: `${heightPx}px` }}
                    ></div>
                    <span className="text-[10px] font-medium text-gray-600 mt-2">
                      {bar.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Chart Summary */}
            <div className="flex gap-12 mt-8 pt-5 text-left border-t border-gray-100">
              <div>
                <p className="text-[10px] font-medium text-gray-500">Peak Month</p>
                <p className="text-xs font-bold text-gray-900 mt-1">{peakMonth}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium text-gray-500">Avg/Month</p>
                <p className="text-xs font-bold text-gray-900 mt-1">
                  {avgPerMonth.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-medium text-gray-500">YTD Total</p>
                <p className="text-xs font-bold text-gray-900 mt-1">
                  {ytdTotal.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Split Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cuisine Card */}
            <div className="bg-white rounded-xl border-2 border-[#d3dbe2] p-6">
              <h2 className="text-[13px] font-bold text-gray-800">Bookings by occasion</h2>
              <p className="text-[10px] font-medium text-gray-500 mb-6">By booking count</p>
              <div className="space-y-4">
                {cuisineBreakdown.length > 0 ? (
                  cuisineBreakdown.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-20 shrink-0 text-[11px] text-gray-600 font-medium">
                        {item.label}
                      </span>
                      <div className="flex-1 h-1.5 bg-[#EAEBEB] relative rounded-full">
                        <div
                          className={`absolute top-0 bottom-0 left-0 rounded-full ${CUISINE_COLORS[i % CUISINE_COLORS.length]}`}
                          style={{ width: `${item.pct}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-gray-400 w-8 text-right font-medium">
                        {item.pct}%
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 text-center py-4">No booking data yet</p>
                )}
              </div>
            </div>

            {/* Location Card */}
            <div className="bg-white rounded-xl border-2 border-[#d3dbe2] p-6">
              <h2 className="text-[13px] font-bold text-gray-800">Bookings by Location</h2>
              <p className="text-[10px] font-medium text-gray-500 mb-6">By booking count</p>
              <div className="space-y-4">
                {locationBreakdown.length > 0 ? (
                  locationBreakdown.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-20 shrink-0 text-[11px] text-gray-600 font-medium">
                        {item.label}
                      </span>
                      <div className="flex-1 h-1.5 bg-[#EAEBEB] relative rounded-full">
                        <div
                          className={`absolute top-0 bottom-0 left-0 rounded-full ${CUISINE_COLORS[i % CUISINE_COLORS.length]}`}
                          style={{ width: `${item.pct}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-gray-400 w-8 text-right font-medium">
                        {item.pct}%
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 text-center py-4">No booking data yet</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Member Activity */}
          <div className="bg-white rounded-xl border-2 border-[#d3dbe2] p-6">
            <h2 className="text-sm font-bold text-gray-800">Member Activity</h2>
            <p className="text-[11px] font-medium text-gray-500 mb-5">Chef lifecycle stats</p>

            <div className="flex flex-col">
              <div className="flex justify-between py-3 border-b border-gray-100/60">
                <span className="text-[11px] font-medium text-gray-600">Added this month</span>
                <span className="text-[11px] font-bold text-gray-800">
                  {memberStats.addedThisMonth}
                </span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100/60">
                <span className="text-[11px] font-medium text-gray-600">On hold</span>
                <span className="text-[11px] font-bold text-gray-800">
                  {memberStats.onHold}
                </span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100/60">
                <span className="text-[11px] font-medium text-gray-600">Pending approval</span>
                <span className="text-[11px] font-bold text-gray-800">{pendingApproval}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-[11px] font-medium text-gray-600">Active Total</span>
                <span className="text-[11px] font-bold text-emerald-600">
                  {memberStats.activeTotal}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border-2 border-[#d3dbe2] p-6 flex-1">
            <h2 className="text-sm font-bold text-gray-800 mb-5">Recent activity</h2>

            <div className="flex flex-col">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, i) => (
                  <div
                    key={i}
                    className="py-3.5 border-b border-gray-100/60 last:border-0 hover:bg-gray-50/50 transition-colors"
                  >
                    <p className="text-[11px] font-medium text-gray-800">{activity.text}</p>
                    <p className="text-[10px] font-medium text-gray-400 mt-1">{activity.time}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 text-center py-8">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
