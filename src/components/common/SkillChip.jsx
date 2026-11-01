import React from 'react';
import { Check, X, AlertTriangle, Plus } from 'lucide-react';

export default function SkillChip({
  name,
  variant = 'default',
  size = 'md',
  onRemove,
  onClick,
  disabled = false,
}) {
  const isClickable = Boolean(onClick) && !disabled;

  let style = 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200';
  let Icon = null;

  if (variant === 'matched') {
    style = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    Icon = Check;
  } else if (variant === 'missing') {
    style = 'bg-amber-50 text-amber-800 border-amber-200';
    Icon = AlertTriangle;
  } else if (variant === 'danger-missing') {
    style = 'bg-rose-50 text-rose-800 border-rose-200';
    Icon = X;
  } else if (variant === 'selected') {
    style = 'bg-blue-600 text-white border-blue-600 shadow-sm';
    Icon = Check;
  } else if (variant === 'primary') {
    style = 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
  } else if (variant === 'outline') {
    style = 'bg-white text-slate-600 border-slate-300 hover:border-blue-400 hover:text-blue-600';
  }

  const sizeClass = size === 'sm'
    ? 'text-xs px-2.5 py-0.5 space-x-1'
    : 'text-xs md:text-sm px-3 py-1 space-x-1.5';

  return (
    <span
      onClick={isClickable ? onClick : undefined}
      className={`inline-flex items-center font-medium rounded-full border transition-all duration-150 ${sizeClass} ${style} ${
        isClickable ? 'cursor-pointer active:scale-95' : ''
      }`}
    >
      {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" />}
      <span className="truncate max-w-[160px]">{name}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(name);
          }}
          className="ml-1 p-0.5 rounded-full hover:bg-black/10 text-current transition"
          aria-label={`Remove ${name}`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}

