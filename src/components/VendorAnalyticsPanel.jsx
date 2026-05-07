import { useState, useEffect } from 'react';
import { analytics } from '../api/api';
import { Loader2, DollarSign, ShoppingCart, Package, Star, AlertTriangle } from 'lucide-react';

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

export default function VendorAnalyticsPanel() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analytics.vendorMe()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin text-orange-400" size={32} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center py-16 text-center text-gray-500">
        <p>No analytics data available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">

      {/* ── Summary stats — 2 col on mobile, 3 on sm+ ─────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <StatCard label="Total Revenue"   value={fmt(data.totalRevenue)}  icon={DollarSign}    colour="bg-green-600" />
        <StatCard label="Total Orders"    value={data.totalOrders}         icon={ShoppingCart}  colour="bg-blue-500" />
        <StatCard label="Units Sold"      value={data.totalUnitsSold}      icon={Package}       colour="bg-orange-400" />
        <StatCard
          label="Avg Rating"
          value={data.avgRating > 0 ? `${Number(data.avgRating).toFixed(1)} ★` : '—'}
          icon={Star}
          colour="bg-yellow-400"
        />
        <StatCard label="Low Stock Items" value={data.lowStockCount} icon={AlertTriangle} colour="bg-red-500" sub="Needs restock" />
      </div>

      {/* ── Top products ──────────────────────────────────────────── */}
      {data.topProducts?.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 sm:px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-green-900">Top Products</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
                  <th className="px-3 sm:px-5 py-3">#</th>
                  <th className="px-3 sm:px-5 py-3">Product</th>
                  <th className="px-3 sm:px-5 py-3">Units</th>
                  <th className="px-3 sm:px-5 py-3">Revenue</th>
                  <th className="px-3 sm:px-5 py-3">Cart Adds</th>
                  <th className="px-3 sm:px-5 py-3">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.topProducts.map((p, i) => (
                  <tr key={p.productId} className="hover:bg-gray-50 transition">
                    <td className="px-3 sm:px-5 py-3 text-gray-400 text-xs font-medium">{i + 1}</td>
                    <td className="px-3 sm:px-5 py-3 font-medium text-green-900 max-w-[140px] truncate">{p.productName}</td>
                    <td className="px-3 sm:px-5 py-3 text-gray-600">{p.unitsSold}</td>
                    <td className="px-3 sm:px-5 py-3 font-semibold text-green-900 whitespace-nowrap">{fmt(p.revenue)}</td>
                    <td className="px-3 sm:px-5 py-3 text-gray-600">{p.cartAddCount}</td>
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
    </div>
  );
}
