
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Stethoscope, 
  ShieldCheck, 
  LogOut, 
  Moon, 
  Sun, 
  Settings, 
  History, 
  Key,
  ChevronLeft,
  Bell
} from 'lucide-react';
import { MigrantPortal } from './components/MigrantPortal';
import { DoctorPortal } from './components/DoctorPortal';
import { GovernmentPortal } from './components/GovernmentPortal';
import { Theme, UserRole, MigrantProfile } from './types';

const App: React.FC = () => {
  const [activePortal, setActivePortal] = useState<UserRole | null>(null);
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // 1. Theme sync
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }

    // 2. Initialize Demo Migrant if none exists
    const migrants = JSON.parse(localStorage.getItem('mock_migrants') || '[]');
    const demoExists = migrants.some((m: any) => m.id === 'MED-123456');
    
    if (!demoExists) {
      const demoMigrant: MigrantProfile = {
        id: 'MED-123456',
        name: 'Rajesh Kumar',
        age: 32,
        nativeState: 'Bihar',
        nativeCity: 'Patna',
        residingCity: 'Chennai',
        aadharNo: '1234-5678-9012',
        dob: '1992-05-15',
        contactNumber: '9876543210',
        mobileNumber: '9876543210',
        emergencyMobileNumber: '9123456789',
        bloodGroup: 'O+',
        medicalReports: [],
        username: 'rajesh',
        password: 'password123',
        voiceNote: 'I have recurring chest pain and slight fever for three days.'
      };
      localStorage.setItem('mock_migrants', JSON.stringify([...migrants, demoMigrant]));
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleLogout = () => {
    setActivePortal(null);
  };

  if (activePortal === 'MIGRANT') {
    return <MigrantPortal theme={theme} toggleTheme={toggleTheme} onLogout={handleLogout} />;
  }

  if (activePortal === 'DOCTOR') {
    return <DoctorPortal theme={theme} toggleTheme={toggleTheme} onLogout={handleLogout} />;
  }

  if (activePortal === 'GOVERNMENT') {
    return <GovernmentPortal theme={theme} toggleTheme={toggleTheme} onLogout={handleLogout} />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <header className={`py-6 px-4 border-b ${theme === 'dark' ? 'border-slate-800 bg-slate-900/50' : 'border-gray-200 bg-white'} sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                MediLink<span className="text-blue-600">+</span>
              </h1>
              <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Government of India Health Initiative</p>
            </div>
          </div>
          <button 
            onClick={toggleTheme}
            className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-slate-800 text-yellow-400' : 'hover:bg-gray-100 text-slate-600'}`}
          >
            {theme === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h2 className={`text-4xl md:text-5xl font-extrabold mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            Bridging Healthcare for India's Pulse
          </h2>
          <p className={`text-lg max-w-2xl mx-auto ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            A secure digital platform empowering migrant workers with seamless access to medical records and consultations anywhere in the country.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div 
            onClick={() => setActivePortal('MIGRANT')}
            className={`group relative overflow-hidden rounded-2xl border-2 transition-all cursor-pointer p-8 flex flex-col items-center text-center
              ${theme === 'dark' 
                ? 'bg-slate-800/50 border-slate-700 hover:border-blue-500 hover:bg-slate-800' 
                : 'bg-white border-transparent hover:border-blue-500 hover:shadow-xl shadow-gray-200'}`}
          >
            <div className="mb-6 p-5 bg-blue-50 dark:bg-blue-900/30 rounded-full transition-transform group-hover:scale-110">
              <Users className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Migrant Portal</h3>
            <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Register details, record voice notes, and access medical history.
            </p>
            <div className="mt-auto inline-flex items-center text-blue-600 font-semibold group-hover:translate-x-1 transition-transform">
              Access Now →
            </div>
          </div>

          <div 
            onClick={() => setActivePortal('DOCTOR')}
            className={`group relative overflow-hidden rounded-2xl border-2 transition-all cursor-pointer p-8 flex flex-col items-center text-center
              ${theme === 'dark' 
                ? 'bg-slate-800/50 border-slate-700 hover:border-emerald-500 hover:bg-slate-800' 
                : 'bg-white border-transparent hover:border-emerald-500 hover:shadow-xl shadow-gray-200'}`}
          >
            <div className="mb-6 p-5 bg-emerald-50 dark:bg-emerald-900/30 rounded-full transition-transform group-hover:scale-110">
              <Stethoscope className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Doctor Portal</h3>
            <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Review records, listen to symptoms, and issue digital prescriptions.
            </p>
            <div className="mt-auto inline-flex items-center text-emerald-600 font-semibold group-hover:translate-x-1 transition-transform">
              Access Now →
            </div>
          </div>

          <div 
            onClick={() => setActivePortal('GOVERNMENT')}
            className={`group relative overflow-hidden rounded-2xl border-2 transition-all cursor-pointer p-8 flex flex-col items-center text-center
              ${theme === 'dark' 
                ? 'bg-slate-800/50 border-slate-700 hover:border-amber-500 hover:bg-slate-800' 
                : 'bg-white border-transparent hover:border-amber-500 hover:shadow-xl shadow-gray-200'}`}
          >
            <div className="mb-6 p-5 bg-amber-50 dark:bg-amber-900/30 rounded-full transition-transform group-hover:scale-110">
              <ShieldCheck className="w-12 h-12 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Government Portal</h3>
            <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Monitor health metrics and manage provider data.
            </p>
            <div className="mt-auto inline-flex items-center text-amber-600 font-semibold group-hover:translate-x-1 transition-transform">
              Access Now →
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
