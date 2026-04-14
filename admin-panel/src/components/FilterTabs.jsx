import React from 'react';

const FilterTabs = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="flex items-center space-x-2 bg-background p-1.5 rounded-xl border border-border w-fit">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
              isActive 
                ? 'bg-surface text-primary shadow-soft' 
                : 'text-text-muted hover:text-text-primary hover:bg-surface-light/50'
            }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
};

export default FilterTabs;
