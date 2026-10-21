import React, { useState } from 'react';
import { X, ArrowUpCircle, ArrowDownCircle, AlertCircle } from 'lucide-react';

export default function AdjustStockModal({ isOpen, onClose, product, onAdjust }) {
  const [type, setType] = useState('add');
  const [quantity, setQuantity] = useState(10);
  const [reason, setReason] = useState('Shipment Received');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quantity || quantity <= 0) {
      setError('Please provide a valid quantity greater than 0');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onAdjust(product.sku, {
        type,
        quantity: parseInt(quantity, 10),
        reason
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to adjust stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">Adjust Stock Level</h3>
            <p className="text-xs text-slate-400 font-mono">{product.sku} - {product.name}</p>
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
          <div className="flex p-1 bg-slate-800/80 rounded-xl border border-slate-700/60">
            <button
              type="button"
              onClick={() => { setType('add'); setReason('Shipment Received'); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition ${
                type === 'add'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowUpCircle className="w-4 h-4" />
              <span>Add Stock (+ Restock)</span>
            </button>
            <button
              type="button"
              onClick={() => { setType('subtract'); setReason('Inventory Shrinkage / Damage'); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition ${
                type === 'subtract'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowDownCircle className="w-4 h-4" />
              <span>Deduct (- Loss/Damaged)</span>
            </button>
          </div>

          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-800 text-xs">
            <span className="text-slate-400">Current Stock:</span>
            <span className="font-bold text-white font-mono">{product.currentStock} units</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Adjustment Quantity *</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-sky-500 font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Reason / Note</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-sky-500"
            />
          </div>

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
              disabled={isSubmitting}
              className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-sky-500 hover:bg-sky-400 text-white transition disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Confirm Adjustment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
