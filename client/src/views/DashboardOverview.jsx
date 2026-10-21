import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, IndianRupee, TrendingUp, Sparkles, UploadCloud } from 'lucide-react';
import { fetchInventorySummary, fetchDashboardAnalytics } from '../services/api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export default function DashboardOverview({ onNavigate }) {
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, a] = await Promise.all([
          fetchInventorySummary(),
          fetchDashboardAnalytics(30)
        ]);
        setSummary(s.summary);
        setAnalytics(a.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const cards = [
    {
      label: 'Total Products',
      value: summary?.totalProducts || 0,
      sub: `${summary?.totalUnitsInStock || 0} units in stock`,
      icon: Package,
      color: 'text-sky-400 bg-sky-500/10'
    },
    {
      label: 'Inventory Value',
      value: `₹${(summary?.totalStockValue || 0).toLocaleString('en-IN')}`,
      sub: `Retail value: ₹${(summary?.totalRetailValue || 0).toLocaleString('en-IN')}`,
      icon: IndianRupee,
      color: 'text-emerald-400 bg-emerald-500/10'
    },
    {
      label: 'Low / Out of Stock',
      value: (summary?.outOfStockCount || 0) + (summary?.lowStockCount || 0),
      sub: `${summary?.outOfStockCount || 0} out of stock, ${summary?.lowStockCount || 0} low`,
      icon: AlertTriangle,
      color: 'text-rose-400 bg-rose-500/10'
    },
    {
      label: '30-Day Revenue',
      value: `₹${Math.round(analytics?.totalRevenue || 0).toLocaleString('en-IN')}`,
      sub: `Profit: ₹${Math.round(analytics?.totalProfit || 0).toLocaleString('en-IN')} (${analytics?.grossMarginPercent || 0}% margin)`,
      icon: TrendingUp,
      color: 'text-amber-400 bg-amber-500/10'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Onboarding Banner for New Stores (0 products) */}
      {(!summary?.totalProducts || summary.totalProducts === 0) && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-sky-950/70 via-slate-900 to-indigo-950/60 border border-sky-800/60 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center justify-center sm:justify-start gap-2">
              <Sparkles className="w-5 h-5 text-sky-400 shrink-0" />
              <span>Welcome to Your New Store Dashboard!</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              You haven&apos;t uploaded your shop&apos;s product inventory yet. Head over to <span className="text-sky-400 font-semibold">Settings</span> to upload your catalog CSV file and instantly unlock automated demand forecasting, EOQ replenishment schedules, and live sales tracking!
            </p>
          </div>
          <button
            onClick={() => onNavigate?.('settings')}
            className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs sm:text-sm rounded-xl transition shadow-lg shadow-sky-600/30 flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Store CSV</span>
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400 uppercase">{c.label}</span>
                <div className={`p-2 rounded-lg ${c.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold text-white">{c.value}</div>
              <p className="mt-1 text-xs text-slate-400">{c.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Sales Trend Chart */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
        <h3 className="text-sm font-semibold text-white mb-4">Daily Revenue (Last 30 Days)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics?.salesTimeline || []}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#38bdf8" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stock Status Breakdown + Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <h3 className="text-sm font-semibold text-white mb-3">Stock Health Breakdown</h3>
          <div className="space-y-3">
            {[
              { label: 'Optimal', count: summary?.optimalCount || 0, color: 'bg-emerald-500' },
              { label: 'Low Stock', count: summary?.lowStockCount || 0, color: 'bg-amber-500' },
              { label: 'Out of Stock', count: summary?.outOfStockCount || 0, color: 'bg-rose-500' },
              { label: 'Overstocked', count: summary?.overstockedCount || 0, color: 'bg-purple-500' }
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${s.color}`}></span>
                  <span className="text-sm text-slate-300">{s.label}</span>
                </div>
                <span className="text-sm font-semibold text-white">{s.count} SKUs</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <h3 className="text-sm font-semibold text-white mb-3">Category Inventory</h3>
          <div className="space-y-3">
            {Object.entries(summary?.categoryBreakdown || {}).map(([cat, data]) => (
              <div key={cat} className="flex items-center justify-between">
                <span className="text-sm text-slate-300">{cat}</span>
                <div className="text-right">
                  <span className="text-sm font-semibold text-white">{data.totalUnits} units</span>
                  <span className="text-xs text-slate-400 ml-2">(₹{Math.round(data.stockValue).toLocaleString('en-IN')})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
