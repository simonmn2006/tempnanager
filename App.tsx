
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Language, AdminTab, User, Facility, Refrigerator, Assignment, Menu, FormTemplate, Reading, FormResponse, RefrigeratorType, CookingMethod, FacilityType, Holiday, FacilityException, Alert, AuditLog, ReminderConfig } from './types';
import { translations } from './translations';
import { Login } from './pages/Login';
import { DashboardLayout } from './components/DashboardLayout';
import { UserDashboardLayout } from './components/UserDashboardLayout';
import { UsersPage } from './pages/Users';
import { FacilitiesPage } from './pages/Facilities';
import { RefrigeratorsPage } from './pages/Refrigerators';
import { MenusPage } from './pages/Menus';
import { FormCreatorPage } from './pages/FormCreator';
import { AssignmentsPage } from './pages/Assignments';
import { ReportsPage } from './pages/Reports';
import { SettingsPage } from './pages/Settings';
import { BackupSyncPage } from './pages/BackupSync';
import { AuditLogsPage } from './pages/AuditLogs';
import { UserWorkspace } from './pages/UserWorkspace';
import { UserForms } from './pages/UserForms';
import { UserReports } from './pages/UserReports';
import { FacilityAnalyticsPage } from './pages/FacilityAnalytics';
import { RemindersPage } from './pages/Reminders';

const API_BASE = 'http://localhost:3001/api';

// Add missing LOGO_URL constant for branding
const LOGO_URL = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.256 1.181-3.103.493.969.819 2.087.819 3.103z'/%3E%3C/svg%3E";

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('de');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>(AdminTab.DASHBOARD);
  
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Synchronized States
  const [users, setUsers] = useState<User[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [fridges, setFridges] = useState<Refrigerator[]>([]);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [formResponses, setFormResponses] = useState<FormResponse[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Static/Config States (Managed in Settings)
  const [fridgeTypes, setFridgeTypes] = useState<RefrigeratorType[]>([
    { id: 'RT1', name: 'Kühlschrank (+2 bis +7°C)', checkpoints: [{ name: 'Luft', minTemp: 2, maxTemp: 7 }] },
    { id: 'RT2', name: 'Tiefkühler (-18 bis -22°C)', checkpoints: [{ name: 'Luft', minTemp: -22, maxTemp: -18 }] }
  ]);
  const [cookingMethods, setCookingMethods] = useState<CookingMethod[]>([
    { id: 'CM1', name: 'Standard Cook & Serve', checkpoints: [{ name: 'Kern', minTemp: 72, maxTemp: 95 }] }
  ]);
  const [facilityTypes, setFacilityTypes] = useState<FacilityType[]>([
    { id: 'FT1', name: 'Kantine' }, { id: 'FT2', name: 'Kita/Schule' }
  ]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [excludedFacilities, setExcludedFacilities] = useState<FacilityException[]>([]);
  const [menus, setMenus] = useState<Menu[]>([{ id: 'M1', name: 'Menü A (Tagesgericht)' }]);
  const [forms, setForms] = useState<FormTemplate[]>([
    { 
      id: 'F-SUP-CHECK', 
      title: 'Supervisor Vor-Ort Check', 
      description: 'Standardabfrage der physischen Präsenz', 
      questions: [{ id: 'Q-SUP', text: 'Hat der Supervisor heute persönlich am Standort vorbeigeschaut?', type: 'yesno' }], 
      requiresSignature: true, 
      createdAt: '2024-01-01' 
    }
  ]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [reminders, setReminders] = useState<ReminderConfig[]>([]);

  const [legalTexts, setLegalTexts] = useState({
    imprint: "Gourmetta Gastronomie GmbH\nAn der Priessnitzaue 28\n01328 Dresden",
    privacy: "Datenhaltung in lokaler PostgreSQL Instanz."
  });

  // API Methods
  const fetchData = useCallback(async () => {
    if (!authToken) return;
    try {
      setIsSyncing(true);
      const headers = { 'Authorization': `Bearer ${authToken}` };
      
      const [readingsRes] = await Promise.all([
        fetch(`${API_BASE}/readings`, { headers }).then(r => r.json()),
      ]);
      
      setReadings(readingsRes);
      setIsSyncing(false);
    } catch (e) {
      console.error("Sync failed", e);
      setIsSyncing(false);
    }
  }, [authToken]);

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated, fetchData]);

  const handleLogin = async (username: string, password?: string) => {
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      if (res.ok) {
        const { user, token } = await res.json();
        setCurrentUser(user);
        setAuthToken(token);
        setIsAuthenticated(true);
        setActiveTab(user.role === 'User' ? 'user_workspace' : AdminTab.DASHBOARD);
      } else {
        alert("Login fehlgeschlagen. Bitte prüfen Sie Ihre Verbindung zur lokalen Datenbank.");
      }
    } catch (e) {
      alert("Lokaler Server nicht erreichar. Bitte starten Sie 'node server.js'.");
    }
  };

  const logAction = useCallback((action: AuditLog['action'], entity: string, details: string) => {
    console.log(`Audit: ${action} - ${entity} - ${details}`);
    // Future: POST to /api/audit
  }, []);

  const queueData = async (type: 'reading' | 'form', data: any) => {
    if (type === 'reading') {
      setReadings(prev => [data, ...prev]);
      await fetch(`${API_BASE}/readings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify(data)
      });
    }
    // Handle form responses similarly
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setAuthToken(null);
  };

  if (!isAuthenticated || !currentUser) {
    return (
      <Login 
        t={translations[language]} 
        currentLanguage={language} 
        onLanguageChange={setLanguage} 
        onLogin={handleLogin} 
        users={[]} // Handled by API
        legalTexts={legalTexts}
      />
    );
  }

  const renderAdminContent = () => {
    const t = translations[language];
    switch (activeTab) {
      case AdminTab.USERS: return <UsersPage t={t} currentUser={currentUser} users={users} setUsers={setUsers} facilities={facilities} onLog={logAction} />;
      case AdminTab.FACILITIES: return <FacilitiesPage t={t} facilities={facilities} setFacilities={setFacilities} facilityTypes={facilityTypes} cookingMethods={cookingMethods} users={users} onLog={logAction} />;
      case AdminTab.REFRIGERATORS: return <RefrigeratorsPage t={t} facilities={facilities} setFacilities={setFacilities} fridges={fridges} setFridges={setFridges} fridgeTypes={fridgeTypes} users={users} setUsers={setUsers} setAssignments={setAssignments} onLog={logAction} setAlerts={setAlerts} />;
      case AdminTab.MENUS: return <MenusPage t={t} menus={menus} setMenus={setMenus} />;
      case AdminTab.FORM_CREATOR: return <FormCreatorPage t={t} forms={forms} setForms={setForms} />;
      case AdminTab.ASSIGNMENTS: return <AssignmentsPage t={t} assignments={assignments} setAssignments={setAssignments} users={users} facilities={facilities} forms={forms} menus={menus} facilityTypes={facilityTypes} onTabChange={setActiveTab as any} />;
      case AdminTab.REPORTS: return <ReportsPage t={t} currentUser={currentUser} readings={readings} formResponses={formResponses} menus={menus} fridges={fridges} users={users} facilities={facilities} excludedFacilities={excludedFacilities} forms={forms} assignments={assignments} />;
      case AdminTab.FACILITY_ANALYTICS: return <FacilityAnalyticsPage t={t} facilities={facilities} alerts={alerts} readings={readings} facilityTypes={facilityTypes} />;
      case AdminTab.REMINDERS: return <RemindersPage t={t} reminders={reminders} setReminders={setReminders} onLog={logAction} />;
      case AdminTab.SETTINGS: return (
        <SettingsPage 
          t={t} facilities={facilities} fridgeTypes={fridgeTypes} setFridgeTypes={setFridgeTypes} 
          cookingMethods={cookingMethods} setCookingMethods={setCookingMethods} 
          facilityTypes={facilityTypes} setFacilityTypes={setFacilityTypes} 
          holidays={holidays} setHolidays={setHolidays} 
          excludedFacilities={excludedFacilities} setExcludedFacilities={setExcludedFacilities}
          legalTexts={legalTexts} setLegalTexts={setLegalTexts}
        />
      );
      case AdminTab.BACKUP_SYNC: return <BackupSyncPage t={t} users={users} setUsers={setUsers} facilities={facilities} setFacilities={setFacilities} currentUser={currentUser} onLog={logAction} facilityTypes={facilityTypes} cookingMethods={cookingMethods} />;
      case AdminTab.AUDIT_LOGS: return <AuditLogsPage t={t} logs={auditLogs} />;
      default: 
        return (
          <div className="space-y-10 animate-in fade-in duration-700 text-left pb-16">
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center md:items-start justify-between gap-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
               <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8 z-10">
                  <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center p-4 shadow-inner">
                     <img src={LOGO_URL} className="w-full h-full object-contain" alt="Logo" />
                  </div>
                  <div className="text-center md:text-left">
                     <h1 className="text-4xl font-black text-slate-900 dark:text-white italic tracking-tighter leading-none mb-2 uppercase">gourmetta</h1>
                     <span className="text-2xl font-bold text-slate-400 dark:text-slate-500 tracking-tight">Management Zentrale</span>
                  </div>
               </div>
            </div>
            {/* KPI Stats Here */}
          </div>
        );
    }
  };

  return (
    <div className="relative">
      {currentUser?.role === 'Admin' || currentUser?.role === 'Manager' || currentUser?.role === 'SuperAdmin' ? (
        <DashboardLayout t={translations[language]} currentUser={currentUser} activeTab={activeTab as AdminTab} onTabChange={setActiveTab} onLogout={handleLogout} language={language} onLanguageChange={setLanguage} alerts={alerts}>
          {renderAdminContent()}
        </DashboardLayout>
      ) : (
        <UserDashboardLayout t={translations[language]} activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} language={language} onLanguageChange={setLanguage} assignments={assignments} currentUser={currentUser!} formResponses={formResponses} readings={readings} holidays={holidays} isOnline={isOnline} isSyncing={isSyncing} facilities={facilities} facilityTypes={facilityTypes}>
          {activeTab === 'user_workspace' ? <UserWorkspace t={translations[language]} user={currentUser} fridges={fridges} menus={menus} assignments={assignments} readings={readings} onSave={(d) => queueData('reading', d)} fridgeTypes={fridgeTypes} cookingMethods={cookingMethods} facilities={facilities} excludedFacilities={excludedFacilities} facilityTypes={facilityTypes} onViolation={(alert) => setAlerts(prev => [...prev, alert])} formResponses={formResponses} /> :
           activeTab === 'user_forms' ? <UserForms t={translations[language]} user={currentUser} forms={forms} assignments={assignments} excludedFacilities={excludedFacilities} facilityTypes={facilityTypes} facilities={facilities} onSave={(d) => queueData('form', d)} formResponses={formResponses} /> :
           <UserReports t={translations[language]} user={currentUser} readings={readings} menus={menus} fridges={fridges} fridgeTypes={fridgeTypes} cookingMethods={cookingMethods} facilities={facilities} assignments={assignments} formResponses={formResponses} excludedFacilities={excludedFacilities} forms={forms} facilityTypes={facilityTypes} />}
        </UserDashboardLayout>
      )}
    </div>
  );
};

export default App;
