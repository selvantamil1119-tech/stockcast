import React, { useState, useEffect } from 'react';
import { IndianRupee, TrendingUp, Percent, Award, Info, Calendar } from 'lucide-react';
import { fetchDashboardAnalytics } from '../services/api';
import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, PieChart, Pie, Cell
} from 'recharts';

export default function SalesAnalytics() {
  const [days, setDays] = useState(30);
  const [customInput, setCustomInput] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchDashboardAnalytics(days)
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [days]);

  const handleCustomDaysSubmit = (e) => {
    e.preventDefault();
    const parsed = parseInt(customInput, 10);
    if (parsed && parsed > 0 && parsed <= 365) {
      setDays(parsed);
    }
  };

  const COLORS = ['#0284c7', '#38bdf8', '#818cf8', '#a855f7', '#34d399', '#f59e0b'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header & Period selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Sales Analytics</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Performance metrics for the past <span className="font-semibold text-sky-400">{days} days</span>
          </p>
        </div>

        {/* Custom Days Input & Quick Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-slate-800 rounded-lg border border-slate-700 p-0.5">
            {[7, 14, 30, 60, 90].map(d => (
              <button
                key={d}
                type="button"
                onClick={() => { setDays(d); setCustomInput(''); }}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${days === d ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                {d}d
              </button>
            ))}
          </div>

          <form onSubmit={handleCustomDaysSubmit} className="flex items-center gap-1.5">
            <div className="relative">
              <Calendar className="w-3 h-3 text-slate-400 absolute left-2 top-2" />
              <input
                type="number"
                min="1"
                max="365"
                placeholder="Custom days..."
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="w-28 pl-6 pr-2 py-1 text-xs bg-slate-800 border border-slate-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
            <button
              type="submit"
              className="px-2.5 py-1 text-xs font-medium bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md transition"
            >
              Apply
            </button>
          </form>
        </div>
      </div>

      {/* Explanation Banner */}
      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 flex items-start gap-3 text-xs text-slate-300">
        <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold text-white">How Sales Analytics is Computed:</span> When you upload a product catalog CSV, the system initializes baseline 60-day transaction history calibrated to each product&apos;s retail velocity. As you record sales or scan checkouts via the real-time POS API, live transaction records update revenue, margins, and sales timelines dynamically.
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Revenue', value: `₹${(data?.totalRevenue || 0).toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-sky-400 bg-sky-500/10' },
          { label: 'Profit', value: `₹${(data?.totalProfit || 0).toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-emerald-400 bg-emerald-500/10' },
          { label: 'Margin', value: `${data?.grossMarginPercent || 0}%`, icon: Percent, color: 'text-purple-400 bg-purple-500/10' },
          { label: 'Units Sold', value: (data?.totalUnitsSold || 0).toLocaleString('en-IN'), icon: Award, color: 'text-amber-400 bg-amber-500/10' }
        ].map(c => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{c.label}</span>
                <div className={`p-1.5 rounded-lg ${c.color}`}><Icon className="w-3.5 h-3.5" /></div>
              </div>
              <div className="mt-1 text-xl font-bold text-white">{c.value}</div>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue + Profit chart */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-slate-900 border border-slate-800">
          <h3 className="text-sm font-semibold text-white mb-3">Revenue vs Profit (₹)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data?.salesTimeline || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={d => d?.slice(5)} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={v => `₹${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  formatter={(v, n) => [`₹${Number(v).toLocaleString('en-IN')}`, n === 'revenue' ? 'Revenue' : 'Profit']}
                />
                <Bar dataKey="revenue" fill="#0284c7" radius={[3, 3, 0, 0]} barSize={12} />
                <Line type="monotone" dataKey="profit" stroke="#34d399" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category pie */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <h3 className="text-sm font-semibold text-white mb-3">Revenue by Category</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.categoryDistribution || []}
                  dataKey="revenue"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={3}
                >
                  {(data?.categoryDistribution || []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  formatter={v => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2">
            {(data?.categoryDistribution || []).map((c, i) => (
              <div key={c.category} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                  {c.category}
                </span>
                <span className="font-mono text-white">₹{c.revenue.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
        <h3 className="text-sm font-semibold text-white mb-3">Top Selling Products</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="py-2 px-3">#</th>
                <th className="py-2 px-3">Product</th>
                <th className="py-2 px-3">Category</th>
                <th className="py-2 px-3">Units Sold</th>
                <th className="py-2 px-3">Revenue</th>
                <th className="py-2 px-3">Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {(!data?.topProducts || data.topProducts.length === 0) ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    No sales transactions recorded yet. Upload your store catalog or record checkouts to see sales performance.
                  </td>
                </tr>
              ) : (data?.topProducts || []).map((p, i) => (
                <tr key={p.sku} className="hover:bg-slate-800/30">
                  <td className="py-2 px-3 text-amber-400 font-semibold">{i + 1}</td>
                  <td className="py-2 px-3">
                    <div className="font-mono text-xs text-sky-400">{p.sku}</div>
                    <div className="text-white">{p.name}</div>
                  </td>
                  <td className="py-2 px-3 text-slate-300">{p.category}</td>
                  <td className="py-2 px-3 font-mono text-white">{p.totalUnits.toLocaleString('en-IN')}</td>
                  <td className="py-2 px-3 font-mono text-emerald-400">₹{p.totalRevenue.toLocaleString('en-IN')}</td>
                  <td className="py-2 px-3 font-mono text-white">₹{p.totalProfit.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
