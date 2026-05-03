import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Globe, ShieldCheck, AlertCircle } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

const Login = () => {
  const [step, setStep] = useState('login'); // 'login' or 'security'
  const [securityCode, setSecurityCode] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // THE SECRET ADMIN CODE (You can change this or fetch it from a config)
  const ADMIN_SECRET_CODE = '858585'; 

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log('User signed in:', result.user);
      setStep('security');
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      setError('Failed to authenticate with Google');
    } finally {
      setLoading(false);
    }
  };

  const verifySecurityCode = (e) => {
    e.preventDefault();
    if (securityCode === ADMIN_SECRET_CODE) {
      // Success - Save to session/local storage
      localStorage.setItem('admin_auth', 'true');
      navigate('/');
    } else {
      setError('Invalid security code. Access denied.');
      setSecurityCode('');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden">
      {/* Premium Gradient Background */}
      <div className="absolute inset-0 bg-[#1A1A1A]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#E84545] via-[#E84545]/20 to-[#1A1A1A]"></div>
        
        {/* Animated Accent Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#E84545]/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#E84545]/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      </div>
      
      <div className="relative w-full max-w-md p-10">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 bg-accent-red rounded-3xl flex items-center justify-center shadow-red-glow mb-6 active:scale-95 transition-all">
            <span className="text-white font-black text-3xl">W</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2 uppercase font-outfit">WorkEase Admin</h1>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Platform Management Suite v1.2.0</p>
        </div>

        <div className="group relative p-[1px] rounded-[3rem] overflow-hidden shadow-2xl backdrop-blur-md">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10 opacity-30 group-hover:opacity-60 transition-opacity duration-500"></div>
          <div className="relative bg-white rounded-[calc(3rem-1px)] p-12 shadow-2xl">
            
            {step === 'login' ? (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="text-center mb-4">
                  <h2 className="text-2xl font-black text-[#1A1A1A] uppercase tracking-tight font-outfit">Admin Access</h2>
                  <p className="text-[10px] text-[#1A1A1A]/40 font-black uppercase tracking-widest mt-2">Sign in to manage the platform node</p>
                </div>

                {error && (
                  <div className="bg-danger/10 border border-danger/20 p-4 rounded-xl flex items-center space-x-3 text-danger mb-4">
                    <AlertCircle size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{error}</span>
                  </div>
                )}

                <button 
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full bg-[#1A1A1A] text-white hover:bg-[#1A1A1A]/90 py-5 rounded-2xl flex items-center justify-center space-x-3 transition-all font-black text-sm uppercase tracking-widest shadow-xl active:scale-[0.98]"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white animate-spin rounded-full"></div>
                  ) : (
                    <Globe size={20} className="text-accent-red" />
                  )}
                  <span>Continue with Google</span>
                </button>

                <p className="text-[9px] text-[#1A1A1A]/30 text-center font-black uppercase tracking-widest leading-relaxed">
                  Platform access requires authorized <br/> corporate Google credentials
                </p>
              </div>
            ) : (
              <form onSubmit={verifySecurityCode} className="space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="text-center">
                  <div className="w-16 h-16 bg-accent-red/10 border border-accent-red/20 text-accent-red rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldCheck size={32} />
                  </div>
                  <h2 className="text-2xl font-black text-[#1A1A1A] uppercase tracking-tight font-outfit">Security Check</h2>
                  <p className="text-[10px] text-[#1A1A1A]/40 font-black uppercase tracking-widest mt-2">Enter the secret admin override code</p>
                </div>

                {error && (
                  <div className="bg-danger/10 border border-danger/20 p-4 rounded-xl flex items-center justify-center space-x-3 text-danger text-center">
                    <span className="text-[10px] font-black uppercase tracking-widest">{error}</span>
                  </div>
                )}

                <div className="relative">
                  <input 
                    type="password" 
                    required
                    maxLength={6}
                    value={securityCode}
                    onChange={(e) => setSecurityCode(e.target.value)}
                    placeholder="••••••"
                    autoFocus
                    className="w-full bg-[#1A1A1A]/5 border border-[#1A1A1A]/10 rounded-2xl py-6 text-center text-3xl font-black tracking-[0.5em] focus:outline-none focus:border-accent-red transition-all text-[#1A1A1A] placeholder:text-[#1A1A1A]/10"
                  />
                </div>

                <div className="flex gap-4 pt-2">
                  <button 
                    type="button"
                    onClick={() => setStep('login')}
                    className="flex-1 text-[10px] font-black text-[#1A1A1A]/40 uppercase tracking-widest py-4 border border-[#1A1A1A]/5 rounded-2xl hover:bg-[#1A1A1A]/5"
                  >
                    Back
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] btn-primary !bg-accent-red hover:!bg-reddish-800 !py-4 shadow-red-glow"
                  >
                    Verify & Access
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="mt-10 text-center">
          <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
            Authorized Personnel Only
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
