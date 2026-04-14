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
  MoreVertical
} from 'lucide-react';
import api from '../utils/api';
import Avatar from '../components/Avatar';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';

const Issues = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Open');

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await api.get('/reports');
        setIssues(response.data.data || response.data || []);
      } catch (error) {
        console.error('Error fetching issues:', error);
        setIssues([]);
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, []);

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          issue.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          issue.userName?.toLowerCase().includes(searchQuery.toLowerCase());
    
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
    <div className="animate-in slide-in-from-right-10 duration-1000 pb-20">
      
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
                   <button className="p-2 text-text-muted hover:text-accent-red hover:bg-accent-red/5 rounded-xl transition-all">
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
    </div>
  );
};

export default Issues;
