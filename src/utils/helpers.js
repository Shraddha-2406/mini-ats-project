// Utility helper functions

export function normalizeSkill(skill) {
  if (!skill) return '';
  return skill.trim().toLowerCase();
}

export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

export function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return formatDate(dateString);
}

export function calculateProfileCompletion(user) {
  if (!user) return 0;
  let score = 0;
  const checks = [
    Boolean(user.name),
    Boolean(user.email),
    Boolean(user.phone),
    Boolean(user.location),
    Boolean(user.education || user.degree),
    Boolean(user.skills && user.skills.length > 0),
    Boolean(user.resumeFile && user.resumeFile.name),
    Boolean(user.experienceYears !== undefined && user.experienceYears !== '')
  ];
  
  const filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100);
}

export function getScoreColor(score) {
  if (score >= 80) {
    return {
      text: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      bar: 'bg-emerald-500',
      ring: '#10B981',
      label: 'High Match'
    };
  }
  if (score >= 50) {
    return {
      text: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
      bar: 'bg-amber-500',
      ring: '#F59E0B',
      label: 'Moderate Match'
    };
  }
  return {
    text: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    badge: 'bg-rose-100 text-rose-800 border-rose-200',
    bar: 'bg-rose-500',
    ring: '#EF4444',
    label: 'Low Match'
  };
}

export function getStatusBadgeConfig(status) {
  switch ((status || '').toLowerCase()) {
    case 'shortlisted':
      return {
        label: 'Shortlisted',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500'
      };
    case 'rejected':
      return {
        label: 'Rejected',
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        dot: 'bg-rose-500'
      };
    case 'pending':
    default:
      return {
        label: 'Under Review',
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-amber-500'
      };
  }
}

