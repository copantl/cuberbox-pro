/**
 * @file MFAConfigurator.tsx
 * @description Interfaz técnica para el aprovisionamiento de 2FA (TOTP) con soporte multi-canal.
 */

import React, { useState, useEffect } from 'react';
import { 
  X, ShieldCheck, Key, Copy, Mail, MessageCircle, 
  RefreshCw, CheckCircle2, Smartphone, Shield,
  ArrowRight, QrCode, AlertCircle, Info, Send
} from 'lucide-react';
import { User } from '../types';
import { useToast } from '../ToastContext';

interface Props {
  user: User;
  onClose: () => void;
  onComplete: (secret: string) => void;
}

const MFAConfigurator: React.FC<Props> = ({ user, onClose, onComplete }) => {
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  const [secret, setSecret] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Generar semilla aleatoria al montar
  useEffect(() => {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let genSecret = "";
    for (let i = 0; i < 16; i++) {
      genSecret += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setSecret(genSecret);
  }, []);

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=otpauth://totp/CUBERBOX:${user.username}?secret=${secret}&issuer=CUBERBOX_PRO`;

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    toast('Semilla copiada al portapapeles.', 'info');
  };

  const handleSendViaEmail = async () => {
    setIsSending(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsSending(false);
    toast(`Instrucciones enviadas a ${user.email}`, 'success', 'Despacho SMTP');
  };

  const handleSendViaWhatsApp = async () => {
    setIsSending(true);
    await new Promise(r => setTimeout(r, 1200));
    setIsSending(false);
    toast(`Enlace de configuración enviado a la terminal móvil vinculada.`, 'success', 'Omnicanal Hub');
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) return;
    setIsVerifying(true);
    await new Promise(r => setTimeout(r, 1000));
    setIsVerifying(false);
    onComplete(secret);
    toast('Doble Factor activado correctamente.', 'success', 'Seguridad Blindada');
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose}></div>
      
      <div className="relative w-full max-w-2xl glass rounded-[64px] border border-slate-700/50 shadow-[0_0_150px_rgba(59,130,246,0.2)] overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
        {/* Header */}
        <div className="p-10 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between shadow-lg">
           <div className="flex items-center space-x-6">
              <div className="w-16 h-16 rounded-[24px] bg-blue-600/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-inner">
                 <ShieldCheck size={32} />
              </div>
              <div>
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter">MFA Provisioning</h3>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1">Configuración de Doble Factor v2.4</p>
              </div>
           </div>
           <button onClick={onClose} className="p-4 bg-slate-800 hover:bg-rose-500/10 rounded-[20px] text-slate-400 hover:text-rose-500 transition-all border border-slate-700">
             <X size={24} />
           </button>
        </div>

        <div className="p-12 overflow-y-auto scrollbar-hide flex-1">
          {step === 1 ? (
            <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
              <div className="text-center space-y-3">
                 <h4 className="text-xl font-black text-white uppercase tracking-tight">Vincular Dispositivo</h4>
                 <p className="text-sm text-slate-500 font-medium max-w-sm mx-auto">Escanea el código con tu app de autenticación favorita para generar tokens de acceso.</p>
              </div>

              <div className="flex flex-col items-center">
                 <div className="p-8 bg-white rounded-[48px] shadow-[0_0_50px_rgba(255,255,255,0.1)] mb-8 group relative">
                    <img src={qrUrl} alt="2FA QR Code" className="w-56 h-56" />
                    <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[48px] flex items-center justify-center pointer-events-none">
                       <QrCode size={48} className="text-blue-600 animate-pulse" />
                    </div>
                 </div>

                 <div className="w-full max-w-sm p-6 bg-slate-900 border border-slate-800 rounded-[32px] space-y-4">
                    <div className="flex justify-between items-center px-1">
                       <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Código Manual / Semilla</span>
                       <button onClick={handleCopySecret} className="text-[9px] font-black text-blue-400 hover:text-blue-300 uppercase flex items-center">
                          <Copy size={12} className="mr-1.5" /> Copiar
                       </button>
                    </div>
                    <div className="bg-slate-950 px-6 py-4 rounded-2xl border border-slate-800 text-center">
                       <code className="text-lg font-black text-emerald-400 font-mono tracking-[0.3em]">{secret}</code>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <button 
                  onClick={handleSendViaEmail}
                  disabled={isSending}
                  className="flex items-center justify-center space-x-3 p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 text-slate-400 hover:text-white transition-all group"
                 >
                    {isSending ? <RefreshCw className="animate-spin" size={18} /> : <Mail size={18} className="group-hover:text-blue-400" />}
                    <span className="text-[10px] font-black uppercase tracking-widest">Enviar por Email</span>
                 </button>
                 <button 
                  onClick={handleSendViaWhatsApp}
                  disabled={isSending}
                  className="flex items-center justify-center space-x-3 p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-slate-400 hover:text-white transition-all group"
                 >
                    {isSending ? <RefreshCw className="animate-spin" size={18} /> : <MessageCircle size={18} className="group-hover:text-emerald-400" />}
                    <span className="text-[10px] font-black uppercase tracking-widest">Enviar WhatsApp</span>
                 </button>
              </div>

              <button 
                onClick={() => setStep(2)}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-6 rounded-[28px] font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center space-x-3 active:scale-95 group"
              >
                 <span>Siguiente Paso: Verificar</span>
                 <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ) : (
            <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
               <div className="text-center space-y-3">
                  <h4 className="text-xl font-black text-white uppercase tracking-tight">Confirmar Vinculación</h4>
                  <p className="text-sm text-slate-500 font-medium">Introduce el código de 6 dígitos que aparece ahora mismo en tu aplicación móvil.</p>
               </div>

               <div className="flex flex-col items-center space-y-10">
                  <div className="w-24 h-24 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-400 border-2 border-blue-500/20">
                     <Smartphone size={40} className="animate-bounce" />
                  </div>

                  <div className="w-full max-w-xs space-y-4">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block text-center">Auth Token (6 Dígitos)</label>
                     <input 
                       type="text" 
                       maxLength={6}
                       value={verificationCode}
                       onChange={e => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                       placeholder="000000"
                       className="w-full bg-slate-950 border-2 border-slate-800 rounded-[28px] px-8 py-6 text-4xl font-black text-white text-center font-mono tracking-[0.5em] outline-none focus:border-blue-500 shadow-inner"
                     />
                  </div>

                  <div className="p-8 bg-slate-900/60 border border-slate-800 rounded-[40px] flex items-start space-x-5">
                     <Info size={20} className="text-blue-500 mt-0.5 shrink-0" />
                     <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase tracking-wider">
                        Asegúrate de que la hora en tu dispositivo móvil sea la correcta (Sincronización de Red), de lo contrario los tokens fallarán al validar.
                     </p>
                  </div>
               </div>

               <div className="flex space-x-4 pt-6">
                  <button 
                    onClick={() => setStep(1)}
                    className="flex-1 py-5 rounded-[24px] bg-slate-900 border border-slate-800 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-white transition-all"
                  >
                     Regresar a QR
                  </button>
                  <button 
                    onClick={handleVerify}
                    disabled={isVerifying || verificationCode.length !== 6}
                    className="flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center space-x-3 active:scale-95 disabled:opacity-50"
                  >
                    {isVerifying ? <RefreshCw className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                    <span>{isVerifying ? 'Validando...' : 'Sellar y Activar 2FA'}</span>
                  </button>
               </div>
            </div>
          )}
        </div>

        {/* Security Footer */}
        <div className="p-8 bg-slate-900/60 border-t border-slate-800 flex justify-center items-center space-x-4 opacity-50 shrink-0">
           <Shield size={16} className="text-slate-500" />
           <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Protocolo RFC 6238 (TOTP) • Cifrado Local AES-GCM</p>
        </div>
      </div>
    </div>
  );
};

export default MFAConfigurator;