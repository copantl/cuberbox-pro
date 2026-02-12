import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, Search, Send, MoreVertical, CheckCheck, 
  Paperclip, Smile, Phone, Info, ArrowLeft, Facebook, 
  Instagram, Music, LayoutGrid, Filter, Settings, ShieldCheck,
  Zap, Bot, Smartphone, Globe, Plus, Trash2, Key, Clock,
  CheckCircle2, AlertCircle, RefreshCw, Layers, Terminal,
  MessageSquare, Sliders, Volume2, Save, X, Network, Share2,
  ChevronRight, ExternalLink, Link, Shield, Wand2,
  FileText, Copy
} from 'lucide-react';
import { WhatsAppConversation, WhatsAppMessage, ChannelType } from '../types';
import { useToast } from '../ToastContext';

const INITIAL_CONVERSATIONS: WhatsAppConversation[] = [
  {
    id: 'conv_1',
    leadId: 'lead_1',
    leadName: 'Johnathan Wick',
    channel: 'WHATSAPP',
    lastMessage: '¿Me puedes enviar el presupuesto actualizado?',
    lastTimestamp: '14:20',
    unreadCount: 2,
    assignedAgentId: 'usr_1',
    messages: [
      { id: '1', senderId: 'lead_1', text: 'Hola, estoy interesado en la propiedad de Miami.', timestamp: '14:15', status: 'read', isMe: false },
      { id: '2', senderId: 'usr_1', text: '¡Hola John! Claro que sí, ¿cuál de todas?', timestamp: '14:18', status: 'read', isMe: true },
      { id: '3', senderId: 'lead_1', text: '¿Me puedes enviar el presupuesto actualizado?', timestamp: '14:20', status: 'read', isMe: false },
    ]
  },
  {
    id: 'conv_2',
    leadId: 'lead_2',
    leadName: 'Maria Garcia',
    channel: 'FACEBOOK',
    lastMessage: 'Me interesa el anuncio que vi sobre el seguro de vida.',
    lastTimestamp: '10:05',
    unreadCount: 0,
    assignedAgentId: 'usr_1',
    messages: [
      { id: 'f1', senderId: 'lead_2', text: 'Vi el anuncio en Facebook.', timestamp: '10:00', status: 'read', isMe: false },
      { id: 'f2', senderId: 'usr_1', text: 'Hola Maria, ¿en qué ciudad buscas?', timestamp: '10:05', status: 'read', isMe: true }
    ]
  }
];

const INITIAL_CHANNELS = [
  { id: 'wa_1', name: 'WhatsApp Business API', provider: 'WABA', status: 'CONNECTED', icon: MessageCircle, color: 'text-emerald-500' },
  { id: 'fb_1', name: 'CUBERBOX Facebook Page', provider: 'Meta', status: 'CONNECTED', icon: Facebook, color: 'text-blue-500' },
  { id: 'tk_1', name: 'Official TikTok Store', provider: 'TikTok', status: 'STANDBY', icon: Music, color: 'text-rose-500' },
];

const INITIAL_TEMPLATES = [
  { id: 't1', name: 'bienvenida_cliente_v1', category: 'UTILITY', status: 'APPROVED', language: 'ES' },
  { id: 't2', name: 'recordatorio_pago_q4', category: 'MARKETING', status: 'APPROVED', language: 'ES' },
  { id: 't3', name: 'otp_auth_code', category: 'AUTHENTICATION', status: 'PENDING', language: 'EN' },
];

const ChannelIcon = ({ channel, size = 16, className = "" }: { channel: ChannelType, size?: number, className?: string }) => {
  switch(channel) {
    case 'WHATSAPP': return <MessageCircle size={size} className={`text-emerald-500 ${className}`} />;
    case 'FACEBOOK': return <Facebook size={size} className={`text-blue-500 ${className}`} />;
    case 'TIKTOK': return <Music size={size} className={`text-rose-500 ${className}`} />;
    case 'INSTAGRAM': return <Instagram size={size} className={`text-purple-500 ${className}`} />;
    default: return <LayoutGrid size={size} className={className} />;
  }
};

const WhatsAppModule: React.FC = () => {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'OPERATIONS' | 'SETTINGS'>('OPERATIONS');
  const [activeSettingsTab, setActiveSettingsTab] = useState<'ACCOUNTS' | 'AI' | 'TEMPLATES' | 'WEBHOOKS'>('ACCOUNTS');
  
  const [conversations, setConversations] = useState<WhatsAppConversation[]>(INITIAL_CONVERSATIONS);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(INITIAL_CONVERSATIONS[0].id);
  const [messageText, setMessageText] = useState("");
  const [activeFilter, setActiveFilter] = useState<ChannelType | 'ALL'>('ALL');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [channels, setChannels] = useState(INITIAL_CHANNELS);
  const [templates, setTemplates] = useState(INITIAL_TEMPLATES);
  const [isSyncing, setIsSyncing] = useState(false);
  const [aiAutoReply, setAiAutoReply] = useState(true);
  const [aiPrompt, setAiPrompt] = useState("Eres un asistente servicial para CUBERBOX. Responde dudas sobre precios y agenda citas si el cliente parece interesado.");
  
  const [isNewChannelModalOpen, setIsNewChannelModalOpen] = useState(false);
  const [isNewTemplateModalOpen, setIsNewTemplateModalOpen] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConvId, conversations]);

  const selectedConv = conversations.find(c => c.id === selectedConvId);

  const handleSend = () => {
    if (!messageText.trim() || !selectedConvId) return;
    
    const newMessage: WhatsAppMessage = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: 'usr_1',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      isMe: true
    };

    setConversations(prev => prev.map(c => 
      c.id === selectedConvId 
        ? { ...c, messages: [...c.messages, newMessage], lastMessage: messageText, lastTimestamp: newMessage.timestamp } 
        : c
    ));

    setMessageText("");
    toast('Mensaje despachado a la API de red.', 'success');
  };

  const handleDeleteChannel = (id: string) => {
    if (confirm('¿Deseas desconectar este canal?')) {
      setChannels(channels.filter(c => c.id !== id));
      toast('Canal de comunicación removido.', 'warning');
    }
  };

  const handleAddChannel = () => {
    const newChan = {
      id: `wa_${Math.random().toString(36).substr(2, 5)}`,
      name: 'Nueva Cuenta Business',
      provider: 'Meta',
      status: 'STANDBY',
      icon: MessageCircle,
      color: 'text-emerald-500'
    };
    setChannels([...channels, newChan]);
    setIsNewChannelModalOpen(false);
    toast('Nuevo canal configurado.', 'info');
  };

  const handleSyncHub = async () => {
    setIsSyncing(true);
    await new Promise(r => setTimeout(r, 2000));
    setIsSyncing(false);
    toast('Sincronización omnicanal completa.', 'success', 'Hub Sync');
  };

  const filteredConversations = conversations.filter(c => 
    activeFilter === 'ALL' || c.channel === activeFilter
  );

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
        <div className="flex items-center space-x-5">
           <div className={`p-4 rounded-[24px] ${viewMode === 'OPERATIONS' ? 'bg-blue-600' : 'bg-amber-500'} text-white shadow-2xl transition-all duration-500`}>
              {viewMode === 'OPERATIONS' ? <LayoutGrid size={28} /> : <Settings size={28} />}
           </div>
           <div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                {viewMode === 'OPERATIONS' ? 'Omnicanal Inbox' : 'Hub Infrastructure'}
              </h2>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1">
                {viewMode === 'OPERATIONS' ? 'Gestión Unificada de Mensajería' : 'Configuración de Nodos'}
              </p>
           </div>
        </div>

        <div className="flex bg-slate-900 border-2 border-slate-800 p-1.5 rounded-[24px] shadow-inner">
           <button onClick={() => setViewMode('OPERATIONS')} className={`px-8 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'OPERATIONS' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500'}`}>Operations</button>
           <button onClick={() => setViewMode('SETTINGS')} className={`px-8 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'SETTINGS' ? 'bg-amber-600 text-white shadow-xl' : 'text-slate-500'}`}>Settings</button>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex glass rounded-[56px] border border-slate-700/50 overflow-hidden shadow-2xl">
        {viewMode === 'OPERATIONS' ? (
          <>
            <div className={`w-full lg:w-[450px] border-r border-slate-800 flex flex-col bg-[#0a0f1d]/40 ${selectedConvId ? 'hidden lg:flex' : 'flex'}`}>
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                   <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Bandeja de Entrada</h3>
                   <div className="flex space-x-1.5">
                      {(['ALL', 'WHATSAPP', 'FACEBOOK', 'TIKTOK'] as const).map(f => (
                        <button key={f} onClick={() => setActiveFilter(f)} className={`p-2.5 rounded-xl border-2 transition-all ${activeFilter === f ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-600'}`}>
                          {f === 'ALL' ? <Filter size={14} /> : <ChannelIcon channel={f as ChannelType} size={14} />}
                        </button>
                      ))}
                   </div>
                </div>
                <div className="relative group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
                  <input type="text" placeholder="Buscar mensajes..." className="w-full bg-slate-950 border-2 border-slate-800 rounded-[20px] pl-14 pr-4 py-4 text-xs text-white outline-none focus:border-blue-500 shadow-inner font-bold" />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-hide divide-y divide-slate-800/40">
                {filteredConversations.map((conv) => (
                  <div key={conv.id} onClick={() => setSelectedConvId(conv.id)} className={`p-8 flex items-center space-x-6 cursor-pointer transition-all relative ${selectedConvId === conv.id ? 'bg-blue-600/5' : 'hover:bg-white/5'}`}>
                    {selectedConvId === conv.id && <div className="absolute left-0 top-0 w-1.5 h-full bg-blue-500 shadow-[0_0_15px_#3b82f6]"></div>}
                    <div className="relative shrink-0">
                      <div className={`w-16 h-16 rounded-[24px] bg-slate-800 flex items-center justify-center text-xl font-black text-slate-400 border-2 ${selectedConvId === conv.id ? 'border-blue-500' : 'border-slate-700'}`}>{conv.leadName.charAt(0)}</div>
                      <div className="absolute -bottom-1 -right-1 bg-slate-900 rounded-lg p-2 border border-slate-700"><ChannelIcon channel={conv.channel} size={14} /></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-black text-sm text-white uppercase truncate">{conv.leadName}</h4>
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{conv.lastTimestamp}</span>
                      </div>
                      <p className={`text-[11px] truncate ${conv.unreadCount > 0 ? 'text-slate-200 font-black' : 'text-slate-500 font-medium'}`}>{conv.lastMessage}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`flex-1 flex flex-col relative ${selectedConvId ? 'flex' : 'hidden lg:flex'} bg-black/10`}>
              {selectedConv ? (
                <>
                  <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
                    <div className="flex items-center space-x-6">
                      <button onClick={() => setSelectedConvId(null)} className="lg:hidden p-4 bg-slate-800 rounded-2xl"><ArrowLeft size={20} /></button>
                      <div className="w-14 h-14 rounded-[22px] bg-blue-600 flex items-center justify-center font-black text-white shadow-2xl">{selectedConv.leadName.charAt(0)}</div>
                      <div>
                        <h3 className="font-black text-lg text-white uppercase">{selectedConv.leadName}</h3>
                        <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">{selectedConv.channel} CORE</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-12 space-y-8 scrollbar-hide">
                    {selectedConv.messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}>
                        <div className={`max-w-[75%] p-6 rounded-[32px] text-sm relative shadow-2xl ${msg.isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'glass border-slate-700 text-slate-200 rounded-tl-none'}`}>
                          <p className="font-medium">{msg.text}</p>
                          <div className={`text-[9px] mt-3 flex justify-end font-black uppercase ${msg.isMe ? 'text-blue-100/50' : 'text-slate-500'}`}>{msg.timestamp}</div>
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>

                  <div className="p-10 bg-slate-900/80 border-t border-slate-800/50">
                    <div className="flex items-center space-x-5 bg-slate-950 border-2 border-slate-800 rounded-[32px] px-10 py-4 focus-within:border-blue-500 transition-all">
                      <input type="text" value={messageText} onChange={(e) => setMessageText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Escribe un mensaje..." className="flex-1 bg-transparent border-none outline-none py-4 text-sm text-slate-200 font-bold" />
                      <button onClick={handleSend} disabled={!messageText.trim()} className={`p-4 rounded-2xl transition-all ${messageText.trim() ? 'bg-blue-600 text-white hover:scale-110' : 'text-slate-800'}`}><Send size={22} /></button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-20 text-center opacity-30">
                  <LayoutGrid size={64} className="text-blue-500 mb-10" />
                  <h3 className="text-3xl font-black text-white uppercase">Inbox</h3>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col animate-in slide-in-from-right-4 duration-500">
             <div className="p-10 border-b border-slate-800 bg-slate-900/60 flex items-center space-x-12">
                {[
                  { id: 'ACCOUNTS', label: 'Infraestructura', icon: Network },
                  { id: 'AI', label: 'Neuronal Lab', icon: Bot },
                  { id: 'TEMPLATES', label: 'HSM Manager', icon: FileText },
                  { id: 'WEBHOOKS', label: 'API Connect', icon: Terminal },
                ].map(tab => (
                  <button key={tab.id} onClick={() => setActiveSettingsTab(tab.id as any)} className={`flex items-center space-x-3 text-[11px] font-black uppercase tracking-[0.2em] pb-5 border-b-4 transition-all ${activeSettingsTab === tab.id ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-600'}`}>
                    <tab.icon size={16} />
                    <span>{tab.label}</span>
                  </button>
                ))}
             </div>

             <div className="flex-1 overflow-y-auto p-12 bg-slate-950/20 scrollbar-hide">
                {activeSettingsTab === 'ACCOUNTS' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {channels.map(chan => (
                      <div key={chan.id} className="p-10 rounded-[48px] bg-slate-900/60 border border-slate-800 hover:border-blue-500/40 transition-all shadow-2xl relative">
                        <div className="flex items-center justify-between mb-8">
                          <div className={`p-5 rounded-[22px] bg-slate-950 border border-slate-800 ${chan.color}`}><chan.icon size={32} /></div>
                          <div className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-400">{chan.status}</div>
                        </div>
                        <h4 className="font-black text-white uppercase text-lg mb-1">{chan.name}</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">{chan.provider}</p>
                        <div className="mt-10 pt-8 border-t border-slate-800/50 flex justify-end">
                          <button onClick={() => handleDeleteChannel(chan.id)} className="p-3 text-slate-700 hover:text-rose-500 transition-colors"><Trash2 size={18} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeSettingsTab === 'WEBHOOKS' && (
                  <div className="max-w-4xl glass p-12 rounded-[64px] border border-slate-700/50 shadow-2xl space-y-10">
                    <div className="flex items-center space-x-8">
                       <div className="w-20 h-20 rounded-[28px] bg-slate-900 flex items-center justify-center text-blue-400 border border-slate-700"><Terminal size={40} /></div>
                       <h4 className="text-2xl font-black text-white uppercase tracking-tight">API Webhooks</h4>
                    </div>
                    <div className="p-10 bg-slate-950 border border-slate-800 rounded-[40px] space-y-6">
                      <div className="flex items-center space-x-5">
                         <code className="flex-1 bg-black/40 p-6 rounded-[24px] text-emerald-400 font-mono text-xs truncate border border-slate-800">https://hub.cuberbox-pro.net/webhook/v3/meta/inbound_627a</code>
                         <button onClick={() => { navigator.clipboard.writeText("https://hub.cuberbox-pro.net/webhook/v3/meta/inbound_627a"); toast('URI copiada', 'info'); }} className="p-5 bg-slate-900 rounded-[24px] text-slate-500 hover:text-white border border-slate-800 active:scale-95 transition-all"><Copy size={22} /></button>
                      </div>
                    </div>
                  </div>
                )}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppModule;