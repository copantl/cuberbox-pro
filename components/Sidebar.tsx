
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, PhoneCall, Settings, BarChart3, Users, Bot, 
  Activity, Database, UserCog, ShieldAlert, GitMerge, Radio,
  Mail, ChevronRight, ListChecks, Volume2, Shield, Menu,
  LayoutGrid, ShieldCheck, Share2, Terminal, Cpu, Network,
  Smartphone, Layers, ListFilter, Sliders, Server, FileText,
  Lock, Globe, Headphones, Target, Zap, BookOpen, MonitorCheck,
  HardDrive, Monitor, Globe2, LayoutTemplate, ShieldQuestion,
  Activity as ActivityIcon, ServerCrash, Key, History, FileSearch,
  Wand2, Boxes, Fingerprint, LifeBuoy
} from 'lucide-react';
import { UserRole } from '../types';
import Logo from './Logo';

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
  role: UserRole;
  userLevel: number;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggle, role, userLevel }) => {
  const location = useLocation();

  // Estructura jerárquica con minLevel (Lvl 1-9)
  const menuItems = [
    // --- COMMAND CENTER ---
    { name: 'Dashboard', icon: LayoutDashboard, path: '/', roles: [UserRole.ADMIN, UserRole.MANAGER], minLevel: 4, cat: 'COMMAND CENTER' },
    { name: 'Estación Agente', icon: PhoneCall, path: '/agent', roles: [UserRole.AGENT, UserRole.ADMIN, UserRole.MANAGER], minLevel: 1, cat: 'COMMAND CENTER' },
    { name: 'Monitor en Vivo', icon: Activity, path: '/realtime', roles: [UserRole.ADMIN, UserRole.MANAGER], minLevel: 4, cat: 'COMMAND CENTER' },
    { name: 'Analista GTR', icon: MonitorCheck, path: '/gtr', roles: [UserRole.ADMIN, UserRole.MANAGER], minLevel: 4, cat: 'COMMAND CENTER' },
    { name: 'Omnicanal Hub', icon: LayoutGrid, path: '/whatsapp', roles: [UserRole.AGENT, UserRole.ADMIN, UserRole.MANAGER], minLevel: 1, cat: 'COMMAND CENTER' },
    { name: 'Blueprint Mapa', icon: GitMerge, path: '/blueprint', roles: [UserRole.ADMIN, UserRole.MANAGER], minLevel: 6, cat: 'COMMAND CENTER' },

    // --- DIALER ENGINE ---
    { name: 'Campañas SIP', icon: Target, path: '/campaigns', roles: [UserRole.ADMIN, UserRole.MANAGER], minLevel: 7, cat: 'DIALER ENGINE' },
    { name: 'Broadcast AI', icon: Radio, path: '/broadcast-ai', roles: [UserRole.ADMIN, UserRole.MANAGER], minLevel: 8, cat: 'DIALER ENGINE' },
    { name: 'Gestión Leads', icon: Database, path: '/lists', roles: [UserRole.ADMIN, UserRole.MANAGER], minLevel: 7, cat: 'DIALER ENGINE' },
    { name: 'DNC Shield', icon: ShieldAlert, path: '/dnc', roles: [UserRole.ADMIN, UserRole.MANAGER], minLevel: 7, cat: 'DIALER ENGINE' },

    // --- NEURAL LAB ---
    { name: 'AI Studio', icon: Bot, path: '/ai-studio', roles: [UserRole.ADMIN], minLevel: 7, cat: 'NEURAL LAB' },
    { name: 'Diseñador IVR', icon: Share2, path: '/ivr', roles: [UserRole.ADMIN], minLevel: 7, cat: 'NEURAL LAB' },
    { name: 'Biblioteca Audio', icon: Volume2, path: '/audio-library', roles: [UserRole.ADMIN, UserRole.MANAGER], minLevel: 4, cat: 'NEURAL LAB' },

    // --- DATA & BI ---
    { name: 'Analytics Hub', icon: BarChart3, path: '/analytics-hub', roles: [UserRole.ADMIN, UserRole.MANAGER], minLevel: 6, cat: 'DATA & BI' },
    { name: 'Reportes CDR', icon: FileText, path: '/reports', roles: [UserRole.ADMIN, UserRole.MANAGER], minLevel: 4, cat: 'DATA & BI' },
    { name: 'Auditoría QA', icon: ShieldCheck, path: '/qa', roles: [UserRole.ADMIN, UserRole.MANAGER], minLevel: 5, cat: 'DATA & BI' },
    { name: 'CRM Connect', icon: Network, path: '/crm', roles: [UserRole.ADMIN], minLevel: 8, cat: 'DATA & BI' },
    { name: 'CRM Designer', icon: LayoutTemplate, path: '/crm-designer', roles: [UserRole.ADMIN], minLevel: 8, cat: 'DATA & BI' },
    { name: 'ERP Connect', icon: Globe2, path: '/crm-hub', roles: [UserRole.ADMIN, UserRole.MANAGER], minLevel: 6, cat: 'DATA & BI' },

    // --- INFRASTRUCTURE ---
    { name: 'Cluster Monitor', icon: Cpu, path: '/cluster', roles: [UserRole.ADMIN], minLevel: 9, cat: 'INFRASTRUCTURE' },
    { name: 'Provisioning', icon: Layers, path: '/cluster-provisioning', roles: [UserRole.ADMIN], minLevel: 9, cat: 'INFRASTRUCTURE' },
    { name: 'High Availability', icon: ServerCrash, path: '/ha-config', roles: [UserRole.ADMIN], minLevel: 9, cat: 'INFRASTRUCTURE' },
    { name: 'Telefonia Core', icon: Server, path: '/telephony', roles: [UserRole.ADMIN], minLevel: 9, cat: 'INFRASTRUCTURE' },
    { name: 'Storage Plane', icon: HardDrive, path: '/storage', roles: [UserRole.ADMIN], minLevel: 9, cat: 'INFRASTRUCTURE' },

    // --- GOVERNANCE ---
    { name: 'Usuarios', icon: UserCog, path: '/users', roles: [UserRole.ADMIN], minLevel: 9, cat: 'GOVERNANCE' },
    { name: 'Grupos de Perfiles', icon: Layers, path: '/user-groups', roles: [UserRole.ADMIN], minLevel: 9, cat: 'GOVERNANCE' },
    { name: 'Audit Logs', icon: FileSearch, path: '/audit', roles: [UserRole.ADMIN], minLevel: 9, cat: 'GOVERNANCE' },
    { name: 'Pausas', icon: Sliders, path: '/pause-codes', roles: [UserRole.ADMIN], minLevel: 8, cat: 'GOVERNANCE' },
    { name: 'Tipificaciones', icon: ListChecks, path: '/call-codes', roles: [UserRole.ADMIN], minLevel: 8, cat: 'GOVERNANCE' },

    // --- SYSTEM ---
    { name: 'Settings', icon: Settings, path: '/settings', roles: [UserRole.ADMIN, UserRole.AGENT, UserRole.MANAGER], minLevel: 1, cat: 'SYSTEM' },
    { name: 'Setup Wizard', icon: Zap, path: '/setup-wizard', roles: [UserRole.ADMIN], minLevel: 9, cat: 'SYSTEM' },
    { name: 'Manual', icon: BookOpen, path: '/manual', roles: [UserRole.ADMIN, UserRole.AGENT, UserRole.MANAGER], minLevel: 1, cat: 'SYSTEM' },
  ];

  const categories = [
    'COMMAND CENTER',
    'DIALER ENGINE',
    'NEURAL LAB',
    'DATA & BI',
    'INFRASTRUCTURE',
    'GOVERNANCE',
    'SYSTEM'
  ];

  return (
    <aside className={`fixed left-0 top-0 h-full z-50 transition-all duration-500 ease-in-out ${isOpen ? 'w-64' : 'w-20'} bg-[var(--bg-sidebar)] border-r border-white/5 shadow-2xl flex flex-col`}>
      <div className="p-8 flex items-center shrink-0">
        <Logo showText={isOpen} className={isOpen ? "w-8 h-8" : "w-8 h-8 mx-auto"} />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-3 py-2 space-y-6">
        {categories.map(cat => {
          const items = menuItems.filter(i => 
            i.cat === cat && 
            i.roles.includes(role) && 
            userLevel >= i.minLevel
          );
          if (items.length === 0) return null;
          return (
            <div key={cat} className="space-y-1">
              {isOpen && (
                <h4 className="px-4 text-[8px] font-black text-slate-600 uppercase tracking-[0.4em] mb-2 mt-4">
                  {cat}
                </h4>
              )}
              {items.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  title={!isOpen ? item.name : ""}
                  className={`flex items-center p-3 rounded-[16px] transition-all duration-300 group relative ${
                    location.pathname === item.path 
                      ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' 
                      : 'text-slate-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon size={18} className={`${location.pathname === item.path ? 'text-white' : 'group-hover:text-blue-400'} transition-colors duration-300`} />
                  {isOpen && (
                    <span className="ml-3 font-bold text-[10px] uppercase tracking-widest truncate">
                      {item.name}
                    </span>
                  )}
                  {location.pathname === item.path && !isOpen && (
                    <div className="absolute left-0 w-1 h-6 bg-white rounded-r-full shadow-[0_0_10px_#fff]"></div>
                  )}
                </Link>
              ))}
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/5 bg-slate-950/40">
        <button 
          onClick={toggle} 
          className="w-full flex items-center justify-center p-3 rounded-[16px] bg-slate-900/50 hover:bg-slate-800 text-slate-500 hover:text-blue-400 transition-all border border-white/5 shadow-inner group"
        >
          <Menu size={18} className={`transition-transform duration-500 group-hover:scale-110 ${isOpen ? '' : 'rotate-180'}`} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
