import React, { useState, useEffect } from 'react';
import { 
  Users as UsersIcon, 
  ShieldAlert, 
  CheckCircle, 
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import StatCard from '../components/StatCard';
import api from '../utils/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/stats');
        setStats(response.data.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
    </div>
  );

  return (
    <div className="p-10 animate-in fade-in duration-700">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Command Center</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Platform monitor & authority hub</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-soft flex items-center space-x-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">System Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={stats?.totalUsers || 0} 
          icon={<UsersIcon size={20} />} 
          trend={12}
        />
        <StatCard 
          title="Active Professionals" 
          value={stats?.activeWorkers || 0} 
          icon={<CheckCircle size={20} />} 
          trend={8}
        />
        <StatCard 
          title="Pending Reviews" 
          value={stats?.pendingWorkers || 0} 
          icon={<ShieldAlert size={20} />} 
        />
        <StatCard 
          title="Market Utilization" 
          value="94%" 
          icon={<TrendingUp size={20} />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
        <div className="lg:col-span-2 card bg-white">
          <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-50">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Launchpad</h3>
            <button className="text-primary hover:text-red-accent text-xs font-black uppercase tracking-widest flex items-center transition-all">
              Traffic Center <ArrowRight size={14} className="ml-2" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="text-left p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary/30 transition-all flex items-center justify-between group">
              <div>
                <p className="font-black text-slate-900 uppercase tracking-tight">Worker Queue</p>
                <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase">{stats?.pendingWorkers} Applications</p>
              </div>
              <ShieldAlert className="text-slate-300 group-hover:text-primary transition-colors" size={24} />
            </button>
            <button className="text-left p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary/30 transition-all flex items-center justify-between group">
              <div>
                <p className="font-black text-slate-900 uppercase tracking-tight">Cloud Traffic</p>
                <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase">Node Cluster Active</p>
              </div>
              <TrendingUp className="text-slate-300 group-hover:text-primary transition-colors" size={24} />
            </button>
          </div>
        </div>

        <div className="card bg-slate-900 text-white border-none shadow-premium relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <TrendingUp size={120} />
          </div>
          <h3 className="text-lg font-black mb-6 tracking-tight uppercase relative z-10">Activity</h3>
          <div className="flex flex-col items-center justify-center p-10 bg-white/5 rounded-2xl border border-white/10 border-dashed relative z-10">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest text-center leading-relaxed">Streaming logs available<br/>in 30 seconds</p>
          </div>
          <button className="w-full mt-6 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-accent transition-all relative z-10">
            View Analytics
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
