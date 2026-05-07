import { useState, useEffect } from 'react';
import { analytics } from '../api/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from 'recharts';
import {
  Loader2, DollarSign, ShoppingCart, TrendingUp,
} from 'lucide-react';

function StatCard({ label, value, icon: Icon, colour, sub }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 shadow-sm">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex-shrink-0 flex items-center justify-center ${colour}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 uppercase tracking-wide truncate">{label}</p>
        <p className="text-lg sm:text-2xl font-bold text-green-900 truncate">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
  );
}

const fmt = (n) => `₦${Number(n ?? 0).toLocaleString()}`;

export default function AdminAnalyticsPanel() {
  const [period, setPeriod]               = useState('daily');
  const [revenue, setRevenue]             = useState(null);
  const [funnel, setFunnel]               = useState(null);
  const [topProducts, setTopProducts]     = useState([]);
  const [categoryData, setCategoryData]   = useState([]);
  const [paymentHealth, setPaymentHealth] = useState(null);
  const [userGrowth, setUserGrowth]       = useState(null);
  const [loading, setLoading]             = useState(true);
  const [revenueLoading, setRevenueLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      analytics.revenue(period),
      analytics.funnel(30),
      analytics.topProducts(10),
      analytics.categories(),
      analytics.paymentHealth(),
      analytics.userGrowth(30),
    ])
      .then(([rev, fun, prods, cats, pay, ug]) => {
        setRevenue(rev);
        setFunnel(fun);
        setTopProducts(prods ?? []);
        setCategoryData(cats ?? []);
        setPaymentHealth(pay);
        setUserGrowth(ug);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const changePeriod = (p) => {
    setPeriod(p);
    setRevenueLoading(true);
    analytics.revenue(p)
      .then(setRevenue)
      .catch(() => {})
      .finally(() => setRevenueLoading(false));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin text-orange-400" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">

      {/* ── Revenue ──────────────────────────────────────────────── */}
      <section>
        {/* Title + period switcher — stacks on mobile */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="text-base font-semibold text-green-900">Revenue</h2>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg self-start sm:self-auto">
            {['daily', 'weekly', 'monthly'].map(p => (
              <button
                key={p}
                onClick={() => changePeriod(p)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition ${
                  period === p
                    ? 'bg-white text-green-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Stat cards — 1 col on mobile, 3 on sm+ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-5">
          <StatCard label="Total Revenue"   value={fmt(revenue?.totalRevenue)}  icon={DollarSign}   colour="bg-green-600" />
          <StatCard label="Total Orders"    value={revenue?.totalOrders ?? 0}    icon={ShoppingCart} colour="bg-blue-500" />
          <StatCard label="Avg Order Value" value={fmt(revenue?.avgOrderValue)}  icon={TrendingUp}   colour="bg-orange-400" />
        </div>

        {/* Bar chart — responsive height */}
        {revenueLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-orange-400" size={24} />
          </div>
        ) : revenue?.breakdown?.length > 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-4">Revenue breakdown</p>
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenue.breakdown} margin={{ top: 0, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#6b7280' }} />
                  <YAxis
                    tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 10, fill: '#6b7280' }}
                    width={48}
                  />
                  <Tooltip
                    formatter={(v) => [`₦${Number(v).toLocaleString()}`, 'Revenue']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: 12 }}
                  />
                  <Bar dataKey="revenue" fill="#15803d" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : null}
      </section>

      {/* ── Funnel + Payment Health ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

        {funnel && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-green-900 mb-4">Conversion Funnel (30 days)</h3>
            <div className="space-y-3">
              {[
                { label: 'Cart Items',          value: funnel.cartItems,          badge: 'bg-blue-100 text-blue-700' },
                { label: 'Checkouts Initiated', value: funnel.checkoutsInitiated, badge: 'bg-yellow-100 text-yellow-700' },
                { label: 'Payments Completed',  value: funnel.paymentsCompleted,  badge: 'bg-green-100 text-green-700' },
                { label: 'Abandoned Carts',     value: funnel.abandonedCarts,     badge: 'bg-red-100 text-red-600' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between gap-2">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${item.badge}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-xs text-gray-500 gap-2">
                <span>Cart → Checkout rate</span>
                <span className="font-medium text-green-700">{funnel.cartToCheckoutRate?.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 gap-2">
                <span>Checkout → Payment rate</span>
                <span className="font-medium text-green-700">{funnel.checkoutToPaymentRate?.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}

        {paymentHealth && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-green-900 mb-4">Payment Health</h3>
            <div className="space-y-3">
              {[
                { label: 'Total Payments', value: paymentHealth.totalPayments, badge: 'bg-gray-100 text-gray-700' },
                { label: 'Completed',      value: paymentHealth.completed,     badge: 'bg-green-100 text-green-700' },
                { label: 'Pending',        value: paymentHealth.pending,       badge: 'bg-yellow-100 text-yellow-700' },
                { label: 'Failed',         value: paymentHealth.failed,        badge: 'bg-red-100 text-red-600' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between gap-2">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${item.badge}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-xs text-gray-500 gap-2">
                <span>Success rate</span>
                <span className={`font-medium ${paymentHealth.successRate >= 80 ? 'text-green-700' : 'text-red-600'}`}>
                  {paymentHealth.successRate}%
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 gap-2">
                <span>Avg verification attempts</span>
                <span className="font-medium text-gray-700">{paymentHealth.avgVerificationAttempts?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── User Growth ───────────────────────────────────────────── */}
      {userGrowth && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between mb-4">
            <h3 className="text-sm font-semibold text-green-900">User Growth (30 days)</h3>
            <div className="flex flex-wrap gap-3 sm:gap-5 text-xs text-gray-500">
              <span>Total <strong className="text-green-900">{userGrowth.totalUsers}</strong></span>
              <span>Active Buyers <strong className="text-green-900">{userGrowth.activeBuyers}</strong></span>
              <span>Vendors <strong className="text-green-900">{userGrowth.totalVendors}</strong></span>
            </div>
          </div>
          {userGrowth.dailyRegistrations?.length > 0 && (
            <div className="h-40 sm:h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowth.dailyRegistrations} margin={{ top: 0, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6b7280' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#6b7280' }} width={26} />
                  <Tooltip
                    formatter={(v) => [v, 'Registrations']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: 12 }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#f97316" strokeWidth={2} dot={{ r: 3, fill: '#f97316' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* ── Top Products ──────────────────────────────────────────── */}
      {topProducts.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 sm:px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-green-900">Top Products</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
                  <th className="px-3 sm:px-5 py-3">#</th>
                  <th className="px-3 sm:px-5 py-3">Product</th>
                  <th className="px-3 sm:px-5 py-3">Units</th>
                  <th className="px-3 sm:px-5 py-3">Revenue</th>
                  <th className="px-3 sm:px-5 py-3">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topProducts.map((p, i) => (
                  <tr key={p.productId} className="hover:bg-gray-50 transition">
                    <td className="px-3 sm:px-5 py-3 text-gray-400 text-xs font-medium">{i + 1}</td>
                    <td className="px-3 sm:px-5 py-3 font-medium text-green-900 max-w-[140px] sm:max-w-none truncate">{p.productName}</td>
                    <td className="px-3 sm:px-5 py-3 text-gray-600">{p.unitsSold}</td>
                    <td className="px-3 sm:px-5 py-3 font-semibold text-green-900 whitespace-nowrap">{fmt(p.revenue)}</td>
                    <td className="px-3 sm:px-5 py-3">
                      {p.avgRating > 0
                        ? <span className="text-gray-700">⭐ {Number(p.avgRating).toFixed(1)}</span>
                        : <span className="text-gray-400 text-xs">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Category Performance ──────────────────────────────────── */}
      {categoryData.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 sm:px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-green-900">Category Performance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[360px]">
              <thead>
                <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
                  <th className="px-3 sm:px-5 py-3">Category</th>
                  <th className="px-3 sm:px-5 py-3">Products</th>
                  <th className="px-3 sm:px-5 py-3">Units</th>
                  <th className="px-3 sm:px-5 py-3">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categoryData.map(c => (
                  <tr key={c.categoryId} className="hover:bg-gray-50 transition">
                    <td className="px-3 sm:px-5 py-3 font-medium text-green-900">{c.categoryName}</td>
                    <td className="px-3 sm:px-5 py-3 text-gray-600">{c.productCount}</td>
                    <td className="px-3 sm:px-5 py-3 text-gray-600">{c.unitsSold}</td>
                    <td className="px-3 sm:px-5 py-3 font-semibold text-green-900 whitespace-nowrap">{fmt(c.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
