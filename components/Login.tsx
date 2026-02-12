
import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  ArrowRight, 
  ShieldAlert, 
  Key, 
  RefreshCw, 
  Mail, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  UserCircle, 
  Globe, 
  Layout, 
  Shield 
} from 'lucide-react';
import { UserRole } from '../types';
import Logo from './Logo';

interface LoginProps {
  onLogin: (role?: UserRole) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [step, setStep] = useState<'LOGIN' | 'MFA' | 'FORGOT_PASSWORD' | 'RECOVERY_SENT'>('LOGIN');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(['', '', '', '', '', '']);
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.ADMIN);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('MFA');
    }, 1200);
  };

  const handleSSOLogin = () => {
    setLoading(true);
    console.debug("[Auth Engine] Redirecting to SSO Provider...");
    setTimeout(() => {
      setLoading(false);
      onLogin(UserRole.AGENT); 
    }, 2000);
  };

  const handleMfa = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin(selectedRole);
    }, 800);
  };

  const handleTokenChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newToken = [...token];
    newToken[index] = value;
    setToken(newToken);
    if (value && index < 5) document.getElementById(`token-${index + 1}`)?.focus();
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-[#020617] to-[#020617]">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
      
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex flex-col items-center">
            {/* Logo reducido para elegancia */}
            <Logo className="w-12 h-12" />
            <h1 className="text-3xl font-black tracking-tighter text-white mt-4 uppercase">cuberbox</h1>
            <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-[8px] mt-1 opacity-50">Enterprise Auth Gateway</p>
          </div>
        </div>

        <div className="glass p-8 rounded-[40px] border border-slate-700/50 shadow-2xl shadow-black/50 overflow-hidden">
          {step === 'LOGIN' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              <button 
                onClick={handleSSOLogin}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-4 bg-white hover:bg-slate-100 text-slate-900 py-4 rounded-2xl transition-all shadow-xl font-black text-xs uppercase tracking-widest active:scale-95 group disabled:opacity-50"
              >
                {loading ? <RefreshCw className="animate-spin" size={20} /> : <Globe size={20} className="text-blue-600 group-hover:rotate-12 transition-transform" />}
                <span>{loading ? 'Redirigiendo...' : 'Acceso Corporativo (SSO)'}</span>
              </button>

              <div className="flex items-center space-x-4 text-slate-700">
                 <div className="h-px bg-slate-800 flex-1"></div>
                 <span className="text-[10px] font-black uppercase tracking-[0.3em]">O acceso local</span>
                 <div className="h-px bg-slate-800 flex-1"></div>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Seleccionar Perfil</label>
                  <div className="grid grid-cols-3 gap-2">
                      {[UserRole.ADMIN, UserRole.MANAGER, UserRole.AGENT].map(r => (
                        <button 
                          key={r}
                          type="button"
                          onClick={() => setSelectedRole(r)}
                          className={`py-3 rounded-2xl text-[9px] font-black uppercase tracking-tighter border transition-all ${selectedRole === r ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-600/20' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'}`}
                        >
                          {r}
                        </button>
                      ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Username / ID</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                    <input type="text" required defaultValue="admin" className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl pl-12 pr-4 py-4 text-sm text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder-slate-600 shadow-inner" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                    <input type="password" required defaultValue="password" className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl pl-12 pr-4 py-4 text-sm text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder-slate-600 shadow-inner" />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center space-x-2 active:scale-95">
                  <span>{loading ? 'Validando...' : 'Iniciar Sesión Local'}</span>
                  {!loading && <ArrowRight size={18} />}
                </button>
              </form>
            </div>
          )}

          {step === 'MFA' && (
            <form onSubmit={handleMfa} className="space-y-8 animate-in zoom-in-95 duration-500">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto mb-4">
                  <ShieldAlert size={32} />
                </div>
                <h3 className="text-xl font-black text-white">Verificación de 2 Pasos</h3>
                <p className="text-xs text-slate-500 leading-relaxed px-4">Introduce el código de seguridad para tu perfil de <span className="text-blue-400 font-bold uppercase">{selectedRole}</span>.</p>
              </div>

              <div className="flex justify-between space-x-2 px-2">
                {token.map((digit, idx) => (
                  <input key={idx} id={`token-${idx}`} type="text" maxLength={1} value={digit} onChange={(e) => handleTokenChange(idx, e.target.value)} className="w-12 h-16 bg-slate-900 border border-slate-800 rounded-xl text-center text-2xl font-black text-blue-400 focus:border-blue-500 outline-none transition-all" />
                ))}
              </div>

              <button type="submit" disabled={loading || token.some(d => !d)} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-emerald-600/20 flex items-center justify-center space-x-2">
                 <span>{loading ? 'Sincronizando...' : 'Verificar Identidad'}</span>
              </button>
            </form>
          )}
        </div>

        <div className="mt-8 text-center space-y-4">
           <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em]">CUBERBOX Secure Infrastructure v3.1</p>
           <div className="p-4 rounded-2xl bg-black/20 border border-slate-800/50">
             <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider leading-relaxed">
               Este software y su interfaz están protegidos por leyes internacionales de propiedad intelectual. <br/>
               © 2024 CUBERBOX. Queda prohibida la reproducción total o parcial sin autorización expresa de <span className="text-slate-400">Galel López</span>.
             </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
