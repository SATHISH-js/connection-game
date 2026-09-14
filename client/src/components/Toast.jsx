import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export default function Toast({ toast }) {
  if (!toast) return null;

  const bgStyles = {
    success: 'bg-emerald-950/90 border-emerald-500 text-emerald-200 shadow-emerald-950/50',
    danger: 'bg-rose-950/90 border-rose-500 text-rose-200 shadow-rose-950/50',
    warning: 'bg-amber-950/90 border-amber-500 text-amber-200 shadow-amber-950/50',
    info: 'bg-blue-950/90 border-blue-500 text-blue-200 shadow-blue-950/50'
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    danger: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-400 shrink-0" />
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-xl text-sm font-medium ${bgStyles[toast.type] || bgStyles.info}`}>
        {icons[toast.type] || icons.info}
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
