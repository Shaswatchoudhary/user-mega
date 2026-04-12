import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Search, 
  Eye, 
  CheckCircle, 
  XCircle,
  Clock,
  ExternalLink,
  Phone,
  User,
  CheckCircle2
} from 'lucide-react';
import api from '../utils/api';

const Workers = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchWorkers = async () => {
    try {
      const response = await api.get('/workers');
      setWorkers(response.data.data);
    } catch (error) {
      console.error('Error fetching workers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.patch(`/workers/${id}/status`, { status });
      setSelectedWorker(null);
      fetchWorkers();
    } catch (error) {
      alert('Error updating status');
    }
  };

  const filteredWorkers = workers.filter(w => 
    w.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
    </div>
  );

  return (
    <div className="p-10 animate-in slide-in-from-bottom-5 duration-700">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Worker Verification</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Review and approve professional partners.</p>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search credentials..." 
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
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Professional</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Role</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Security Check</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Date Joined</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredWorkers.map((worker) => (
              <tr key={worker._id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-primary font-black border border-slate-200 text-lg group-hover:bg-white transition-all shadow-sm">
                      {worker.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 leading-tight">{worker.fullName}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{worker.phone}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black rounded-lg border border-slate-200 uppercase tracking-widest">
                    {worker.category}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex">
                    {worker.status === 'UNDER_REVIEW' && (
                      <span className="flex items-center space-x-2 text-amber-600 text-[10px] font-black bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100 uppercase tracking-widest">
                        <Clock size={12} /> <span>Under Review</span>
                      </span>
                    )}
                    {worker.status === 'ACTIVE' && (
                      <span className="flex items-center space-x-2 text-emerald-600 text-[10px] font-black bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 uppercase tracking-widest">
                        <CheckCircle size={12} /> <span>Active Partner</span>
                      </span>
                    )}
                    {worker.status === 'REJECTED' && (
                      <span className="flex items-center space-x-2 text-rose-600 text-[10px] font-black bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100 uppercase tracking-widest">
                        <XCircle size={12} /> <span>Restricted</span>
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <p className="text-xs text-slate-500 font-bold tracking-tight">{new Date(worker.createdAt).toLocaleDateString()}</p>
                </td>
                <td className="px-8 py-6 text-right">
                  <button 
                    onClick={() => setSelectedWorker(worker)}
                    className="p-2.5 bg-white hover:bg-primary text-slate-400 hover:text-white rounded-xl transition-all border border-slate-100 shadow-sm"
                  >
                    <Eye size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredWorkers.length === 0 && (
          <div className="flex flex-col items-center justify-center p-20 bg-slate-50/50">
            <ShieldCheck size={48} className="text-slate-200 mb-4" />
            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No records found.</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedWorker && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl flex items-center justify-center z-50 p-6 overflow-y-auto">
          <div className="bg-[#050505] border border-white/5 w-full max-w-5xl my-auto rounded-[3.5rem] shadow-glass animate-in zoom-in-95 duration-500 overflow-hidden">
            <div className="p-12">
              <div className="flex justify-between items-start mb-12">
                <div className="flex items-center space-x-8">
                  <div className="w-24 h-24 bg-primary rounded-[2rem] flex items-center justify-center text-white text-4xl font-black shadow-glass ring-8 ring-primary/5 italic">
                    {selectedWorker.fullName.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">{selectedWorker.fullName}</h2>
                    <p className="text-primary font-black uppercase tracking-[0.2em] text-xs mt-1">{selectedWorker.category} Authority</p>
                    <div className="flex items-center space-x-2 mt-3 p-2 bg-white/5 rounded-xl border border-white/5 w-fit">
                      <Phone size={14} className="text-slate-500" />
                      <p className="text-slate-400 text-xs font-black tracking-widest uppercase">{selectedWorker.phone}</p>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedWorker(null)}
                  className="p-4 bg-white/5 hover:bg-primary text-slate-500 hover:text-white rounded-2xl transition-all border border-white/10"
                >
                  <XCircle size={28} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-10">
                  <section>
                    <h4 className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-black mb-6 flex items-center">
                      <ShieldCheck size={14} className="mr-3 text-primary" /> Identity Verification
                    </h4>
                    <div className="bg-black p-8 rounded-[2.5rem] space-y-6 border border-white/5 shadow-2xl">
                      <div>
                        <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.2em] mb-2">Aadhaar Security Link</p>
                        <p className="text-2xl font-black text-white font-mono tracking-[0.3em] italic">{selectedWorker.aadhaar}</p>
                      </div>
                      <div className="pt-6 border-t border-white/5">
                        <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.2em] mb-2">PAN Registry Number</p>
                        <p className="text-2xl font-black text-white font-mono tracking-[0.3em] italic uppercase">{selectedWorker.pan}</p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h4 className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-black mb-6 flex items-center">
                      <MapPin size={14} className="mr-3 text-primary" /> Active Jurisdiction
                    </h4>
                    <div className="bg-black p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
                      <p className="text-white font-black text-lg leading-tight uppercase tracking-tight mb-3 italic">{selectedWorker.location.address}</p>
                      <div className="flex items-center space-x-2 opacity-30">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-ping"></div>
                        <p className="text-[10px] text-slate-500 font-black tracking-widest">GPS: {selectedWorker.location.coordinates[1]}, {selectedWorker.location.coordinates[0]}</p>
                      </div>
                    </div>
                  </section>
                </div>

                <div className="space-y-10">
                  <section>
                    <h4 className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-black mb-6 flex items-center">
                      <CheckCircle size={14} className="mr-3 text-primary" /> Financial Registry
                    </h4>
                    <div className="bg-black p-8 rounded-[2.5rem] space-y-6 border border-white/5 shadow-2xl">
                      <div className="flex justify-between items-end">
                        <div className="flex-1">
                          <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.2em] mb-2">Bank Institution</p>
                          <p className="text-xl font-black text-white uppercase tracking-tight italic">{selectedWorker.bankDetails.bankName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.2em] mb-2">IFSC Gateway</p>
                          <p className="text-lg font-black text-white font-mono tracking-widest">{selectedWorker.bankDetails.ifsc}</p>
                        </div>
                      </div>
                      <div className="pt-6 border-t border-white/5">
                        <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.2em] mb-2">Operational Account</p>
                        <p className="text-3xl font-black text-white font-mono tracking-[0.2em] italic">{selectedWorker.bankDetails.accountNumber}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <User size={12} className="text-primary" />
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest opacity-60">Verified Holder: {selectedWorker.bankDetails.holderName}</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="bg-primary/10 p-10 rounded-[3rem] border-2 border-primary/20 shadow-glass">
                    <h3 className="font-black text-white text-2xl mb-6 tracking-tighter uppercase italic">Authority Actions</h3>
                    <div className="flex flex-col space-y-4">
                      <button 
                        onClick={() => handleStatusUpdate(selectedWorker._id, 'ACTIVE')}
                        className="w-full bg-white text-black hover:bg-primary hover:text-white font-black py-5 rounded-[1.5rem] transition-all shadow-2xl flex items-center justify-center space-x-3 group"
                      >
                        <CheckCircle2 size={24} className="group-hover:scale-110 transition-transform" /> 
                        <span className="uppercase tracking-widest text-sm">Approve Identity</span>
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(selectedWorker._id, 'REJECTED')}
                        className="w-full bg-transparent hover:bg-rose-600 border-2 border-white/10 hover:border-rose-600 text-slate-500 hover:text-white font-black py-5 rounded-[1.5rem] transition-all flex items-center justify-center space-x-3 group"
                      >
                        <XCircle size={24} className="group-hover:scale-110 transition-transform" /> 
                        <span className="uppercase tracking-widest text-sm text-opacity-50">Restrict Registry</span>
                      </button>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workers;
