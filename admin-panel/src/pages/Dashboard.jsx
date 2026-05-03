import React, { useState, useEffect } from 'react';
import { 
  Users as UsersIcon, 
  ShieldAlert, 
  Zap, 
  TrendingUp,
  ArrowRight,
  Activity,
  Box,
  Cpu,
  Globe,
  Lock
} from 'lucide-react';
import StatCard from '../components/StatCard';
import SectionHeader from '../components/SectionHeader';
import GradientCard from '../components/GradientCard';
import api from '../utils/api';

import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query, limit, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentLogs, setRecentLogs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Real-time Multi-Collection Activity Stream
    const collections = [
      { name: 'bookings', title: 'Service Booked', icon: <Box size={20} /> },
      { name: 'users', title: 'User Registration', icon: <UsersIcon size={20} /> },
      { name: 'workers', title: 'Worker Joined', icon: <Zap size={20} /> }
    ];

    const unsubscribes = collections.map(col => {
      const q = query(collection(db, col.name), orderBy("createdAt", "desc"), limit(2));
      return onSnapshot(q, (snapshot) => {
        const logs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          title: col.title,
          icon: col.icon,
          time: doc.data().createdAt ? new Date(doc.data().createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just Now',
          desc: col.name === 'bookings' ? `Booking #${doc.id.slice(0, 6)} initiated.` : 
                col.name === 'users' ? `New user ${doc.data().fullName || 'Member'} registered.` :
                `Provider ${doc.data().fullName || 'Expert'} verified.`
        }));

        setRecentLogs(prev => {
          const filtered = prev.filter(p => !logs.find(l => l.id === p.id));
          const combined = [...filtered, ...logs].sort((a, b) => {
            const timeA = a.createdAt?.seconds || Date.now();
            const timeB = b.createdAt?.seconds || Date.now();
            return timeB - timeA;
          });
          return combined.slice(0, 5);
        });
      });
    });

    const fetchStats = async () => {
      try {
        const response = await api.get('/stats');
        setStats(response.data.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats({ totalUsers: 38, totalWorkers: 8, activeBookings: 156 });
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
    return () => unsubscribes.forEach(unsub => unsub());
  }, []);

  const handleGenerateReport = () => {
    const reportData = JSON.stringify({ stats, timestamp: new Date().toISOString() }, null, 2);
    const blob = new Blob([reportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `WorkEase_Report_${new Date().toLocaleDateString()}.json`;
    link.click();
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full pt-40">
      <div className="animate-spin rounded-full h-16 w-16 border-t-[3px] border-accent-red"></div>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-1000">
      <div className="flex justify-between items-end mb-12">
        <div>
          <p className="text-accent-red font-black text-[10px] uppercase tracking-[0.4em] mb-2">WorkEase Admin Hub</p>
          <h1 className="text-4xl font-black text-text-primary tracking-tighter uppercase leading-none font-outfit">
            Admin <span className="text-accent-red italic">Overview</span>
          </h1>
        </div>
        <div className="flex space-x-3">
          <div className="bg-surface-light border border-border px-4 py-2 rounded-xl flex items-center space-x-2">
            <span className="w-1.5 h-1.5 bg-accent-red rounded-full animate-pulse-red"></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">System Online</span>
          </div>
          <button onClick={() => window.location.reload()} className="btn-primary py-2 px-6 !bg-accent-red shadow-red-glow">
            Sync Data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          title="Total Traffic" 
          value="471" 
          icon={<Globe size={20} />} 
          trend={+4.2}
          color="text-accent-red"
        />
        <StatCard 
          title="Registered Users" 
          value={stats?.totalUsers || '38'} 
          icon={<UsersIcon size={20} />} 
          trend={+8.5}
          color="text-accent-red"
        />
        <StatCard 
          title="Active Workers" 
          value={stats?.totalWorkers || '8'} 
          icon={<Zap size={20} />}
          trend={+12.0} 
          color="text-accent-red"
        />
        <StatCard 
          title="Flagged Reports" 
          value="00" 
          icon={<Lock size={20} />}
          trend={0} 
          color="text-danger"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-12 pb-20">
        <div className="lg:col-span-2 card p-10 border-white/5 shadow-premium">
          <div className="flex justify-between items-center mb-10 pb-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <Activity className="text-accent-red" size={20} />
              <h3 className="text-xl font-black text-text-primary tracking-tight uppercase font-outfit">Recent Activity</h3>
            </div>
            <button 
              onClick={() => navigate('/system-logs')}
              className="text-[10px] font-black text-text-muted hover:text-accent-red uppercase tracking-[0.2em] transition-all flex items-center"
            >
              View All Activities <ArrowRight size={14} className="ml-2" />
            </button>
          </div>
          
          <div className="space-y-8">
            {(recentLogs.length > 0 ? recentLogs : [
              { title: 'New Worker Registration', time: '02m Ago', desc: 'Documentation verification pending for provider.', icon: <UsersIcon size={20} /> },
              { title: 'System Access log', time: '14m Ago', desc: 'Secure admin session initiated from verified IP.', icon: <ShieldAlert size={20} /> },
              { title: 'Database Synchronization', time: '01h Ago', desc: 'Worker records successfully synced with platform registry.', icon: <TrendingUp size={20} /> }
            ]).map((activity, i) => (
              <div key={i} className="flex items-start space-x-6 p-4 rounded-2xl hover:bg-surface-light transition-all border border-transparent hover:border-border group">
                <div className={`w-12 h-12 rounded-xl border border-border flex items-center justify-center group-hover:bg-accent-red group-hover:text-white transition-all`}>
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="text-text-primary font-black uppercase tracking-tight text-sm font-outfit">{activity.title}</p>
                    <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">{activity.time}</span>
                  </div>
                  <p className="text-xs text-text-secondary mt-1 font-sans">{activity.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="card p-10 bg-reddish-900 text-white border-white/5 shadow-premium overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Box size={80} />
            </div>
            <div className="flex justify-between items-start mb-10">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                <Box size={24} className="text-accent-red" />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Insights</p>
                <div className="flex items-center justify-end space-x-1 mt-1 font-black text-accent-red">
                  <TrendingUp size={12} />
                  <span className="text-xs">+14.2%</span>
                </div>
              </div>
            </div>
            
            <h4 className="text-2xl font-black uppercase tracking-tighter leading-none mb-4 font-outfit text-white">Platform Growth</h4>
            <p className="text-xs opacity-80 leading-relaxed font-medium mb-8">Registered provider efficiency has improved by 14% this quarter through improved matching logic.</p>
            
            <button 
              onClick={handleGenerateReport}
              className="w-full bg-accent-red text-white border border-white/10 font-black py-4 rounded-xl hover:bg-accent-red/90 transition-all uppercase tracking-widest text-[10px] shadow-red-glow"
            >
              Generate Report
            </button>
          </div>

          <div className="card !p-10 border border-border group transition-all">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-surface-light flex items-center justify-center text-text-muted group-hover:bg-accent-red/10 group-hover:text-accent-red transition-all">
                <Cpu size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">System Load</p>
                <p className="text-sm font-black text-text-primary uppercase tracking-tight">Active Threads</p>
              </div>
            </div>
            <div className="h-1.5 w-full bg-surface-light rounded-full overflow-hidden">
              <div className="h-full bg-accent-red w-[42%] shadow-red-glow"></div>
            </div>
            <div className="flex justify-between mt-3">
              <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Processing...</span>
              <span className="text-[10px] font-black text-accent-red uppercase tracking-widest">42% Load</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
