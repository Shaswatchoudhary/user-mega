import React from 'react';
import { 
  User, 
  Phone, 
  Star, 
  Briefcase, 
  CheckCircle2, 
  MapPin, 
  Calendar,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import Avatar from './Avatar';
import StatusBadge from './StatusBadge';

const WorkerDetails = ({ worker, loading }) => {
  const safeRender = (value) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (value?.toDate) return value.toDate().toLocaleDateString('en-IN');
    if (typeof value === 'object') {
      // Handle location object specifically
      if (value.address) return value.address;
      if (value.area) return value.area;
      if (value.coordinates) return `${value.coordinates[1]}, ${value.coordinates[0]}`;
      if (value.name) return value.name;
      if (value.text) return value.text;
      return JSON.stringify(value);
    }
    return 'N/A';
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 bg-surface-light rounded-3xl" />
          <div className="space-y-3">
            <div className="h-6 w-48 bg-surface-light rounded-lg" />
            <div className="h-4 w-32 bg-surface-light rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-surface-light rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-surface-light rounded-full flex items-center justify-center mb-6">
          <User size={32} className="text-text-muted opacity-20" />
        </div>
        <h3 className="text-lg font-black text-text-primary uppercase font-outfit">Worker Not Found</h3>
        <p className="text-xs text-text-muted mt-2 max-w-[200px]">The requested worker profile could not be retrieved from the database.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header Info */}
      <div className="flex items-center space-x-8">
        <div className="relative">
          <Avatar src={worker.profileImage || worker.photo} initials={worker.name || worker.fullName} size="xl" className="!w-24 !h-24 !rounded-3xl border-2 border-accent-red/10" />
          {worker.isVerified && (
            <div className="absolute -top-2 -right-2 bg-accent-red text-white p-1.5 rounded-full border-4 border-white shadow-soft">
              <ShieldCheck size={14} />
            </div>
          )}
        </div>
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-2xl font-black text-text-primary uppercase tracking-tight font-outfit">{safeRender(worker.name || worker.fullName)}</h3>
            {worker.isVerified && (
              <span className="flex items-center space-x-1 bg-accent-red/5 text-accent-red px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-accent-red/10">
                <CheckCircle2 size={10} />
                <span>Verified Professional</span>
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-text-muted">
              <Briefcase size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">{safeRender(worker.serviceType || worker.category)}</span>
            </div>
            <div className="w-1.5 h-1.5 bg-border rounded-full" />
            <div className="flex items-center space-x-2 text-accent-red bg-accent-red/5 px-2 py-1 rounded-lg border border-accent-red/10">
              <Star size={12} fill="currentColor" />
              <span className="text-[10px] font-black uppercase tracking-widest">{worker.rating || '0'} ({worker.completedOrders || '0'} Reviews)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <a 
          href={`tel:${worker.phoneNumber || worker.phone}`}
          className="flex-1 btn-primary py-4 hover:shadow-red-glow"
        >
          <Phone size={16} className="mr-3" /> Call Worker
        </a>
        <button className="flex-1 btn-secondary py-4 group">
          <User size={16} className="mr-3 group-hover:text-accent-red transition-colors" /> View Profile
        </button>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-surface-light p-6 rounded-3xl border border-border/50">
          <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-4">Identification</p>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-black text-text-primary uppercase tracking-tight">Worker ID</p>
              <p className="text-xs font-mono text-text-secondary mt-1">#{safeRender(worker.id || worker._id || worker.uid).substring(0, 10)}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-text-primary uppercase tracking-tight">Contact Node</p>
              <p className="text-xs font-medium text-text-secondary mt-1">{safeRender(worker.phoneNumber || worker.phone)}</p>
            </div>
          </div>
        </div>

        <div className="bg-surface-light p-6 rounded-3xl border border-border/50">
          <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-4">Availability</p>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-black text-text-primary uppercase tracking-tight">Status</p>
              <div className="mt-2">
                <StatusBadge status={worker.status || 'Active'} />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-text-primary uppercase tracking-tight">Jobs Completed</p>
              <p className="text-xs font-black text-accent-red mt-1 uppercase tracking-tight">{safeRender(worker.totalBookings || worker.completedOrders)} Deliveries</p>
            </div>
          </div>
        </div>

        <div className="bg-surface-light p-6 rounded-3xl border border-border/50">
          <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-4">Registry Details</p>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Calendar size={14} className="text-text-muted" />
              <div>
                <p className="text-[10px] font-black text-text-primary uppercase tracking-tight">Date Joined</p>
                <p className="text-[11px] text-text-secondary mt-0.5">{safeRender(worker.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface-light p-6 rounded-3xl border border-border/50">
          <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-4">Service Area</p>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <MapPin size={14} className="text-text-muted" />
              <div>
                <p className="text-[10px] font-black text-text-primary uppercase tracking-tight">Location</p>
                <p className="text-[11px] text-text-secondary mt-0.5">
                  {safeRender(worker.location || worker.area || worker.address)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerDetails;

