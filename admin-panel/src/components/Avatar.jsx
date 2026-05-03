import React, { useState } from 'react';

const Avatar = ({ src, alt, size = 'md', initials, online }) => {
  const [imageError, setImageError] = useState(false);

  const sizes = {
    sm: 'w-8 h-8 text-[10px]',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl'
  };

  const showInitials = !src || imageError;

  return (
    <div className="relative inline-block">
      {!showInitials ? (
        <div className={`rounded-xl overflow-hidden shadow-inner border border-border ${sizes[size]}`}>
          <img 
            src={src} 
            alt={alt || initials} 
            className="w-full h-full object-cover" 
            onError={() => setImageError(true)}
          />
        </div>
      ) : (
        <div className={`rounded-xl bg-[#1A1A1A] flex items-center justify-center text-white font-black border border-white/10 shadow-premium ${sizes[size]}`}>
          {initials?.substring(0, 2).toUpperCase() || 'U'}
        </div>
      )}
      
      {online !== undefined && (
        <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
          online ? 'bg-accent-red animate-pulse' : 'bg-text-muted'
        }`} />
      )}
    </div>
  );
};

export default Avatar;
