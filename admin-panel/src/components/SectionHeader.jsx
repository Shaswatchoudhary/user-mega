import React from 'react';

const SectionHeader = ({ title, subtitle, count, action }) => {
  return (
    <div className="flex justify-between items-end mb-10">
      <div>
        <div className="flex items-center space-x-3">
          <h1 className="text-3xl font-black text-text-primary tracking-tight">{title}</h1>
          {count !== undefined && (
            <span className="bg-primary/20 text-primary px-3 py-1 rounded-lg text-xs font-black">
              {count}
            </span>
          )}
        </div>
        {subtitle && <p className="text-text-muted font-medium text-sm mt-1">{subtitle}</p>}
      </div>
      
      {action && (
        <div>{action}</div>
      )}
    </div>
  );
};

export default SectionHeader;
