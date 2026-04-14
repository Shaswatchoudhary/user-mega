import React, { useState, useEffect } from 'react';
import { 
  User, 
  Shield, 
  Activity, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar,
  Zap,
  Cpu,
  Globe,
  Lock,
  ArrowRight,
  Edit2,
  Save,
  CheckCircle2
} from 'lucide-react';
import api from '../utils/api';
import Avatar from '../components/Avatar';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Platform Administrator',
    email: 'admin@workease.com',
    role: 'Senior System Operations',
    location: 'Central Headquarters',
    hardwareId: 'WE-ADM-001',
    bio: 'Responsible for overseeing platform operations, verifying service providers, and managing user escalations across the WorkEase ecosystem.'
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/profile');
        if (response.data.data) {
          setProfile(response.data.data);
          localStorage.setItem('admin_profile', JSON.stringify(response.data.data));
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        const savedProfile = localStorage.getItem('admin_profile');
        if (savedProfile) {
          setProfile(JSON.parse(savedProfile));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      await api.patch('/profile', profile);
      localStorage.setItem('admin_profile', JSON.stringify(profile));
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      localStorage.setItem('admin_profile', JSON.stringify(profile));
      setIsEditing(false);
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full pt-40">
      <div className="animate-spin rounded-full h-16 w-16 border-t-[3px] border-accent-red shadow-red-glow"></div>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-1000 pb-20">
      <div className="flex justify-between items-end mb-12">
        <div>
          <p className="text-accent-red font-black text-[10px] uppercase tracking-[0.4em] mb-2">Platform Member Identity</p>
          <h1 className="text-4xl font-black text-text-primary tracking-tighter uppercase leading-none font-outfit">
            Account <span className="text-accent-red italic">Profile</span>
          </h1>
        </div>
        <button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={saveLoading}
          className={`btn-primary py-2 px-8 flex items-center shadow-red-glow ${isEditing ? '!bg-accent-red' : '!bg-reddish-900'} hover:!bg-accent-red transition-all`}
        >
          {saveLoading ? (
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
          ) : isEditing ? (
            <Save size={16} className="mr-2" />
          ) : (
            <Edit2 size={16} className="mr-2" />
          )}
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-8">
          <div className="card text-center !p-10 border border-border bg-white rounded-3xl group transition-all hover:border-accent-red/20 shadow-premium">
            <div className="relative inline-block mb-6">
              <Avatar 
                src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=256&auto=format&fit=crop" 
                initials="AS" 
                size="xl" 
                online={true} 
                ringColor="ring-accent-red/20" 
              />
            </div>
            
            {isEditing ? (
              <div className="space-y-4 text-left px-4">
                <input 
                  className="w-full bg-surface-light border border-border rounded-xl p-3 text-center font-black uppercase text-xl focus:border-accent-red outline-none transition-all font-outfit"
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                />
                <input 
                  className="w-full bg-surface-light border border-border rounded-xl p-2 text-center font-black uppercase text-[10px] text-accent-red tracking-widest outline-none"
                  value={profile.role}
                  onChange={(e) => setProfile({...profile, role: e.target.value})}
                />
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-black text-text-primary uppercase tracking-tight font-outfit group-hover:text-accent-red transition-colors">{profile.name}</h2>
                <p className="text-text-muted font-black text-xs tracking-[0.2em] uppercase mt-2 group-hover:text-text-primary transition-colors">{profile.role}</p>
              </>
            )}
            
            <div className="mt-8 pt-8 border-t border-border grid grid-cols-2 gap-4">
               <div className="text-center">
                  <p className="text-xl font-black text-accent-red">Admin</p>
                  <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mt-1">Status</p>
               </div>
               <div className="text-center border-l border-border">
                  <p className="text-xl font-black text-text-primary">Verified</p>
                  <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mt-1">Identity</p>
               </div>
            </div>
          </div>

          <div className="card !p-8 bg-white border border-border rounded-3xl transition-all hover:border-accent-red/20 shadow-premium">
             <h3 className="text-xs font-black text-text-primary uppercase tracking-[0.2em] mb-6 pb-4 border-b border-border flex items-center">
                <Shield size={14} className="mr-2 text-accent-red" />
                Platform Credentials
             </h3>
             <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-surface-light rounded-2xl border border-transparent hover:border-accent-red/20 hover:bg-white transition-all group">
                   <Mail size={16} className="text-accent-red" />
                   {isEditing ? (
                     <input 
                       className="flex-1 bg-transparent text-[10px] font-black text-text-secondary uppercase tracking-widest outline-none"
                       value={profile.email}
                       onChange={(e) => setProfile({...profile, email: e.target.value})}
                     />
                   ) : (
                     <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">{profile.email}</span>
                   )}
                </div>
                <div className="flex items-center space-x-4 p-4 bg-surface-light rounded-2xl border border-transparent hover:border-accent-red/20 hover:bg-white transition-all group">
                   <Globe size={16} className="text-accent-red" />
                   {isEditing ? (
                     <input 
                       className="flex-1 bg-transparent text-[10px] font-black text-text-secondary uppercase tracking-widest outline-none"
                       value={profile.location}
                       onChange={(e) => setProfile({...profile, location: e.target.value})}
                     />
                   ) : (
                     <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">{profile.location}</span>
                   )}
                </div>
                <div className="flex items-center space-x-4 p-4 bg-surface-light rounded-2xl border border-transparent hover:border-accent-red/20 transition-all group">
                   <Lock size={16} className="text-accent-red" />
                   <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Hardware ID: {profile.hardwareId}</span>
                </div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-10">
           <div className="card !p-10 border border-border bg-white rounded-3xl shadow-premium">
              <h3 className="text-xl font-black text-text-primary tracking-tight uppercase mb-10 font-outfit">Account Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="p-8 bg-surface-light rounded-3xl border border-border relative overflow-hidden group transition-all hover:border-accent-red/20">
                    <p className="text-[9px] font-black text-accent-red uppercase tracking-[0.3em] mb-4">Professional Summary</p>
                    {isEditing ? (
                      <textarea 
                        className="w-full bg-white border border-border rounded-xl p-3 text-xs text-text-secondary mt-3 outline-none focus:border-accent-red transition-all"
                        rows="4"
                        value={profile.bio}
                        onChange={(e) => setProfile({...profile, bio: e.target.value})}
                      />
                    ) : (
                      <p className="text-xs text-text-secondary mt-3 leading-relaxed font-sans">{profile.bio}</p>
                    )}
                 </div>
                 <div className="p-8 bg-reddish-900 rounded-3xl text-white relative overflow-hidden group border border-white/5 shadow-premium">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                       <Shield size={60} />
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40 mb-4">Account Status</p>
                    <h4 className="text-2xl font-black uppercase tracking-tighter text-white">Verified <span className="text-accent-red">Official</span></h4>
                    <p className="text-[11px] text-white/70 mt-3 leading-relaxed font-medium">Account identity has been verified through national documentation. Professional standards maintained.</p>
                 </div>
              </div>
           </div>

            <div className="card !p-10 border border-border bg-white rounded-3xl shadow-premium">
              <div className="flex justify-between items-center mb-10">
                 <div className="flex items-center space-x-3">
                    <Activity className="text-accent-red" size={20} />
                    <h3 className="text-xl font-black text-text-primary tracking-tight uppercase font-outfit">Recent Actions</h3>
                 </div>
              </div>

              <div className="space-y-4">
                 {[
                   { action: 'Admin Settings Updated', time: '2h ago', status: 'Success' },
                   { action: 'Provider Verification Core', time: '5h ago', status: 'Complete' },
                   { action: 'System Backup Initiated', time: '1d ago', status: 'Verified' }
                 ].map((act, i) => (
                    <div key={i} className="flex items-center justify-between p-5 rounded-3xl hover:bg-surface-light border border-transparent hover:border-border transition-all group">
                       <div className="flex items-center space-x-6">
                          <div className="w-1.5 h-1.5 bg-accent-red rounded-full transition-transform animate-pulse-red"></div>
                          <div>
                             <p className="text-sm font-black text-text-primary uppercase tracking-tight group-hover:text-accent-red transition-colors">{act.action}</p>
                             <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mt-1">{act.time}</p>
                          </div>
                       </div>
                       <span className="text-[9px] font-black text-accent-red uppercase tracking-widest bg-accent-red/5 px-4 py-1.5 rounded-lg border border-accent-red/10 transition-all group-hover:bg-accent-red group-hover:text-white">{act.status}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
