import React, { useState } from 'react';
import { 
  Mail, Server, Key, ShieldCheck, Globe, Plus, Trash2, Edit2, X, Save, 
  RefreshCw, CheckCircle, AlertCircle, Eye, EyeOff, Lock, Network,
  Send, ExternalLink, ShieldAlert, Zap, Info, Smartphone
} from 'lucide-react';
import { SMTPServer } from '../types';
import { MOCK_SMTP_SERVERS } from '../constants';
import { useToast } from '../ToastContext';

const SMTPServerManagement: React.FC = () => {
  const { toast } = useToast();
  const [servers, setServers] = useState<SMTPServer[]>(MOCK_SMTP_SERVERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingServer, setEditingServer] = useState<Partial<SMTPServer> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleOpenModal = (server?: SMTPServer) => {
    if (server) {
      setEditingServer({ ...server });
    } else {
      setEditingServer({
        id: `smtp_${Math.random().toString(36).substr(2, 5)}`,
        name: '',
        host: '',
        port: 587,
        encryption: 'TLS',
        authMethod: 'LOGIN',
        username: '',
        password: '',
        fromEmail: '',
        fromName: '',
        isActive: true,
        status: 'DISCONNECTED'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingServer?.name || !editingServer?.host) {
      toast('Nombre y Host son obligatorios.', 'error');
      return;
    }
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1000));

    const isExisting = servers.find(s => s.id === editingServer.id);
    const finalServer = editingServer as SMTPServer;

    if (isExisting) {
      setServers(servers.map(s => s.id === finalServer.id ? finalServer : s));
      toast('Configuración de SMTP actualizada.', 'success');
    } else {
      setServers([...servers, finalServer]);
      toast('Nuevo relevo SMTP registrado.', 'success');
    }

    setIsSaving(false);
    setIsModalOpen(false);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    toast('Iniciando handshake SMTP...', 'info', 'Relay Tester');
    await new Promise(r => setTimeout(r, 2000));
    
    const success = Math.random() > 0.2;
    if (success) {
      toast('Prueba de conexión exitosa. El servidor respondió OK.', 'success');
      if (editingServer) setEditingServer({ ...editingServer, status: 'CONNECTED' });
    } else {
      toast('Falla de autenticación o tiempo de espera agotado.', 'error');
      if (editingServer) setEditingServer({ ...editingServer, status: 'ERROR' });
    }
    setIsTesting(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar este servidor de relevo? Los envíos vinculados a esta cuenta fallarán.')) {
      setServers(servers.filter(s => s.id !== id));
      toast('Servidor removido de la infraestructura.', 'warning');
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase flex items-center">
            <Mail className="mr-4 text-blue-400" size={36} />
            SMTP Relay Forge
          </h2>
          <p className="text-slate-400 text-sm font-medium mt-1">Configuración de servidores de salida para notificaciones y marketing.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/30 transition-all active:scale-95 group"
        >
          <Plus size={22} className="group-hover:rotate-90 transition-transform" />
          <span>Añadir Relay</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {servers.map((server) => (
          <div key={server.id} className="glass p-10 rounded-[56px] border border-slate-700/50 flex flex-col h-full hover:border-blue-500/30 transition-all shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700 text-white">
               <Server size={180} />
            </div>

            <div className="flex justify-between items-start mb-8 relative z-10">
               <div className={`p-4 rounded-[22px] bg-slate-950 border border-slate-800 text-blue-400 shadow-inner group-hover:scale-105 transition-transform`}>
                  <Mail size={28} />
               </div>
               <div className="flex flex-col items-end space-y-2">
                  <div className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${server.status === 'CONNECTED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                     {server.status}
                  </div>
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                     <button onClick={() => handleOpenModal(server)} className="p-3 bg-slate-900 border border-slate-800 hover:bg-blue-600 text-white rounded-xl transition-all shadow-lg"><Edit2 size={16} /></button>
                     <button onClick={() => handleDelete(server.id)} className="p-3 bg-slate-900 border border-slate-800 hover:bg-rose-600 text-white rounded-xl transition-all shadow-lg"><Trash2 size={16} /></button>
                  </div>
               </div>
            </div>

            <div className="space-y-2 relative z-10 mb-8">
               <h3 className="text-2xl font-black text-white uppercase tracking-tight truncate">{server.name}</h3>
               <p className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-widest">{server.host}:{server.port}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-10 relative z-10">
               <div className="p-5 bg-slate-950/60 rounded-[30px] border border-slate-800 space-y-1">
                  <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Cifrado</p>
                  <p className="text-sm font-black text-white tracking-tighter">{server.encryption}</p>
               </div>
               <div className="p-5 bg-slate-950/60 rounded-[30px] border border-slate-800 space-y-1">
                  <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Auth</p>
                  <p className="text-sm font-black text-blue-400 tracking-tighter">{server.authMethod}</p>
               </div>
            </div>

            <div className="mt-auto pt-8 border-t border-slate-800/50 flex items-center justify-between relative z-10">
               <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-400">
                     {server.fromName.charAt(0)}
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter truncate max-w-[120px]">{server.fromEmail}</span>
               </div>
               <div className={`w-2 h-2 rounded-full ${server.isActive ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-slate-700'}`}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal CRUD SMTP */}
      {isModalOpen && editingServer && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-4xl glass rounded-[64px] border border-slate-700/50 shadow-[0_0_120px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[95vh]">
             <div className="p-10 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 shadow-lg shrink-0">
                <div className="flex items-center space-x-6">
                   <div className="w-16 h-16 rounded-[24px] bg-blue-600/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-inner">
                      <Server size={32} />
                   </div>
                   <div>
                      <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Relay Configuration</h3>
                      <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2">Parámetros de Protocolo y Seguridad de Capas</p>
                   </div>
                </div>
                <div className="flex items-center space-x-4">
                   <button 
                    onClick={handleTestConnection}
                    disabled={isTesting || !editingServer.host}
                    className="flex items-center space-x-3 bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 px-6 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
                   >
                     {isTesting ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} />}
                     <span>{isTesting ? 'Handshaking...' : 'Test Connection'}</span>
                   </button>
                   <button onClick={() => setIsModalOpen(false)} className="p-4 bg-slate-800 hover:bg-rose-500/10 rounded-[20px] text-slate-400 hover:text-rose-500 transition-all border border-slate-700">
                     <X size={24} />
                   </button>
                </div>
             </div>

             <div className="p-12 overflow-y-auto space-y-12 scrollbar-hide">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   {/* Connection Settings */}
                   <div className="space-y-10">
                      <h4 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.4em] border-b-2 border-slate-800 pb-4 flex items-center">
                         <Network size={14} className="mr-2" /> Connection Core
                      </h4>
                      <div className="space-y-6">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Friendly Alias</label>
                            <input type="text" value={editingServer.name} onChange={e => setEditingServer({...editingServer, name: e.target.value})} className="w-full bg-slate-950 border-2 border-slate-800 rounded-[28px] px-8 py-5 text-sm text-white font-bold outline-none focus:border-blue-500 shadow-inner" placeholder="Ej: AWS SES Primary" />
                         </div>
                         <div className="grid grid-cols-3 gap-6">
                            <div className="col-span-2 space-y-2">
                               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">SMTP Host</label>
                               <input type="text" value={editingServer.host} onChange={e => setEditingServer({...editingServer, host: e.target.value})} className="w-full bg-slate-950 border-2 border-slate-800 rounded-[28px] px-6 py-5 text-sm text-blue-400 font-mono outline-none focus:border-blue-500 shadow-inner" placeholder="smtp.mail.com" />
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Port</label>
                               <input type="number" value={editingServer.port} onChange={e => setEditingServer({...editingServer, port: parseInt(e.target.value)})} className="w-full bg-slate-950 border-2 border-slate-800 rounded-[28px] px-6 py-5 text-sm text-white font-mono outline-none focus:border-blue-500 shadow-inner text-center" />
                            </div>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Encryption Mode</label>
                            <div className="grid grid-cols-4 gap-2">
                               {['NONE', 'SSL', 'TLS', 'STARTTLS'].map(enc => (
                                  <button 
                                    key={enc}
                                    onClick={() => setEditingServer({...editingServer, encryption: enc as any})}
                                    className={`py-3 rounded-2xl text-[9px] font-black transition-all border ${editingServer.encryption === enc ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-600 hover:text-slate-400'}`}
                                  >
                                     {enc}
                                  </button>
                               ))}
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Authentication Settings */}
                   <div className="space-y-10">
                      <h4 className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.4em] border-b-2 border-slate-800 pb-4 flex items-center">
                         <Lock size={14} className="mr-2" /> Authentication Matrix
                      </h4>
                      <div className="space-y-6">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Username / API Key</label>
                            <input type="text" value={editingServer.username} onChange={e => setEditingServer({...editingServer, username: e.target.value})} className="w-full bg-slate-950 border-2 border-slate-800 rounded-[28px] px-8 py-5 text-sm text-white font-medium outline-none focus:border-emerald-500 shadow-inner" />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password / Secret</label>
                            <div className="relative group">
                               <input 
                                 type={showPass ? 'text' : 'password'} 
                                 value={editingServer.password} 
                                 onChange={e => setEditingServer({...editingServer, password: e.target.value})} 
                                 className="w-full bg-slate-950 border-2 border-slate-800 rounded-[28px] px-8 py-5 text-sm text-white outline-none focus:border-emerald-500 transition-all shadow-inner" 
                               />
                               <button onClick={() => setShowPass(!showPass)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 hover:text-emerald-400 transition-colors">
                                  {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                               </button>
                            </div>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Auth Method</label>
                            <select value={editingServer.authMethod} onChange={e => setEditingServer({...editingServer, authMethod: e.target.value as any})} className="w-full bg-slate-950 border-2 border-slate-800 rounded-[28px] px-8 py-5 text-xs text-white font-black uppercase outline-none focus:border-emerald-500 appearance-none shadow-inner cursor-pointer">
                               <option value="LOGIN">LOGIN (Recomendado)</option>
                               <option value="PLAIN">PLAIN</option>
                               <option value="CRAM-MD5">CRAM-MD5</option>
                            </select>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Identity Settings */}
                <div className="space-y-10">
                   <h4 className="text-[11px] font-black text-amber-500 uppercase tracking-[0.4em] border-b-2 border-slate-800 pb-4 flex items-center">
                      <Smartphone size={14} className="mr-2" /> Sender Identity
                   </h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Default "From" Name</label>
                         <input type="text" value={editingServer.fromName} onChange={e => setEditingServer({...editingServer, fromName: e.target.value})} className="w-full bg-slate-950 border-2 border-slate-800 rounded-[28px] px-8 py-5 text-sm text-white font-bold outline-none focus:border-amber-500 shadow-inner" placeholder="CUBERBOX Systems" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Default "From" Email</label>
                         <input type="email" value={editingServer.fromEmail} onChange={e => setEditingServer({...editingServer, fromEmail: e.target.value})} className="w-full bg-slate-950 border-2 border-slate-800 rounded-[28px] px-8 py-5 text-sm text-white font-bold outline-none focus:border-amber-500 shadow-inner" placeholder="noreply@domain.com" />
                      </div>
                   </div>
                </div>

                <div className="p-10 glass rounded-[48px] border border-blue-500/20 bg-blue-600/5 flex items-start space-x-6 shadow-inner group">
                   <div className="p-4 rounded-3xl bg-blue-600/10 text-blue-400 group-hover:rotate-12 transition-transform">
                      <Info size={32} />
                   </div>
                   <div className="flex-1">
                      <h5 className="text-sm font-black text-white uppercase tracking-widest mb-1">Nota de Seguridad</h5>
                      <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase tracking-wider">
                         CUBERBOX Pro encripta todas las credenciales SMTP en reposo utilizando AES-256. Asegúrate de que el firewall del servidor permita tráfico saliente en el puerto {editingServer.port || 'configurado'}.
                      </p>
                   </div>
                </div>
             </div>

             <div className="p-10 bg-slate-900/60 border-t border-slate-800 flex justify-end items-center space-x-6 shadow-2xl shrink-0">
                <div className="flex items-center space-x-3 text-[10px] font-black text-slate-500 uppercase tracking-widest italic opacity-60">
                   <ShieldCheck size={16} />
                   <span>Cifrado AES-256 Sincronizado</span>
                </div>
                <button onClick={handleSave} disabled={isSaving} className="flex items-center space-x-4 bg-blue-600 hover:bg-blue-500 text-white px-14 py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50 group">
                   {isSaving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} className="group-hover:scale-110 transition-transform" />}
                   <span>{isSaving ? 'Actualizando Forge...' : 'Sellar Configuración'}</span>
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SMTPServerManagement;