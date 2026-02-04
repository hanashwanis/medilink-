
import React from 'react';
import { LogOut, Sun, Moon, Settings, History, Key, ChevronLeft, Bell } from 'lucide-react';
import { Theme } from '../types';

interface PortalLayoutProps {
  title: string;
  portalType: 'MIGRANT' | 'DOCTOR' | 'GOVERNMENT';
  theme: Theme;
  toggleTheme: () => void;
  onLogout: () => void;
  children: React.ReactNode;
  activeView: string;
  setActiveView: (view: string) => void;
  userName?: string;
}

export const PortalLayout: React.FC<PortalLayoutProps> = ({
  title,
  portalType,
  theme,
  toggleTheme,
  onLogout,
  children,
  activeView,
  setActiveView,
  userName = "User"
}) => {
  const portalColors = {
    MIGRANT: 'blue',
    DOCTOR: 'emerald',
    GOVERNMENT: 'amber'
  };

  const color = portalColors[portalType];

  return (
    <div className={`min-h-screen transition-colors duration-200 ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-gray-50 text-slate-900'}`}>
      {/* Sidebar / Top Nav for Mobile */}
      <header className={`sticky top-0 z-40 w-full border-b ${theme === 'dark' ? 'border-slate-800 bg-slate-900/80 backdrop-blur-md' : 'border-gray-200 bg-white/80 backdrop-blur-md'}`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => activeView === 'main' ? onLogout() : setActiveView('main')}
              className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors`}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold">{title}</h1>
              <p className="text-[10px] uppercase tracking-widest opacity-60">MediLink+ Central</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 relative hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>
            <button 
              onClick={() => setActiveView('settings')}
              className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors ${activeView === 'settings' ? `text-${color}-600` : ''}`}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeView === 'settings' ? (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-extrabold mb-8">Settings</h2>
            <div className={`rounded-2xl border overflow-hidden ${theme === 'dark' ? 'border-slate-800 bg-slate-800/50' : 'border-gray-200 bg-white shadow-sm'}`}>
              <div className="p-6 space-y-2">
                <button 
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-gray-100 text-gray-600'}`}>
                      {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">Switch Theme</p>
                      <p className="text-sm opacity-60">Currently: {theme.charAt(0).toUpperCase() + theme.slice(1)} Mode</p>
                    </div>
                  </div>
                </button>

                <button 
                  onClick={() => setActiveView('change-password')}
                  className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400`}>
                      <Key className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">Change Password</p>
                      <p className="text-sm opacity-60">Update your security credentials</p>
                    </div>
                  </div>
                </button>

                {portalType !== 'GOVERNMENT' && (
                  <button 
                    onClick={() => setActiveView('history')}
                    className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400`}>
                        <History className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold">Medical History</p>
                        <p className="text-sm opacity-60">View past records and consultations</p>
                      </div>
                    </div>
                  </button>
                )}

                <hr className="my-2 border-gray-100 dark:border-slate-800" />

                <button 
                  onClick={onLogout}
                  className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                      <LogOut className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">Logout</p>
                      <p className="text-sm opacity-60">Exit from your account session</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        ) : activeView === 'change-password' ? (
           <div className="max-w-lg mx-auto">
             <div className="flex items-center gap-4 mb-8">
                <button onClick={() => setActiveView('settings')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800">
                  <ChevronLeft />
                </button>
                <h2 className="text-2xl font-bold">Change Password</h2>
             </div>
             <form onSubmit={(e) => { e.preventDefault(); setActiveView('settings'); alert('Password changed successfully!'); }} className={`p-8 rounded-2xl border ${theme === 'dark' ? 'border-slate-800 bg-slate-800/50' : 'bg-white border-gray-200'}`}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium opacity-60 mb-1">Old Password</label>
                    <input type="password" required className={`w-full p-3 rounded-xl border focus:ring-2 focus:ring-${color}-500 outline-none ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-200'}`} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium opacity-60 mb-1">New Password</label>
                    <input type="password" required className={`w-full p-3 rounded-xl border focus:ring-2 focus:ring-${color}-500 outline-none ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-200'}`} />
                  </div>
                  <button type="submit" className={`w-full py-3 bg-${color}-600 hover:bg-${color}-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-${color}-500/20`}>
                    Confirm Changes
                  </button>
                </div>
             </form>
           </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
};
