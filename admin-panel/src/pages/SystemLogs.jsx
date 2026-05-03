import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Search, 
  Clock, 
  User, 
  Briefcase,
  ArrowRight,
  Download,
  Activity,
  Calendar,
  Filter
} from 'lucide-react';
import api from '../utils/api';
import Avatar from '../components/Avatar';

const SystemLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        // 1. Fetch from MongoDB API
        let mongoLogs = [];
        try {
          const response = await api.get('/bookings');
          const data = response.data.data || response.data.bookings || response.data || [];
          mongoLogs = (Array.isArray(data) ? data : []).map(log => ({
            id: log._id,
            timestamp: new Date(log.createdAt).toLocaleString(),
            event: log.serviceType || log.category || 'Service Booking',
            worker: log.workerId?.fullName || log.workerName || 'Not Assigned',
            user: log.userId?.name || log.userName || 'Client',
            status: log.status || 'Pending',
            amount: log.totalPrice || '0',
            location: log.address || 'N/A',
            source: 'mongodb'
          }));
        } catch (err) {
          console.error('MongoDB bookings fetch failed:', err);
        }

        // 2. Fetch from Firestore (if needed)
        let firestoreLogs = [];
        try {
          // Import firebase dependencies dynamically if not available globally
          const { getDocs, collection, query, orderBy } = await import('firebase/firestore');
          const { db } = await import('../config/firebase');
          
          const bookingSnap = await getDocs(query(collection(db, 'bookings'), orderBy('createdAt', 'desc')));
          firestoreLogs = bookingSnap.docs.map(doc => {
            const d = doc.data();
            return {
              id: doc.id,
              timestamp: d.createdAt?.toDate ? d.createdAt.toDate().toLocaleString() : new Date().toLocaleString(),
              event: d.serviceType || d.category || 'App Booking',
              worker: d.workerName || 'Not Assigned',
              user: d.userName || 'App User',
              status: d.status || 'Pending',
              amount: d.totalPrice || '0',
              location: d.address || 'N/A',
              source: 'firestore'
            };
          });
        } catch (err) {
          console.error('Firestore bookings fetch failed:', err);
        }

        // Merge and sort
        const combinedLogs = [...mongoLogs, ...firestoreLogs].sort((a, b) => {
          return new Date(b.timestamp) - new Date(a.timestamp);
        });

        setLogs(combinedLogs);
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.worker.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center h-full pt-40">
      <div className="animate-spin rounded-full h-16 w-16 border-t-[3px] border-accent-red"></div>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-1000 pb-20">
      <div className="flex justify-between items-end mb-12">
        <div>
          <p className="text-accent-red font-black text-[10px] uppercase tracking-[0.4em] mb-2">System Audit Trail</p>
          <h1 className="text-4xl font-black text-text-primary tracking-tighter uppercase leading-none font-outfit">
            System <span className="text-accent-red italic">Activities</span>
          </h1>
          <p className="text-text-secondary text-xs mt-3 max-w-md font-medium leading-relaxed">
            Comprehensive log of all service bookings, provider assignments, and platform transactions.
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="btn-secondary py-2 px-6 flex items-center hover:bg-reddish-800 hover:text-white hover:border-reddish-800 transition-all">
            <Download size={16} className="mr-2" /> Export Activities
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
        <div className="relative w-full md:w-96">
           <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
           <input 
              type="text" 
              placeholder="Search by User, Worker or Event..."
              className="w-full bg-surface-light border border-border rounded-xl py-4 pl-12 pr-4 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-accent-red/50 transition-all font-outfit"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
           />
        </div>
        <div className="flex items-center space-x-3">
           <button className="px-5 py-2.5 bg-accent-red text-white text-[10px] font-black uppercase tracking-widest rounded-full transition-all flex items-center shadow-red-glow">
             <Filter size={14} className="mr-2" /> All Time
           </button>
           <button className="px-5 py-2.5 bg-white text-text-muted hover:text-accent-red text-[10px] font-black uppercase tracking-widest rounded-full transition-all border border-border">Current Week</button>
        </div>
      </div>

      <div className="card !p-0 overflow-hidden border border-border bg-white rounded-3xl overflow-x-auto shadow-premium">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-light border-b border-border">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted">Timestamp</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted">Event / Description</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted">Personnel</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted">Status</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredLogs.length > 0 ? filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-reddish-900/[0.02] transition-all group">
                <td className="px-8 py-6">
                  <div className="flex items-center space-x-3">
                    <Clock size={14} className="text-text-muted" />
                    <span className="text-xs font-black text-text-primary tabular-nums group-hover:text-accent-red">{log.timestamp}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <p className="text-sm font-black text-text-primary uppercase tracking-tight group-hover:text-accent-red transition-colors">{log.event}</p>
                  <p className="text-[10px] text-text-muted mt-1 uppercase tracking-widest truncate max-w-xs">{log.location}</p>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-text-primary uppercase tracking-tight">User: {log.user}</span>
                    <span className="text-[10px] text-text-muted mt-0.5 uppercase tracking-widest">Worker: {log.worker}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1 border text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${
                    log.status === 'completed' || log.status === 'accepted' 
                    ? 'border-accent-red bg-accent-red text-white' 
                    : 'border-border bg-surface-light text-text-muted'
                  }`}>
                    {log.status}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <button className="w-10 h-10 bg-surface-light hover:bg-accent-red hover:text-white rounded-xl flex items-center justify-center transition-all ml-auto group/btn">
                    <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="px-8 py-24 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-surface-light rounded-2xl flex items-center justify-center mb-6 opacity-20">
                        <ClipboardList size={32} className="text-accent-red" />
                    </div>
                    <p className="text-sm font-black text-text-muted uppercase tracking-widest">No matching activities recorded</p>
                    <p className="text-[10px] text-text-muted mt-2 uppercase tracking-[0.2em]">The system audit trail is currently clean.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-10 flex justify-between items-center px-4">
        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Showing {filteredLogs.length} activity nodes found in core registry</p>
        <div className="flex space-x-2">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-text-muted hover:border-accent-red hover:text-accent-red transition-all">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-text-muted hover:border-accent-red hover:text-accent-red transition-all">2</button>
        </div>
      </div>
    </div>
  );
};

export default SystemLogs;
