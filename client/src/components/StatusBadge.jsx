import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, PackagePlus } from 'lucide-react';

export default function StatusBadge({ status, size = 'sm' }) {
  const configs = {
    out_of_stock: {
      label: 'Stockout',
      icon: AlertCircle,
      classes: 'bg-rose-500/10 text-rose-400 border-rose-500/30'
    },
    CRITICAL_STOCKOUT: {
      label: 'Critical Stockout',
      icon: AlertCircle,
      classes: 'bg-rose-500/15 text-rose-400 border-rose-500/40 animate-pulse'
    },
    low_stock: {
      label: 'Low Stock',
      icon: AlertTriangle,
      classes: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    },
    REORDER_NOW: {
      label: 'Reorder Now',
      icon: AlertTriangle,
      classes: 'bg-amber-500/15 text-amber-400 border-amber-500/40'
    },
    WARNING_LOW: {
      label: 'Approaching ROP',
      icon: AlertTriangle,
      classes: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30'
    },
    optimal: {
      label: 'Optimal',
      icon: CheckCircle2,
      classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    },
    OPTIMAL: {
      label: 'Optimal',
      icon: CheckCircle2,
      classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    },
    overstocked: {
      label: 'Overstocked',
      icon: PackagePlus,
      classes: 'bg-purple-500/10 text-purple-300 border-purple-500/30'
    },
    OVERSTOCKED: {
      label: 'Overstocked',
      icon: PackagePlus,
      classes: 'bg-purple-500/10 text-purple-300 border-purple-500/30'
    },
    default: {
      label: status || 'Unknown',
      icon: CheckCircle2,
      classes: 'bg-slate-800 text-slate-400 border-slate-700'
    }
  };

  const config = configs[status] || configs.default;
  const Icon = config.icon;

  const sizeClasses = size === 'xs'
    ? 'text-[10px] px-2 py-0.5 gap-1'
    : 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${sizeClasses} ${config.classes}`}>
      <Icon className={size === 'xs' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {config.label}
    </span>
  );
}
