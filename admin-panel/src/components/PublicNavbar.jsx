import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const PublicNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Services', path: '/services' },
    { label: 'For Workers', path: '/workers' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-reddish-900/5 px-8 h-20">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 bg-accent-red rounded-xl flex items-center justify-center shadow-red-glow">
            <span className="text-white font-black text-xl">W</span>
          </div>
          <span className="text-sm font-black tracking-[0.2em] text-reddish-900 uppercase">WorkEase</span>
        </div>
        <div className="hidden md:flex items-center space-x-10">
          {navLinks.map(item => (
            <button 
              key={item.path} 
              onClick={() => navigate(item.path)}
              className={`text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${
                isActive(item.path) ? 'text-accent-red' : 'text-text-muted hover:text-accent-red'
              }`}
            >
              {item.label}
            </button>
          ))}
          <button className="bg-accent-red text-white px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-red-glow hover:bg-reddish-800 transition-all hover:scale-105 active:scale-95">
            App Store
          </button>
        </div>
      </div>
    </header>
  );
};

export default PublicNavbar;
