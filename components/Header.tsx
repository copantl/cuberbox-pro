import React from 'react';
import { Bell, Search, Globe, Power, Sun, Moon, Droplets, Box, Trees, Sunset, Zap, Layout, ShieldCheck, Activity } from 'lucide-react';
import { User, ThemeType } from '../types';
import Logo from './Logo';

interface HeaderProps {
  user: User;
  currentTheme: ThemeType;
  onThemeToggle: (theme: ThemeType) => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, currentTheme, onThemeToggle, onLogout }) => {
  const themes: { id: ThemeType; icon: React.ReactNode; label: string }[] = [
    { id: 'light', icon: <Sun size={14} />, label: 'Light' },
    { id: 'minimal', icon: <Layout size={14} />, label: 'Arctic' },
    { id: 'midnight', icon: <Moon size={14} />, label: 'Midnight' },
    { id: 'ocean', icon: <Droplets size={14} />, label: 'Ocean' },
    { id: 'forest', icon: <Trees size={14} />, label: 'Forest' },
    { id: 'sunset', icon: <Sunset size={14} />, label: 'Sunset' },
    { id: 'cyber', icon: <Zap size={14} />, label: 'Cyber' },
    { id: 'obsidian', icon: <Box size={14} />, label: 'Obsidian' },
  ];

  return (
    <header className="h-16 glass border-b flex items-center justify-between px-8 z-40 bg-[#020617]/50 backdrop-blur-2xl">
      <div className="flex items-center space-x-6">
        {/* Logo de Marca Global */}
        <div className="flex items-center space-x-3 group cursor-pointer">
           <Logo className="w-7 h-7 group-hover:scale-110 transition-transform duration-500" />
           <span className="text-[14px] font-black tracking-tighter text-white uppercase hidden xl:block opacity-80 group-hover:opacity-100 transition-opacity">CUBERBOX</span>
        </div>

        <div className="h-6 w-px bg-slate-800/50 mx-2 hidden xl:block"></div>

        <div className="flex items-center bg-slate-900/40 rounded-xl px-4 py-2 border border-slate-800/50 w-72 shadow-inner group focus-within:border-blue-500/50 transition-all">
          <Search size={16} className="text-slate-500 group-focus-within:text-blue-400" />
          <input 
            type="text" 
            placeholder="Buscar leads, campañas..." 
            className="bg-transparent border-none outline-none ml-3 text-xs w-full text-white placeholder-slate-600 font-medium"
          />
        </div>

        {/* System Health Production Indicator */}
        <div className="hidden xl:flex items-center space-x-3 px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-xl shadow-inner">
           <div className="relative">
              <ShieldCheck size={18} className="text-emerald-500" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
           </div>
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Engine v5.2.1 (TITAN)</span>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="hidden lg:flex bg-slate-900/50 p-1 rounded-2xl border border-slate-800/50">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => onThemeToggle(t.id)}
              title={t.label}
              className={`p-2 rounded-xl transition-all duration-300 ${
                currentTheme === t.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 scale-105' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
              }`}
            >
              {t.icon}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2 text-slate-500 hover:text-white cursor-pointer transition-colors px-3 py-1.5 rounded-xl hover:bg-slate-800/40 border border-transparent hover:border-slate-800">
          <Globe size={18} />
          <span className="text-[10px] font-black uppercase tracking-widest">ES</span>
        </div>
        
        <div className="relative cursor-pointer text-slate-500 hover:text-white transition-colors p-2.5 hover:bg-slate-800/40 rounded-xl border border-transparent hover:border-slate-800">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 rounded-full text-[9px] font-black flex items-center justify-center text-white border-2 border-[#020617]">3</span>
        </div>

        <div className="h-8 w-px bg-slate-800/50"></div>

        <button 
          onClick={onLogout}
          className="flex items-center space-x-3 text-rose-500 hover:bg-rose-500/10 px-5 py-2.5 rounded-xl transition-all duration-300 border border-transparent hover:border-rose-500/20 active:scale-95 group shadow-xl hover:shadow-rose-500/5"
        >
          <Power size={18} className="group-hover:rotate-12 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Desconectar</span>
        </button>
      </div>
    </header>
  );
};

export default Header;