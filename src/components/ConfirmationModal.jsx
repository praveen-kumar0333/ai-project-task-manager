import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import GlassPanel from './spatial/GlassPanel.jsx';

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Deletion", 
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  confirmLabel = "Delete"
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <GlassPanel level="floating" className="w-full max-w-md overflow-hidden flex flex-col border border-white/20 shadow-2xl">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-white leading-snug">{title}</h3>
              <p className="text-sm text-slate-300 mt-1 leading-relaxed">{message}</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white/5 border-t border-white/10 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-sm font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors shadow-lg shadow-rose-600/30 border border-rose-400/30 cursor-pointer active:scale-[0.98]"
          >
            {confirmLabel}
          </button>
        </div>
      </GlassPanel>
    </div>
  );
}
