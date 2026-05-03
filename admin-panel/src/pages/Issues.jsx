import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  User, 
  ShieldAlert,
  ArrowRight,
  Filter,
  Search,
  MoreVertical,
  X,
  AlertTriangle,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  serverTimestamp,
  query,
  orderBy 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import api from '../utils/api';
import Avatar from '../components/Avatar';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import DetailPanel from '../components/DetailPanel';
import WorkerDetails from '../components/WorkerDetails';
import BookingDetails from '../components/BookingDetails';

const Issues = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Open');
  
  // Panel States
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [panelLoading, setPanelLoading] = useState(false);
  const [workerData, setWorkerData] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [activePanelTab, setActivePanelTab] = useState('worker'); // 'worker', 'booking', 'issue'
  const [toast, setToast] = useState(null);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      // 1. Fetch from MongoDB API
      let mongoIssues = [];
      try {
        const response = await api.get('/reports');
        mongoIssues = (response.data.data || response.data || []).map(i => ({
          ...i,
          id: i._id,
          source: 'mongodb'
        }));
      } catch (err) {
        console.error('MongoDB reports fetch failed:', err);
      }

      // 2. Fetch from Firestore support_tickets
      let supportTickets = [];
      try {
        const supportSnap = await getDocs(collection(db, 'support_tickets'));
        supportTickets = supportSnap.docs.map(d => ({
          id: d.id,
          _id: d.id,
          source: 'support_tickets',
          subject: d.data().subject || 'Support Ticket',
          description: d.data().description,
          userName: d.data().userName,
          userId: d.data().userId,
          workerId: d.data().workerId,
          workerName: d.data().workerName,
          bookingId: d.data().bookingId,
          priority: d.data().priority || 'medium',
          status: d.data().status || 'open',
          createdAt: d.data().createdAt?.toDate() || new Date(),
        }));
      } catch (err) {
        console.error('Firestore support_tickets fetch failed:', err);
      }

      // 3. Fetch from Firestore issues
      let issuesList = [];
      try {
        const issuesSnap = await getDocs(collection(db, 'issues'));
        issuesList = issuesSnap.docs.map(d => ({
          id: d.id,
          _id: d.id,
          source: 'issues',
          subject: d.data().issueText || 'Issue Raised',
          description: d.data().issueText,
          userName: d.data().userName,
          userId: d.data().userId,
          workerId: d.data().workerId,
          workerName: d.data().workerName,
          bookingId: d.data().bookingId,
          status: d.data().status || 'open',
          createdAt: d.data().createdAt?.toDate() || new Date(),
        }));
      } catch (err) {
        console.error('Firestore issues fetch failed:', err);
      }

      // Merge and sort
      const allIssues = [...mongoIssues, ...supportTickets, ...issuesList].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      
      setIssues(allIssues);
    } catch (error) {
      console.error('Global issues fetch error:', error);
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleOpenDetails = async (issue) => {
    setSelectedIssue(issue);
    setIsPanelOpen(true);
    setPanelLoading(true);
    setActivePanelTab('worker');
    
    try {
      // Fetch Worker Details
      if (issue.workerId && issue.workerId !== 'N/A') {
        try {
          const response = await api.get(`/workers/${issue.workerId}`);
          setWorkerData(response.data.data);
        } catch (err) {
          console.log('Worker not in MongoDB, trying Firestore...');
          const workerDoc = await getDoc(doc(db, 'workers', issue.workerId));
          if (workerDoc.exists()) {
            setWorkerData({ _id: workerDoc.id, ...workerDoc.data() });
          } else {
            setWorkerData(null);
          }
        }
      } else {
        setWorkerData(null);
      }

      // Fetch Booking Details
      if (issue.bookingId && issue.bookingId !== 'N/A') {
        try {
          const response = await api.get(`/bookings/${issue.bookingId}`);
          setBookingData(response.data.data);
        } catch (err) {
          console.log('Booking not in MongoDB, trying Firestore...');
          const bookingDoc = await getDoc(doc(db, 'bookings', issue.bookingId));
          if (bookingDoc.exists()) {
            setBookingData({ _id: bookingDoc.id, ...bookingDoc.data() });
          } else {
            setBookingData(null);
          }
        }
      } else {
        setBookingData(null);
      }
    } catch (error) {
      console.error('Error in detail fetching:', error);
    } finally {
      setPanelLoading(false);
    }
  };

  const handleCloseIssue = async (issueId, source) => {
    try {
      if (source === 'mongodb') {
        await api.patch(`/reports/${issueId}`, { status: 'resolved' });
      } else {
        const collectionName = source === 'issues' ? 'issues' : 'support_tickets';
        await updateDoc(doc(db, collectionName, issueId), {
          status: 'resolved',
          closedAt: serverTimestamp(),
        });
      }
      
      setIssues(prev => prev.map(issue => 
        issue.id === issueId ? { ...issue, status: 'resolved' } : issue
      ));
      
      showToast('Issue resolved successfully');
      setIsPanelOpen(false);
    } catch (error) {
      console.error('Error closing issue:', error);
      showToast('Failed to resolve issue', 'error');
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          issue.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          issue.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          issue._id?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'Open') return matchesSearch && issue.status !== 'resolved';
    if (activeTab === 'Resolved') return matchesSearch && issue.status === 'resolved';
    return matchesSearch;
  });

  if (loading) return (
    <div className="flex items-center justify-center h-full pt-40">
      <div className="animate-spin rounded-full h-16 w-16 border-t-[3px] border-accent-red"></div>
    </div>
  );

  return (
    <div className="animate-in slide-in-from-right-10 duration-1000 pb-20 relative">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-10 right-10 z-[100] animate-in slide-in-from-top-10 px-6 py-4 rounded-2xl shadow-premium border flex items-center space-x-3 ${toast.type === 'error' ? 'bg-danger/10 border-danger/20 text-danger' : 'bg-success/10 border-success/20 text-success'}`}>
          {toast.type === 'error' ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
          <span className="text-[10px] font-black uppercase tracking-widest">{toast.message}</span>
        </div>
      )}

      <div className="flex justify-between items-end mb-12">
        <div>
          <p className="text-accent-red font-black text-[10px] uppercase tracking-[0.4em] mb-2">Platform Member Reports</p>
          <h1 className="text-4xl font-black text-text-primary tracking-tighter uppercase leading-none font-outfit">
            System <span className="text-accent-red italic">Issues</span>
          </h1>
          <p className="text-text-secondary text-xs mt-3 max-w-md font-medium leading-relaxed">
            Manage and resolve user complaints, technical issues, and feedback reports submitted through the platform.
          </p>
        </div>
        <div className="flex space-x-3">
          <div className="bg-accent-red/5 border border-accent-red/10 px-4 py-2 rounded-xl flex items-center space-x-3">
            <span className="w-1.5 h-1.5 bg-accent-red rounded-full animate-pulse-red"></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-accent-red">High Priority: {issues.filter(i => i.priority === 'high').length}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div className="flex bg-surface-light p-1 rounded-2xl border border-border">
          {['Open', 'Resolved', 'All Reports'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-reddish-900 text-white shadow-soft' : 'text-text-muted hover:text-accent-red'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="w-full md:w-80 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
          <input 
            type="text"
            placeholder="Search Report ID..."
            className="w-full bg-surface-light border border-border rounded-xl py-3 pl-12 pr-4 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-accent-red/50 transition-all font-outfit"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredIssues.map((issue) => (
          <div key={issue._id} className="card group hover:shadow-premium !p-0 overflow-hidden flex flex-col md:flex-row border-l-[6px] border-l-transparent hover:border-l-accent-red transition-all">
            <div className={`w-2 md:w-3 ${issue.priority === 'high' ? 'bg-accent-red' : issue.priority === 'medium' ? 'bg-warning' : 'bg-reddish-800/40'}`}></div>
            
            <div className="flex-1 p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="flex items-center space-x-6 min-w-0">
                <div className="w-14 h-14 bg-surface-light rounded-2xl border border-transparent flex items-center justify-center text-text-muted group-hover:bg-accent-red/10 group-hover:text-accent-red transition-all flex-shrink-0">
                   <MessageSquare size={24} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-3 mb-1">
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">#{issue._id.substring(18)}</span>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${issue.priority === 'high' ? 'text-accent-red border-accent-red/20 bg-accent-red/5' : 'text-text-muted border-border'}`}>
                      {issue.priority || 'standard'}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-text-primary uppercase tracking-tight truncate group-hover:text-accent-red transition-colors font-outfit">{issue.subject || 'Platform Report Placeholder'}</h3>
                  <p className="text-xs text-text-secondary line-clamp-1 mt-1 font-medium">{issue.description || 'No detailed description provided for this report.'}</p>
                </div>
              </div>

              <div className="flex flex-wrap md:flex-nowrap items-center gap-10">
                <div className="flex items-center space-x-3">
                  <Avatar src={issue.userProfile} initials={issue.userName} size="md" />
                  <div>
                    <p className="text-[10px] font-black text-text-primary uppercase tracking-tight">{issue.userName || 'Unknown Agent'}</p>
                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Origin Point</p>
                  </div>
                </div>

                <div className="text-right min-w-24">
                  <p className="text-xs font-black text-text-primary uppercase tracking-tight mb-1">
                    {new Date(issue.createdAt || Date.now()).toLocaleDateString()}
                  </p>
                  <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Time Registered</p>
                </div>

                <div className="flex items-center space-x-3">
                   <StatusBadge status={issue.status} />
                   <button 
                    onClick={() => handleOpenDetails(issue)}
                    className="p-2 text-text-muted hover:text-accent-red hover:bg-accent-red/5 rounded-xl transition-all"
                   >
                      <MoreVertical size={20} />
                   </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredIssues.length === 0 && (
        <EmptyState 
          icon={CheckCircle2} 
          title="No Issues Reported" 
          subtitle="All user reports are currently resolved or non-existent." 
        />
      )}

      {/* Details Panel */}
      <DetailPanel 
        isOpen={isPanelOpen} 
        onClose={() => setIsPanelOpen(false)} 
        title={`Report #${selectedIssue?._id?.substring(18)}`}
      >
        <div className="space-y-8 pb-10">
          {/* Internal Tabs */}
          <div className="flex bg-surface-light p-1 rounded-2xl border border-border">
            {[
              { id: 'worker', label: 'Worker', icon: User },
              { id: 'booking', label: 'Booking', icon: Clock },
              { id: 'issue', label: 'Issue', icon: AlertCircle }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActivePanelTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activePanelTab === tab.id ? 'bg-white text-accent-red shadow-soft' : 'text-text-muted hover:text-text-primary'}`}
              >
                <tab.icon size={14} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {activePanelTab === 'worker' && (
            <WorkerDetails worker={workerData} loading={panelLoading} />
          )}

          {activePanelTab === 'booking' && (
            <BookingDetails booking={bookingData} loading={panelLoading} />
          )}

          {activePanelTab === 'issue' && selectedIssue && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="bg-surface-light p-8 rounded-3xl border border-border/50">
                  <div className="flex items-center space-x-3 mb-6">
                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${selectedIssue.priority === 'high' ? 'bg-accent-red text-white' : 'bg-white text-text-muted border border-border'}`}>
                        <AlertCircle size={24} />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Priority Matrix</p>
                        <p className="text-sm font-black text-text-primary uppercase tracking-tight">{selectedIssue.priority || 'Standard'} Assessment</p>
                     </div>
                  </div>
                  
                  <div className="space-y-6">
                     <div>
                        <p className="text-[10px] font-black text-text-primary uppercase tracking-tight mb-2">Subject Header</p>
                        <p className="text-lg font-black text-accent-red uppercase tracking-tighter leading-tight font-outfit">{selectedIssue.subject || 'Generic Platform Report'}</p>
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-text-primary uppercase tracking-tight mb-2">Full Description</p>
                        <p className="text-xs text-text-secondary leading-relaxed font-medium bg-white p-4 rounded-xl border border-border/50">
                           {selectedIssue.description || 'No detailed description was provided for this report node.'}
                        </p>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-6">
                  <div className="bg-surface-light p-6 rounded-3xl border border-border/50">
                     <p className="text-[10px] font-black text-text-primary uppercase tracking-tight">Report Date</p>
                     <p className="text-xs font-medium text-text-secondary mt-1">{new Date(selectedIssue.createdAt || Date.now()).toLocaleDateString()} {new Date(selectedIssue.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div className="bg-surface-light p-6 rounded-3xl border border-border/50">
                     <p className="text-[10px] font-black text-text-primary uppercase tracking-tight">Current Status</p>
                     <div className="mt-2">
                        <StatusBadge status={selectedIssue.status} />
                     </div>
                  </div>
               </div>
            </div>
          )}

          {/* Action Footer in Panel */}
          <div className="pt-8 mt-10 border-t border-border flex space-x-4">
             {selectedIssue?.status !== 'resolved' && (
               <button 
                onClick={() => handleCloseIssue(selectedIssue.id, selectedIssue.source)}
                className="flex-1 btn-primary py-4 bg-accent-red hover:bg-reddish-800"
               >
                  <CheckCircle2 size={16} className="mr-3" /> Close Issue
               </button>
             )}
             <button 
              onClick={() => setIsPanelOpen(false)}
              className="flex-1 btn-secondary py-4"
             >
                Cancel
             </button>
          </div>
        </div>
      </DetailPanel>
    </div>
  );
};

export default Issues;
