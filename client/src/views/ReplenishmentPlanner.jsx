import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, Truck, PackageCheck } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import {
  fetchReplenishmentRecommendations, fetchPurchaseOrders,
  createPurchaseOrder, receivePurchaseOrder
} from '../services/api';

export default function ReplenishmentPlanner({ onInventoryUpdated }) {
  const [recommendations, setRecommendations] = useState([]);
  const [summary, setSummary] = useState(null);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('recommendations');
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const [rec, po] = await Promise.all([
        fetchReplenishmentRecommendations(),
        fetchPurchaseOrders()
      ]);
      setRecommendations(rec.data || []);
      setSummary(rec.summary);
      setOrders(po.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleOrder = async (item) => {
    try {
      setOrdering(item.sku);
      await createPurchaseOrder({
        supplierName: item.supplier?.name || 'Primary Supplier',
        items: [{ sku: item.sku, name: item.name, quantity: item.suggestedOrderQty || item.eoq }],
        notes: `Reorder based on EOQ (${item.urgency})`
      });
      await load();
      onInventoryUpdated?.();
      setTab('orders');
    } catch (err) { alert(err.message); }
    finally { setOrdering(null); }
  };

  const handleReceive = async (orderNumber) => {
    try {
      await receivePurchaseOrder(orderNumber);
      await load();
      onInventoryUpdated?.();
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Items Need Restock</span>
          <div className="text-2xl font-bold text-amber-400">{summary?.itemsRequiringAction || 0}<span className="text-sm text-slate-400 font-normal"> / {summary?.totalEvaluated || 0}</span></div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Est. Restock Cost</span>
          <div className="text-2xl font-bold text-white">₹{(summary?.estimatedTotalCapitalRequired || 0).toLocaleString('en-IN')}</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Active Purchase Orders</span>
          <div className="text-2xl font-bold text-sky-400">{orders.filter(o => o.status !== 'Received').length}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setTab('recommendations')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'recommendations' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
          Recommendations
        </button>
        <button onClick={() => setTab('orders')}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 ${tab === 'orders' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
          <Truck className="w-3.5 h-3.5" /> Purchase Orders ({orders.length})
        </button>
      </div>

      {/* Recommendations Table */}
      {tab === 'recommendations' && (
        <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/60 text-slate-400 text-xs uppercase border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Reorder Point</th>
                  <th className="py-3 px-4">Daily Demand</th>
                  <th className="py-3 px-4">Runway</th>
                  <th className="py-3 px-4">EOQ</th>
                  <th className="py-3 px-4">Order Cost</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr><td colSpan="8" className="py-10 text-center text-slate-400">Loading...</td></tr>
                ) : recommendations.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-slate-400">
                      No products in your store yet. Upload your catalog in Settings to generate replenishment schedules.
                    </td>
                  </tr>
                ) : recommendations.map(item => (
                  <tr key={item.sku} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4">
                      <StatusBadge status={item.urgency} size="xs" />
                      <div className="font-mono text-xs text-sky-400 mt-1">{item.sku}</div>
                      <div className="text-white text-xs truncate max-w-[180px]">{item.name}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-white">{item.currentStock}</td>
                    <td className="py-3 px-4 font-mono text-amber-400">{item.rop}</td>
                    <td className="py-3 px-4 font-mono text-slate-300">{item.avgDailyDemand}/day</td>
                    <td className="py-3 px-4">
                      <span className={`font-mono font-semibold ${item.runwayDays <= item.leadTimeDays ? 'text-rose-400' : 'text-slate-300'}`}>
                        {item.runwayDays}d
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-sky-400">{item.eoq}</td>
                    <td className="py-3 px-4 font-mono text-white">₹{item.estimatedOrderCost.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right">
                      {item.needsReorder ? (
                        <button onClick={() => handleOrder(item)} disabled={ordering === item.sku}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-sky-600 hover:bg-sky-500 text-white disabled:opacity-50">
                          <Send className="w-3 h-3" /> {ordering === item.sku ? 'Ordering...' : `Order ${item.suggestedOrderQty}`}
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-400 flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> OK
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Purchase Orders Table */}
      {tab === 'orders' && (
        <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/60 text-slate-400 text-xs uppercase border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">PO Number</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {orders.length === 0 ? (
                  <tr><td colSpan="6" className="py-10 text-center text-slate-400">No purchase orders yet</td></tr>
                ) : orders.map(po => (
                  <tr key={po.orderNumber} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-mono text-sky-400">{po.orderNumber}</td>
                    <td className="py-3 px-4 text-white">{po.supplier?.name}</td>
                    <td className="py-3 px-4 text-slate-300">
                      {po.items?.map((it, i) => <div key={i}>{it.quantity}× {it.name}</div>)}
                    </td>
                    <td className="py-3 px-4 font-mono text-white">₹{po.totalAmount.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        po.status === 'Received' ? 'bg-emerald-500/10 text-emerald-400' :
                        po.status === 'In Transit' ? 'bg-sky-500/10 text-sky-400' :
                        'bg-amber-500/10 text-amber-400'
                      }`}>{po.status}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {po.status !== 'Received' ? (
                        <button onClick={() => handleReceive(po.orderNumber)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white">
                          <PackageCheck className="w-3.5 h-3.5" /> Receive
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500">Completed</span>
                      )}
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
