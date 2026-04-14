import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Cpu, 
  Shield, 
  Database, 
  Bell, 
  Globe, 
  Activity,
  Zap,
  Lock,
  RefreshCw,
  Sliders,
  Save,
  Monitor,
  UserCheck,
  ShieldAlert,
  ChevronRight,
  Download
} from 'lucide-react';
import api from '../utils/api';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('General Preferences');
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    autoApproveWorkers: false,
    sessionTimeout: 30,
    maintenanceMode: false,
    backupInterval: 'Daily',
    apiLogsRetention: 30,
    twoFactorAuth: false
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings');
        if (response.data.data) {
          const fetchedSettings = response.data.data;
          setSettings(prev => ({ ...prev, ...fetchedSettings }));
          localStorage.setItem('admin_settings', JSON.stringify(fetchedSettings));
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        const savedSettings = localStorage.getItem('admin_settings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      await api.patch('/settings', settings);
      localStorage.setItem('admin_settings', JSON.stringify(settings));
    } catch (error) {
       console.error('Error saving settings:', error);
       localStorage.setItem('admin_settings', JSON.stringify(settings));
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full pt-40">
      <div className="animate-spin rounded-full h-16 w-16 border-t-[3px] border-accent-red"></div>
    </div>
  );

  const sections = [
    { title: 'General Preferences', icon: <Monitor /> },
    { title: 'Security & Access', icon: <Shield /> },
    { title: 'Notifications', icon: <Bell /> },
    { title: 'Data Management', icon: <Database /> }
  ];

  return (
    <div className="animate-in fade-in duration-1000 pb-20">
      <div className="flex justify-between items-end mb-12">
        <div>
          <p className="text-accent-red font-black text-[10px] uppercase tracking-[0.4em] mb-2">Platform Administration</p>
          <h1 className="text-4xl font-black text-text-primary tracking-tighter uppercase leading-none font-outfit">
            System <span className="text-accent-red italic">Settings</span>
          </h1>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleSave}
            disabled={saveLoading}
            className="btn-primary py-2 px-8 flex items-center shadow-red-glow !bg-accent-red border border-white/10"
          >
            {saveLoading ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
            ) : (
              <Save size={16} className="mr-2" />
            )}
            {saveLoading ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-8">
           <div className="card !p-8 border border-border bg-white rounded-3xl shadow-premium">
              <h3 className="text-xs font-black text-text-primary uppercase tracking-[0.2em] mb-8 pb-4 border-b border-border flex items-center">
                <Sliders size={16} className="mr-3 text-accent-red" />
                Configuration Sections
              </h3>
              <div className="space-y-2">
                 {sections.map((mod, i) => (
                    <button 
                      key={i}
                      onClick={() => setActiveSection(mod.title)}
                      className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all ${activeSection === mod.title ? 'bg-reddish-900 text-white shadow-premium' : 'text-text-secondary hover:text-accent-red hover:bg-surface-light group'}`}
                    >
                       <div className="flex items-center space-x-4">
                          {React.cloneElement(mod.icon, { size: 18 })}
                          <span className="text-[10px] font-black uppercase tracking-widest">{mod.title}</span>
                       </div>
                       <ChevronRight size={14} className={`${activeSection === mod.title ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-all`} />
                    </button>
                 ))}
              </div>
           </div>

           <div className="card !p-10 bg-reddish-900 text-white border-white/5 rounded-3xl shadow-premium relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                 <ShieldAlert size={80} />
              </div>
              <h4 className="text-2xl font-black uppercase tracking-tighter mb-4 font-outfit relative z-10 text-white">Maintenance Mode</h4>
              <p className="text-xs opacity-70 mb-8 leading-relaxed font-medium relative z-10">Temporarily disable public access to the WorkEase platform for core database updates or scheduled maintenance.</p>
              <button 
                onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
                className={`w-full font-black py-4 rounded-xl uppercase tracking-widest text-[10px] transition-all relative z-10 ${settings.maintenanceMode ? 'bg-accent-red text-white shadow-red-glow' : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'}`}
              >
                 {settings.maintenanceMode ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode'}
              </button>
           </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
           <div className="card !p-10 border border-border bg-white rounded-3xl shadow-premium">
              <div className="flex justify-between items-center mb-10 pb-6 border-b border-border">
                 <h3 className="text-xl font-black text-text-primary tracking-tight uppercase font-outfit">{activeSection}</h3>
                 <span className="text-[10px] font-black text-text-primary uppercase tracking-widest flex items-center">
                    <div className="w-1.5 h-1.5 bg-accent-red rounded-full mr-2 animate-pulse-red"></div>
                    Registry Online
                 </span>
              </div>

              {activeSection === 'General Preferences' && (
                <div className="space-y-12 animate-in slide-in-from-bottom-2 duration-500">
                   <div className="space-y-4">
                      <div className="flex justify-between items-center">
                         <div>
                            <p className="text-sm font-black text-text-primary uppercase tracking-tight">Worker Auto-Approve</p>
                            <p className="text-[10px] text-text-muted mt-1 uppercase tracking-widest leading-none">Automatically approve new service provider registrations</p>
                         </div>
                         <div className="flex items-center space-x-4">
                            <span className="text-xs font-black text-accent-red">{settings.autoApproveWorkers ? 'Enabled' : 'Disabled'}</span>
                            <button 
                              onClick={() => setSettings({...settings, autoApproveWorkers: !settings.autoApproveWorkers})}
                              className={`w-12 h-6 rounded-full relative p-1 transition-all ${settings.autoApproveWorkers ? 'bg-accent-red shadow-red-glow' : 'bg-surface-light border border-border'}`}
                            >
                               <div className={`w-4 h-4 bg-white rounded-full transition-all ${settings.autoApproveWorkers ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </button>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <div className="flex justify-between items-center">
                         <div>
                            <p className="text-sm font-black text-text-primary uppercase tracking-tight">Session Timeout</p>
                            <p className="text-[10px] text-text-muted mt-1 uppercase tracking-widest leading-none">Inactivity duration before automatic administrative logout</p>
                         </div>
                         <div className="flex items-center space-x-6">
                            <input 
                              type="range" 
                              min="5"
                              max="120"
                              step="5"
                              className="w-32 accent-accent-red cursor-pointer" 
                              value={settings.sessionTimeout}
                              onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
                            />
                            <span className="text-xs font-black text-text-primary tabular-nums w-12">{settings.sessionTimeout}m</span>
                         </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-border">
                      <div className="space-y-3 p-6 bg-surface-light rounded-2xl border border-transparent hover:border-accent-red/20 transition-all">
                         <p className="text-[9px] font-black text-accent-red uppercase tracking-[0.2em]">Platform Version</p>
                         <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-black text-text-primary bg-white px-3 py-1 rounded-lg border border-border">v1.2.0-STABLE</span>
                         </div>
                      </div>
                      <div className="space-y-3 p-6 bg-surface-light rounded-2xl border border-transparent hover:border-accent-red/20 transition-all">
                         <p className="text-[9px] font-black text-accent-red uppercase tracking-[0.2em]">System Status</p>
                         <div className="flex items-center space-x-2">
                           <span className="px-3 py-1 bg-white text-accent-red text-[9px] font-black uppercase rounded-lg border border-accent-red/20">Operational</span>
                         </div>
                      </div>
                   </div>
                </div>
              )}

              {activeSection === 'Security & Access' && (
                <div className="space-y-12 animate-in slide-in-from-bottom-2 duration-500">
                  <div className="space-y-4">
                      <div className="flex justify-between items-center">
                         <div>
                            <p className="text-sm font-black text-text-primary uppercase tracking-tight">Two-Factor Authentication</p>
                            <p className="text-[10px] text-text-muted mt-1 uppercase tracking-widest leading-none">Add an extra layer of security to your admin account</p>
                         </div>
                         <div className="flex items-center space-x-4">
                            <span className="text-xs font-black text-accent-red">{settings.twoFactorAuth ? 'Active' : 'Disabled'}</span>
                            <button 
                              onClick={() => setSettings({...settings, twoFactorAuth: !settings.twoFactorAuth})}
                              className={`w-12 h-6 rounded-full relative p-1 transition-all ${settings.twoFactorAuth ? 'bg-accent-red shadow-red-glow' : 'bg-surface-light border border-border'}`}
                            >
                               <div className={`w-4 h-4 bg-white rounded-full transition-all ${settings.twoFactorAuth ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </button>
                         </div>
                      </div>
                   </div>
                   <div className="p-8 bg-surface-light rounded-3xl border border-border flex items-center justify-between group hover:border-accent-red/20 transition-all">
                     <div className="flex items-center space-x-4">
                       <Lock size={20} className="text-accent-red" />
                       <div>
                         <p className="text-xs font-black text-text-primary uppercase tracking-tight">Management Credentials</p>
                         <p className="text-[9px] text-text-muted uppercase tracking-widest">Last changed 42 days ago</p>
                       </div>
                     </div>
                     <button className="text-[10px] font-black text-accent-red uppercase tracking-widest hover:underline px-4 py-2 bg-white rounded-xl border border-border shadow-sm">Update Key</button>
                   </div>
                </div>
              )}

              {activeSection === 'Notifications' && (
                <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-8 bg-surface-light rounded-3xl border border-border flex items-center justify-between transition-all hover:border-accent-red/20">
                      <div className="flex items-center space-x-4">
                        <Mail size={18} className="text-accent-red" />
                        <span className="text-xs font-black uppercase tracking-tight">Email Notifications</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={settings.emailNotifications} 
                        onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                        className="accent-accent-red w-5 h-5 cursor-pointer"
                      />
                    </div>
                    <div className="p-8 bg-surface-light rounded-3xl border border-border flex items-center justify-between transition-all hover:border-accent-red/20">
                      <div className="flex items-center space-x-4">
                        <Bell size={18} className="text-accent-red" />
                        <span className="text-xs font-black uppercase tracking-tight">Push Notifications</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={settings.pushNotifications} 
                        onChange={(e) => setSettings({...settings, pushNotifications: e.target.checked})}
                        className="accent-accent-red w-5 h-5 cursor-pointer"
                      />
                    </div>
                  </div>
                  <div className="p-8 bg-surface-light rounded-3xl border border-border space-y-4">
                    <p className="text-[10px] font-black text-accent-red uppercase tracking-widest border-b border-white/40 pb-3">Administrative Alerts</p>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs font-black text-text-primary uppercase tracking-tight">Critical Security Alerts</span>
                      <span className="px-3 py-1 bg-accent-red text-white text-[9px] font-black uppercase rounded-lg shadow-red-glow">Mandatory</span>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'Data Management' && (
                <div className="space-y-12 animate-in slide-in-from-bottom-2 duration-500">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-4">
                        <p className="text-sm font-black text-text-primary uppercase tracking-tight">Backup Frequency</p>
                        <select 
                          className="w-full bg-surface-light border border-border rounded-xl p-4 text-xs font-black uppercase tracking-widest outline-none focus:border-accent-red transition-all"
                          value={settings.backupInterval}
                          onChange={(e) => setSettings({...settings, backupInterval: e.target.value})}
                        >
                          <option>Hourly</option>
                          <option>Daily</option>
                          <option>Weekly</option>
                        </select>
                     </div>
                     <div className="space-y-4">
                        <p className="text-sm font-black text-text-primary uppercase tracking-tight">Log Retention (Days)</p>
                        <input 
                          type="number" 
                          className="w-full bg-surface-light border border-border rounded-xl p-4 text-xs font-black uppercase tracking-widest outline-none focus:border-accent-red transition-all"
                          value={settings.apiLogsRetention}
                          onChange={(e) => setSettings({...settings, apiLogsRetention: parseInt(e.target.value)})}
                        />
                     </div>
                   </div>
                   <div className="p-8 bg-surface-light rounded-3xl border border-border flex items-center justify-between group hover:border-accent-red/20 transition-all">
                     <div className="flex items-center space-x-4">
                       <Database size={20} className="text-accent-red" />
                       <div>
                         <p className="text-xs font-black text-text-primary uppercase tracking-tight">Core Database Archive</p>
                         <p className="text-[9px] text-text-muted uppercase tracking-widest">Last Backup: Yesterday at 23:45</p>
                       </div>
                     </div>
                     <button className="text-[10px] font-black text-accent-red uppercase tracking-widest px-4 py-2 bg-white rounded-xl border border-border shadow-sm flex items-center hover:bg-accent-red hover:text-white transition-all">
                       <Download size={12} className="mr-1" /> Download
                     </button>
                   </div>
                </div>
              )}
           </div>

           <div className="p-10 bg-reddish-900/[0.03] rounded-[2.5rem] border border-reddish-900/10 flex items-center justify-between shadow-premium transition-all hover:border-danger/30">
              <div className="flex items-center space-x-6">
                 <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-accent-red shadow-premium">
                    <ShieldAlert size={28} />
                 </div>
                 <div>
                    <h3 className="text-xl font-black text-text-primary uppercase tracking-tight font-outfit">Emergency Reset</h3>
                    <p className="text-[11px] text-text-muted mt-1 uppercase tracking-widest font-medium">Re-initialize core system parameters to factory default.</p>
                 </div>
              </div>
              <button 
                className="px-8 py-4 bg-white border border-danger/20 text-danger text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-danger hover:text-white transition-all shadow-sm"
                onClick={() => alert("CONFIRMATION REQUIRED: This action cannot be undone.")}
              >
                Reset System
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
