
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Scan, 
  User, 
  FileEdit, 
  Send, 
  History, 
  CheckCircle2, 
  AlertCircle,
  Activity,
  UserCheck,
  Stethoscope,
  Info,
  FileIcon,
  Eye,
  ExternalLink,
  QrCode,
  X,
  Camera,
  Maximize2
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { PortalLayout } from './SharedUI';
import { Theme, MigrantProfile, Consultation, DoctorProfile } from '../types';

interface DoctorPortalProps {
  theme: Theme;
  toggleTheme: () => void;
  onLogout: () => void;
}

export const DoctorPortal: React.FC<DoctorPortalProps> = ({ theme, toggleTheme, onLogout }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeView, setActiveView] = useState('main');
  const [currentDoctor, setCurrentDoctor] = useState<DoctorProfile | null>(null);
  const [searchId, setSearchId] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<MigrantProfile | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  
  const [consultForm, setConsultForm] = useState<Partial<Consultation>>({
    date: new Date().toISOString().split('T')[0]
  });

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    const existingDoctors = JSON.parse(localStorage.getItem('mock_doctors') || '[]');
    const demoExists = existingDoctors.some((d: any) => d.username === 'doc_demo');
    if (!demoExists) {
      const demoDoctor: DoctorProfile = {
        id: 'DOC-999',
        name: 'Dr. Sarah Wilson',
        username: 'doc_demo',
        password: 'password123',
        specialization: 'General Physician',
        patientsTreated: 45
      };
      localStorage.setItem('mock_doctors', JSON.stringify([...existingDoctors, demoDoctor]));
    }
  }, []);

  useEffect(() => {
    if (isScannerOpen) {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );
      
      scannerRef.current.render((decodedText) => {
        setSearchId(decodedText);
        setIsScannerOpen(false);
        if (scannerRef.current) scannerRef.current.clear();
        // Trigger search
        handleSearchPatient(decodedText);
      }, (error) => {
        // Silently ignore failures
      });
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(e => console.error("Scanner clear fail", e));
      }
    };
  }, [isScannerOpen]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const doctors = JSON.parse(localStorage.getItem('mock_doctors') || '[]');
    const target = e.target as any;
    const found = doctors.find((d: any) => d.username === target.username.value && d.password === target.password.value);
    if (found) {
      setCurrentDoctor(found);
      setIsLoggedIn(true);
      setActiveView('main');
    } else {
      alert("Invalid Doctor Credentials.");
    }
  };

  const handleSearchPatient = (manualId?: string) => {
    const query = (manualId || searchId).trim().toUpperCase();
    if (!query) return;
    const migrants = JSON.parse(localStorage.getItem('mock_migrants') || '[]');
    const found = migrants.find((m: any) => 
      m.id.toUpperCase() === query || 
      (m.aadharNo && m.aadharNo.replace(/-/g, '') === query.replace(/-/g, ''))
    );
    if (found) {
      setSelectedPatient(found);
      setConsultForm({
        ...consultForm,
        patientId: found.id,
        patientName: found.name,
        patientAge: found.age,
        doctorName: currentDoctor?.name,
        doctorId: currentDoctor?.id,
      });
    } else {
      alert(`Patient not found for ID: ${query}`);
      setSelectedPatient(null);
    }
  };

  const openFileInSafeView = (base64: string) => {
    try {
      // Create a Blob from the base64 string to handle viewing more reliably
      const parts = base64.split(';base64,');
      const contentType = parts[0].split(':')[1];
      const raw = window.atob(parts[1]);
      const rawLength = raw.length;
      const uInt8Array = new Uint8Array(rawLength);
      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }
      const blob = new Blob([uInt8Array], { type: contentType });
      const blobUrl = URL.createObjectURL(blob);
      
      // Set to preview modal
      setPreviewFile(blobUrl);
    } catch (e) {
      alert("Error processing file for view. Base64 might be corrupted.");
    }
  };

  const handleSendConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    const newConsultation: Consultation = {
      ...consultForm as Consultation,
      id: 'CNS-' + Math.floor(10000 + Math.random() * 90000),
    };
    const consults = JSON.parse(localStorage.getItem('mock_consultations') || '[]');
    consults.push(newConsultation);
    localStorage.setItem('mock_consultations', JSON.stringify(consults));
    
    const doctors = JSON.parse(localStorage.getItem('mock_doctors') || '[]');
    const idx = doctors.findIndex((d: any) => d.id === currentDoctor?.id);
    if (idx !== -1) {
      doctors[idx].patientsTreated += 1;
      setCurrentDoctor(doctors[idx]);
      localStorage.setItem('mock_doctors', JSON.stringify(doctors));
    }
    alert("Consultation sent successfully!");
    setSelectedPatient(null);
    setSearchId('');
  };

  if (!isLoggedIn) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-gray-50 text-slate-900'}`}>
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-slate-700">
          <div className="flex justify-center mb-8"><div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl text-emerald-600"><Stethoscope className="w-10 h-10" /></div></div>
          <h2 className="text-3xl font-bold text-center mb-2">Doctor Portal</h2>
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl text-xs">
            <p className="font-bold text-blue-700 dark:text-blue-300 mb-1">Demo Login</p>
            <p className="opacity-70">User: <span className="font-bold">doc_demo</span> | Pass: <span className="font-bold">password123</span></p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input name="username" placeholder="Username" required className="w-full p-3 rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-gray-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm" />
            <input name="password" type="password" placeholder="Password" required className="w-full p-3 rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-gray-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm" />
            <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20">Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <PortalLayout title="Doctor Portal" portalType="DOCTOR" theme={theme} toggleTheme={toggleTheme} onLogout={onLogout} activeView={activeView} setActiveView={setActiveView} userName={currentDoctor?.name}>
      
      {/* QR Scanner Modal Overlay */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center p-6">
          <button onClick={() => setIsScannerOpen(false)} className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all">
            <X className="w-8 h-8" />
          </button>
          <div className="max-w-md w-full bg-white rounded-[2rem] overflow-hidden shadow-2xl">
            <div className="p-8 border-b text-center">
              <Camera className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
              <h3 className="text-xl font-bold text-slate-900">Scan Patient QR</h3>
              <p className="text-sm text-slate-500">Align the patient's QR code within the frame</p>
            </div>
            <div id="qr-reader" className="w-full border-none p-4"></div>
            <div className="p-6 bg-slate-50 text-center">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Health Vault Scan</p>
            </div>
          </div>
        </div>
      )}

      {/* File Preview Modal Overlay */}
      {previewFile && (
        <div className="fixed inset-0 z-[110] bg-black/95 flex flex-col items-center justify-center p-4">
           <div className="absolute top-4 right-4 flex gap-2">
              <a href={previewFile} download="Patient_Report" className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white">
                <Send className="w-6 h-6 rotate-45" />
              </a>
              <button onClick={() => setPreviewFile(null)} className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all">
                <X className="w-6 h-6" />
              </button>
           </div>
           <div className="max-w-4xl w-full h-full max-h-[90vh] rounded-2xl overflow-hidden bg-white/5 flex items-center justify-center">
              {/* Check if it's an image or other */}
              <iframe src={previewFile} className="w-full h-full border-none bg-white rounded-xl" title="File Preview"></iframe>
           </div>
           <p className="mt-4 text-white/50 text-xs font-bold uppercase tracking-widest">Secure Report Viewer</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className={`p-6 rounded-3xl border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-100 shadow-sm'}`}>
            <h4 className="text-sm font-black uppercase opacity-40 mb-4 tracking-tighter">Patient Identification</h4>
            <div className="space-y-4">
               <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-30" />
                    <input 
                      value={searchId}
                      onChange={e => setSearchId(e.target.value)}
                      placeholder="ID or Aadhar" 
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-gray-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm" 
                    />
                  </div>
                  <button onClick={() => setIsScannerOpen(true)} className="p-4 bg-slate-900 dark:bg-slate-700 text-white rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-black/10">
                    <QrCode className="w-6 h-6" />
                  </button>
               </div>
               <button onClick={() => handleSearchPatient()} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md">Find Record</button>
               <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl text-[10px]">
                  <p className="font-bold text-blue-700 dark:text-blue-300">QUICK TEST: <span className="font-mono underline">MED-123456</span></p>
               </div>
            </div>
          </div>
          {selectedPatient && (
            <div className={`p-6 rounded-3xl border animate-in slide-in-from-left duration-300 ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-100 shadow-sm'}`}>
              <div className="flex items-center gap-4 mb-6 pb-6 border-b dark:border-slate-700">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center font-bold text-blue-600 text-2xl border-2 border-white dark:border-slate-800 shadow-sm">{selectedPatient.name[0]}</div>
                <div><h4 className="font-bold text-lg text-slate-900 dark:text-white">{selectedPatient.name}</h4><p className="text-xs opacity-50">Age: {selectedPatient.age} | {selectedPatient.id}</p></div>
              </div>
              <div className="space-y-4">
                {selectedPatient.voiceNote && (
                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 text-xs italic">
                    <p className="font-bold uppercase text-blue-600 mb-1 not-italic tracking-tighter">AI Translation (Symptoms):</p>
                    "{selectedPatient.voiceNote}"
                  </div>
                )}
                
                {/* Reports Section for Doctor */}
                <div className="mt-6">
                  <h5 className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Patient Vault Reports</h5>
                  {selectedPatient.medicalReports && selectedPatient.medicalReports.length > 0 ? (
                    <div className="space-y-2">
                      {selectedPatient.medicalReports.map((report, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-900/50 border dark:border-slate-800 group hover:border-emerald-500 transition-colors">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span className="text-[10px] font-bold truncate">MedReport_{i+1}</span>
                          </div>
                          <button 
                            onClick={() => openFileInSafeView(report)}
                            className="p-1.5 hover:bg-emerald-600 hover:text-white rounded-lg text-emerald-600 transition-all"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] opacity-30 italic text-center py-4 border-2 border-dashed rounded-xl">No physical reports in vault.</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] mt-4">
                   <div className="p-2 bg-gray-50 dark:bg-slate-900/50 rounded-lg border dark:border-slate-800">Blood: <span className="font-bold text-red-500">{selectedPatient.bloodGroup}</span></div>
                   <div className="p-2 bg-gray-50 dark:bg-slate-900/50 rounded-lg border dark:border-slate-800">Origin: <span className="font-bold">{selectedPatient.nativeCity}</span></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="lg:col-span-8">
           {selectedPatient ? (
             <form onSubmit={handleSendConsultation} className={`p-8 rounded-3xl border space-y-6 animate-in fade-in duration-500 ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-100 shadow-sm'}`}>
               <div className="flex justify-between items-center">
                 <h4 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white"><FileEdit className="text-emerald-500" /> New Consultation</h4>
                 <div className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-[10px] font-black uppercase rounded-full">Secure Session Active</div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black opacity-40 ml-1">Diagnosis</label>
                    <input required placeholder="e.g. Acute Respiratory Infection" onChange={e => setConsultForm({...consultForm, diagnosis: e.target.value})} className="w-full p-3 rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-gray-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black opacity-40 ml-1">Etiology / Cause</label>
                    <input required placeholder="e.g. Environmental dust exposure" onChange={e => setConsultForm({...consultForm, causeOfIllness: e.target.value})} className="w-full p-3 rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-gray-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm" />
                  </div>
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] uppercase font-black opacity-40 ml-1">Digital Prescription & Dosage</label>
                 <textarea required rows={5} placeholder="Prescribe medicines, dosage timing (Morning/Evening), and dietary advice..." onChange={e => setConsultForm({...consultForm, prescription: e.target.value})} className="w-full p-4 rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-gray-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 resize-none shadow-sm" />
               </div>
               <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"><Send className="w-5 h-5" /> Issue Central Prescription</button>
             </form>
           ) : (
             <div className="h-[450px] flex flex-col items-center justify-center opacity-30 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] bg-gray-50/50 dark:bg-slate-900/30">
                <div className="p-8 bg-emerald-100 dark:bg-emerald-900/20 rounded-full mb-4">
                  <QrCode className="w-16 h-16 text-emerald-600" />
                </div>
                <h4 className="text-xl font-bold">No Records Loaded</h4>
                <p className="text-sm max-w-xs text-center mt-2 leading-relaxed">Scan the patient's ID card or search manually to view their medical history and issue a prescription.</p>
                <button onClick={() => setIsScannerOpen(true)} className="mt-6 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20">
                  <Maximize2 className="w-4 h-4" /> Open Scanner
                </button>
             </div>
           )}
        </div>
      </div>
    </PortalLayout>
  );
};
