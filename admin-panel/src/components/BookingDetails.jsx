import React from 'react';
import { 
  Clock, 
  MapPin, 
  CreditCard, 
  Star, 
  Info,
  CheckCircle2,
  Calendar,
  Zap
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import Avatar from './Avatar';

const BookingDetails = ({ booking, loading }) => {
  const safeRender = (value) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (value?.toDate) return value.toDate().toLocaleString('en-IN');
    if (typeof value === 'object') {
      if (value.address) return value.address;
      if (value.shortAddress) return value.shortAddress;
      if (value.name) return value.name;
      if (value.text) return value.text;
      return JSON.stringify(value);
    }
    return 'N/A';
  };

  const safeDate = (date) => {
    if (!date) return null;
    if (date.toDate) return date.toDate();
    const d = new Date(date);
    return isNaN(d.getTime()) ? null : d;
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-40 bg-surface-light rounded-3xl" />
        <div className="space-y-4">
          <div className="h-4 w-full bg-surface-light rounded-lg" />
          <div className="h-4 w-3/4 bg-surface-light rounded-lg" />
        </div>
      </div>
    );
  }

  if (!booking) return null;

  const timeline = [
    { label: 'Booking Created', time: safeDate(booking.createdAt), icon: Calendar, active: true },
    { label: 'Worker Assigned', time: safeDate(booking.assignedAt), icon: Zap, active: !!booking.workerId },
    { label: 'Work Started', time: safeDate(booking.startedAt), icon: Clock, active: !!booking.startedAt },
    { label: 'Completion', time: safeDate(booking.completedAt), icon: CheckCircle2, active: booking.status === 'completed' }
  ];

  return (
    <div className="space-y-10">
      {/* Booking Header */}
      <div className="bg-reddish-900 p-8 rounded-[2rem] border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
           <Zap size={120} className="text-white" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Registry ID: #{safeRender(booking.id || booking._id).substring(0, 8)}</span>
            <StatusBadge status={booking.status} />
          </div>
          <h4 className="text-3xl font-black text-white uppercase tracking-tighter font-outfit leading-none mb-2">
            {booking.serviceType || booking.serviceName || 'Premium Service'}
          </h4>
          <p className="text-white/60 text-xs font-medium max-w-xs">Confirmed allocation for platform service request node.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Participants */}
        <div className="space-y-6">
          <h5 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Participants</h5>
          <div className="flex items-center justify-between p-4 bg-surface-light rounded-2xl border border-border/50">
             <div className="flex items-center space-x-3">
                <Avatar src={booking.userProfile} initials={booking.userName} size="sm" />
                <div>
                   <p className="text-[10px] font-black text-text-primary uppercase tracking-tight">{safeRender(booking.userName || 'Client Node')}</p>
                   <p className="text-[8px] font-black text-text-muted uppercase tracking-widest">Origin Client</p>
                </div>
             </div>
             <div className="h-8 w-px bg-border" />
             <div className="flex items-center space-x-3">
                <Avatar src={booking.workerProfile} initials={booking.workerName} size="sm" />
                <div>
                   <p className="text-[10px] font-black text-text-primary uppercase tracking-tight">{safeRender(booking.workerName || 'Provider Node')}</p>
                   <p className="text-[8px] font-black text-text-muted uppercase tracking-widest">Allocated Pro</p>
                </div>
             </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-4">
               <div className="w-10 h-10 bg-accent-red/5 rounded-xl flex items-center justify-center text-accent-red shrink-0 border border-accent-red/10">
                  <MapPin size={18} />
               </div>
               <div>
                  <p className="text-[10px] font-black text-text-primary uppercase tracking-tight mb-1">Service Destination</p>
                  <p className="text-xs text-text-secondary font-medium leading-relaxed">{safeRender(booking.userLocation || booking.address || 'Location not provided')}</p>
               </div>
            </div>

            <div className="flex items-start space-x-4">
               <div className="w-10 h-10 bg-accent-red/5 rounded-xl flex items-center justify-center text-accent-red shrink-0 border border-accent-red/10">
                  <CreditCard size={18} />
               </div>
                <div>
                   <p className="text-[10px] font-black text-text-primary uppercase tracking-tight mb-1">Cash Amount to Collect</p>
                   <p className="text-2xl font-black text-accent-red uppercase tracking-tighter tabular-nums leading-none">₹{booking.amount || booking.totalPrice || '0.00'}</p>
                   <p className="text-[8px] font-black text-text-muted uppercase tracking-widest mt-1">Final platform settlement value</p>
                </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-6">
          <h5 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Lifecycle Event Log</h5>
          <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-border">
             {timeline.map((item, idx) => (
               <div key={idx} className="relative">
                  <div className={`absolute -left-[22px] top-1 w-4 h-4 rounded-full border-4 border-white ${item.active ? 'bg-accent-red shadow-red-glow' : 'bg-border'}`} />
                  <div className="flex items-center justify-between">
                     <div className="flex items-center space-x-3">
                        <item.icon size={14} className={item.active ? 'text-accent-red' : 'text-text-muted'} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${item.active ? 'text-text-primary' : 'text-text-muted'}`}>{item.label}</span>
                     </div>
                     <span className="text-[9px] font-black text-text-muted uppercase tabular-nums">
                        {item.time ? item.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                     </span>
                  </div>
               </div>
             ))}
          </div>

          {(booking.rating || booking.review) && (
            <div className="mt-6 p-5 bg-accent-red/5 border border-accent-red/10 rounded-2xl">
               <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-accent-red uppercase tracking-widest">Client Feedback</span>
                  <div className="flex items-center text-accent-red">
                     <Star size={12} fill="currentColor" className="mr-1" />
                     <span className="text-[10px] font-black">{booking.rating || '0'} / 5</span>
                  </div>
               </div>
               <p className="text-[11px] italic text-text-secondary font-medium">"{booking.review || 'No written feedback provided by the client.'}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;

