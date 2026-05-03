import React from 'react';
import { X } from 'lucide-react';

const DetailPanel = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" 
        onClick={onClose}
      />
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-2xl animate-in slide-in-from-right duration-500 ease-out">
          <div className="h-full flex flex-col bg-white shadow-premium border-l border-border relative">
            <div className="flex items-center justify-between p-8 border-b border-border">
              <div>
                <h2 className="text-2xl font-black text-text-primary tracking-tighter uppercase font-outfit">
                  {title}
                </h2>
                <p className="text-[10px] font-black text-accent-red uppercase tracking-widest mt-1">Management Console</p>
              </div>
              <button 
                onClick={onClose}
                className="p-3 text-text-muted hover:text-accent-red hover:bg-accent-red/5 rounded-2xl transition-all"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailPanel;
