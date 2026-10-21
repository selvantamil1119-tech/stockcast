import React from 'react';
import { BarChart3, Box, TrendingUp, RefreshCw, PieChart, Settings as SettingsIcon, LogOut, User as UserIcon } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, user, onLogout }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'inventory', label: 'Inventory', icon: Box },
    { id: 'forecast', label: 'Demand Forecast', icon: TrendingUp },
    { id: 'replenishment', label: 'Replenishment', icon: RefreshCw },
    { id: 'analytics', label: 'Sales Analytics', icon: PieChart },
    { id: 'settings', label: 'Settings & POS', icon: SettingsIcon },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center">
              <TrendingUp className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">StockCast</span>
          </div>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-sky-500/15 text-sky-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User profile & Logout */}
          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden md:flex items-center gap-2 text-xs text-slate-300">
                <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-sky-400 font-bold border border-slate-700">
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium text-slate-200">{user.businessName || user.email}</span>
              </div>
            )}
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
