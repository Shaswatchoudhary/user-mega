import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  Activity, 
  Cpu, 
  ShieldCheck, 
  Zap,
  ArrowRight,
  Search,
  Globe,
  Radio,
  Phone,
  MessageSquare,
  Maximize2
} from 'lucide-react';
import api from '../utils/api';
import Avatar from '../components/Avatar';

const Tracker = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await api.get('/workers');
        const data = response.data.data || [];
        setProviders(data);
        if (data.length > 0 && !selectedNode) {
          setSelectedNode(data[0]);
        }
      } catch (error) {
        console.error('Error fetching tracker data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProviders();
    const interval = setInterval(fetchProviders, 15000);
    return () => clearInterval(interval);
  }, [selectedNode]);

  if (loading) return (
    <div className="flex items-center justify-center h-full pt-40">
      <div className="animate-spin rounded-full h-16 w-16 border-t-[3px] border-accent-red"></div>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-1000 pb-20">
      
      <div className="flex justify-between items-end mb-12">
        <div>
          <p className="text-accent-red font-black text-[10px] uppercase tracking-[0.4em] mb-2">Live Service Monitoring // Global Fleet</p>
          <h1 className="text-4xl font-black text-text-primary tracking-tighter uppercase leading-none font-outfit">
            Field <span className="text-accent-red italic">Tracker</span>
          </h1>
          <p className="text-text-secondary text-xs mt-3 max-w-md font-medium leading-relaxed">
            Real-time visualization of service provider locations, current availability, and active engagement status.
          </p>
        </div>
        <div className="flex space-x-3">
          <div className="bg-accent-red/5 border border-accent-red/10 px-4 py-2 rounded-xl flex items-center space-x-3 shadow-sm">
            <span className="w-1.5 h-1.5 bg-accent-red rounded-full animate-pulse-red"></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-accent-red">Active Providers: {providers.filter(p => p.isOnline).length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
           <div className="relative bg-reddish-950 border border-white/5 rounded-[3rem] overflow-hidden min-h-[600px] shadow-premium group">
              {/* Premium Grid Background */}
              <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#C41E3A 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
              <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(#fff 0.5px, transparent 0.5px), linear-gradient(90deg, #fff 0.5px, transparent 0.5px)', backgroundSize: '100px 100px' }}></div>

              {/* Provider Markers (Simulated Scatter) */}
              {providers.map((p, idx) => (
                <div 
                  key={p._id}
                  onClick={() => setSelectedNode(p)}
                  className={`absolute cursor-pointer transition-all duration-700 hover:scale-125 ${selectedNode?._id === p._id ? 'z-20' : 'z-10'}`}
                  style={{ 
                    left: `${20 + (idx * 137) % 65}%`, 
                    top: `${15 + (idx * 211) % 70}%` 
                  }}
                >
                  <div className={`relative flex flex-col items-center group`}>
                    <div className={`w-10 h-10 rounded-2xl border-2 p-0.5 transition-all bg-reddish-900 shadow-lg ${p.isOnline ? 'border-accent-red' : 'border-white/10'} ${selectedNode?._id === p._id ? 'scale-110 border-accent-red shadow-red-glow' : ''}`}>
                       <Avatar src={p.profileImage} initials={p.fullName} size="xs" />
                    </div>
                    {selectedNode?._id === p._id && (
                       <div className="absolute top-14 bg-accent-red text-white px-3 py-1.5 rounded-lg border border-white/10 shadow-premium whitespace-nowrap animate-in slide-in-from-top-2 z-30">
                          <p className="text-[9px] font-black uppercase tracking-widest">{p.fullName}</p>
                       </div>
                    )}
                  </div>
                </div>
              ))}

              <div className="absolute bottom-8 right-8 flex flex-col space-y-3 relative z-30">
                 <button className="w-12 h-12 bg-reddish-900 border border-white/10 rounded-2xl flex items-center justify-center text-white/40 hover:text-accent-red shadow-premium transition-all"><Maximize2 size={20}/></button>
                 <button className="w-12 h-12 bg-reddish-900 border border-white/10 rounded-2xl flex items-center justify-center text-white/40 hover:text-accent-red shadow-premium transition-all"><Globe size={20}/></button>
              </div>
           </div>
        </div>

        <div className="space-y-8">
           {selectedNode && (
             <div className="card !p-10 border border-border bg-white rounded-3xl animate-in slide-in-from-right-10 shadow-premium">
                <div className="flex items-center space-x-6 mb-10 pb-10 border-b border-border">
                   <Avatar src={selectedNode.profileImage} initials={selectedNode.fullName} size="xl" ringColor="ring-accent-red/20" />
                   <div>
                      <h4 className="text-xl font-black text-text-primary uppercase tracking-tight leading-none font-outfit">{selectedNode.fullName}</h4>
                      <p className="text-accent-red font-black text-[10px] uppercase tracking-[0.2em] mt-2">{selectedNode.category || 'Professional'}</p>
                      <div className="flex items-center space-x-2 mt-4">
                         <span className={`w-2 h-2 rounded-full ${selectedNode.isOnline ? 'bg-accent-red animate-pulse-red' : 'bg-text-muted'}`}></span>
                         <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{selectedNode.isOnline ? 'Verified Connection' : 'Standard Status'}</span>
                      </div>
                   </div>
                </div>

                <div className="space-y-6 mb-10">
                   <div className="p-5 bg-surface-light rounded-2xl border border-border flex justify-between items-center transition-all hover:border-accent-red/20">
                      <div>
                         <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">Current Location</p>
                         <p className="text-xs font-black text-text-primary uppercase">{selectedNode.location?.address || 'Location Not Available'}</p>
                      </div>
                      <MapPin size={18} className="text-accent-red" />
                   </div>
                   <div className="p-5 bg-surface-light rounded-2xl border border-border flex justify-between items-center">
                      <div>
                         <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">Connection Signal</p>
                         <p className="text-xs font-black text-accent-red uppercase">Verified - Hub Node</p>
                      </div>
                      <Activity size={18} className="text-accent-red" />
                   </div>
                   <div className="p-5 bg-surface-light rounded-2xl border border-border flex justify-between items-center">
                      <div>
                         <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">Fleet Territory</p>
                         <p className="text-xs font-black text-text-primary uppercase">Alpha District</p>
                      </div>
                      <Navigation size={18} className="text-text-muted" />
                   </div>
                </div>

                <div className="flex gap-3">
                   <button className="flex-1 btn-primary !bg-accent-red !py-4 flex items-center justify-center shadow-red-glow transition-all active:scale-95">
                      <Phone size={16} className="mr-2" />
                      Contact
                   </button>
                   <button className="w-14 h-14 bg-surface-light border border-border rounded-2xl flex items-center justify-center text-text-primary hover:bg-reddish-900 hover:text-white hover:border-reddish-900 transition-all">
                      <MessageSquare size={20} />
                   </button>
                </div>
             </div>
           )}

            <div className="card !p-8 border border-border bg-white rounded-3xl">
              <h3 className="text-xs font-black text-text-primary uppercase tracking-[0.2em] mb-6 flex items-center">
                 <Radio size={14} className="mr-2 text-accent-red" /> active Fleet
              </h3>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                 {providers.map(p => (
                   <div 
                    key={p._id} 
                    onClick={() => setSelectedNode(p)}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${selectedNode?._id === p._id ? 'bg-reddish-900 text-white shadow-premium border-reddish-900' : 'bg-white border-border hover:bg-surface-light'}`}
                   >
                      <div className="flex items-center space-x-3">
                         <Avatar src={p.profileImage} initials={p.fullName} size="sm" />
                         <span className={`text-[10px] font-black uppercase tracking-tight ${selectedNode?._id === p._id ? 'text-white' : 'text-text-primary'}`}>{p.fullName}</span>
                      </div>
                      <span className={`w-1.5 h-1.5 rounded-full ${p.isOnline ? 'bg-accent-red shadow-red-glow' : 'bg-text-muted opacity-50'}`}></span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Tracker;
