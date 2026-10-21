import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DashboardOverview from './views/DashboardOverview';
import InventoryList from './views/InventoryList';
import DemandForecast from './views/DemandForecast';
import ReplenishmentPlanner from './views/ReplenishmentPlanner';
import SalesAnalytics from './views/SalesAnalytics';
import Settings from './views/Settings';
import Login from './views/Login';
import ProductModal from './components/ProductModal';
import AdjustStockModal from './components/AdjustStockModal';
import {
  fetchProducts, createProduct, updateProduct, adjustStock
} from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Authentication State
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Modals State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustingProduct, setAdjustingProduct] = useState(null);

  // Check login session on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error('Session restore error:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setAuthChecked(true);
    }
  }, []);

  const handleLogin = (data) => {
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setIsAuthenticated(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const refresh = () => setRefreshTrigger(p => p + 1);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts().then(res => setProducts(res.data || [])).catch(console.error);
    }
  }, [isAuthenticated, refreshTrigger]);

  const handleSaveProduct = async (data) => {
    if (editingProduct) {
      await updateProduct(editingProduct.sku, data);
    } else {
      await createProduct(data);
    }
    refresh();
  };

  const handleAdjustStock = async (sku, payload) => {
    await adjustStock(sku, payload);
    refresh();
  };

  // Wait for initial auth check before rendering
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // If not logged in, show Login / Register screen
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && <DashboardOverview key={refreshTrigger} onNavigate={setActiveTab} />}

        {activeTab === 'inventory' && (
          <InventoryList
            refreshTrigger={refreshTrigger}
            onOpenProductModal={(p) => { setEditingProduct(p); setIsProductModalOpen(true); }}
            onOpenAdjustModal={(p) => { setAdjustingProduct(p); setIsAdjustModalOpen(true); }}
          />
        )}

        {activeTab === 'forecast' && <DemandForecast key={refreshTrigger} />}

        {activeTab === 'replenishment' && (
          <ReplenishmentPlanner key={refreshTrigger} onInventoryUpdated={refresh} />
        )}

        {activeTab === 'analytics' && <SalesAnalytics key={refreshTrigger} />}

        {activeTab === 'settings' && <Settings onUploadSuccess={refresh} />}
      </main>

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={handleSaveProduct}
        initialData={editingProduct}
      />

      <AdjustStockModal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        product={adjustingProduct}
        onAdjust={handleAdjustStock}
      />
    </div>
  );
}
