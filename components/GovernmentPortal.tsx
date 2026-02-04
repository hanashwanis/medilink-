
import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  Users, 
  Stethoscope, 
  Activity, 
  MapPin, 
  Search, 
  Globe, 
  Download,
  ExternalLink,
  ChevronRight,
  Info,
  User,
  Phone,
  Home,
  ShieldAlert
} from 'lucide-react';
import { PortalLayout } from './SharedUI';
import { Theme, MigrantProfile, DoctorProfile } from '../types';

interface GovernmentPortalProps { theme: Theme; toggleTheme: () => void; onLogout: () => void; }

export const GovernmentPortal: React.FC<GovernmentPortalProps> = ({ theme, toggleTheme, onLogout }) => {
  const [activeView, setActiveView] = useState('main');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<MigrantProfile | null>(null);
  const [stats, setStats] = useState({ patients: 0, doctors: 0, consultations: 0 });
  const [allPatients, setAllPatients] = useState<MigrantProfile[]>([]);
  const [allDoctors, setAllDoctors] = useState<DoctorProfile[]>([]);

  useEffect(() => {
    const migrants = JSON.parse(localStorage.getItem('mock_migrants') || '[]');
    const doctors = JSON.parse(localStorage.getItem('mock_doctors') || '[]');
    const consultations = JSON.parse(localStorage.getItem('mock_consultations') || '[]');
    
    setAllPatients(migrants);
    setAllDoctors(doctors);
    setStats({ 
      patients: migrants.length, 
      doctors: doctors.length, 
      consultations: consultations.length 
    });
  }, [activeView]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const target = e.target as any;
    if (target.username.value === 'gov_admin' && target.password.value === 'admin_password') {
      setIsLoggedIn(true);
      setActiveView('main');
    } else {
      alert("Invalid Admin Credentials.");
    }
  };

  const handleSearchPatient = () => {
    const query = searchId.trim().toUpperCase();
    if (!query) return;
    const migrants = JSON.parse(localStorage.getItem('mock_migrants') || '[]');
    const found = migrants.find((m: any) => 
      m.id.toUpperCase() === query || 
      (m.aadharNo && m.aadharNo.replace(/-/g, '') === query.replace(/-/g, ''))
    );
    if (found) { 
      setSelectedPatient(found); 
    } else { 
      alert(`No registered migrant found with ID: ${query}`); 
      setSelectedPatient(null); 
    }
  };

  const chartData = [
    { name: 'Migrants', value: stats.patients, color: '#3b82f6' },
    { name: 'Doctors', value: stats.doctors, color: '#10b981' },
    { name: 'Consults', value: stats.consultations, color: '#f59e0b' },
  ];

  if (!isLoggedIn) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-gray-50 text-slate-900'}`}>
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-slate-700">
          <div className="flex justify-center mb-8"><div className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-2xl text-amber-600"><Globe className="w-10 h-10" /></div></div>
          <h2 className="text-3xl font-bold text-center mb-2 text-slate-900 dark:text-white">Central Admin</h2>
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-2xl text-xs">
            <p className="font-bold text-amber-700 dark:text-amber-300 mb-1">Demo Credentials</p>
            <p className="opacity-70">User: <span className="font-bold">gov_admin</span> | Pass: <span className="font-bold">admin_password</span></p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input name="username" placeholder="Admin ID" required className="w-full p-3 rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-gray-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-amber-500 shadow-sm" />
            <input name="password" type="password" placeholder="Access Token" required className="w-full p-3 rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-gray-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-amber-500 shadow-sm" />
            <button type="submit" className="w-full py-4 bg-amber-600 text-white rounded-2xl font-bold shadow-lg shadow-amber-500/20">Authenticate</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <PortalLayout title="Government Portal" portalType="GOVERNMENT" theme={theme} toggleTheme={toggleTheme} onLogout={onLogout} activeView={activeView} setActiveView={setActiveView} userName="Admin Officer">
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div onClick={() => setActiveView('patients')} className={`p-6 rounded-3xl border cursor-pointer hover:shadow-md transition-all ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-100 shadow-sm'}`}>
            <p className="text-[10px] font-black uppercase opacity-40 mb-1">Total Migrants</p>
            <p className="text-3xl font-black text-blue-600">{stats.patients}</p>
          </div>
          <div onClick={() => setActiveView('doctors')} className={`p-6 rounded-3xl border cursor-pointer hover:shadow-md transition-all ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-100 shadow-sm'}`}>
            <p className="text-[10px] font-black uppercase opacity-40 mb-1">Verified Doctors</p>
            <p className="text-3xl font-black text-emerald-600">{stats.doctors}</p>
          </div>
          <div className={`p-6 rounded-3xl border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-100 shadow-sm'}`}>
            <p className="text-[10px] font-black uppercase opacity-40 mb-1">Total Consultations</p>
            <p className="text-3xl font-black text-amber-600">{stats.consultations}</p>
          </div>
        </div>

        {activeView === 'main' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className={`p-8 rounded-3xl border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-100 shadow-sm'}`}>
              <h4 className="text-xl font-bold mb-6 flex items-center gap-2"><MapPin className="text-amber-500" /> Migrant Tracking System</h4>
              <div className="flex gap-2 mb-2">
                <input value={searchId} onChange={e => setSearchId(e.target.value)} placeholder="Search Patient ID (e.g. MED-123456)" className="flex-1 p-3 rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-gray-300 dark:border-slate-700 outline-none focus:ring-2 focus:ring-amber-500 shadow-sm" />
                <button onClick={handleSearchPatient} className="px-6 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-colors">Trace Location</button>
              </div>
              <div className="mb-6 text-[11px] opacity-60 flex items-center gap-2 text-slate-600 dark:text-slate-400"><Info className="w-3 h-3" /> Search "MED-123456" to see the Demo Patient details.</div>
              
              {selectedPatient ? (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
                  {/* Comprehensive Profile Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-4 bg-blue-50/50 dark:bg-slate-900/50 rounded-2xl border border-blue-100 dark:border-slate-800">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white shrink-0">{selectedPatient.name[0]}</div>
                      <div>
                        <p className="font-bold text-sm text-slate-900 dark:text-white">{selectedPatient.name}</p>
                        <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">ID: {selectedPatient.id}</p>
                        <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold">Aadhar: {selectedPatient.aadharNo}</p>
                      </div>
                    </div>
                    <div className="p-4 bg-emerald-50/50 dark:bg-slate-900/50 rounded-2xl border border-emerald-100 dark:border-slate-800 space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-bold opacity-60"><Phone className="w-3 h-3" /> CONTACT DETAILS</div>
                      <p className="text-xs font-semibold">Primary: {selectedPatient.contactNumber || selectedPatient.mobileNumber || "N/A"}</p>
                      <p className="text-xs font-semibold text-red-600 flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> Emergency: {selectedPatient.emergencyMobileNumber || "N/A"}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-gray-100 dark:border-slate-800">
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="opacity-50 uppercase text-[9px] font-black block mb-1">Native Region</span>
                        <div className="flex items-center gap-1 font-bold"><Home className="w-3 h-3 text-blue-500" /> {selectedPatient.nativeCity}, {selectedPatient.nativeState}</div>
                      </div>
                      <div>
                        <span className="opacity-50 uppercase text-[9px] font-black block mb-1">Current Residence</span>
                        <div className="flex items-center gap-1 font-bold"><MapPin className="w-3 h-3 text-red-500" /> {selectedPatient.residingCity}</div>
                      </div>
                    </div>
                  </div>

                  {/* High Visibility Map View */}
                  <div className="aspect-video rounded-3xl bg-blue-50/50 dark:bg-slate-950 border-4 border-white dark:border-slate-800 flex items-center justify-center relative overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 via-transparent to-transparent"></div>
                    
                    {/* Visual representation of a target map location */}
                    <div className="relative">
                       <div className="absolute -inset-4 bg-red-500/20 rounded-full animate-ping"></div>
                       <MapPin className="w-16 h-16 text-red-600 drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)] z-10" />
                    </div>
                    
                    <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                      <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur p-4 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 min-w-[150px]">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">GPS COORDS (TRACED)</p>
                         <p className="text-xs font-mono font-bold text-slate-800 dark:text-blue-400">LAT: 12.9716 N</p>
                         <p className="text-xs font-mono font-bold text-slate-800 dark:text-blue-400">LNG: 77.5946 E</p>
                         <p className="text-[9px] mt-2 italic text-emerald-600 font-bold">● Active Residing Sync</p>
                      </div>
                      <a 
                        href={`https://www.google.com/maps/search/${encodeURIComponent(selectedPatient.residingCity + " " + selectedPatient.name)}`} 
                        target="_blank" 
                        className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-4 rounded-2xl text-sm font-black shadow-xl flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                      >
                        Launch Google Maps <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-80 opacity-20 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl">
                   <Search className="w-16 h-16 mb-4" />
                   <p className="font-bold text-lg text-center px-8">No tracing session active.<br/><span className="text-sm font-normal">Enter a Patient ID or Aadhar number above to start.</span></p>
                </div>
              )}
            </div>

            <div className={`p-8 rounded-3xl border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-100 shadow-sm'}`}>
              <h4 className="text-xl font-bold mb-6">Regional Health Metrics</h4>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                    <XAxis dataKey="name" tick={{fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12}} />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', backgroundColor: theme === 'dark' ? '#1e293b' : 'white' }} 
                    />
                    <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                      {chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-8 pt-8 border-t dark:border-slate-800">
                 <h5 className="text-xs font-black text-slate-400 uppercase mb-4">Quick Insights</h5>
                 <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm font-bold">
                       <span>Total Registrations</span>
                       <span className="text-blue-600">{stats.patients}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold">
                       <span>Medical Capacity</span>
                       <span className="text-emerald-600">{stats.doctors} Doctors</span>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        ) : activeView === 'patients' ? (
          <div className={`p-8 rounded-3xl border animate-in slide-in-from-bottom duration-500 ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-100 shadow-sm'}`}>
            <h4 className="text-2xl font-black mb-8">Registered Migrant Directory</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b dark:border-slate-800 text-[10px] uppercase font-black opacity-40">
                    <th className="pb-4">Name & ID</th>
                    <th className="pb-4">Location (Residing)</th>
                    <th className="pb-4">Native City</th>
                    <th className="pb-4">Contact</th>
                    <th className="pb-4">Aadhar</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-slate-800">
                  {allPatients.map(p => (
                    <tr key={p.id} className="group hover:bg-gray-50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="py-4">
                        <p className="font-bold text-sm text-slate-900 dark:text-white">{p.name}</p>
                        <p className="text-[10px] font-mono text-slate-400">{p.id}</p>
                      </td>
                      <td className="py-4 text-sm font-semibold text-red-600">{p.residingCity}</td>
                      <td className="py-4 text-sm">{p.nativeCity || "N/A"}</td>
                      <td className="py-4 text-sm font-mono">{p.contactNumber || p.mobileNumber || "N/A"}</td>
                      <td className="py-4 text-xs opacity-60">{p.aadharNo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={() => setActiveView('main')} className="mt-8 text-blue-600 font-bold flex items-center gap-2">← Back to Dashboard</button>
          </div>
        ) : (
          <div className={`p-8 rounded-3xl border animate-in slide-in-from-bottom duration-500 ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-100 shadow-sm'}`}>
            <h4 className="text-2xl font-black mb-8">Medical Staff Ledger</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allDoctors.map(d => (
                <div key={d.id} className="p-6 rounded-2xl bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{d.name}</p>
                    <p className="text-xs opacity-50">{d.specialization}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-600 font-black text-xl">{d.patientsTreated}</p>
                    <p className="text-[10px] uppercase font-bold opacity-40">Consultations</p>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setActiveView('main')} className="mt-8 text-blue-600 font-bold flex items-center gap-2">← Back to Dashboard</button>
          </div>
        )}
      </div>
    </PortalLayout>
  );
};
