import React from 'react';

const Avatar = ({ src, alt, size = 'md', initials, online }) => {
  const sizes = {
    sm: 'w-8 h-8 text-[10px]',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl'
  };

  return (
    <div className="relative inline-block">
      {src ? (
        <div className={`rounded-xl overflow-hidden shadow-inner border border-border ${sizes[size]}`}>
          <img src={src} alt={alt || initials} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className={`rounded-xl bg-surface-light flex items-center justify-center text-text-primary font-black border border-border shadow-soft ${sizes[size]}`}>
          {initials?.substring(0, 2).toUpperCase() || 'U'}
        </div>
      )}
      
      {online !== undefined && (
        <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-surface ${
          online ? 'bg-success' : 'bg-text-muted'
        }`} />
      )}
    </div>
  );
};

export default Avatar;
