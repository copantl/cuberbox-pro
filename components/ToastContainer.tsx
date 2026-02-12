
import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X, ShieldAlert, Zap } from 'lucide-react';
import { ToastType } from '../ToastContext';

interface ToastContainerProps {
  toasts: { id: string; message: string; type: ToastType; title?: string; persistent?: boolean }[];
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success': return <CheckCircle2 size={22} className="text-emerald-400" />;
      case 'error': return <AlertCircle size={22} className="text-rose-400" />;
      case 'warning': return <AlertTriangle size={22} className="text-amber-400" />;
      case 'critical': return <ShieldAlert size={24} className="text-white animate-pulse" />;
      default: return <Info size={22} className="text-blue-400" />;
    }
  };

  const getStyle = (type: ToastType) => {
    switch (type) {
      case 'success': return 'border-emerald-500/20 bg-emerald-500/5 shadow-emerald-500/10';
      case 'error': return 'border-rose-500/20 bg-rose-500/5 shadow-rose-500/10';
      case 'warning': return 'border-amber-500/20 bg-amber-500/5 shadow-amber-500/10';
      case 'critical': return 'border-rose-600 bg-rose-600/90 shadow-[0_0_50px_rgba(225,29,72,0.4)] backdrop-blur-md';
      default: return 'border-blue-500/20 bg-blue-600/5 shadow-blue-500/10';
    }
  };

  return (
    <div className="fixed bottom-10 right-10 z-[300] flex flex-col space-y-4 max-w-md w-full pointer-events-none">
      {toasts.map((t) => (
        <div 
          key={t.id}
          className={`glass p-6 rounded-[32px] border-2 shadow-2xl flex items-start space-x-5 pointer-events-auto animate-in slide-in-from-right-10 fade-in duration-500 group ${getStyle(t.type)}`}
        >
          <div className={`shrink-0 mt-1 ${t.type === 'critical' ? 'p-2 bg-white/20 rounded-xl' : ''}`}>
            {getIcon(t.type)}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
               <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] ${t.type === 'critical' ? 'text-white' : 'text-slate-400'}`}>
                 {t.title || (t.type === 'critical' ? 'Kernel Alert' : 'System Notification')}
               </h4>
               {t.persistent && <Zap size={12} className="text-white/50" />}
            </div>
            <p className={`text-sm font-bold leading-relaxed ${t.type === 'critical' ? 'text-white' : 'text-slate-200'}`}>
              {t.message}
            </p>
          </div>
          <button 
            onClick={() => onRemove(t.id)}
            className={`p-2 rounded-xl transition-all ${t.type === 'critical' ? 'text-white hover:bg-white/10' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
          >
            <X size={18} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
