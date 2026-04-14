import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatCard = ({ title, value, trend, icon, color = 'text-primary', glowColor = 'shadow-glow-primary' }) => {
  const isPositive = trend > 0;
  
  return (
    <div className={`relative bg-white p-8 rounded-[2.5rem] shadow-soft border border-border hover:border-primary/50 hover:${glowColor} transition-all duration-500 group overflow-hidden`}>
      {/* Subtle glassmorphism effect background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[4rem] group-hover:bg-primary/10 transition-all duration-500 pointer-events-none" />
      
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] mb-4">{title}</p>
          <div className="flex items-end space-x-3">
            <h3 className="text-3xl font-black text-text-primary tracking-tighter uppercase leading-none">{value}</h3>
            {trend !== undefined && (
              <span className={`text-[10px] font-black pb-0.5 ${isPositive ? 'text-success' : 'text-danger'}`}>
                {isPositive ? '+' : ''}{trend}%
              </span>
            )}
          </div>
        </div>
        
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-surface-light group-hover:bg-primary/20 transition-all duration-300 ${color}`}>
          {React.cloneElement(icon, { size: 20 })}
        </div>
      </div>
      
      <div className="mt-6 h-1 w-full bg-surface-light rounded-full overflow-hidden">
         <div className={`h-full bg-primary/20 rounded-full group-hover:bg-primary transition-all duration-1000 w-[60%] shadow-glow-primary`} style={{ width: `${Math.min(Math.abs(trend) * 5, 100)}%` }}></div>
      </div>
    </div>
  );
};


export default StatCard;
