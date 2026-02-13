import React, { useState, useEffect } from 'react';
import { 
  Zap, Shield, Users, Database, Radio, Bot, ChevronRight, ChevronLeft, 
  CheckCircle2, Server, Globe, Key, Lock, Phone, Layers, Play, 
  Sparkles, Terminal, FileCheck, AlertCircle, RefreshCw, Smartphone, ShieldCheck,
  TerminalSquare, Network, Activity,
  // Added missing Info icon import
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../ToastContext';

type SetupStep = 'ENVIRONMENT' | 'TELEPHONY' | 'SECURITY' | 'DATA' | 'FINISH';

const SystemSetupWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<SetupStep>('ENVIRONMENT');
  const [progress, setProgress] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  const steps: { id: SetupStep; label: string; icon: any }[] = [
    { id: 'ENVIRONMENT', label: 'Server Check', icon: TerminalSquare },
    { id: 'TELEPHONY', label: 'Media Plane', icon: Phone },
    { id: 'SECURITY', label: 'Blindaje Core', icon: ShieldCheck },
    { id: 'DATA', label: 'Sync Datos', icon: Database },
  ];

  useEffect(() => {
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    const calculatedProgress = currentIndex === -1 ? 100 : ((currentIndex + 1) / steps.length) * 100;
    setProgress(calculatedProgress);
  }, [currentStep]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`].slice(-8));
  };

  const handleNext = async () => {
    setIsVerifying(true);
    addLog(`Validando parámetros de ${currentStep}...`);
    
    // Simulación de validación técnica real (Handshakes)
    if (currentStep === 'ENVIRONMENT') {
       addLog("Verificando versión de Debian...");
       await new Promise(r => setTimeout(r, 800));
       addLog("Comprobando binarios en /usr/local/bin...");
       await new Promise(r => setTimeout(r, 600));
    } else if (currentStep === 'TELEPHONY') {
       addLog("Sincronizando DialPlan XML con FreeSwitch...");
       await new Promise(r => setTimeout(r, 1200));
       addLog("Testeando socket ESL en puerto 8021...");
    } else if (currentStep === 'SECURITY') {
       addLog("Aplicando reglas UFW Hardening...");
       await new Promise(r => setTimeout(r, 1000));
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    setIsVerifying(false);

    const currentIndex = steps.findIndex(s => s.id === currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id);
      toast('Validación técnica exitosa.', 'success', 'System Check OK');
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
            const isCompleted = steps.findIndex(st => st.id === currentStep) > idx || currentStep === 'FINISH';
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
      <div className="w-full max-w-5xl glass rounded-[64px] border border-slate-700/50 shadow-2xl p-16 relative overflow-hidden min-h-[600px] flex flex-col justify-between">
        
        {/* Background Decor */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex-1">
          {currentStep === 'ENVIRONMENT' && (
            <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center space-x-6">
                <div className="p-4 bg-blue-600/10 rounded-3xl text-blue-400 border border-blue-500/20">
                  <TerminalSquare size={40} />
                </div>
                <div>
                  <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Server Verification</h2>
                  <p className="text-slate-400 font-medium">Validación de pre-requisitos y binarios core.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-6">
                    <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-500 uppercase">OS Architecture</span>
                          <span className="text-emerald-400 font-mono text-xs">x86_64 Debian 12</span>
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-500 uppercase">Node Registry</span>
                          <span className="text-blue-400 font-mono text-xs">ONLINE</span>
                       </div>
                    </div>
                    {/* Added Info icon for system notes */}
                    <div className="p-8 bg-blue-600/5 border border-blue-500/10 rounded-[32px] flex items-start space-x-4">
                       <Info size={20} className="text-blue-400 shrink-0 mt-0.5" />
                       <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed tracking-wider">
                          El asistente asume que ya ha ejecutado el script maestro <code>install.sh</code> en su terminal SSH.
                       </p>
                    </div>
                 </div>
                 <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 font-mono text-[10px] text-emerald-400/80 space-y-1 shadow-inner h-full">
                    {logs.map((log, i) => <div key={i} className="animate-in fade-in slide-in-from-left-2">{log}</div>)}
                    {logs.length === 0 && <div className="text-slate-700 italic">Esperando inicialización...</div>}
                 </div>
              </div>
            </div>
          )}

          {currentStep === 'TELEPHONY' && (
            <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
               <div className="flex items-center space-x-6">
                  <div className="p-4 bg-purple-600/10 rounded-3xl text-purple-400 border border-purple-500/20">
                     <Radio size={40} />
                  </div>
                  <div>
                     <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Media Plane Link</h2>
                     <p className="text-slate-400 font-medium">Estableciendo puente con el orquestador SIP.</p>
                  </div>
               </div>

               <div className="grid grid-cols-3 gap-6">
                  {[
                    { label: 'SIP Port', val: '5060', icon: Network },
                    { label: 'ESL Port', val: '8021', icon: Zap },
                    { label: 'WSS Port', val: '7443', icon: Activity },
                  ].map(p => (
                    <div key={p.label} className="p-6 rounded-[32px] bg-slate-900 border border-slate-800 text-center space-y-3">
                       <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{p.label}</p>
                       <p className="text-2xl font-black text-white">{p.val}</p>
                    </div>
                  ))}
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
                <h2 className="text-5xl font-black text-white uppercase tracking-tighter">¡NODO INICIALIZADO!</h2>
                <p className="text-slate-400 text-lg mt-4 max-w-md mx-auto font-medium">
                  CUBERBOX Pro se ha enlazado con éxito al motor de FreeSwitch. El clúster está listo para procesar tráfico.
                </p>
              </div>
              <button 
                onClick={() => navigate('/')}
                className="mt-8 bg-blue-600 hover:bg-blue-500 text-white px-16 py-6 rounded-[32px] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/30 transition-all active:scale-95 flex items-center space-x-4"
              >
                 <span>Acceder a la Consola</span>
                 <Play size={20} fill="currentColor" />
              </button>
            </div>
          )}
        </div>

        {/* Action Bar */}
        {currentStep !== 'FINISH' && (
          <div className="mt-16 pt-10 border-t border-slate-800/50 flex justify-between items-center">
            <button 
              onClick={handleBack}
              disabled={currentStep === 'ENVIRONMENT'}
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
                  <span>Sincronizando...</span>
                </>
              ) : (
                <>
                  <span>Validar y Siguiente</span>
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <p className="mt-12 text-[9px] text-slate-700 font-black uppercase tracking-[0.4em]">CUBERBOX Pro Infrastructure Setup v4.6.1</p>
    </div>
  );
};

export default SystemSetupWizard;