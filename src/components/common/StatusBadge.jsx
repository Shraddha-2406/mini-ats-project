import React from 'react';
import { CheckCircle, Clock, XCircle, Briefcase, FileText } from 'lucide-react';

export default function StatusBadge({ status, size = 'md' }) {
  const norm = (status || '').toLowerCase();

  let config = {
    label: status || 'Pending',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    Icon: Clock,
  };

  if (norm === 'shortlisted') {
    config = {
      label: 'Shortlisted',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      dot: 'bg-emerald-500',
      Icon: CheckCircle,
    };
  } else if (norm === 'rejected') {
    config = {
      label: 'Rejected',
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      dot: 'bg-rose-500',
      Icon: XCircle,
    };
  } else if (norm === 'active') {
    config = {
      label: 'Active',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      dot: 'bg-blue-500',
      Icon: Briefcase,
    };
  } else if (norm === 'draft') {
    config = {
      label: 'Draft',
      bg: 'bg-slate-100',
      text: 'text-slate-600',
      border: 'border-slate-200',
      dot: 'bg-slate-400',
      Icon: FileText,
    };
  } else if (norm === 'closed') {
    config = {
      label: 'Closed',
      bg: 'bg-slate-100',
      text: 'text-slate-500',
      border: 'border-slate-300',
      dot: 'bg-slate-400',
      Icon: XCircle,
    };
  }

  const sizeClasses = size === 'sm' 
    ? 'text-xs px-2 py-0.5 space-x-1.5' 
    : 'text-xs font-semibold px-2.5 py-1 space-x-1.5';

  const IconComponent = config.Icon;

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
}

