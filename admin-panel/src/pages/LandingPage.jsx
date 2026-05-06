import React from 'react';
import { 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Smartphone, 
  Users, 
  MessageCircle, 
  ChevronRight,
  ArrowRight,
  Star,
  MapPin,
  Zap,
  
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar.jsx';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white min-h-screen font-outfit text-text-primary overflow-x-hidden selection:bg-accent-red selection:text-white">
      <PublicNavbar />

      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 bg-[#FAFAFA] overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-accent-red/5 skew-x-12 translate-x-20 -z-0 hidden lg:block"></div>
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-accent-red/10 px-4 py-2 rounded-full mb-8">
                <Zap size={14} className="text-accent-red" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-red">Trusted by 10,000+ Homes</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-reddish-900 leading-[1.1] mb-8">
                Premium Home Services, <span className="text-accent-red underline decoration-red/20 underline-offset-8">Simplified.</span>
              </h1>
              <p className="text-lg text-text-secondary mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Connect with verified local professionals for everything from cleaning and repairs to premium grooming. Reliable, transparent, and always on time.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button className="w-full sm:w-auto bg-accent-red text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-reddish-800 transition-all shadow-red-glow flex items-center justify-center gap-3 group">
                  Get the App
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => navigate('/workers')}
                  className="w-full sm:w-auto bg-white border-2 border-reddish-900/10 text-reddish-900 px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-surface transition-all"
                >
                  Join as a Pro
                </button>
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-premium transform rotate-3 hover:rotate-0 transition-all duration-700">
                <img 
                  src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=1000" 
                  alt="Service Professional" 
                  className="w-full h-auto grayscale-[40%] group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
                />
              </div>
              {/* Floating Cards */}
              <div className="absolute -bottom-10 -left-10 bg-white p-6 rounded-3xl shadow-premium z-20 hidden xl:block border border-reddish-900/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center">
                    <CheckCircle2 className="text-green-500" size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Verification</p>
                    <p className="text-sm font-black text-reddish-900">100% SECURE</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WHY WORKIES? */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-24">
            <h2 className="text-sm font-black text-accent-red uppercase tracking-[0.4em] mb-4">Core Principles</h2>
            <p className="text-4xl font-black text-reddish-900 uppercase tracking-tighter">Why Thousands Trust WorkEase</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { 
                icon: <ShieldCheck size={40} />, 
                title: "Verified Experts", 
                desc: "Every professional undergoes a multi-step background verification process before joining our platform."
              },
              { 
                icon: <Clock size={40} />, 
                title: "Punctuality", 
                desc: "Time is valuable. We guarantee that your service provider will arrive within the scheduled window."
              },
              { 
                icon: <Star size={40} />, 
                title: "Premium Quality", 
                desc: "We maintain high service standards through continuous training and strict quality control measures."
              }
            ].map((feature, i) => (
              <div key={i} className="group p-10 rounded-[2.5rem] bg-[#FAFAFA] border border-transparent hover:border-accent-red/10 transition-all hover:bg-white hover:shadow-premium">
                <div className="text-accent-red mb-8 group-hover:scale-110 transition-transform origin-left">{feature.icon}</div>
                <h3 className="text-2xl font-black text-reddish-900 mb-4">{feature.title}</h3>
                <p className="text-text-secondary leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FOR PROFESSIONALS */}
      <section className="py-32 bg-reddish-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="flex-1 order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-sm">
                  <p className="text-4xl font-black text-accent-red mb-2">20%</p>
                  <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">More Earnings</p>
                </div>
                <div className="bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-sm mt-8">
                  <p className="text-4xl font-black text-accent-red mb-2">500+</p>
                  <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Daily Bookings</p>
                </div>
              </div>
            </div>
            <div className="flex-1 order-1 lg:order-2">
              <h2 className="text-sm font-black text-accent-red uppercase tracking-[0.4em] mb-4">For Workers</h2>
              <h3 className="text-5xl font-black text-white leading-tight mb-8">
                Grow Your Business With WorkEase
              </h3>
              <p className="text-white/60 text-lg mb-10 leading-relaxed">
                Join Kolhapur's fastest growing community of skilled professionals. Get access to thousands of customers, transparent payment tracking, and professional support.
              </p>
              <ul className="space-y-4 mb-12">
                {['Direct customer connections', 'Real-time booking management', 'Automated secure payments'].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-white font-black uppercase tracking-widest text-[11px]">
                    <div className="w-5 h-5 bg-accent-red rounded-full flex items-center justify-center">
                      <CheckCircle2 size={12} className="text-white" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => navigate('/workers')}
                className="bg-white text-reddish-900 px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-accent-red hover:text-white transition-all shadow-premium"
              >
                Become a Partner
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CONNECT WITH WORKIES */}
      <section className="py-32 bg-white" id="contact">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <div className="bg-reddish-900 p-16 lg:p-24 rounded-[4rem] relative overflow-hidden shadow-premium">
            <div className="absolute top-0 left-0 w-64 h-64 bg-accent-red/20 blur-[100px] -z-0"></div>
            <div className="relative z-10">
              <h2 className="text-4xl lg:text-6xl font-black text-white mb-8">Ready to Get Started?</h2>
              <p className="text-white/60 text-lg mb-12 max-w-2xl mx-auto">
                Join thousands of satisfied customers and professionals today. Experience the future of home services.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
                <a href="mailto:support@workies.in" className="flex items-center gap-4 text-white hover:text-accent-red transition-colors group">
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-accent-red/20">
                    <MessageCircle size={24} />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">Email Support</p>
                    <p className="font-black text-sm">support@workease.site</p>
                  </div>
                </a>
                <div className="h-10 w-[1px] bg-white/10 hidden sm:block"></div>
                <div className="flex items-center gap-4 text-white group">
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-accent-red/20">
                    <MapPin size={24} />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">Our HQ</p>
                    <p className="font-black text-sm">Kolhapur, Maharashtra</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-center gap-8">
                {['Facebook', 'Instagram', 'LinkedIn'].map(social => (
                  <a key={social} href="#" className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-white transition-colors">
                    {social}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="py-12 bg-white border-t border-reddish-900/5">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-accent-red rounded-xl flex items-center justify-center shadow-red-glow">
              <span className="text-white font-black text-xl">W</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-reddish-900">WorkEase Technologies</p>
          </div>
          <div className="flex gap-8">
            <Link to="/terms" className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-accent-red transition-colors">Terms</Link>
            <Link to="/privacy" className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-accent-red transition-colors">Privacy</Link>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">© 2026 Powered by InsForge</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
