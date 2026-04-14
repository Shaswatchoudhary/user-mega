import React, { useState, useEffect } from 'react';
import { 
  Users as UsersIcon, 
  Search, 
  Mail, 
  Phone, 
  Calendar,
  MoreVertical,
  ShieldAlert,
  Ban,
  Activity,
  Cpu,
  Globe,
  Database,
  ArrowRight
} from 'lucide-react';
import api from '../utils/api';
import SectionHeader from '../components/SectionHeader';
import SearchBar from '../components/SearchBar';
import Avatar from '../components/Avatar';
import EmptyState from '../components/EmptyState';
import StatCard from '../components/StatCard';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users');
        setUsers(response.data.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center h-full pt-40">
      <div className="animate-spin rounded-full h-16 w-16 border-t-[3px] border-accent-red"></div>
    </div>
  );

  return (
    <div className="animate-in slide-in-from-right-10 duration-1000">
      
      <div className="flex justify-between items-end mb-12">
        <div>
          <p className="text-accent-red font-black text-[10px] uppercase tracking-[0.4em] mb-2">Customer & Client Database</p>
          <h1 className="text-4xl font-black text-text-primary tracking-tighter uppercase leading-none font-outfit">
            User <span className="text-accent-red italic">Registry</span>
          </h1>
          <p className="text-text-secondary text-xs mt-3 max-w-md font-medium leading-relaxed">
            Manage your registered users and clients. Monitor account status, communication history, and platform engagement.
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="btn-primary py-2 px-6 !bg-accent-red shadow-red-glow transition-all active:scale-95">
            Register User
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="card !bg-reddish-900 text-white !border-white/5 relative overflow-hidden group shadow-premium">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <UsersIcon size={80} className="text-accent-red" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Platform Users</p>
          <div className="mt-4 flex items-end space-x-3 relative z-10">
            <h2 className="text-4xl font-black text-white">{users.length || '12,482'}</h2>
            <span className="text-[10px] font-bold pb-1 text-accent-red tracking-tight">+4.2% Growth</span>
          </div>
        </div>
        <StatCard title="Joined Today" value={Math.floor(users.length * 0.05) || '142'} icon={<Calendar />} color="text-accent-red" />
        <StatCard title="Suspended" value={29} icon={<Ban />} color="text-danger" />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div className="w-full md:w-96">
          <SearchBar 
            placeholder="Search Users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-3">
           <button className="px-5 py-2.5 bg-accent-red text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-red-glow transition-all">All Users</button>
           <button className="px-5 py-2.5 bg-white text-text-muted hover:text-accent-red text-[10px] font-black uppercase tracking-widest rounded-full transition-all border border-border">Active</button>
           <button className="px-5 py-2.5 bg-white text-text-muted hover:text-accent-red text-[10px] font-black uppercase tracking-widest rounded-full transition-all border border-border">Pending</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredUsers.map((user) => (
          <div key={user._id} className="card group hover:shadow-premium border border-border !p-8 transition-all hover:border-accent-red/20">
            <div className="flex items-start justify-between mb-8 pb-6 border-b border-border">
              <div className="flex items-center space-x-5">
                <Avatar src={user.profileImage} initials={user.name} size="lg" online={true} ringColor="ring-accent-red/10" />
                <div className="min-w-0">
                  <h3 className="text-lg font-black text-text-primary truncate transition-colors tracking-tight uppercase font-outfit group-hover:text-accent-red">{user.name || 'Personal Account'}</h3>
                  <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] mt-1">{user.email || 'Verified Customer'}</p>
                </div>
              </div>
              <button className="text-text-muted hover:text-accent-red transition-colors p-2 hover:bg-surface-light rounded-lg">
                <MoreVertical size={18} />
              </button>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center text-xs">
                <span className="font-black text-text-muted uppercase tracking-widest text-[9px]">Platform Status</span>
                <span className="px-2 py-0.5 bg-surface-light text-text-primary text-[10px] font-black rounded-md uppercase border border-border">Active</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-black text-text-muted uppercase tracking-widest text-[9px]">Last Active</span>
                <span className="font-black text-text-primary uppercase tracking-tight">Today</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 btn-secondary !py-3 !px-0 bg-white border-border text-text-primary hover:bg-reddish-900 hover:text-white hover:border-reddish-900 transition-all">
                View Account
              </button>
              <button className="w-12 h-12 bg-white border border-border rounded-2xl flex items-center justify-center text-text-muted hover:text-danger hover:bg-danger/5 transition-all">
                <ShieldAlert size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <EmptyState icon={UsersIcon} title="No Users Found" subtitle="Zero results found matching the current search parameters." />
      )}
    </div>
  );
};

export default Users;
