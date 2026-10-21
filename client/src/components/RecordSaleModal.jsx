import React, { useState } from 'react';
import { X, ShoppingBag, AlertCircle } from 'lucide-react';

export default function RecordSaleModal({ isOpen, onClose, products, onRecordSale }) {
  const [selectedSku, setSelectedSku] = useState(products[0]?.sku || '');
  const [quantity, setQuantity] = useState(2);
  const [channel, setChannel] = useState('Retail POS');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const currentProduct = products.find(p => p.sku === selectedSku) || products[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentProduct) return;

    if (quantity > currentProduct.currentStock) {
      setError(`Cannot sell ${quantity} units. Only ${currentProduct.currentStock} in stock.`);
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onRecordSale({
        sku: currentProduct.sku,
        quantitySold: parseInt(quantity, 10),
        channel
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to record sale');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Record Sale Transaction</h3>
              <p className="text-xs text-slate-400">Decrements live inventory & records POS revenue</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Select Product *</label>
            <select
              value={selectedSku}
              onChange={(e) => setSelectedSku(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-sky-500"
            >
              {products.map(p => (
                <option key={p.sku} value={p.sku}>
                  {p.sku} - {p.name} (₹{p.unitPrice}) [Stock: {p.currentStock}]
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Quantity Sold *</label>
              <input
                type="number"
                min="1"
                max={currentProduct?.currentStock || 999}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Sales Channel</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white"
              >
                <option value="Retail POS">Retail POS</option>
                <option value="Online Store">Online Store</option>
                <option value="Direct B2B">Direct B2B</option>
              </select>
            </div>
          </div>

          {currentProduct && (
            <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-800/80 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Unit Retail Price:</span>
                <span className="font-mono text-white">₹{currentProduct.unitPrice}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Transaction:</span>
                <span className="font-mono text-emerald-400 font-bold text-sm">
                  ₹{(quantity * currentProduct.unitPrice).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Est. Net Margin:</span>
                <span className="font-mono text-sky-400">
                  ₹{(quantity * (currentProduct.unitPrice - currentProduct.unitCost)).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !currentProduct || currentProduct.currentStock <= 0}
              className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition disabled:opacity-50"
            >
              {isSubmitting ? 'Recording...' : 'Record Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
