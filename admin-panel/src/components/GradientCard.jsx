import React from 'react';

const GradientCard = ({ children, className = '' }) => {
  return (
    <div className="card-gradient group relative overflow-hidden bg-surface border border-border rounded-3xl transition-all duration-500 hover:shadow-premium">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
      <div className={`relative z-10 h-full ${className}`}>
        {children}
      </div>
    </div>
  );
};

export default GradientCard;
