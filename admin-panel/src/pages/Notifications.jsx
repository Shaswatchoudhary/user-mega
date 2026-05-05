import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Send, 
  Users, 
  ShieldCheck, 
  Search, 
  Filter, 
  Trash2, 
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import GradientCard from '../components/GradientCard';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import api from '../utils/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // all, users, workers
  
  // Broadcast Form State
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    target: 'all', // all, users, workers
    priority: 'normal' // normal, high, urgent
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // In a real app, you'd fetch history from a DB. 
      // For now, we'll keep the UI history local, but the SEND is real.
      setTimeout(() => {
        setNotifications([
          { 
            id: 1, 
            title: 'System Maintenance', 
            message: 'We will be undergoing scheduled maintenance tonight at 2 AM. Some services may be intermittent.',
            target: 'all',
            sender: 'System Admin',
            sentAt: new Date().toISOString(),
            status: 'delivered',
            priority: 'high'
          }
        ]);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    }
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.message) return;

    setIsSending(true);
    try {
      // ━━━━━━━━━━━━━━━━━━━━━
      // REAL LIVE API CALL
      // ━━━━━━━━━━━━━━━━━━━━━
      const response = await api.post('/admin/broadcast', formData);
      
      if (response.data.success) {
        alert(response.data.message); // Shows how many devices received it
        
        const newNotif = {
          id: Date.now(),
          ...formData,
          sender: 'Administrator',
          sentAt: new Date().toISOString(),
          status: 'delivered'
        };
        
        setNotifications([newNotif, ...notifications]);
        setFormData({ title: '', message: '', target: 'all', priority: 'normal' });
      }
    } catch (error) {
      console.error('Broadcast Error:', error);
      alert(error.response?.data?.message || 'Failed to send broadcast. Make sure the backend is running.');
    } finally {
      setIsSending(false);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'all') return true;
    return n.target === activeTab;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <SectionHeader 
        title="Notifications Center" 
        subtitle="Broadcast messages and manage system-wide alerts"
        icon={<Bell className="text-accent-red" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Broadcast Form */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm h-fit sticky top-28">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-accent-red/10 rounded-lg text-accent-red">
                <Send size={20} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Send Broadcast</h3>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Target Audience</label>
                <div className="grid grid-cols-3 gap-2">
                  {['all', 'users', 'workers'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormData({ ...formData, target: t })}
                      className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                        formData.target === t 
                        ? 'bg-accent-red text-white shadow-md' 
                        : 'bg-slate-50 text-slate-500 border border-slate-100 hover:border-slate-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Title</label>
                <input 
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-accent-red transition-all"
                  placeholder="Notification Heading"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Message Body</label>
                <textarea 
                  rows="4"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-accent-red transition-all resize-none"
                  placeholder="What would you like to tell your audience?"
                />
              </div>

              <button 
                type="submit"
                disabled={isSending}
                className="w-full bg-accent-red hover:bg-accent-red/90 disabled:bg-slate-200 text-white font-black uppercase tracking-widest text-[11px] py-4 rounded-xl shadow-lg shadow-accent-red/20 transition-all flex items-center justify-center space-x-2"
              >
                {isSending ? 'Sending...' : (
                  <>
                    <Send size={16} />
                    <span>Blast Notification</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right: History List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              {['all', 'users', 'workers'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeTab === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            <button className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-800 transition-colors">
              <Filter size={14} />
              <span>Filter History</span>
            </button>
          </div>

          <div className="space-y-4">
            {loading ? (
              [1,2,3].map(i => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-slate-100" />)
            ) : filteredNotifications.length > 0 ? (
              filteredNotifications.map((notif) => (
                <div key={notif.id} className="group bg-white border border-slate-200 p-5 rounded-2xl hover:border-accent-red/30 hover:shadow-xl hover:shadow-slate-200/50 transition-all flex items-start space-x-4">
                  <div className={`p-3 rounded-xl ${
                    notif.target === 'workers' ? 'bg-blue-50 text-blue-600' : 'bg-accent-red/10 text-accent-red'
                  }`}>
                    {notif.target === 'workers' ? <ShieldCheck size={20} /> : <Users size={20} />}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">{notif.title}</h4>
                      <span className="text-[10px] font-black text-slate-300 uppercase">{new Date(notif.sentAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">{notif.message}</p>
                    <div className="flex items-center space-x-4 pt-2">
                      <div className="flex items-center space-x-1.5">
                        <StatusBadge status={notif.status} />
                      </div>
                      <div className="h-1 w-1 bg-slate-200 rounded-full" />
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">SENT BY: {notif.sender}</span>
                    </div>
                  </div>

                  <button className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-accent-red transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            ) : (
              <EmptyState title="No Notifications Found" subtitle="You haven't sent any broadcast messages yet." />
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Notifications;
