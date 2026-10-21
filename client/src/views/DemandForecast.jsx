import React, { useState, useEffect } from 'react';
import { TrendingUp, PackageSearch } from 'lucide-react';
import { fetchProducts, fetchProductForecast } from '../services/api';
import {
  ResponsiveContainer, ComposedChart, Line, Area, XAxis, YAxis,
  CartesianGrid, Tooltip
} from 'recharts';

export default function DemandForecast() {
  const [products, setProducts] = useState([]);
  const [selectedSku, setSelectedSku] = useState('');
  const [horizon, setHorizon] = useState(30);
  const [method, setMethod] = useState('holt_smoothing');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [catalogLoaded, setCatalogLoaded] = useState(false);

  useEffect(() => {
    fetchProducts()
      .then(res => {
        const prods = res.data || [];
        setProducts(prods);
        if (prods.length > 0) setSelectedSku(prods[0].sku);
      })
      .catch(console.error)
      .finally(() => setCatalogLoaded(true));
  }, []);

  useEffect(() => {
    if (!selectedSku) return;
    setLoading(true);
    fetchProductForecast(selectedSku, horizon, method)
      .then(res => setData(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedSku, horizon, method]);

  if (catalogLoaded && products.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center mx-auto shadow-inner">
          <PackageSearch className="w-7 h-7" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-white">No Products in Your Catalog Yet</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            To generate Holt-Winters or Moving Average demand forecasts, please upload your shop&apos;s product inventory CSV in the <span className="text-sky-400 font-semibold">Settings</span> tab.
          </p>
        </div>
      </div>
    );
  }

  // Build chart data: historical + forecast
  const chartPoints = [];
  if (data) {
    (data.historicalSales || []).forEach(d => {
      chartPoints.push({ date: d.date, actual: d.quantity, predicted: null, upper: null });
    });
    const last = data.historicalSales?.slice(-1)[0];
    if (last) {
      chartPoints.push({ date: last.date, actual: last.quantity, predicted: last.quantity, upper: last.quantity });
    }
    (data.forecast?.forecastItems || []).forEach(d => {
      chartPoints.push({ date: d.date, actual: null, predicted: d.predictedDemand, upper: d.upperBound });
    });
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-end gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Product</label>
          <select value={selectedSku} onChange={e => setSelectedSku(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white">
            {products.map(p => <option key={p.sku} value={p.sku}>{p.sku} — {p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Horizon</label>
          <div className="flex bg-slate-800 rounded-lg border border-slate-700 p-0.5">
            {[7, 14, 30, 90].map(h => (
              <button key={h} onClick={() => setHorizon(h)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium ${horizon === h ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                {h}d
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Algorithm</label>
          <div className="flex bg-slate-800 rounded-lg border border-slate-700 p-0.5">
            <button onClick={() => setMethod('holt_smoothing')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium ${method === 'holt_smoothing' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
              Exponential Smoothing
            </button>
            <button onClick={() => setMethod('moving_average')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium ${method === 'moving_average' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
              Moving Average
            </button>
          </div>
        </div>
      </div>

      {/* Forecast Summary */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400">Current Stock</span>
            <div className="text-xl font-bold text-white">{data.product?.currentStock} units</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400">Forecast Demand ({horizon}d)</span>
            <div className="text-xl font-bold text-sky-400">{data.forecast?.totalForecastUnits} units</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400">Days Until Stockout</span>
            <div className={`text-xl font-bold ${typeof data.forecast?.daysUntilStockout === 'number' && data.forecast.daysUntilStockout <= 7 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {data.forecast?.daysUntilStockout}{typeof data.forecast?.daysUntilStockout === 'number' ? ' days' : ''}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400">Model Accuracy (MAPE)</span>
            <div className="text-xl font-bold text-indigo-400">{data.forecast?.mapePercent}%</div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-4 mb-4 text-xs">
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-sky-400 inline-block"></span> Actual Sales</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-indigo-400 inline-block border-dashed border-t"></span> Predicted Demand</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-indigo-900/40 border border-indigo-700/50 inline-block rounded-sm"></span> Confidence Band</span>
        </div>
        <div className="h-72">
          {loading ? (
            <div className="flex items-center justify-center h-full text-slate-400">Loading forecast...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartPoints}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={d => d?.slice(5)} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="upper" stroke="transparent" fill="#4338ca" fillOpacity={0.2} />
                <Line type="monotone" dataKey="actual" stroke="#38bdf8" strokeWidth={2} dot={{ r: 2 }} connectNulls={false} />
                <Line type="monotone" dataKey="predicted" stroke="#818cf8" strokeWidth={2.5} strokeDasharray="5 5" dot={{ r: 2 }} connectNulls={false} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
