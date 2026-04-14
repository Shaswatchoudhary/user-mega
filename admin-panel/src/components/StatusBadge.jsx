import React from 'react';

const StatusBadge = ({ status }) => {
  const getStatusStyles = (s) => {
    switch (s?.toLowerCase()) {
      case 'active':
      case 'completed':
      case 'success':
        return 'bg-success/10 text-success border-success/20';
      case 'pending':
      case 'under_review':
      case 'warning':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'cancelled':
      case 'rejected':
      case 'danger':
      case 'blocked':
        return 'bg-danger/10 text-danger border-danger/20';
      default:
        return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  return (
    <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${getStatusStyles(status)}`}>
      {status?.replace('_', ' ')}
    </span>
  );
};

export default StatusBadge;
