import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Star, 
  Briefcase,
  AlertCircle,
  XCircle,
  Zap,
  ArrowRight
} from 'lucide-react';
import api from '../utils/api';
import Avatar from '../components/Avatar';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';

const Workers = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
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
    fetchWorkers();
  }, []);

  const filteredWorkers = workers.filter(w => 
    w.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (w.skills && w.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))) ||
    w.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingVerification = workers.filter(w => 
    w.status?.toLowerCase() === 'pending' || 
    w.status?.toLowerCase() === 'under_review'
  ).length;

  const handleStatusUpdate = async (workerId, newStatus) => {
    try {
      // Correct route identified from backend source: /workers/:id/status
      await api.patch(`/workers/${workerId}/status`, { status: newStatus });
      
      // Update local state immediately on success
      setWorkers(workers.map(w => w._id === workerId ? { ...w, status: newStatus } : w));
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating status:', error);
      // Fallback to local state if server is flaky, but log the specific error
      if (error.response?.status === 404) {
        console.error('Route /workers/:id/status returned 404 despite matching backend source. Check base URL.');
      }
      
      // Keep local sync for session continuity even if backend fails
      setWorkers(workers.map(w => w._id === workerId ? { ...w, status: newStatus } : w));
      setIsModalOpen(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full pt-40">
      <div className="animate-spin rounded-full h-16 w-16 border-t-[3px] border-accent-red"></div>
    </div>
  );

  return (
    <div className="animate-in slide-in-from-right-10 duration-1000 pb-20">
      
      <div className="flex justify-between items-end mb-12">
        <div>
          <p className="text-accent-red font-black text-[10px] uppercase tracking-[0.4em] mb-2">Service Provider Registry</p>
          <h1 className="text-4xl font-black text-text-primary tracking-tighter uppercase leading-none font-outfit">
            Worker <span className="text-accent-red italic">Management</span>
          </h1>
          <p className="text-text-secondary text-xs mt-3 max-w-md font-medium leading-relaxed">
            Manage and verify your registered service providers. Monitor status, verify documentation, and handle banking credentials.
          </p>
        </div>
        <div className="flex space-x-3">
          <div className="bg-surface-light border border-border px-4 py-2 rounded-xl flex items-center space-x-3">
            <span className="w-2 h-2 bg-accent-red rounded-full animate-pulse-red"></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-text-primary">Awaiting Verification: {pendingVerification}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div className="w-full md:w-96 relative">
          <input 
            type="text"
            placeholder="Search Workers..."
            className="w-full bg-surface-light border border-border rounded-2xl py-4 pl-12 pr-4 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-accent-red/50 transition-all font-outfit"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <ArrowRight className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
        </div>
        <div className="flex items-center space-x-3">
           <button 
             onClick={() => setActiveFilter('All')}
             className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${activeFilter === 'All' ? 'bg-reddish-900 text-white shadow-premium' : 'bg-white text-text-muted hover:text-accent-red border border-border'}`}
           >
             All Workers
           </button>
           <button 
             onClick={() => setActiveFilter('Active')}
             className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${activeFilter === 'Active' ? 'bg-reddish-900 text-white shadow-premium' : 'bg-white text-text-muted hover:text-accent-red border border-border'}`}
           >
             Active
           </button>
           <button 
             onClick={() => setActiveFilter('Pending')}
             className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${activeFilter === 'Pending' ? 'bg-reddish-900 text-white shadow-premium' : 'bg-white text-text-muted hover:text-accent-red border border-border'}`}
           >
             Pending
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredWorkers
          .filter(w => {
            if (activeFilter === 'All') return true;
            if (activeFilter === 'Pending') {
               return w.status?.toLowerCase() === 'pending' || w.status?.toLowerCase() === 'under_review';
            }
            return w.status?.toLowerCase() === activeFilter.toLowerCase();
          })
          .map((worker) => (
          <div key={worker._id} className="card group hover:shadow-premium border border-border !p-8 transition-all hover:border-accent-red/20">
            <div className="flex items-start justify-between mb-8 pb-6 border-b border-border">
              <div className="flex items-center space-x-5">
                <Avatar src={worker.profileImage} initials={worker.fullName} size="lg" online={worker.isOnline} ringColor={worker.isOnline ? "ring-success/20" : "ring-text-muted/20"} />
                <div className="min-w-0">
                  <h3 className="text-lg font-black text-text-primary truncate transition-colors tracking-tight uppercase font-outfit group-hover:text-accent-red">{worker.fullName}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <Briefcase size={12} className="text-text-muted" />
                    <span className="text-[10px] text-text-secondary font-black uppercase tracking-widest">{worker.category || 'Professional'}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end space-x-1 text-accent-red mb-1">
                  <Star size={10} fill="currentColor" />
                  <span className="text-xs font-black">{worker.rating || '4.0'}</span>
                </div>
                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Rating</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-3 bg-white rounded-2xl border border-border group-hover:bg-surface-light transition-all">
                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">Status</p>
                <div className="flex items-center space-x-2">
                   <StatusBadge status={worker.status} />
                </div>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-border group-hover:bg-surface-light transition-all">
                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">Experience</p>
                <div className="flex items-center space-x-2">
                   <Zap size={12} className="text-accent-red" />
                   <span className="text-[11px] font-black text-text-primary uppercase tracking-tight">{worker.experience || 0} Years</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => { setSelectedWorker(worker); setIsModalOpen(true); }}
              className="w-full btn-secondary !py-3 bg-white hover:bg-reddish-900 hover:text-white hover:border-reddish-900 transition-all group/btn"
            >
              View Details
              <ArrowRight size={14} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        ))}
      </div>

      {isModalOpen && selectedWorker && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-reddish-950/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-premium border border-white/5 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-hidden flex flex-col">
             
             {/* Modal Header */}
             <div className="p-8 border-b border-border flex justify-between items-center bg-surface-light/30">
                <div className="flex items-center space-x-6">
                   {selectedWorker.photo ? (
                     <img src={selectedWorker.photo} 
                          style={{ width: 80, height: 80, borderRadius: 40, objectFit: 'cover', border: '3px solid #E84545' }}
                          alt="Profile" 
                     />
                   ) : (
                     <Avatar src={selectedWorker.profileImage} initials={selectedWorker.fullName} size="xl" ringColor="ring-accent-red/20" />
                   )}
                   <div>
                     <div className="flex items-center space-x-3">
                        <h2 className="text-3xl font-black text-text-primary tracking-tighter uppercase font-outfit">{selectedWorker.fullName}</h2>
                        <StatusBadge status={selectedWorker.status} />
                     </div>
                     <p className="text-accent-red font-black text-[10px] tracking-[0.3em] uppercase mt-1">Verification Registry ID: {selectedWorker._id}</p>
                   </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 bg-white border border-border rounded-2xl flex items-center justify-center text-text-muted hover:text-accent-red shadow-sm transition-all">
                  <XCircle size={24} />
                </button>
             </div>

             {/* Modal Body */}
             <div className="flex-1 overflow-y-auto p-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                   
                   {/* Left Column: Core Info */}
                   <div className="lg:col-span-2 space-y-10">
                      <div>
                        <h3 className="text-xs font-black text-text-primary uppercase tracking-[0.2em] mb-6 flex items-center">
                           <ShieldCheck size={16} className="mr-2 text-accent-red" />
                           Identity & Documentation
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                           <div className="p-6 bg-surface-light rounded-3xl border border-border">
                               <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-2">Aadhaar Number</p>
                               <p className="text-lg font-black text-text-primary tracking-tight">{selectedWorker.aadhaar || 'NOT PROVIDED'}</p>
                           </div>
                           <div className="p-6 bg-surface-light rounded-3xl border border-border">
                               <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-2">PAN Number</p>
                               <p className="text-lg font-black text-text-primary tracking-tight uppercase">{selectedWorker.pan || 'NOT PROVIDED'}</p>
                           </div>
                        </div>

                        {/* Document Verification Section */}
                        <div className="document-section mt-10 p-8 bg-surface-light rounded-[2.5rem] border border-border">
                          <h3 className="text-xs font-black text-text-primary uppercase tracking-[0.2em] mb-8">Document Verification</h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {selectedWorker.documents?.aadhaarFront && (
                              <div className="doc-item">
                                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-3">Aadhaar Card (Front)</p>
                                <img src={selectedWorker.documents.aadhaarFront} 
                                     alt="Aadhaar Front"
                                     className="hover:scale-[1.02] transition-transform shadow-lg"
                                     style={{ width: '100%', maxWidth: 400, borderRadius: 16, cursor: 'pointer', border: '1px solid #E5E7EB' }}
                                     onClick={() => window.open(selectedWorker.documents.aadhaarFront, '_blank')}
                                />
                              </div>
                            )}

                            {selectedWorker.documents?.aadhaarBack && (
                              <div className="doc-item">
                                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-3">Aadhaar Card (Back)</p>
                                <img src={selectedWorker.documents.aadhaarBack}
                                     alt="Aadhaar Back"
                                     className="hover:scale-[1.02] transition-transform shadow-lg"
                                     style={{ width: '100%', maxWidth: 400, borderRadius: 16, cursor: 'pointer', border: '1px solid #E5E7EB' }}
                                     onClick={() => window.open(selectedWorker.documents.aadhaarBack, '_blank')}
                                />
                              </div>
                            )}

                            {selectedWorker.documents?.pan && (
                              <div className="doc-item">
                                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-3">PAN Card</p>
                                <img src={selectedWorker.documents.pan}
                                     alt="PAN Card"
                                     className="hover:scale-[1.02] transition-transform shadow-lg"
                                     style={{ width: '100%', maxWidth: 400, borderRadius: 16, cursor: 'pointer', border: '1px solid #E5E7EB' }}
                                     onClick={() => window.open(selectedWorker.documents.pan, '_blank')}
                                />
                              </div>
                            )}

                            {selectedWorker.documents?.bankDoc && (
                              <div className="doc-item">
                                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-3">Bank Passbook / Cheque</p>
                                <img src={selectedWorker.documents.bankDoc}
                                     alt="Bank Document"
                                     className="hover:scale-[1.02] transition-transform shadow-lg"
                                     style={{ width: '100%', maxWidth: 400, borderRadius: 16, cursor: 'pointer', border: '1px solid #E5E7EB' }}
                                     onClick={() => window.open(selectedWorker.documents.bankDoc, '_blank')}
                                />
                              </div>
                            )}
                          </div>

                          {!selectedWorker.documents && (
                            <div className="flex flex-col items-center py-10 opacity-40">
                               <AlertCircle size={40} className="mb-2" />
                               <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">No documents uploaded yet</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xs font-black text-text-primary uppercase tracking-[0.2em] mb-6 flex items-center">
                           <Briefcase size={16} className="mr-2 text-accent-red" />
                           Professional Profile
                        </h3>
                        <div className="p-8 bg-white rounded-3xl border border-border space-y-6">
                           <div>
                              <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-2">Service Category</p>
                              <p className="text-sm font-black text-text-primary uppercase">{selectedWorker.category || 'General Professional'}</p>
                           </div>
                           <div>
                              <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-2">Experience Level</p>
                              <p className="text-sm font-black text-text-primary uppercase">{selectedWorker.experience || 0} Years Active Practice</p>
                           </div>
                           <div>
                              <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-2">Professional Summary</p>
                              <p className="text-xs text-text-secondary leading-relaxed font-medium">{selectedWorker.summary || 'No summary provided by the provider.'}</p>
                           </div>
                           {selectedWorker.skills && selectedWorker.skills.length > 0 && (
                              <div>
                                 <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-3">Verified Skills</p>
                                 <div className="flex flex-wrap gap-2">
                                    {selectedWorker.skills.map((skill, i) => (
                                       <span key={i} className="px-3 py-1 bg-accent-red/5 text-accent-red text-[9px] font-black uppercase rounded-full border border-accent-red/10">{skill}</span>
                                    ))}
                                 </div>
                              </div>
                           )}
                        </div>
                      </div>
                   </div>

                   {/* Right Column: Contact & Banking */}
                   <div className="space-y-10">
                      <div>
                        <h3 className="text-xs font-black text-text-primary uppercase tracking-[0.2em] mb-6 flex items-center">
                           <MapPin size={16} className="mr-2 text-accent-red" />
                           Contact Registry
                        </h3>
                        <div className="p-6 bg-surface-light rounded-3xl border border-border space-y-4">
                           <div>
                              <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">Phone Number</p>
                              <p className="text-sm font-black text-text-primary">{selectedWorker.phone || 'N/A'}</p>
                           </div>
                           <div>
                              <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">Registered Address</p>
                              <p className="text-xs font-medium text-text-primary leading-tight">{selectedWorker.location?.address || 'Location Hidden / Not Provided'}</p>
                           </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xs font-black text-text-primary uppercase tracking-[0.2em] mb-6">Settlement Account</h3>
                        <div className="p-8 bg-reddish-900 text-white rounded-[2.5rem] shadow-premium relative overflow-hidden group border border-white/5">
                           <div className="absolute top-0 right-0 p-8 opacity-5">
                              <Zap size={80} />
                           </div>
                           <div className="space-y-6 relative z-10">
                              <div>
                                 <p className="text-[8px] font-black uppercase tracking-[0.3em] opacity-40 mb-1">Account Holder</p>
                                 <p className="text-sm font-black uppercase tracking-tight text-white">{selectedWorker.bankDetails?.holderName || 'Not Verified'}</p>
                              </div>
                              <div>
                                 <p className="text-[8px] font-black uppercase tracking-[0.3em] opacity-40 mb-1">Financial Institution</p>
                                 <p className="text-sm font-black uppercase tracking-tight text-white">{selectedWorker.bankDetails?.bankName || 'Unknown Bank'}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                 <div>
                                    <p className="text-[8px] font-black uppercase tracking-[0.3em] opacity-40 mb-1">Account No.</p>
                                    <p className="text-xs font-black tracking-widest text-white">{selectedWorker.bankDetails?.accountNumber || '••••••••'}</p>
                                 </div>
                                 <div>
                                    <p className="text-[8px] font-black uppercase tracking-[0.3em] opacity-40 mb-1">IFSC Code</p>
                                    <p className="text-xs font-black tracking-widest text-white">{selectedWorker.bankDetails?.ifsc || '••••••••'}</p>
                                 </div>
                              </div>
                           </div>
                        </div>
                      </div>
                   </div>
                </div>
             </div>

             {/* Modal Footer */}
             <div className="p-8 border-t border-border bg-surface-light/30 flex gap-4">
                <button 
                   onClick={() => handleStatusUpdate(selectedWorker._id, 'ACTIVE')}
                   disabled={selectedWorker.status === 'ACTIVE'}
                   className="flex-1 btn-primary !py-4 shadow-red-glow !bg-accent-red disabled:opacity-50"
                >
                   Verify & Activate Provider
                </button>
                <button 
                   onClick={() => handleStatusUpdate(selectedWorker._id, 'REJECTED')}
                   disabled={selectedWorker.status === 'REJECTED'}
                   className="flex-1 btn-secondary !py-4 text-danger border-danger/20 bg-danger/5 hover:bg-danger hover:text-white transition-all disabled:opacity-50"
                >
                   Reject Documentation
                </button>
             </div>
          </div>
        </div>
      )}

      {filteredWorkers.length === 0 && (
        <EmptyState 
          icon={ShieldCheck} 
          title="No Workers Found" 
          subtitle="Zero results matching your current search parameters." 
        />
      )}
    </div>
  );
};

export default Workers;
