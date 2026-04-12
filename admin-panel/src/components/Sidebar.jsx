import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users as UsersIcon, 
  ShieldCheck, 
  ClipboardList, 
  Settings,
  LogOut
} from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { title: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { title: 'Verify Workers', icon: <ShieldCheck size={20} />, path: '/workers' },
    { title: 'User Directory', icon: <UsersIcon size={20} />, path: '/users' },
    { title: 'System Logs', icon: <ClipboardList size={20} />, path: '/system-logs' },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-slate-100 flex flex-col fixed left-0 top-0 z-50">
      <div className="p-8 flex items-center space-x-3 border-b border-slate-50">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
          <span className="text-white font-black text-xl">W</span>
        </div>
        <div>
          <span className="text-lg font-black tracking-tight text-slate-900 block leading-tight">WorkEase</span>
          <span className="text-primary text-[10px] font-bold uppercase tracking-wider">Admin</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              isActive ? 'sidebar-link-active' : 'sidebar-link'
            }
          >
            {item.icon}
            <span className="font-bold text-sm">{item.title}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-100 bg-slate-50/50">
        <button className="sidebar-link w-full text-left group hover:bg-white">
          <LogOut size={18} className="group-hover:text-primary transition-colors" />
          <span className="font-bold text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
