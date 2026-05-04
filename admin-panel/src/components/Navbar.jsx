import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Settings, 
  Bell, 
  Search,
  LayoutDashboard,
  Users as UsersIcon,
  ShieldCheck,
  ClipboardList,
  MapPin,
  AlertCircle,
  LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Avatar from './Avatar';
import { useAdmin } from '../context/AdminContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { profile, logout: centralLogout } = useAdmin();
  const isAuthenticated = localStorage.getItem('admin_auth') === 'true';

  if (!isAuthenticated) return null;
  
  const handleLogout = () => {
    centralLogout();
    navigate('/login');
  };

  const navLinks = [
    { title: 'Dashboard', path: '/', icon: <LayoutDashboard size={18} /> },
    { title: 'Users', path: '/users', icon: <UsersIcon size={18} /> },
    { title: 'Workers', path: '/workers', icon: <ShieldCheck size={18} /> },
    { title: 'Logs', path: '/system-logs', icon: <ClipboardList size={18} /> },
    { title: 'Tracker', path: '/tracker', icon: <MapPin size={18} /> },
    { title: 'Issues', path: '/issues', icon: <AlertCircle size={18} />, badge: true },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 h-20 bg-reddish-900 text-white z-50 px-8 shadow-premium border-b border-white/5">
      <div className="max-w-[1600px] mx-auto h-full flex items-center justify-between">
        
        {/* Left: Branding */}
        <div className="flex items-center space-x-6 lg:space-x-10 shrink-0">
          <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-accent-red rounded-xl flex items-center justify-center shadow-red-glow group-hover:scale-105 transition-all">
              <span className="text-white font-black text-xl">W</span>
            </div>
            <div className="flex flex-col hidden sm:flex">
              <span className="text-sm font-black tracking-[0.2em] text-white uppercase leading-tight font-outfit">WorkEase</span>
              <span className="text-[10px] font-black tracking-[0.3em] text-white/40 uppercase">Admin Hub</span>
            </div>
          </div>

          {/* Center: Nav Links */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => `
                  px-3 xl:px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center space-x-2
                  ${isActive 
                    ? 'bg-accent-red text-white shadow-red-glow' 
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                  }
                `}
              >
                <div className="relative">
                  {React.cloneElement(link.icon, { size: 16 })}
                  {link.badge && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent-red rounded-full border-2 border-reddish-900"></span>
                  )}
                </div>
                <span className="hidden xl:inline">{link.title}</span>
              </NavLink>
            ))}
          </div>
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center space-x-2 xl:space-x-6 shrink-0">
          <div className="relative hidden 2xl:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={14} />
            <input 
              type="text" 
              placeholder="SEARCH..." 
              className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-[9px] font-black uppercase tracking-widest focus:outline-none focus:border-accent-red/50 w-48 transition-all text-white"
            />
          </div>

          <div className="flex items-center space-x-1">
            <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all relative">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-accent-red rounded-full border-2 border-reddish-900"></span>
            </button>
            <NavLink to="/settings" className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all">
              <Settings size={18} />
            </NavLink>
          </div>

          <div className="h-8 w-[1px] bg-white/10 mx-1 hidden sm:block"></div>

          <NavLink to="/profile" className="flex items-center space-x-3 group cursor-pointer shrink-0">
            <div className="text-right hidden xl:block">
              <p className="text-[10px] font-black text-white uppercase tracking-tight group-hover:text-accent-red transition-colors">
                {profile?.fullName || 'Administrator'}
              </p>
              <p className="text-[8px] font-black text-white/40 uppercase tracking-widest leading-none">
                {profile?.role || 'Operations'}
              </p>
            </div>
            <div className="relative group">
              <Avatar 
                src={profile?.avatar} 
                initials={profile?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'AD'} 
                size="md"
                online={true}
              />
            </div>
          </NavLink>

          <div className="h-8 w-[1px] bg-white/10 mx-1"></div>

          <button 
            onClick={handleLogout}
            className="p-2.5 text-accent-red hover:bg-accent-red/10 rounded-xl transition-all group flex items-center space-x-2 shrink-0"
            title="Sign Out"
          >
            <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Logout</span>
          </button>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
