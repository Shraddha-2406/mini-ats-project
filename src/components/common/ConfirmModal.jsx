import React, { useEffect } from 'react';
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'primary', // 'primary' | 'danger' | 'success'
  children,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  let confirmBtnClass = 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm';
  let Icon = Info;
  let iconBg = 'bg-blue-50 text-blue-600';

  if (type === 'danger') {
    confirmBtnClass = 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm';
    Icon = AlertTriangle;
    iconBg = 'bg-rose-50 text-rose-600';
  } else if (type === 'success') {
    confirmBtnClass = 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm';
    Icon = CheckCircle;
    iconBg = 'bg-emerald-50 text-emerald-600';
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl shadow-elevated border border-slate-200 w-full max-w-lg overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3.5">
              <div className={`p-2.5 rounded-xl ${iconBg}`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {message && (
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              {message}
            </p>
          )}

          {children && <div className="mt-4">{children}</div>}

          <div className="mt-6 flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition"
            >
              {cancelText}
            </button>
            {onConfirm && (
              <button
                type="button"
                onClick={onConfirm}
                className={`px-5 py-2 text-sm font-semibold rounded-xl transition ${confirmBtnClass}`}
              >
                {confirmText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

