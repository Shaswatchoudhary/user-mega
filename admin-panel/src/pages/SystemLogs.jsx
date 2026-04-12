import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Search, 
  Clock, 
  User, 
  Briefcase,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import api from '../utils/api';

const SystemLogs = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLogs = async () => {
    try {
      const response = await api.get('/bookings');
      setBookings(response.data.data);
    } catch (error) {
      console.error('Error fetching system logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // Refresh logs every 30 seconds
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredLogs = bookings.filter(log => 
    log.workerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusStyle = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'accepted':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'cancelled':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default:
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
    </div>
  );

  return (
    <div className="p-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Traffic Logs</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Real-time assignment monitoring & analytics.</p>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Filter traffic..." 
            className="bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-6 text-sm focus:outline-none focus:border-primary/50 w-80 transition-all font-bold text-slate-700 shadow-soft"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-soft">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Assignment Index</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Category</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Timeline</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Revenue</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Service Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLogs.map((log) => (
              <tr key={log._id} className="hover:bg-slate-50/50 transition-all duration-300 group">
                <td className="px-8 py-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-black text-slate-400 uppercase">U</div>
                      <div className="w-8 h-8 rounded-full bg-primary/10 border-2 border-white flex items-center justify-center text-[8px] font-black text-primary uppercase">W</div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-black text-slate-900 text-sm tracking-tight group-hover:text-primary transition-colors uppercase italic">{log.userId?.name || 'Customer'}</p>
                        <span className="text-slate-300 text-[10px]">→</span>
                        <p className="font-black text-slate-900 text-sm tracking-tight uppercase italic">{log.workerName}</p>
                      </div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5 tracking-widest opacity-60">REF: {log._id.substring(18)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center space-x-2">
                    <Briefcase size={12} className="text-primary" />
                    <span className="text-[11px] font-black text-slate-600 uppercase tracking-tight">{log.category}</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-center">
                  <div className="inline-flex flex-col items-center">
                    <span className="text-[10px] font-black text-slate-500">{new Date(log.createdAt).toLocaleDateString()}</span>
                    <span className="text-[9px] font-bold text-slate-300 mt-0.5">{new Date(log.createdAt).toLocaleTimeString()}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <p className="text-sm font-black text-slate-900 tracking-tighter italic">₹{log.totalPrice}</p>
                </td>
                <td className="px-8 py-6 text-right">
                  <span className={`inline-flex px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${getStatusStyle(log.status)}`}>
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredLogs.length === 0 && (
          <div className="flex flex-col items-center justify-center p-32 bg-slate-50/20">
            <ClipboardList size={48} className="text-slate-100 mb-4 animate-pulse" />
            <p className="text-slate-300 font-black uppercase tracking-widest text-[10px] italic">Zero traffic recorded.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemLogs;
