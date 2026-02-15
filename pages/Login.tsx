
import React, { useState, useEffect } from 'react';
import { Language, TranslationSet, User } from '../types';

interface LoginProps {
  t: TranslationSet;
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  onLogin: (username: string, password: string) => void;
  users: User[];
  legalTexts: { imprint: string; privacy: string };
}

const LOGO_URL = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.256 1.181-3.103.493.969.819 2.087.819 3.103z'/%3E%3C/svg%3E";

export const Login: React.FC<LoginProps> = ({ t, currentLanguage, onLanguageChange, onLogin, users, legalTexts }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginMode, setLoginMode] = useState<'service' | 'management'>('service');
  const [alertMsg, setAlertMsg] = useState<{ text: string, type: 'error' | 'success' } | null>(null);
  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());
  const [showImprint, setShowImprint] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const showAlert = (text: string, type: 'error' | 'success' = 'error') => {
    setAlertMsg({ text, type });
    setTimeout(() => setAlertMsg(null), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAlertMsg(null);
    const errors = new Set<string>();

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (!cleanUsername) errors.add('username');
    if (!cleanPassword) errors.add('password');

    if (errors.size > 0) {
      setInvalidFields(errors);
      showAlert(currentLanguage === 'de' ? 'Bitte füllen Sie alle Felder aus.' : 'Please fill in all fields.', 'error');
      return;
    }

    onLogin(cleanUsername, cleanPassword);
  };

  const getFieldClass = (fieldName: string) => {
    const base = "w-full px-6 py-4 rounded-2xl bg-slate-50 border font-bold outline-none transition-all duration-200";
    if (invalidFields.has(fieldName)) return base + " border-rose-500 ring-4 ring-rose-500/10 animate-shake";
    return base + " border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-700 px-4 relative overflow-hidden text-left ${loginMode === 'management' ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className={`absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl transition-opacity duration-1000 ${loginMode === 'management' ? 'bg-indigo-500/10 opacity-100' : 'bg-blue-600/5 opacity-50'}`} />
      <div className={`absolute -bottom-24 -right-24 w-96 h-96 rounded-full blur-3xl transition-opacity duration-1000 ${loginMode === 'management' ? 'bg-blue-500/10 opacity-100' : 'bg-indigo-600/5 opacity-50'}`} />

      {alertMsg && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4">
          <div className={(alertMsg.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500') + " text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center space-x-4"}>
             <span className="font-black text-xs uppercase tracking-tight">{alertMsg.text}</span>
          </div>
        </div>
      )}

      <div className="w-full max-w-[460px] bg-white rounded-[3.5rem] shadow-2xl p-8 lg:p-14 border border-slate-100 relative z-10 flex flex-col">
        {/* MODAL TOGGLE */}
        <div className="bg-slate-100 p-1.5 rounded-[2rem] flex mb-12 shadow-inner relative">
          <div 
            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-[1.75rem] shadow-md transition-all duration-300 ease-out ${loginMode === 'management' ? 'translate-x-[calc(100%+6px)]' : 'translate-x-0'}`}
          />
          <button 
            type="button"
            onClick={() => setLoginMode('service')}
            className={`flex-1 relative z-10 py-3.5 text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${loginMode === 'service' ? 'text-blue-600' : 'text-slate-400'}`}
          >
            🍽️ Service
          </button>
          <button 
            type="button"
            onClick={() => setLoginMode('management')}
            className={`flex-1 relative z-10 py-3.5 text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${loginMode === 'management' ? 'text-blue-600' : 'text-slate-400'}`}
          >
            🏢 Zentrale
          </button>
        </div>

        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 mb-4 p-4 bg-slate-50 rounded-[2rem] shadow-inner">
            <img src={LOGO_URL} className="w-full h-full object-contain" alt="Gourmetta Logo" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 italic tracking-tighter">gourmetta</h1>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 text-center leading-relaxed">
            {loginMode === 'service' ? 'HACCP Mess-Terminal' : 'Management & Monitoring Dashboard'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 flex-1">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
              {loginMode === 'service' ? 'Mitarbeiter-ID / Name' : t.username}
            </label>
            <input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              className={getFieldClass('username')} 
              placeholder={loginMode === 'service' ? "z.B. max_mustermann" : "Admin-ID..."} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t.password}</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className={getFieldClass('password')} 
              placeholder="••••••••" 
            />
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              className={`w-full text-white font-black py-5 rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-[0.2em] text-xs ${loginMode === 'management' ? 'bg-slate-900 hover:bg-blue-600' : 'bg-blue-600 hover:bg-slate-900'}`}
            >
              {t.loginButton} &rarr;
            </button>
          </div>
          
          <div className="pt-8 mt-4 border-t border-slate-50 flex flex-col items-center space-y-6">
            <div className="flex items-center space-x-6">
              <button type="button" onClick={() => setShowImprint(true)} className="text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors">Impressum</button>
              <span className="w-1.5 h-1.5 bg-slate-100 rounded-full" />
              <button type="button" onClick={() => setShowPrivacy(true)} className="text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors">Datenschutz</button>
            </div>
          </div>
        </form>
      </div>

      <p className={`mt-8 text-[9px] font-bold uppercase tracking-widest transition-colors ${loginMode === 'management' ? 'text-slate-500' : 'text-slate-400 opacity-60'}`}>
        &copy; {new Date().getFullYear()} Gourmetta Gastronomie GmbH
      </p>

      {(showImprint || showPrivacy) && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={() => { setShowImprint(false); setShowPrivacy(false); }} />
           <div className="relative bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl p-10 lg:p-14 overflow-hidden border border-white/10 flex flex-col max-h-[85vh]">
              <div className="flex justify-between items-center mb-8 shrink-0">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white text-lg">🛡️</div>
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
                    {showImprint ? 'Impressum' : 'Datenschutzerklärung'}
                  </h2>
                </div>
                <button onClick={() => { setShowImprint(false); setShowPrivacy(false); }} className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-bold hover:scale-110 transition-transform">✕</button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 whitespace-pre-wrap font-medium text-slate-600 text-sm leading-relaxed pb-6 text-left">
                 {showImprint ? legalTexts.imprint : legalTexts.privacy}
              </div>
              <div className="mt-4 pt-8 border-t border-slate-50 shrink-0">
                 <button onClick={() => { setShowImprint(false); setShowPrivacy(false); }} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-600 transition-colors">Verstanden</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
