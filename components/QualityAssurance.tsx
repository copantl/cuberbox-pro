
import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, Search, Filter, Play, Pause, SkipBack, SkipForward,
  Star, MessageSquare, Save, Trash2, Edit2, X, RefreshCw, CheckCircle,
  AlertCircle, PhoneIncoming, Clock, User, Award, Sliders, ChevronRight,
  Maximize2, Volume2, Info, Sparkles, BrainCircuit, Wand2, Zap, Plus,
  Smile, Meh, Frown, FileText, Quote
} from 'lucide-react';
import { QAEvaluation, CDRRecord } from '../types';
import { MOCK_CDR_DATA, MOCK_USERS_LIST } from '../constants';
import { GoogleGenAI, Type } from "@google/genai";

interface EnhancedQAEvaluation extends QAEvaluation {
  sentiment?: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  summary?: string;
}

const MOCK_QA_LIST: EnhancedQAEvaluation[] = [
  {
    id: 'qa_1',
    cdrId: 'cdr_001',
    agentId: 'usr_2',
    evaluatorId: 'usr_1',
    timestamp: '2024-11-20 16:30:00',
    scores: { script: 95, empathy: 88, product: 100, professionalism: 92 },
    comment: 'Excelente manejo de objeciones. Auditoría IA completada.',
    finalScore: 93.7,
    status: 'PASSED',
    sentiment: 'POSITIVE',
    summary: 'El cliente mostró alto interés en el proyecto inmobiliario. El agente resolvió dudas sobre financiamiento y agendó visita para el viernes.'
  }
];

const QualityAssurance: React.FC = () => {
  const [evaluations, setEvaluations] = useState<EnhancedQAEvaluation[]>(MOCK_QA_LIST);
  const [selectedEval, setSelectedEval] = useState<EnhancedQAEvaluation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  const filteredEvaluations = useMemo(() => {
    return evaluations.filter(e => {
      const agent = MOCK_USERS_LIST.find(u => u.id === e.agentId);
      return agent?.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [evaluations, searchTerm]);

  const handleOpenModal = (evaluation?: EnhancedQAEvaluation) => {
    if (evaluation) {
      setSelectedEval({ ...evaluation });
    } else {
      setSelectedEval({
        id: Math.random().toString(36).substr(2, 9),
        cdrId: MOCK_CDR_DATA[0].id,
        agentId: 'usr_2',
        evaluatorId: 'usr_1',
        timestamp: new Date().toISOString().replace('T', ' ').substr(0, 19),
        scores: { script: 0, empathy: 0, product: 0, professionalism: 0 },
        comment: '',
        finalScore: 0,
        status: 'RECALIBRATION',
        sentiment: 'NEUTRAL',
        summary: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleAiAudit = async () => {
    if (!selectedEval) return;
    setIsAiAnalyzing(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Prompt mejorado para incluir sentimiento y resumen
      const prompt = `Analiza este transcript de llamada y genera un reporte estructurado en JSON.
      TRANSCRIPT:
      AGENT: Buenos días, le llamo de CUBERBOX para ofrecerle un descuento en su seguro.
      CLIENT: Ah hola, sí me interesa, pero ahora mismo voy conduciendo.
      AGENT: Entiendo perfectamente. ¿Le parece si le mando la info por WhatsApp y le llamo mañana a las 10?
      CLIENT: Sí, perfecto, mándamelo. Muchas gracias.
      AGENT: Gracias a usted, que tenga buen día.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              script: { type: Type.NUMBER, description: "Score de 0-100 para adherencia al guion" },
              empathy: { type: Type.NUMBER, description: "Score de 0-100 para empatía del agente" },
              product: { type: Type.NUMBER, description: "Score de 0-100 para conocimiento de producto" },
              professionalism: { type: Type.NUMBER, description: "Score de 0-100 para tono profesional" },
              sentiment: { type: Type.STRING, enum: ["POSITIVE", "NEUTRAL", "NEGATIVE"] },
              summary: { type: Type.STRING, description: "Resumen breve de la llamada" },
              feedback: { type: Type.STRING, description: "Comentario para el coaching" },
              summaryScore: { type: Type.NUMBER, description: "Puntuación final promediada" }
            },
            required: ["script", "empathy", "product", "professionalism", "sentiment", "summary", "feedback", "summaryScore"]
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      
      setSelectedEval({
        ...selectedEval,
        scores: {
          script: result.script,
          empathy: result.empathy,
          product: result.product,
          professionalism: result.professionalism
        },
        comment: `[IA AUDIT]: ${result.feedback}`,
        finalScore: result.summaryScore,
        sentiment: result.sentiment,
        summary: result.summary
      });

    } catch (error) {
      console.error("AI Audit Error:", error);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!selectedEval) return;
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const s = selectedEval.scores;
    const avg = (s.script + s.empathy + s.product + s.professionalism) / 4;
    const finalEval = { 
      ...selectedEval, 
      finalScore: avg, 
      status: avg >= 80 ? 'PASSED' : avg >= 60 ? 'RECALIBRATION' : 'FAILED' 
    } as EnhancedQAEvaluation;

    setEvaluations(prev => {
      const exists = prev.find(e => e.id === finalEval.id);
      return exists ? prev.map(e => e.id === finalEval.id ? finalEval : e) : [finalEval, ...prev];
    });

    setIsSaving(false);
    setIsModalOpen(false);
  };

  const SentimentIcon = ({ type, size = 20 }: { type?: string, size?: number }) => {
    switch(type) {
      case 'POSITIVE': return <Smile size={size} className="text-emerald-500" />;
      case 'NEGATIVE': return <Frown size={size} className="text-rose-500" />;
      default: return <Meh size={size} className="text-slate-400" />;
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase flex items-center">
            <ShieldCheck className="mr-4 text-emerald-400" size={32} />
            Calidad & Auditoría IA
          </h2>
          <p className="text-slate-400 text-sm font-medium">Monitoreo automatizado del desempeño humano con Gemini Core.</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
             <input 
              type="text" 
              placeholder="Buscar por agente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border-2 border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-xs text-white outline-none focus:border-emerald-500 transition-all w-64 shadow-inner"
             />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center space-x-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-[20px] transition-all shadow-xl active:scale-95 group"
          >
            <Plus size={20} className="group-hover:scale-110 transition-transform" />
            <span className="font-black text-xs uppercase tracking-widest">Nueva Evaluación</span>
          </button>
        </div>
      </div>

      <div className="glass rounded-[48px] border border-slate-700/50 shadow-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-800/50 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
            <tr>
              <th className="px-10 py-6">Agente</th>
              <th className="px-10 py-6 text-center">Score Final</th>
              <th className="px-10 py-6 text-center">Sentimiento</th>
              <th className="px-10 py-6 text-center">IA Audit</th>
              <th className="px-10 py-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {filteredEvaluations.map((evalu) => {
              const agent = MOCK_USERS_LIST.find(u => u.id === evalu.agentId);
              return (
                <tr key={evalu.id} className="hover:bg-blue-600/5 transition-all group cursor-pointer" onClick={() => handleOpenModal(evalu)}>
                  <td className="px-10 py-6">
                    <div className="flex items-center space-x-5">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center font-black text-blue-500 shadow-inner">
                        {agent?.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-black text-white uppercase tracking-tight">{agent?.fullName}</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">{evalu.timestamp}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-center">
                    <span className={`text-2xl font-black ${evalu.finalScore >= 80 ? 'text-emerald-400' : 'text-rose-400'}`}>{evalu.finalScore.toFixed(1)}%</span>
                  </td>
                  <td className="px-10 py-6 text-center">
                    <div className="flex justify-center">
                       <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 shadow-inner">
                          <SentimentIcon type={evalu.sentiment} />
                       </div>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-center">
                    <div className="flex justify-center">
                      {evalu.comment.includes('[IA AUDIT]') ? (
                        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse"><Sparkles size={20} /></div>
                      ) : (
                        <div className="p-2 rounded-xl bg-slate-800 text-slate-600 border border-slate-700"><User size={20} /></div>
                      )}
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <button className="p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-slate-400 transition-all opacity-0 group-hover:opacity-100"><ChevronRight size={20} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && selectedEval && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-5xl glass rounded-[64px] border border-slate-700/50 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[95vh]">
             
             {isAiAnalyzing && (
               <div className="absolute inset-0 z-[110] bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center space-y-6 text-center p-10">
                  <div className="relative">
                     <div className="w-24 h-24 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
                     <Sparkles size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-400 animate-pulse" />
                  </div>
                  <div>
                     <h3 className="text-2xl font-black text-white uppercase tracking-[0.2em] mb-2">Neural Audit Engine</h3>
                     <p className="text-slate-400 text-sm font-bold uppercase tracking-widest animate-pulse">Analizando sentimiento y resumiendo conversación...</p>
                  </div>
               </div>
             )}

             <div className="p-10 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
                <div className="flex items-center space-x-5">
                   <div className="w-14 h-14 rounded-2xl bg-emerald-600/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-inner">
                      <Award size={28} />
                   </div>
                   <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Evaluación Estructural</h3>
                </div>
                <div className="flex items-center space-x-4">
                   <button 
                    onClick={handleAiAudit}
                    className="flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-[20px] transition-all shadow-xl active:scale-95 group"
                   >
                     <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
                     <span className="text-[11px] font-black uppercase tracking-widest">Auto-Audit Gemini</span>
                   </button>
                   <button onClick={() => setIsModalOpen(false)} className="p-4 bg-slate-800 hover:bg-rose-500/10 rounded-[20px] text-slate-500 hover:text-rose-400 transition-all"><X size={24} /></button>
                </div>
             </div>

             <div className="flex-1 overflow-y-auto p-12 grid grid-cols-1 md:grid-cols-12 gap-12 scrollbar-hide">
                {/* Columna Izquierda: Scores */}
                <div className="md:col-span-4 space-y-10">
                   <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] border-b-2 border-slate-800 pb-4">Rubrica Operativa</h4>
                   {[
                     { label: 'SCRIPT ADHERENCE', key: 'script' },
                     { label: 'EMPATÍA VOCAL', key: 'empathy' },
                     { label: 'CONOCIMIENTO PRODUCTO', key: 'product' },
                     { label: 'PROFESIONALISMO', key: 'professionalism' },
                   ].map(field => (
                     <div key={field.key} className="space-y-4">
                        <div className="flex justify-between items-center px-1">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{field.label}</label>
                           <span className="text-xs font-mono font-black text-blue-400">{(selectedEval.scores as any)[field.key]}%</span>
                        </div>
                        <input 
                          type="range" min="0" max="100" step="5"
                          value={(selectedEval.scores as any)[field.key]}
                          onChange={(e) => setSelectedEval({...selectedEval, scores: {...selectedEval.scores, [field.key]: parseInt(e.target.value)}})}
                          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" 
                        />
                     </div>
                   ))}

                   <div className="p-8 bg-slate-900/60 rounded-[40px] border border-slate-800 space-y-4 shadow-inner">
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sentiment Analysis</span>
                         <SentimentIcon type={selectedEval.sentiment} size={24} />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                         {['POSITIVE', 'NEUTRAL', 'NEGATIVE'].map(s => (
                           <button 
                            key={s}
                            onClick={() => setSelectedEval({...selectedEval, sentiment: s as any})}
                            className={`py-2 rounded-xl text-[8px] font-black uppercase tracking-tighter border transition-all ${selectedEval.sentiment === s ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-600'}`}
                           >
                             {s}
                           </button>
                         ))}
                      </div>
                   </div>
                </div>

                {/* Columna Derecha: Feedback e Inteligencia */}
                <div className="md:col-span-8 space-y-10">
                   {selectedEval.summary && (
                      <div className="space-y-4 animate-in slide-in-from-bottom-2">
                         <h4 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.4em] border-b-2 border-slate-800 pb-4 flex items-center">
                            <FileText size={14} className="mr-2" /> Resumen Generado por IA
                         </h4>
                         <div className="p-8 bg-slate-900 border border-slate-800 rounded-[32px] relative overflow-hidden group">
                            <Quote size={40} className="absolute -top-2 -right-2 text-slate-800 group-hover:text-blue-900/20 transition-colors" />
                            <p className="text-sm text-slate-300 font-medium leading-relaxed italic relative z-10">
                               {selectedEval.summary}
                            </p>
                         </div>
                      </div>
                   )}

                   <div className="space-y-4">
                      <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] border-b-2 border-slate-800 pb-4">Feedback Estructural</h4>
                      <textarea 
                        value={selectedEval.comment}
                        onChange={(e) => setSelectedEval({...selectedEval, comment: e.target.value})}
                        className="w-full bg-slate-950 border-2 border-slate-800 rounded-[40px] p-8 text-sm text-slate-300 h-48 resize-none outline-none focus:border-emerald-500 shadow-inner font-medium leading-relaxed"
                        placeholder="Observaciones para el coaching del agente..."
                      />
                   </div>
                </div>
             </div>

             <div className="p-10 bg-slate-900/60 border-t border-slate-800 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                   <div className="p-2.5 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20">
                      <ShieldCheck size={18} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-white uppercase tracking-widest">Protocolo de Calidad Activo</p>
                      <p className="text-[9px] text-slate-500 font-bold uppercase">Evaluador: Admin Cuberbox</p>
                   </div>
                </div>
                <button 
                 onClick={handleSave}
                 disabled={isSaving}
                 className="flex items-center space-x-4 bg-emerald-600 hover:bg-emerald-500 text-white px-12 py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
                  <span>Guardar Evaluación Final</span>
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QualityAssurance;
