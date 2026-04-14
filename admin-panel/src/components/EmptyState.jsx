import React from 'react';

const EmptyState = ({ icon: Icon, title, subtitle }) => {
  return (
    <div className="flex flex-col items-center justify-center p-20 bg-surface/50 rounded-2xl border border-dashed border-border text-center">
      <div className="w-16 h-16 bg-surface-light rounded-2xl flex items-center justify-center mb-4 text-text-muted shadow-inner">
        {Icon && <Icon size={32} />}
      </div>
      <h3 className="text-lg font-black text-text-primary mb-1 uppercase tracking-tight">{title}</h3>
      <p className="text-text-muted font-bold text-xs uppercase tracking-widest max-w-sm">{subtitle}</p>
    </div>
  );
};

export default EmptyState;
