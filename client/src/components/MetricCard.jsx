import React from 'react';

export default function MetricCard({ title, value, subtitle, icon: Icon, trend, variant = 'default', badge }) {
  const variantStyles = {
    default: 'from-slate-800/80 to-slate-900/80 border-slate-800 text-slate-100',
    primary: 'from-sky-950/40 to-slate-900/80 border-sky-800/50 text-sky-400',
    warning: 'from-amber-950/40 to-slate-900/80 border-amber-800/50 text-amber-400',
    danger: 'from-rose-950/40 to-slate-900/80 border-rose-800/50 text-rose-400',
    success: 'from-emerald-950/40 to-slate-900/80 border-emerald-800/50 text-emerald-400',
    purple: 'from-purple-950/40 to-slate-900/80 border-purple-800/50 text-purple-400',
  };

  const iconBgStyles = {
    default: 'bg-slate-800 text-slate-300',
    primary: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  };

  return (
    <div className={`relative p-5 rounded-2xl bg-gradient-to-b border shadow-lg backdrop-blur transition-all duration-200 hover:border-slate-700 ${variantStyles[variant]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-2xl font-extrabold tracking-tight text-white">{value}</h3>
            {badge && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-800 text-slate-300 border border-slate-700">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-400 flex items-center gap-1">
              {subtitle}
            </p>
          )}
        </div>

        {Icon && (
          <div className={`p-2.5 rounded-xl ${iconBgStyles[variant]}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center gap-1.5 text-xs">
          <span className={trend.isPositive ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
            {trend.value}
          </span>
          <span className="text-slate-400">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
