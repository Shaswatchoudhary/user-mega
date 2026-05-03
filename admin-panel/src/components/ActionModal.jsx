import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ActionModal = ({ isOpen, onClose, onConfirm, title, message, type = 'danger' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-reddish-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-[2.5rem] shadow-premium max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-10">
          <div className="flex justify-between items-start mb-6">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${type === 'danger' ? 'bg-danger/10 text-danger' : 'bg-accent-red/10 text-accent-red'}`}>
              <AlertTriangle size={24} />
            </div>
            <button onClick={onClose} className="p-2 hover:bg-surface-light rounded-xl transition-colors">
              <X size={20} className="text-text-muted" />
            </button>
          </div>
          
          <h3 className="text-2xl font-black text-text-primary uppercase tracking-tighter font-outfit mb-4">{title}</h3>
          <p className="text-text-secondary text-sm leading-relaxed mb-10 font-medium">
            {message}
          </p>

          <div className="flex gap-4">
            <button 
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-border text-text-muted hover:bg-surface-light transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition-all active:scale-95 ${type === 'danger' ? 'bg-danger shadow-danger/20' : 'bg-accent-red shadow-red-glow'}`}
            >
              Confirm Action
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionModal;
