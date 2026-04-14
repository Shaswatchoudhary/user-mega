import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Box, Globe, UserPlus } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    inviteCode: ''
  });
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    navigate('/');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-reddish-950 overflow-hidden">
      {/* Reddish Background Effects */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent-red/5 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent-red/10 rounded-full blur-[120px] animate-pulse delay-700"></div>
      
      <div className="relative w-full max-w-md p-10">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 bg-accent-red rounded-3xl flex items-center justify-center shadow-red-glow mb-6 active:scale-95 transition-all">
            <UserPlus size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2 uppercase font-outfit">Join WorkEase</h1>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Administrative Account Registration</p>
        </div>

        <div className="card-gradient group relative p-[1px] rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-red/50 via-transparent to-accent-red/50 opacity-20 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative bg-reddish-900 rounded-[calc(2.5rem-1px)] p-10 border border-white/5 max-h-[80vh] overflow-y-auto custom-scrollbar">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input 
                    type="text" 
                    required
                    placeholder="ENTER FULL NAME"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-accent-red/50 transition-all text-white placeholder:text-white/10"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input 
                    type="email" 
                    required
                    placeholder="ADMIN@WORKEASE.COM"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-accent-red/50 transition-all text-white placeholder:text-white/10"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Administrator Invite Code</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input 
                    type="password" 
                    required
                    placeholder="WE-XXXX-XXXX"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-accent-red/50 transition-all font-mono text-white placeholder:text-white/10"
                    value={formData.accessKey}
                    onChange={(e) => setFormData({...formData, accessKey: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full btn-primary group !py-4 !bg-accent-red hover:!bg-accent-red/80 !shadow-red-glow">
                  Create Account
                  <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </form>

            <div className="mt-8">
              <div className="relative flex items-center justify-center mb-6">
                <div className="absolute w-full h-[1px] bg-white/5"></div>
                <span className="relative bg-reddish-900 px-4 text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Quick Enrollment</span>
              </div>

              <div className="flex gap-4">
                <button className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-2xl flex items-center justify-center space-x-2 transition-all">
                  <Box size={18} className="text-white/40" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Box</span>
                </button>
                <button className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-2xl flex items-center justify-center space-x-2 transition-all">
                  <Globe size={18} className="text-white/40" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Google</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
            Already have an account? <Link to="/login" className="text-accent-red hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
