import React, { useState, useEffect } from 'react';
import { 
  Users as UsersIcon, 
  Search, 
  Mail, 
  Phone, 
  Calendar,
  MoreVertical
} from 'lucide-react';
import api from '../utils/api';

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
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
    </div>
  );

  return (
    <div className="p-10 animate-in slide-in-from-right-5 duration-700">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">User Directory</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Platform customer registry & profiles</p>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search registry..." 
            className="bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-6 text-sm focus:outline-none focus:border-primary/50 w-80 transition-all font-bold text-slate-700 shadow-soft"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <div key={user._id} className="card group hover:shadow-premium">
            <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-slate-50">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200 overflow-hidden shadow-inner">
                <img 
                  src={user.profileImage || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} 
                  alt={user.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-black text-slate-900 truncate group-hover:text-primary transition-colors uppercase tracking-tight italic">{user.name || 'Anonymous User'}</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5 truncate">ID: {user._id.substring(18)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-100 group-hover:border-primary/20 transition-all">
                <Phone size={14} className="text-primary" />
                <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">{user.phone}</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-100 group-hover:border-primary/20 transition-all">
                <Mail size={14} className="text-primary" />
                <span className="text-[11px] font-black text-slate-700 truncate lowercase">{user.email || 'No email registered'}</span>
              </div>
              
              <div className="flex items-center justify-between pt-4 mt-2">
                <div className="flex items-center space-x-2">
                  <Calendar size={12} className="text-slate-300" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                <button className="text-[9px] font-black text-primary uppercase tracking-[0.2em] hover:tracking-[0.3em] transition-all">
                  Profile Console
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="flex flex-col items-center justify-center p-32 bg-white/50 rounded-[3rem] border-2 border-dashed border-slate-100">
          <UsersIcon size={48} className="text-slate-100 mb-4" />
          <p className="text-slate-300 font-black uppercase tracking-widest text-xs italic">Registry indices empty.</p>
        </div>
      )}
    </div>
  );
};

export default Users;
