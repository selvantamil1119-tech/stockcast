import React, { useState, useEffect } from 'react';
import { Search, Plus, SlidersHorizontal, Edit2, Trash2, Package } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { fetchProducts, deleteProduct } from '../services/api';

export default function InventoryList({ onOpenProductModal, onOpenAdjustModal, refreshTrigger }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (category !== 'All') params.category = category;
      if (search.trim()) params.search = search.trim();
      const res = await fetchProducts(params);
      setProducts(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProducts(); }, [category, refreshTrigger]);

  const handleSearch = (e) => { e.preventDefault(); loadProducts(); };

  const handleDelete = async (sku) => {
    if (!window.confirm(`Delete ${sku}?`)) return;
    try { await deleteProduct(sku); loadProducts(); }
    catch (err) { alert(err.message); }
  };

  const categories = ['All', 'Electronics', 'Apparel', 'Groceries', 'Home & Kitchen', 'Healthcare'];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by SKU or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
          />
        </form>

        <div className="flex items-center gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white"
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <button
            onClick={() => onOpenProductModal(null)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-sky-600 hover:bg-sky-500 text-white transition"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-800/60 text-slate-400 text-xs uppercase border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">SKU / Product</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Cost</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Lead Time</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr><td colSpan="8" className="py-10 text-center text-slate-400">Loading...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan="8" className="py-10 text-center text-slate-400">
                  <Package className="w-6 h-6 mx-auto mb-1 text-slate-600" />No products found
                </td></tr>
              ) : products.map((p) => (
                <tr key={p.sku} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4">
                    <div className="font-mono text-xs text-sky-400">{p.sku}</div>
                    <div className="text-white font-medium truncate max-w-[200px]">{p.name}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{p.category}</td>
                  <td className="py-3 px-4 font-mono text-slate-300">₹{p.unitCost}</td>
                  <td className="py-3 px-4 font-mono text-white">₹{p.unitPrice}</td>
                  <td className="py-3 px-4">
                    <span className="font-mono font-semibold text-white">{p.currentStock}</span>
                    <span className="text-slate-500 text-xs"> / {p.maxStockLevel}</span>
                  </td>
                  <td className="py-3 px-4"><StatusBadge status={p.stockStatus} size="sm" /></td>
                  <td className="py-3 px-4 text-slate-300">{p.leadTimeDays}d</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => onOpenAdjustModal(p)} className="p-1.5 rounded-lg hover:bg-slate-800 text-sky-400" title="Adjust Stock">
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => onOpenProductModal(p)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300" title="Edit">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(p.sku)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
