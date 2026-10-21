import React, { useState, useEffect } from 'react';
import {
  Sliders,
  AlertTriangle,
  Flame,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  RotateCcw
} from 'lucide-react';
import { fetchReplenishmentRecommendations } from '../services/api';
import StatusBadge from '../components/StatusBadge';

export default function SimulationSandbox({ onNavigate }) {
  const [demandSurge, setDemandSurge] = useState(30); // % surge in demand
  const [leadTimeDelay, setLeadTimeDelay] = useState(5); // extra days of supplier delivery delay
  const [baseItems, setBaseItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBase() {
      try {
        setLoading(true);
        const res = await fetchReplenishmentRecommendations();
        setBaseItems(res.data || []);
      } catch (err) {
        console.error('Failed to load simulation base:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBase();
  }, []);

  // Run What-If simulation recalculations
  const multiplier = 1 + (demandSurge / 100);

  const simulatedItems = baseItems.map(item => {
    const simDemand = Number((item.avgDailyDemand * multiplier).toFixed(2));
    const simLeadTime = item.leadTimeDays + leadTimeDelay;
    const simRop = Math.ceil((simDemand * simLeadTime) + item.safetyStock);
    const simRunway = simDemand > 0 ? Number((item.currentStock / simDemand).toFixed(1)) : 999;

    let simRisk = 'OPTIMAL';
    if (item.currentStock <= 0) {
      simRisk = 'CRITICAL_STOCKOUT';
    } else if (item.currentStock <= simRop || simRunway <= simLeadTime) {
      simRisk = 'REORDER_NOW';
    } else if (simRunway <= simLeadTime + 3) {
      simRisk = 'WARNING_LOW';
    } else if (item.currentStock >= 150) {
      simRisk = 'OVERSTOCKED';
    }

    const simSuggestedOrder = Math.max(item.eoq, simRop - item.currentStock + item.safetyStock);

    return {
      ...item,
      simDemand,
      simLeadTime,
      simRop,
      simRunway,
      simRisk,
      simSuggestedOrder,
      simOrderCost: Number((simSuggestedOrder * item.unitCost).toFixed(2)),
      isVulnerable: (simRisk === 'CRITICAL_STOCKOUT' || simRisk === 'REORDER_NOW') && item.urgency === 'OPTIMAL'
    };
  });

  const baseUrgentCount = baseItems.filter(i => i.needsReorder).length;
  const simUrgentCount = simulatedItems.filter(i => i.simRisk === 'CRITICAL_STOCKOUT' || i.simRisk === 'REORDER_NOW' || i.simRisk === 'WARNING_LOW').length;
  const vulnerableCount = simulatedItems.filter(i => i.isVulnerable).length;

  const totalSimCapital = simulatedItems
    .filter(i => i.simRisk === 'CRITICAL_STOCKOUT' || i.simRisk === 'REORDER_NOW')
    .reduce((sum, i) => sum + i.simOrderCost, 0);

  return (
    <div className="space-y-6">
      {/* Simulation Scenario Controls */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-400" />
              "What-If" Scenario Stress-Testing Engine
            </h3>
            <p className="text-xs text-slate-400">
              Simulate festival demand spikes and supply chain delays to stress-test stock resiliency
            </p>
          </div>
          <button
            onClick={() => { setDemandSurge(0); setLeadTimeDelay(0); }}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Sliders</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Slider 1: Demand Surge */}
          <div className="space-y-2 p-4 rounded-xl bg-slate-800/40 border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400" />
                Customer Demand Surge (Holiday / Promotional Spike)
              </span>
              <span className="font-mono font-bold text-amber-400 text-sm">+{demandSurge}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={demandSurge}
              onChange={(e) => setDemandSurge(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Normal (0%)</span>
              <span>Moderate (+50%)</span>
              <span>2x Demand (+100%)</span>
            </div>
          </div>

          {/* Slider 2: Supply Chain Lead Time Delay */}
          <div className="space-y-2 p-4 rounded-xl bg-slate-800/40 border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-sky-400" />
                Supplier Lead Time Disruption (Shipping Delays)
              </span>
              <span className="font-mono font-bold text-sky-400 text-sm">+{leadTimeDelay} Days</span>
            </div>
            <input
              type="range"
              min="0"
              max="21"
              step="1"
              value={leadTimeDelay}
              onChange={(e) => setLeadTimeDelay(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>On Time (0d)</span>
              <span>1 Week (+7d)</span>
              <span>3 Weeks (+21d)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Impact KPI Comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <span className="text-xs font-semibold text-slate-400 uppercase">Stockout Risk Escalation</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-mono">{baseUrgentCount}</span>
            <ArrowRight className="w-4 h-4 text-rose-400" />
            <span className="text-2xl font-extrabold text-rose-400 font-mono">{simUrgentCount} SKUs</span>
          </div>
          <span className="text-[11px] text-rose-300 mt-1 block">
            {vulnerableCount > 0 ? `⚠️ ${vulnerableCount} previously safe items flip into critical deficit!` : 'Resilient portfolio under current stress'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <span className="text-xs font-semibold text-slate-400 uppercase">Buffer Capital Required</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-amber-400 font-mono">
              ₹{Math.round(totalSimCapital).toLocaleString('en-IN')}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Estimated capital to order expanded safety buffers
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <span className="text-xs font-semibold text-slate-400 uppercase">Vulnerability Assessment</span>
          <div className="mt-1">
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono ${
              vulnerableCount >= 3 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
            }`}>
              {vulnerableCount >= 3 ? 'HIGH EXPOSURE' : 'MODERATE RESILIENCE'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1.5 block">
            Tested under +{demandSurge}% surge & +{leadTimeDelay}d delay
          </span>
        </div>
      </div>

      {/* Stress Test Breakdown Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            Product Resilience & Simulated Stock Runway
          </h4>
          <p className="text-xs text-slate-400">Items flagged with red highlight are safe in baseline but rupture under simulated surge</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">SKU / Item</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Base Runway</th>
                <th className="py-3 px-4">Simulated Runway</th>
                <th className="py-3 px-4">Base ROP</th>
                <th className="py-3 px-4">Simulated ROP</th>
                <th className="py-3 px-4">Simulated Status</th>
                <th className="py-3 px-4 text-right">Protection Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {simulatedItems.map(item => (
                <tr
                  key={item.sku}
                  className={`transition ${item.isVulnerable ? 'bg-rose-950/20 hover:bg-rose-950/30' : 'hover:bg-slate-800/40'}`}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sky-400">{item.sku}</span>
                      {item.isVulnerable && (
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40">
                          Vulnerable
                        </span>
                      )}
                    </div>
                    <div className="font-semibold text-slate-200 line-clamp-1 max-w-[200px]">
                      {item.name}
                    </div>
                  </td>

                  <td className="py-3 px-4 font-mono font-bold text-white">
                    {item.currentStock} units
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-400">
                    {item.runwayDays}d
                  </td>

                  <td className="py-3 px-4 font-mono font-bold">
                    <span className={item.simRunway <= item.simLeadTime ? 'text-rose-400' : 'text-slate-200'}>
                      {item.simRunway}d
                    </span>
                    <span className="text-[10px] text-slate-500 block">Lead: {item.simLeadTime}d</span>
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-400">
                    {item.rop}
                  </td>

                  <td className="py-3 px-4 font-mono font-bold text-amber-400">
                    {item.simRop}
                  </td>

                  <td className="py-3 px-4">
                    <StatusBadge status={item.simRisk} size="xs" />
                  </td>

                  <td className="py-3 px-4 text-right font-mono font-semibold text-white">
                    {item.simSuggestedOrder > 0 ? (
                      <div>
                        <span className="text-sky-400 font-bold">{item.simSuggestedOrder} units</span>
                        <span className="block text-[10px] text-slate-500">₹{item.simOrderCost.toLocaleString('en-IN')}</span>
                      </div>
                    ) : (
                      <span className="text-slate-500 text-[11px]">No order needed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
