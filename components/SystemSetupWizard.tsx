import React, { useState, useEffect } from 'react';
import { 
  Zap, Shield, Users, Database, Radio, Bot, ChevronRight, ChevronLeft, 
  CheckCircle2, Server, Globe, Key, Lock, Phone, Layers, Play, 
  Sparkles, Terminal, FileCheck, AlertCircle, RefreshCw, Smartphone, ShieldCheck,
  TerminalSquare, Network, Activity, Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../ToastContext';

type SetupStep = 'ENVIRONMENT' | 'ASTERISK' | 'SECURITY' | 'DATA' | 'FINISH';

const SystemSetupWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<SetupStep>('ENVIRONMENT');
  const [progress, setProgress] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const steps: { id: SetupStep; label: string; icon: any }[] = [
    { id: 'ENVIRONMENT', label: 'Debian Check', icon: TerminalSquare },
    { id: 'ASTERISK', label: 'Asterisk Engine', icon: Phone },
    { id: 'SECURITY', label: 'AMI/ARI Guard', icon: ShieldCheck },
    { id: 'DATA', label: 'SQL Sync', icon: Database },
  ];

  const handleNext = async () => {
    setIsVerifying(true);
    // Simulación de handshake con AMI
    await new Promise(r => setTimeout(r, 1200));
    setIsVerifying(false);

    const currentIndex = steps.findIndex(s => s.id === currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id);
      toast('Validación estructural exitosa.', 'success', 'Asterisk Ready');
    } else {
      setCurrentStep('FINISH');
    }
  };

  return (
    <div className="min-h-full flex flex-col items-center justify-center py-10 animate-in fade-in duration-700">
      <div className="w-full max-w-5xl glass rounded-[64px] border border-slate-700/50 shadow-2xl p-16 relative overflow-hidden flex flex-col justify-between min-h-[600px]">
        <div className="flex-1">
          {currentStep === 'ASTERISK' && (
            <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
               <div className="flex items-center space-x-6">
                  <div className="p-4 bg-orange-600/10 rounded-3xl text-orange-400 border border-orange-500/20">
                     <Radio size={40} />
                  </div>
                  <div>
                     <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Asterisk 21 LTS Link</h2>
                     <p className="text-slate-400 font-medium">Estableciendo puente de gestión vía Manager Interface (AMI).</p>
                  </div>
               </div>

               <div className="grid grid-cols-3 gap-6">
                  {[
                    { label: 'SIP Port', val: '5060', icon: Network },
                    { label: 'AMI Port', val: '5038', icon: Zap },
                    { label: 'HTTP Bind', val: '8088', icon: Activity },
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
            <div className="flex flex-col items-center justify-center text-center space-y-8">
              <div className="w-32 h-32 bg-orange-500/20 rounded-full flex items-center justify-center border-4 border-orange-500 shadow-[0_0_50px_rgba(249,115,22,0.4)]">
                <Sparkles size={64} className="text-orange-400 animate-pulse" />
              </div>
              <h2 className="text-5xl font-black text-white uppercase tracking-tighter">ASTERISK ACTIVADO</h2>
              <p className="text-slate-400 text-lg max-w-md mx-auto">El clúster CUBERBOX está ahora gobernado por Asterisk 21 LTS.</p>
              <button onClick={() => navigate('/')} className="mt-8 bg-orange-600 hover:bg-orange-500 text-white px-16 py-6 rounded-[32px] font-black text-sm uppercase tracking-[0.2em] shadow-xl">Entrar al Centro de Mando</button>
            </div>
          )}
        </div>

        {currentStep !== 'FINISH' && (
          <div className="mt-16 pt-10 border-t border-slate-800/50 flex justify-end">
            <button 
              onClick={handleNext} 
              className="bg-orange-600 hover:bg-orange-500 text-white px-12 py-5 rounded-[28px] font-black text-xs uppercase tracking-widest shadow-xl flex items-center space-x-4"
            >
               {isVerifying ? <RefreshCw className="animate-spin" size={20} /> : <span>Siguiente</span>}
               {!isVerifying && <ChevronRight size={20} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemSetupWizard;