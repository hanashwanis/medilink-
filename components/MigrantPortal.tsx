
import React, { useState, useRef, useEffect } from 'react';
import { 
  UserPlus, 
  LogIn, 
  Mic, 
  Square, 
  QrCode, 
  FileText, 
  ChevronRight, 
  Upload, 
  History,
  CheckCircle2,
  Copy,
  FileIcon,
  X,
  Eye,
  Trash2,
  Plus
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { PortalLayout } from './SharedUI';
import { Theme, MigrantProfile, Consultation } from '../types';
import { translateAudioToEnglish } from '../geminiService';

interface MigrantPortalProps {
  theme: Theme;
  toggleTheme: () => void;
  onLogout: () => void;
}

export const MigrantPortal: React.FC<MigrantPortalProps> = ({ theme, toggleTheme, onLogout }) => {
  const [activeView, setActiveView] = useState('landing');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<MigrantProfile | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  
  const [regForm, setRegForm] = useState<Partial<MigrantProfile>>({});
  const [isRecording, setIsRecording] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedConsultations = localStorage.getItem('mock_consultations');
    if (savedConsultations) {
      setConsultations(JSON.parse(savedConsultations));
    }
  }, []);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: MigrantProfile = {
      ...regForm as MigrantProfile,
      id: 'MED-' + Math.floor(100000 + Math.random() * 900000),
      medicalReports: [],
    };
    const migrants = JSON.parse(localStorage.getItem('mock_migrants') || '[]');
    migrants.push(newUser);
    localStorage.setItem('mock_migrants', JSON.stringify(migrants));
    setUser(newUser);
    setIsLoggedIn(true);
    setActiveView('main');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const migrants = JSON.parse(localStorage.getItem('mock_migrants') || '[]');
    const target = e.target as any;
    const found = migrants.find((m: any) => 
      m.username === target.username.value && 
      m.password === target.password.value
    );
    if (found) {
      setUser(found);
      setIsLoggedIn(true);
      setActiveView('main');
    } else {
      alert("Account not found or password incorrect.");
    }
  };

  const copyId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      alert("Patient ID copied to clipboard!");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit to ~1MB to prevent LocalStorage overflows
    if (file.size > 1.2 * 1024 * 1024) {
      alert("File is too large for current storage. Please upload files under 1MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (user) {
        const updatedReports = [...(user.medicalReports || []), base64];
        const updatedUser = { ...user, medicalReports: updatedReports };
        setUser(updatedUser);
        
        const migrants = JSON.parse(localStorage.getItem('mock_migrants') || '[]');
        const idx = migrants.findIndex((m: any) => m.id === user.id);
        if (idx !== -1) {
          migrants[idx] = updatedUser;
          localStorage.setItem('mock_migrants', JSON.stringify(migrants));
        }
        alert("Medical report uploaded successfully!");
      }
    };
    reader.readAsDataURL(file);
  };

  const removeReport = (index: number) => {
    if (!user) return;
    const updatedReports = user.medicalReports.filter((_, i) => i !== index);
    const updatedUser = { ...user, medicalReports: updatedReports };
    setUser(updatedUser);
    
    const migrants = JSON.parse(localStorage.getItem('mock_migrants') || '[]');
    const idx = migrants.findIndex((m: any) => m.id === user.id);
    if (idx !== -1) {
      migrants[idx] = updatedUser;
      localStorage.setItem('mock_migrants', JSON.stringify(migrants));
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1];
          setIsTranslating(true);
          const translation = await translateAudioToEnglish(base64);
          if (user) {
            const updatedUser = { ...user, voiceNote: translation };
            setUser(updatedUser);
            const migrants = JSON.parse(localStorage.getItem('mock_migrants') || '[]');
            const idx = migrants.findIndex((m: any) => m.id === user.id);
            if (idx !== -1) migrants[idx] = updatedUser;
            localStorage.setItem('mock_migrants', JSON.stringify(migrants));
          }
          setIsTranslating(false);
        };
      };
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  if (!isLoggedIn) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-gray-50 text-slate-900'}`}>
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-slate-700">
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-2xl">
              <LogIn className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-center mb-2 text-slate-900 dark:text-white">Migrant Portal</h2>
          <p className="text-center text-sm opacity-60 mb-8 text-slate-500 dark:text-slate-400">Access your healthcare profile securely.</p>
          {activeView === 'landing' ? (
            <div className="space-y-4">
              <button onClick={() => setActiveView('login')} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all">
                <LogIn className="w-5 h-5" /> Sign In
              </button>
              <button onClick={() => setActiveView('register')} className="w-full py-4 bg-white dark:bg-slate-700 border-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 rounded-2xl font-bold flex items-center justify-center gap-2">
                <UserPlus className="w-5 h-5" /> Create Account
              </button>
            </div>
          ) : activeView === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 opacity-70">Username</label>
                <input name="username" type="text" required className="w-full p-3 rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-gray-300 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 opacity-70">Password</label>
                <input name="password" type="password" required className="w-full p-3 rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-gray-300 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" />
              </div>
              <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold">Login</button>
              <button onClick={() => setActiveView('landing')} className="w-full py-2 text-sm opacity-60">Back</button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Name" required onChange={e => setRegForm({...regForm, name: e.target.value})} className="p-3 rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-gray-300 dark:border-slate-700 shadow-sm" />
                <input placeholder="Age" type="number" required onChange={e => setRegForm({...regForm, age: parseInt(e.target.value)})} className="p-3 rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-gray-300 dark:border-slate-700 shadow-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Native State" required onChange={e => setRegForm({...regForm, nativeState: e.target.value})} className="p-3 rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-gray-300 dark:border-slate-700 shadow-sm" />
                <input placeholder="Native City" required onChange={e => setRegForm({...regForm, nativeCity: e.target.value})} className="p-3 rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-gray-300 dark:border-slate-700 shadow-sm" />
              </div>
              <input placeholder="Residing City" required onChange={e => setRegForm({...regForm, residingCity: e.target.value})} className="w-full p-3 rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-gray-300 dark:border-slate-700 shadow-sm" />
              <input placeholder="Aadhar No" required onChange={e => setRegForm({...regForm, aadharNo: e.target.value})} className="w-full p-3 rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-gray-300 dark:border-slate-700 shadow-sm" />
              
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Contact Number" required onChange={e => setRegForm({...regForm, contactNumber: e.target.value, mobileNumber: e.target.value})} className="p-3 rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-gray-300 dark:border-slate-700 shadow-sm" />
                <input placeholder="Emergency Contact" required onChange={e => setRegForm({...regForm, emergencyMobileNumber: e.target.value})} className="p-3 rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-gray-300 dark:border-slate-700 shadow-sm" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Date of Birth" type="date" required onChange={e => setRegForm({...regForm, dob: e.target.value})} className="p-3 rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-gray-300 dark:border-slate-700 shadow-sm" />
                <input placeholder="Blood Group" required onChange={e => setRegForm({...regForm, bloodGroup: e.target.value})} className="p-3 rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-gray-300 dark:border-slate-700 shadow-sm" />
              </div>

              <div className="border-t pt-4 mt-4 space-y-4">
                <input placeholder="Choose Username" required onChange={e => setRegForm({...regForm, username: e.target.value})} className="w-full p-3 rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-gray-300 dark:border-slate-700 shadow-sm" />
                <input placeholder="Create Password" type="password" required onChange={e => setRegForm({...regForm, password: e.target.value})} className="w-full p-3 rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-gray-300 dark:border-slate-700 shadow-sm" />
              </div>
              <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold">Complete Registration</button>
              <button onClick={() => setActiveView('landing')} className="w-full py-2 text-sm opacity-60">Back</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <PortalLayout title="Migrant Portal" portalType="MIGRANT" theme={theme} toggleTheme={toggleTheme} onLogout={onLogout} activeView={activeView} setActiveView={setActiveView} userName={user?.name}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`md:col-span-1 rounded-3xl border p-6 flex flex-col items-center ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-100 shadow-sm'}`}>
          <div className="w-32 h-32 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 border-4 border-white dark:border-slate-800 shadow-lg">
            <span className="text-4xl font-black text-blue-600">{user?.name[0]}</span>
          </div>
          <h3 className="text-2xl font-bold">{user?.name}</h3>
          <div className="flex items-center gap-2 mb-6">
            <p className="text-sm opacity-60">ID: {user?.id}</p>
            <button onClick={copyId} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-blue-500">
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <div className="w-full space-y-3">
            <div className="flex justify-between items-center px-4 py-2 bg-gray-50 dark:bg-slate-900/50 rounded-xl">
              <span className="text-xs opacity-50 font-bold uppercase">Blood Group</span>
              <span className="font-bold text-red-500">{user?.bloodGroup}</span>
            </div>
            <div className="flex justify-between items-center px-4 py-2 bg-gray-50 dark:bg-slate-900/50 rounded-xl">
              <span className="text-xs opacity-50 font-bold uppercase">Residing</span>
              <span className="font-bold">{user?.residingCity}</span>
            </div>
            <div className="flex justify-between items-center px-4 py-2 bg-gray-50 dark:bg-slate-900/50 rounded-xl">
              <span className="text-xs opacity-50 font-bold uppercase">Native</span>
              <span className="font-bold">{user?.nativeCity}, {user?.nativeState}</span>
            </div>
          </div>
          
          {/* Functional QR Code Generation */}
          <div className="mt-8 p-5 bg-white rounded-2xl shadow-inner flex flex-col items-center border border-gray-100">
             {user?.id && (
               <QRCodeSVG 
                value={user.id} 
                size={140} 
                level="H" 
                includeMargin={false}
                imageSettings={{
                  src: "https://upload.wikimedia.org/wikipedia/commons/5/55/Aadhar_Logo.svg",
                  x: undefined,
                  y: undefined,
                  height: 24,
                  width: 24,
                  excavate: true,
                }}
              />
             )}
             <p className="text-[9px] mt-3 font-black text-slate-400 uppercase tracking-widest text-center">Patient Access QR</p>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className={`p-8 rounded-3xl border transition-all ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-100 shadow-sm'}`}>
            <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Mic className="w-5 h-5 text-blue-500" /> Record Symptoms
            </h4>
            <p className="text-sm opacity-60 mb-6 italic">Describe your medical issues in your native language (Tamil, Hindi, Telugu, etc.).</p>
            <div className="flex items-center gap-6">
              <button onClick={isRecording ? stopRecording : startRecording} className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-blue-600 hover:scale-105 shadow-xl shadow-blue-500/20'} text-white`}>
                {isRecording ? <Square /> : <Mic className="w-8 h-8" />}
              </button>
              <div className="flex-1">
                {isRecording ? <p className="text-red-500 font-bold">Recording in progress...</p> : isTranslating ? <p className="text-blue-500 animate-pulse">AI Translation active...</p> : <p className="text-sm opacity-50">Translation will appear below for the doctor.</p>}
                {user?.voiceNote && !isRecording && !isTranslating && (
                  <div className="mt-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                    <p className="text-[10px] uppercase font-bold text-blue-600 mb-1">Translated Sync:</p>
                    <p className="text-sm leading-relaxed">{user.voiceNote}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <button onClick={() => setActiveView('history')} className={`p-6 rounded-3xl border flex flex-col items-center gap-3 transition-transform hover:-translate-y-1 ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-100 shadow-sm'}`}>
                <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl text-emerald-600"><FileText className="w-8 h-8" /></div>
                <span className="font-bold">Consultations</span>
             </button>
             <button onClick={() => setActiveView('reports')} className={`p-6 rounded-3xl border flex flex-col items-center gap-3 transition-transform hover:-translate-y-1 ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-100 shadow-sm'}`}>
                <div className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-2xl text-amber-600"><Upload className="w-8 h-8" /></div>
                <span className="font-bold">Medical Reports</span>
             </button>
          </div>

          {activeView === 'history' && (
            <div className={`p-8 rounded-3xl border animate-in fade-in duration-500 ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-100 shadow-sm'}`}>
              <h4 className="text-xl font-bold mb-6">Medical History</h4>
              <div className="space-y-4">
                {consultations.filter(c => c.patientId === user?.id).length > 0 ? (
                  consultations.filter(c => c.patientId === user?.id).map(c => (
                    <div key={c.id} className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold">{c.diagnosis}</p>
                          <p className="text-xs opacity-60">Dr. {c.doctorName}</p>
                        </div>
                        <span className="text-xs opacity-40">{c.date}</span>
                      </div>
                      <p className="text-sm opacity-80">Prescription: {c.prescription}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 opacity-30">
                    <FileText className="w-12 h-12 mx-auto mb-2" />
                    <p>No consultations found yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeView === 'reports' && (
            <div className={`p-8 rounded-3xl border animate-in slide-in-from-bottom duration-500 ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-100 shadow-sm'}`}>
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-xl font-bold">Your Medical Reports</h4>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-amber-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-amber-700 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Upload New
                </button>
                <input 
                  type="file" 
                  hidden 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/*,application/pdf"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user?.medicalReports && user.medicalReports.length > 0 ? (
                  user.medicalReports.map((report, idx) => (
                    <div key={idx} className="p-4 rounded-2xl border bg-gray-50 dark:bg-slate-900/50 flex flex-col gap-3 group relative">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center">
                          <FileIcon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-xs font-bold truncate">Report_{idx + 1}</p>
                          <p className="text-[10px] opacity-40">Stored in vault</p>
                        </div>
                        <button onClick={() => removeReport(idx)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {report.startsWith('data:image') && (
                        <div className="aspect-video rounded-xl overflow-hidden bg-white border border-gray-200 dark:border-slate-800">
                          <img src={report} alt="Medical Report" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <a 
                        href={report} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg text-center text-xs font-bold flex items-center justify-center gap-2"
                      >
                        <Eye className="w-3 h-3" /> View Large
                      </a>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-16 text-center opacity-30">
                    <Upload className="w-12 h-12 mx-auto mb-2" />
                    <p>No reports uploaded yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  );
};
