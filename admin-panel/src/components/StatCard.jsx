import React from 'react';

const StatCard = ({ title, value, icon, trend, subtext }) => {
  return (
    <div className="stat-card group">
      <div className="p-4 bg-primary/10 rounded-2xl mb-4 group-hover:bg-primary/20 transition-all">
        {React.cloneElement(icon, { className: 'text-primary' })}
      </div>
      <span className="text-4xl font-extrabold text-white tracking-tight">{value}</span>
      <span className="text-sm font-semibold uppercase tracking-wider text-slate-500">{title}</span>
      {trend && (
        <span className={`text-xs mt-2 px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
          {trend > 0 ? '+' : ''}{trend}% from last week
        </span>
      )}
    </div>
  );
};

export default StatCard;
