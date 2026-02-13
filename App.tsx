import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AgentScreen from './components/AgentScreen';
import Campaigns from './components/Campaigns';
import ClusterMonitor from './components/ClusterMonitor';
import ClusterProvisioning from './components/ClusterProvisioning';
import HAConfig from './components/HAConfig';
import WhatsAppModule from './components/WhatsAppModule';
import EmailModule from './components/EmailModule';
import RealTimeMonitor from './components/RealTimeMonitor';
import GTRDashboard from './components/GTRDashboard';
import Login from './components/Login';
import TelephonyConfig from './components/TelephonyConfig';
import AIStudio from './components/AIStudio';
import Reports from './components/Reports';
import Settings from './components/Settings';
import UserManual from './components/UserManual';
import Instructions from './components/Instructions';
import ListsManagement from './components/ListsManagement';
import UsersManagement from './components/UsersManagement';
import UserGroupsManagement from './components/UserGroupsManagement';
import UserProfilesManagement from './components/UserProfilesManagement';
import DNCManagement from './components/DNCManagement';
import QualityAssurance from './components/QualityAssurance';
import AnalyticsHub from './components/AnalyticsHub';
import BroadcastAI from './components/BroadcastAI';
import CRMIntegrations from './components/CRMIntegrations';
import PauseCodesManagement from './components/PauseCodesManagement';
import CallCodesManagement from './components/CallCodesManagement';
import AudioLibrary from './components/AudioLibrary';
import SMTPServerManagement from './components/SMTPServerManagement';
import SystemAudit from './components/SystemAudit';
import SystemSetupWizard from './components/SystemSetupWizard';
import IVRDesigner from './components/IVRDesigner';
import Workflows from './components/Workflows';
import AgentPerformanceReport from './components/AgentPerformanceReport';
import StorageServer from './components/StorageServer';
import FormDesigner from './components/FormDesigner';
import ExternalCRMHub from './components/ExternalCRMHub';
import AccessControl from './components/AccessControl';
import Logo from './components/Logo';

import { User, UserRole, ThemeType } from './types';
import { MOCK_USER } from './constants';
import { ToastProvider } from './ToastContext';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User>(MOCK_USER);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<ThemeType>((localStorage.getItem('cuberbox-theme') as ThemeType) || 'midnight');

  useEffect(() => {
    document.body.className = `theme-${theme}`;
  }, [theme]);

  const handleThemeChange = (newTheme: ThemeType) => {
    setTheme(newTheme);
    localStorage.setItem('cuberbox-theme', newTheme);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <ToastProvider>
        <Login onLogin={(role?: UserRole) => {
          let level = 1;
          if (role === UserRole.ADMIN) level = 9;
          if (role === UserRole.MANAGER) level = 6;
          setUser({ ...MOCK_USER, role, userLevel: level });
          setIsAuthenticated(true);
        }} />
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <Router>
        <div className={`flex h-screen overflow-hidden bg-[#020617] text-white selection:bg-orange-500/30`}>
          <Sidebar isOpen={sidebarOpen} toggle={() => setSidebarOpen(!sidebarOpen)} role={user.role} userLevel={user.userLevel} />
          
          <main className={`flex-1 flex flex-col transition-all duration-500 ease-in-out relative ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
            <Header 
              user={user} 
              currentTheme={theme} 
              onThemeToggle={handleThemeChange} 
              onLogout={handleLogout} 
            />
            
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide bg-[radial-gradient(circle_at_top_right,_rgba(249,115,22,0.03),_transparent)] relative">
              <div className="fixed bottom-8 right-8 opacity-[0.05] pointer-events-none z-0">
                <Logo className="w-16 h-16" />
              </div>

              <div className="relative z-10">
                <Routes>
                  <Route path="/" element={<AccessControl userLevel={user.userLevel} minLevel={4}><Dashboard /></AccessControl>} />
                  <Route path="/agent" element={<AgentScreen user={user} />} />
                  <Route path="/realtime" element={<AccessControl userLevel={user.userLevel} minLevel={4}><RealTimeMonitor /></AccessControl>} />
                  <Route path="/campaigns" element={<AccessControl userLevel={user.userLevel} minLevel={7}><Campaigns /></AccessControl>} />
                  <Route path="/telephony" element={<AccessControl userLevel={user.userLevel} minLevel={9}><TelephonyConfig /></AccessControl>} />
                  <Route path="/setup-wizard" element={<AccessControl userLevel={user.userLevel} minLevel={9}><SystemSetupWizard /></AccessControl>} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </div>
            </div>
          </main>
        </div>
      </Router>
    </ToastProvider>
  );
};

export default App;