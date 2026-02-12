
import React, { useState, useEffect } from 'react';
import { 
  Zap, Shield, Users, Database, Radio, Bot, ChevronRight, ChevronLeft, 
  CheckCircle2, Server, Globe, Key, Lock, Phone, Layers, Play, 
  Sparkles, Terminal, FileCheck, AlertCircle, RefreshCw, Smartphone, ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../ToastContext';

type SetupStep = 'TELEPHONY' | 'SECURITY' | 'DATA' | 'CAMPAIGN' | 'AI' | 'FINISH';

const SystemSetupWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<SetupStep>('TELEPHONY');
  const [progress, setProgress] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const steps: { id: SetupStep; label: string; icon: any }[] = [
    { id: 'TELEPHONY', label: 'Telefonía Core', icon: Phone },
    { id: 'SECURITY', label: 'Seguridad & Acceso', icon: Shield },
    { id: 'DATA', label: 'Ingesta de Datos', icon: Database },
    { id: 'CAMPAIGN', label: 'Lógica Dial Plan', icon: Radio },
    { id: 'AI', label: 'Neural AI Bridge', icon: Bot },
  ];

  useEffect(() => {
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    setProgress(((currentIndex + 1) / steps.length) * 100);
  }, [currentStep]);

  const handleNext = async () => {
    setIsVerifying(true);
    // Simulación de validación de backend para cada paso
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsVerifying(false);

    const currentIndex = steps.findIndex(s => s.id === currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id);
      toast('Configuración validada y guardada.', 'success', 'Progreso Guardado');
    } else {
      setCurrentStep('FINISH');
    }
  };

  const handleBack = () => {
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id);
    }
  };

  return (
    <div className="min-h-full flex flex-col items-center justify-center py-10 animate-in fade-in duration-700">
      {/* Stepper Header */}
      <div className="w-full max-w-5xl mb-12">
        <div className="flex justify-between items-center px-4">
          {steps.map((s, idx) => {
            const isActive = s.id === currentStep;
            const isCompleted = steps.findIndex(st => st.id === currentStep) > idx;
            return (
              <div key={s.id} className="flex flex-col items-center space-y-3 relative z-10">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${
                  isActive ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-600/20 scale-110' : 
                  isCompleted ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-600'
                }`}>
                  {isCompleted ? <CheckCircle2 size={24} /> : <s.icon size={24} />}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-blue-400' : 'text-slate-600'}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
        <div className="relative mt-8 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden shadow-inner">
          <div 
            className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-1000 shadow-[0_0_15px_#3b82f6]" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Content Canvas */}
      <div className="w-full max-w-4xl glass rounded-[64px] border border-slate-700/50 shadow-2xl p-16 relative overflow-hidden">
        
        {/* Background Decor */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl pointer-events-none"></div>

        {currentStep === 'TELEPHONY' && (
          <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center space-x-6">
              <div className="p-4 bg-blue-600/10 rounded-3xl text-blue-400 border border-blue-500/20">
                <Globe size={40} />
              </div>
              <div>
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Telephony Bridge</h2>
                <p className="text-slate-400 font-medium">Vincula tu primer SIP Trunk para habilitar el motor de audio.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Carrier Gateway Host</label>
                <input type="text" placeholder="sip.provider.com" className="w-full bg-slate-950 border-2 border-slate-800 rounded-[28px] px-8 py-5 text-white outline-none focus:border-blue-500 shadow-inner font-mono" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Protocolo de Red</label>
                <div className="grid grid-cols-3 gap-3">
                  {['UDP', 'TCP', 'TLS'].map(p => (
                    <button key={p} className={`py-4 rounded-2xl text-xs font-black transition-all border ${p === 'TLS' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">SIP Auth Username</label>
                <input type="text" className="w-full bg-slate-950 border-2 border-slate-800 rounded-[28px] px-8 py-5 text-white outline-none focus:border-blue-500 shadow-inner" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">SIP Secret</label>
                <input type="password" placeholder="••••••••••••" className="w-full bg-slate-950 border-2 border-slate-800 rounded-[28px] px-8 py-5 text-white outline-none focus:border-blue-500 shadow-inner" />
              </div>
            </div>

            <div className="p-8 rounded-[40px] bg-blue-600/5 border border-blue-500/10 flex items-center space-x-6">
              <Terminal size={24} className="text-blue-400" />
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider leading-relaxed">
                El sistema realizará un <span className="text-blue-400">OPTIONS ping</span> para validar la latencia con el carrier antes de finalizar el paso.
              </p>
            </div>
          </div>
        )}

        {currentStep === 'SECURITY' && (
          <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center space-x-6">
              <div className="p-4 bg-emerald-600/10 rounded-3xl text-emerald-400 border border-emerald-500/20">
                <Lock size={40} />
              </div>
              <div>
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Security Hardening</h2>
                <p className="text-slate-400 font-medium">Configura las capas de protección de identidad y cifrado.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-8 bg-slate-900/60 rounded-[40px] border-2 border-slate-800 flex items-center justify-between group hover:border-emerald-500/30 transition-all">
                <div className="flex items-center space-x-6">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shadow-inner">
                    {/* Fix: Added missing ShieldCheck import from lucide-react */}
                    <ShieldCheck size={28} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white uppercase tracking-tight">Doble Factor Obligatorio (MFA)</h4>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Requerir token para administradores</p>
                  </div>
                </div>
                <div className="w-14 h-7 bg-emerald-600 rounded-full relative shadow-xl">
                  <div className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full shadow-md"></div>
                </div>
              </div>

              <div className="p-8 bg-slate-900/60 rounded-[40px] border-2 border-slate-800 flex items-center justify-between group hover:border-blue-500/30 transition-all">
                <div className="flex items-center space-x-6">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 shadow-inner">
                    <Key size={28} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white uppercase tracking-tight">Cifrado de Llamada (SRTP)</h4>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Encriptar audio de extremo a extremo</p>
                  </div>
                </div>
                <div className="w-14 h-7 bg-blue-600 rounded-full relative shadow-xl">
                  <div className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full shadow-md"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'DATA' && (
          <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center space-x-6">
              <div className="p-4 bg-amber-600/10 rounded-3xl text-amber-500 border border-amber-500/20">
                <Layers size={40} />
              </div>
              <div>
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Initial Data Sync</h2>
                <p className="text-slate-400 font-medium">Carga la primera lista de contactos para iniciar la operativa.</p>
              </div>
            </div>

            <div className="border-4 border-dashed border-slate-800 rounded-[48px] p-20 flex flex-col items-center justify-center text-center space-y-6 group hover:border-amber-500/40 transition-all cursor-pointer bg-slate-950/20">
               <div className="w-20 h-20 rounded-3xl bg-slate-900 flex items-center justify-center text-slate-700 group-hover:scale-110 group-hover:text-amber-500 transition-all shadow-inner">
                  <FileCheck size={40} />
               </div>
               <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Arrastra tu CSV Maestro</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2 max-w-xs mx-auto">Formatos soportados: Vicidial Standard, Custom JSON.</p>
               </div>
               <button className="bg-slate-800 text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-700 hover:bg-slate-700 transition-all">Explorar Archivos</button>
            </div>
          </div>
        )}

        {currentStep === 'FINISH' && (
          <div className="flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in-95 duration-700">
            <div className="relative">
              <div className="w-32 h-32 bg-emerald-500/20 rounded-full flex items-center justify-center border-4 border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.4)]">
                <Sparkles size={64} className="text-emerald-400 animate-pulse" />
              </div>
              <div className="absolute -top-4 -right-4 bg-blue-500 p-2 rounded-xl text-white animate-bounce shadow-xl">
                 <CheckCircle2 size={24} />
              </div>
            </div>
            <div>
              <h2 className="text-5xl font-black text-white uppercase tracking-tighter">¡SISTEMA LISTO!</h2>
              <p className="text-slate-400 text-lg mt-4 max-w-md mx-auto font-medium">
                La configuración inicial ha concluido. El motor neuronal ya está procesando las primeras solicitudes de red.
              </p>
            </div>
            <button 
              onClick={() => navigate('/')}
              className="mt-8 bg-blue-600 hover:bg-blue-500 text-white px-12 py-5 rounded-[32px] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/30 transition-all active:scale-95 flex items-center space-x-4"
            >
               <span>Entrar al Dashboard</span>
               <Play size={20} fill="currentColor" />
            </button>
          </div>
        )}

        {/* Action Bar */}
        {currentStep !== 'FINISH' && (
          <div className="mt-16 pt-10 border-t border-slate-800/50 flex justify-between items-center">
            <button 
              onClick={handleBack}
              disabled={currentStep === 'TELEPHONY'}
              className="flex items-center space-x-3 text-slate-500 hover:text-white transition-colors font-black text-[11px] uppercase tracking-widest disabled:opacity-0"
            >
              <ChevronLeft size={20} />
              <span>Atrás</span>
            </button>

            <button 
              onClick={handleNext}
              disabled={isVerifying}
              className="bg-blue-600 hover:bg-blue-500 text-white px-12 py-5 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-600/30 transition-all active:scale-95 flex items-center space-x-4 group"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="animate-spin" size={20} />
                  <span>Verificando...</span>
                </>
              ) : (
                <>
                  <span>Siguiente Paso</span>
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <p className="mt-12 text-[9px] text-slate-700 font-black uppercase tracking-[0.4em]">CUBERBOX Pro Infrastructure Setup v1.0.4</p>
    </div>
  );
};

export default SystemSetupWizard;
