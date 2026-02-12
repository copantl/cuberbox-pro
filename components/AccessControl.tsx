
import React from 'react';
import { ShieldAlert, Lock, ArrowLeft, ShieldX, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AccessControlProps {
  userLevel: number;
  minLevel: number;
  children: React.ReactNode;
}

const AccessControl: React.FC<AccessControlProps> = ({ userLevel, minLevel, children }) => {
  const navigate = useNavigate();

  if (userLevel < minLevel) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="glass p-16 rounded-[64px] border-2 border-rose-500/30 bg-rose-600/5 shadow-[0_0_100px_rgba(244,63,94,0.15)] max-w-2xl w-full text-center space-y-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-5 text-rose-500 group-hover:scale-110 transition-transform duration-700">
            <ShieldX size={300} />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 rounded-[32px] bg-rose-600 flex items-center justify-center text-white shadow-2xl animate-pulse mb-8 border-4 border-white/10">
              <Lock size={48} />
            </div>
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">Acceso Restringido</h2>
            <div className="inline-flex items-center space-x-3 bg-slate-950 px-6 py-2 rounded-full border border-slate-800 mb-8">
               <ShieldAlert size={14} className="text-rose-500" />
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Nivel de Autoridad Insuficiente</span>
            </div>
            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-sm mb-10">
              Tu perfil actual tiene autoridad <span className="text-white font-black">Nivel {userLevel}</span>. Este módulo requiere credenciales de <span className="text-rose-400 font-black">Nivel {minLevel} o superior</span>.
            </p>
            
            <div className="grid grid-cols-2 gap-4 w-full">
              <button 
                onClick={() => navigate(-1)}
                className="bg-slate-900 hover:bg-slate-800 text-slate-300 px-8 py-5 rounded-[24px] font-black text-[10px] uppercase tracking-widest border border-slate-700 transition-all flex items-center justify-center space-x-3"
              >
                <ArrowLeft size={18} />
                <span>Regresar</span>
              </button>
              <button 
                className="bg-white text-slate-900 px-8 py-5 rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all shadow-xl"
              >
                Solicitar Upgrade
              </button>
            </div>
          </div>

          <div className="pt-10 border-t border-slate-800 flex items-center justify-center space-x-4 opacity-50 relative z-10">
            <Info size={16} className="text-blue-400" />
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Protocolo de Seguridad CUBERBOX Core v4.6</span>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AccessControl;
