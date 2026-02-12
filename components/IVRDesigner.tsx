
/**
 * @file IVRDesigner.tsx
 * @description Diseñador visual de IVR con soporte para Drag & Drop y conexiones lógicas dinámicas.
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  GitMerge, Plus, Play, Headphones, Bot, PhoneOff, 
  Save, Trash2, ChevronRight, Zap, X,
  Grid, RefreshCw, Music, MousePointer2, Move,
  AlertCircle, ShieldCheck, Link, ArrowRight,
  Settings
} from 'lucide-react';
import { IVRNode } from '../types';
import { useToast } from '../ToastContext';
import { MOCK_BOTS, MOCK_AUDIO_ASSETS, MOCK_CAMPAIGNS } from '../constants';

const IVRDesigner: React.FC = () => {
  const { toast } = useToast();
  const [nodes, setNodes] = useState<IVRNode[]>([
    { id: 'start_1', type: 'START', title: 'Entrada DID Principal', position: { x: 50, y: 200 }, config: { nextNode: 'welcome_1' } },
    { id: 'welcome_1', type: 'PLAY_AUDIO', title: 'Bienvenida', position: { x: 350, y: 200 }, config: { file: 'welcome.wav', nextNode: 'menu_1' } },
    { id: 'menu_1', type: 'MENU', title: 'Menú Inicial', position: { x: 650, y: 200 }, config: { options: { '1': 'bot_1', '2': 'queue_1' } } },
    { id: 'bot_1', type: 'AI_BOT', title: 'Agente Ventas AI', position: { x: 950, y: 50 }, config: { botId: 'bot_1' } },
    { id: 'queue_1', type: 'QUEUE', title: 'Cola Soporte', position: { x: 950, y: 350 }, config: { queueId: 'tech_support' } },
  ]);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const selectedNode = useMemo(() => 
    nodes.find(n => n.id === selectedNodeId) || null
  , [nodes, selectedNodeId]);

  const handleMouseDown = (node: IVRNode, e: React.MouseEvent) => {
    e.stopPropagation();
    setDraggingNode(node.id);
    setSelectedNodeId(node.id);
    setDragOffset({
      x: e.clientX - node.position.x,
      y: e.clientY - node.position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingNode || !canvasRef.current) return;
    
    const x = e.clientX - dragOffset.x;
    const y = e.clientY - dragOffset.y;

    setNodes(prev => prev.map(n => 
      n.id === draggingNode ? { ...n, position: { x, y } } : n
    ));
  };

  const handleMouseUp = () => setDraggingNode(null);

  const handleAddNode = (type: IVRNode['type']) => {
    const newNode: IVRNode = {
      id: `node_${Math.random().toString(36).substr(2, 5)}`,
      type,
      title: `Nuevo ${type}`,
      position: { x: 100, y: 100 },
      config: type === 'MENU' ? { options: {} } : { nextNode: '' }
    };
    setNodes([...nodes, newNode]);
    setSelectedNodeId(newNode.id);
    toast(`Componente ${type} inyectado al flujo.`, 'info');
  };

  const updateNodeConfig = (nodeId: string, updates: any) => {
    setNodes(nodes.map(n => n.id === nodeId ? { ...n, ...updates } : n));
  };

  const updateNestedConfig = (nodeId: string, key: string, value: any) => {
    setNodes(nodes.map(n => {
      if (n.id === nodeId) {
        return { ...n, config: { ...n.config, [key]: value } };
      }
      return n;
    }));
  };

  const handleDeleteNode = (id: string) => {
    if (nodes.length <= 1) return;
    setNodes(nodes.filter(n => n.id !== id));
    setSelectedNodeId(null);
    toast('Nodo eliminado del flujo SIP.', 'warning');
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    await new Promise(r => setTimeout(r, 2000));
    setIsPublishing(false);
    toast('IVR Sincronizado con FreeSwitch. Cambios en vivo propagados al clúster.', 'success', 'Deploy OK');
  };

  const getNodeIcon = (type: IVRNode['type']) => {
    switch (type) {
      case 'START': return <Play size={20} className="text-emerald-400" />;
      case 'PLAY_AUDIO': return <Music size={20} className="text-blue-400" />;
      case 'MENU': return <Grid size={20} className="text-amber-400" />;
      case 'AI_BOT': return <Bot size={20} className="text-purple-400" />;
      case 'QUEUE': return <Headphones size={20} className="text-sky-400" />;
      case 'HANGUP': return <PhoneOff size={20} className="text-rose-400" />;
    }
  };

  const renderPath = (source: IVRNode, target: IVRNode, label: string) => {
    const startX = source.position.x + 256;
    const startY = source.position.y + 40;
    const endX = target.position.x;
    const endY = target.position.y + 40;
    
    const cp1x = startX + (endX - startX) / 2;
    const cp2x = startX + (endX - startX) / 2;
    
    const pathData = `M ${startX} ${startY} C ${cp1x} ${startY}, ${cp2x} ${endY}, ${endX} ${endY}`;

    return (
      <g key={`${source.id}-${target.id}-${label}`} className="group/path">
        <path 
          d={pathData} 
          fill="none" 
          stroke={label === 'default' ? '#3b82f6' : '#f59e0b'} 
          strokeWidth="3" 
          strokeDasharray={label === 'default' ? "0" : "6,6"}
          className="opacity-30 group-hover/path:opacity-100 transition-opacity duration-300"
        />
        <circle cx={endX} cy={endY} r="5" fill={label === 'default' ? '#3b82f6' : '#f59e0b'} className="shadow-lg" />
      </g>
    );
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-700 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase flex items-center">
            <GitMerge className="mr-4 text-blue-500" size={32} />
            IVR Designer Pro
          </h2>
          <p className="text-slate-400 text-sm font-medium mt-1">Orquestación visual de rutas de audio y lógica de red.</p>
        </div>
        <div className="flex space-x-3">
           <div className="flex bg-slate-900 border-2 border-slate-800 p-1.5 rounded-2xl shadow-inner">
              {(['PLAY_AUDIO', 'MENU', 'AI_BOT', 'QUEUE', 'HANGUP'] as const).map(type => (
                <button 
                  key={type}
                  onClick={() => handleAddNode(type)}
                  className="p-2.5 hover:bg-blue-600/20 text-slate-500 hover:text-blue-400 rounded-xl transition-all"
                >
                  {getNodeIcon(type)}
                </button>
              ))}
           </div>
           <button 
            onClick={handlePublish}
            disabled={isPublishing}
            className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-600/30 flex items-center disabled:opacity-50 active:scale-95"
           >
             {isPublishing ? <RefreshCw className="animate-spin mr-2" size={16} /> : <Save size={16} className="mr-2" />}
             Publicar Flujo
           </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-8 min-h-0">
        <div 
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="col-span-12 lg:col-span-8 xl:col-span-9 glass rounded-[64px] border border-slate-700/50 relative overflow-hidden bg-[#020617]"
        >
           <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[length:50px_50px] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]"></div>
           
           <div className="relative h-full w-full overflow-auto scrollbar-hide">
              <svg className="absolute inset-0 w-[2000px] h-[2000px] pointer-events-none z-0">
                {nodes.map(node => {
                  if (node.config.nextNode) {
                    const target = nodes.find(n => n.id === node.config.nextNode);
                    if (target) return renderPath(node, target, 'default');
                  }
                  if (node.type === 'MENU' && node.config.options) {
                    return Object.entries(node.config.options).map(([key, targetId]) => {
                      const target = nodes.find(n => n.id === targetId);
                      if (target) return renderPath(node, target, `Option ${key}`);
                      return null;
                    });
                  }
                  return null;
                })}
              </svg>

              {nodes.map(node => (
                <div 
                  key={node.id}
                  onMouseDown={(e) => handleMouseDown(node, e)}
                  style={{ left: node.position.x, top: node.position.y }}
                  className={`absolute p-6 rounded-[32px] border-2 cursor-grab active:cursor-grabbing transition-all w-64 flex items-center space-x-4 shadow-2xl ${selectedNodeId === node.id ? 'bg-blue-600/20 border-blue-500 z-20 ring-4 ring-blue-500/10' : 'glass border-slate-800 hover:border-slate-600 z-10'}`}
                >
                   <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner shrink-0">
                      {getNodeIcon(node.type)}
                   </div>
                   <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-black text-white uppercase truncate tracking-tighter">{node.title}</h4>
                      <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5 tracking-widest">{node.type}</p>
                   </div>
                </div>
              ))}
           </div>

           <div className="absolute bottom-10 left-10 flex items-center space-x-4 z-30">
              <div className="p-4 bg-slate-900/80 border border-slate-700 rounded-3xl flex items-center space-x-6 shadow-2xl backdrop-blur-md">
                 <div className="flex items-center space-x-2">
                    <MousePointer2 size={16} className="text-blue-500" />
                    <span className="text-[9px] font-black text-slate-400 uppercase">Interactive Canvas</span>
                 </div>
                 <div className="h-4 w-px bg-slate-800"></div>
                 <div className="flex items-center space-x-2">
                    <Zap size={16} className="text-emerald-500" />
                    <span className="text-[9px] font-black text-slate-400 uppercase">Real-Time Sync</span>
                 </div>
              </div>
           </div>
        </div>

        <div className="col-span-12 lg:col-span-4 xl:col-span-3">
           {selectedNode ? (
             <div className="glass p-10 rounded-[56px] border border-slate-700/50 shadow-2xl h-full flex flex-col animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between mb-10">
                   <div className="flex items-center space-x-4">
                      <div className="p-3 bg-blue-600/10 rounded-2xl text-blue-400 border border-blue-500/20">
                         {getNodeIcon(selectedNode.type)}
                      </div>
                      <div>
                         <h3 className="text-xl font-black text-white uppercase tracking-tight">Propiedades</h3>
                         <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">ID: {selectedNode.id}</p>
                      </div>
                   </div>
                   <button onClick={() => setSelectedNodeId(null)} className="p-3 bg-slate-800 hover:bg-rose-500/10 rounded-2xl text-slate-500 hover:text-rose-500 transition-all"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide space-y-10 pb-10">
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Etiqueta de Nodo</label>
                      <input 
                        type="text" 
                        value={selectedNode.title}
                        onChange={(e) => updateNodeConfig(selectedNode.id, { title: e.target.value })}
                        className="w-full bg-slate-950 border-2 border-slate-800 rounded-[24px] px-6 py-4 text-xs text-white font-bold outline-none focus:border-blue-500 transition-all shadow-inner"
                      />
                   </div>

                   <div className="space-y-8 pt-6 border-t border-slate-800/50">
                      <h4 className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.4em] flex items-center">
                        <Settings size={14} className="mr-2" /> DialPlan Settings
                      </h4>

                      {selectedNode.type === 'PLAY_AUDIO' && (
                        <div className="space-y-6">
                           <div className="space-y-3">
                              <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-2">Prompt Audio Asset</label>
                              <select 
                                value={selectedNode.config.file}
                                onChange={e => updateNestedConfig(selectedNode.id, 'file', e.target.value)}
                                className="w-full bg-slate-950 border-2 border-slate-800 rounded-[20px] px-4 py-3 text-xs text-white font-bold outline-none focus:border-blue-500"
                              >
                                 <option value="">Seleccionar audio...</option>
                                 {MOCK_AUDIO_ASSETS.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                              </select>
                           </div>
                        </div>
                      )}

                      {selectedNode.type === 'AI_BOT' && (
                        <div className="space-y-6">
                           <div className="space-y-3">
                              <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-2">Instance Brain</label>
                              <select 
                                value={selectedNode.config.botId}
                                onChange={e => updateNestedConfig(selectedNode.id, 'botId', e.target.value)}
                                className="w-full bg-slate-950 border-2 border-slate-800 rounded-[20px] px-4 py-3 text-xs text-purple-400 font-bold outline-none focus:border-purple-500"
                              >
                                 <option value="">Seleccionar bot...</option>
                                 {MOCK_BOTS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                              </select>
                           </div>
                        </div>
                      )}
                   </div>
                </div>

                <div className="pt-8 border-t border-slate-800 mt-auto">
                   <button 
                    onClick={() => handleDeleteNode(selectedNode.id)}
                    className="w-full py-5 rounded-[28px] bg-rose-600/10 border border-rose-600/20 text-rose-500 hover:bg-rose-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center group active:scale-95"
                   >
                      <Trash2 size={18} className="mr-3 group-hover:rotate-12 transition-transform" /> Borrar del Diagrama
                   </button>
                </div>
             </div>
           ) : (
             <div className="glass p-12 rounded-[64px] border border-slate-700/50 shadow-2xl h-full flex flex-col items-center justify-center text-center opacity-40">
                <div className="w-24 h-24 rounded-[32px] bg-slate-800 flex items-center justify-center mb-8 border border-slate-700 shadow-inner">
                   <ArrowRight size={48} className="text-slate-600" />
                </div>
                <h4 className="text-2xl font-black text-slate-500 uppercase tracking-tighter">Property Hub</h4>
                <p className="text-xs text-slate-600 mt-3 max-w-[200px] font-bold uppercase tracking-widest leading-relaxed">Selecciona un elemento para configurar el enrutamiento SIP.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default IVRDesigner;
