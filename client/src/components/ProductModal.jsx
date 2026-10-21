import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';

export default function ProductModal({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: 'Electronics',
    unitCost: 15,
    unitPrice: 35,
    currentStock: 25,
    minStockLevel: 15,
    maxStockLevel: 100,
    safetyStock: 10,
    leadTimeDays: 7,
    supplierName: 'Global Prime Supplies',
    supplierEmail: 'orders@primesupplies.com'
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        sku: initialData.sku || '',
        name: initialData.name || '',
        category: initialData.category || 'Electronics',
        unitCost: initialData.unitCost || 0,
        unitPrice: initialData.unitPrice || 0,
        currentStock: initialData.currentStock || 0,
        minStockLevel: initialData.minStockLevel || 15,
        maxStockLevel: initialData.maxStockLevel || 100,
        safetyStock: initialData.safetyStock || 10,
        leadTimeDays: initialData.leadTimeDays || 7,
        supplierName: initialData.supplier?.name || '',
        supplierEmail: initialData.supplier?.email || ''
      });
    } else {
      setFormData({
        sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        name: '',
        category: 'Electronics',
        unitCost: 20,
        unitPrice: 49.99,
        currentStock: 30,
        minStockLevel: 15,
        maxStockLevel: 120,
        safetyStock: 12,
        leadTimeDays: 7,
        supplierName: 'Global Prime Supplies',
        supplierEmail: 'orders@primesupplies.com'
      });
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.sku.trim()) {
      setError('Please provide a valid SKU and Product Name');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onSave({
        ...formData,
        supplier: {
          name: formData.supplierName,
          email: formData.supplierEmail
        }
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white">
              {initialData ? `Edit Product (${initialData.sku})` : 'Add New Inventory SKU'}
            </h3>
            <p className="text-xs text-slate-400">Configure catalog properties, pricing, and replenishment parameters</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">SKU Code *</label>
              <input
                type="text"
                disabled={!!initialData}
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 text-sm bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-sky-500 disabled:opacity-50"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-sky-500"
              >
                <option value="Electronics">Electronics</option>
                <option value="Apparel">Apparel</option>
                <option value="Groceries">Groceries</option>
                <option value="Home & Kitchen">Home & Kitchen</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Office Supplies">Office Supplies</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Product Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-sky-500"
              placeholder="e.g. Ergonomic Bluetooth Mouse"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Unit Cost (₹) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.unitCost}
                onChange={(e) => setFormData({ ...formData, unitCost: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-sm bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-sky-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Retail Selling Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-sm bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-sky-500"
                required
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 space-y-3">
            <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider block">
              Inventory & Replenishment Parameters
            </span>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Current Stock</label>
                <input
                  type="number"
                  min="0"
                  value={formData.currentStock}
                  onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Min Threshold</label>
                <input
                  type="number"
                  min="1"
                  value={formData.minStockLevel}
                  onChange={(e) => setFormData({ ...formData, minStockLevel: parseInt(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Safety Stock</label>
                <input
                  type="number"
                  min="1"
                  value={formData.safetyStock}
                  onChange={(e) => setFormData({ ...formData, safetyStock: parseInt(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Supplier Lead Time (Days)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.leadTimeDays}
                  onChange={(e) => setFormData({ ...formData, leadTimeDays: parseInt(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Max Capacity (Units)</label>
                <input
                  type="number"
                  min="10"
                  value={formData.maxStockLevel}
                  onChange={(e) => setFormData({ ...formData, maxStockLevel: parseInt(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Supplier Name</label>
              <input
                type="text"
                value={formData.supplierName}
                onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Supplier Contact</label>
              <input
                type="email"
                value={formData.supplierEmail}
                onChange={(e) => setFormData({ ...formData, supplierEmail: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-300 hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-xl bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/20 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Save Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
