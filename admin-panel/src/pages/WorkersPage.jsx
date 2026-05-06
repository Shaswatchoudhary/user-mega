import React from 'react';
import PublicNavbar from '../components/PublicNavbar';
import { ShieldCheck, CheckCircle2, TrendingUp, Users, Smartphone, Clock, Award, Headphones } from 'lucide-react';

const WorkersPage = () => {
  return (
    <div className="bg-white min-h-screen font-outfit text-text-primary pt-20">
      <PublicNavbar />
      
      {/* Hero Section */}
      <section className="py-24 bg-reddish-900 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-accent-red/10 -skew-x-12 translate-x-32 hidden lg:block"></div>
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-sm font-black text-accent-red uppercase tracking-[0.4em] mb-6">Partner with us</h2>
              <h1 className="text-5xl lg:text-8xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-8">
                Empowering <br/> Professionals.
              </h1>
              <p className="text-xl text-white/60 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium mb-10">
                Join Kolhapur's largest community of skilled professionals. Get more jobs, earn more, and build your reputation with WorkEase.
              </p>
              <button className="bg-white text-reddish-900 px-12 py-6 rounded-2xl font-black uppercase tracking-widest shadow-premium hover:bg-accent-red hover:text-white transition-all">
                Join as a Partner
              </button>
            </div>
            <div className="flex-1 relative">
              <div className="bg-white/5 p-12 rounded-[4rem] border border-white/10 backdrop-blur-md">
                <div className="grid grid-cols-2 gap-8">
                  {[
                    { val: "20%", label: "Earnings Growth", icon: <TrendingUp /> },
                    { val: "500+", label: "Verified Partners", icon: <Users /> },
                    { val: "4.8/5", label: "Average Rating", icon: <Award /> },
                    { val: "24/7", label: "Partner Support", icon: <Headphones /> }
                  ].map((stat, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="text-accent-red mb-2">{stat.icon}</div>
                      <p className="text-4xl font-black text-white">{stat.val}</p>
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-24">
            <h2 className="text-sm font-black text-accent-red uppercase tracking-[0.4em] mb-4">Why Join Us?</h2>
            <h3 className="text-4xl lg:text-6xl font-black text-reddish-900 uppercase tracking-tighter">Your Success, Our Priority</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { 
                icon: <Smartphone />, 
                title: "Smart Booking", 
                desc: "Get real-time job notifications based on your location and expertise. Manage everything via the Workies app." 
              },
              { 
                icon: <Clock />, 
                title: "Work Your Way", 
                desc: "Full control over your schedule. Choose when you want to work and set your own availability." 
              },
              { 
                icon: <ShieldCheck />, 
                title: "Weekly Payments", 
                desc: "No more chasing payments. Get guaranteed weekly payouts directly into your bank account." 
              }
            ].map((benefit, i) => (
              <div key={i} className="p-10 rounded-[3rem] bg-[#FAFAFA] border border-reddish-900/5 hover:shadow-premium transition-all">
                <div className="w-16 h-16 bg-accent-red/10 rounded-2xl flex items-center justify-center text-accent-red mb-8">
                  {React.cloneElement(benefit.icon, { size: 32 })}
                </div>
                <h4 className="text-2xl font-black text-reddish-900 mb-4">{benefit.title}</h4>
                <p className="text-text-secondary leading-relaxed font-medium">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps to Join */}
      <section className="py-32 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col lg:flex-row items-center gap-24">
            <div className="flex-1">
              <h2 className="text-sm font-black text-accent-red uppercase tracking-[0.4em] mb-8">Onboarding Process</h2>
              <div className="space-y-12">
                {[
                  { step: "01", title: "Registration", desc: "Download the Workies app and create your professional profile." },
                  { step: "02", title: "Verification", desc: "Our team will verify your skills and perform a background check." },
                  { step: "03", title: "Onboarding", desc: "Get trained on our quality standards and app usage." },
                  { step: "04", title: "Start Earning", desc: "Go live on the platform and start receiving service requests." }
                ].map((step, i) => (
                  <div key={i} className="flex gap-8 group">
                    <span className="text-4xl font-black text-reddish-900/10 group-hover:text-accent-red/20 transition-colors">{step.step}</span>
                    <div>
                      <h5 className="text-xl font-black text-reddish-900 mb-2 uppercase tracking-widest">{step.title}</h5>
                      <p className="text-text-secondary font-medium leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <div className="relative">
                <div className="bg-reddish-900 p-12 rounded-[5rem] transform rotate-3 shadow-premium">
                  <h6 className="text-white font-black text-3xl mb-8 leading-tight">Ready to transform <br/> your professional <br/> career?</h6>
                  <ul className="space-y-4 mb-10">
                    {["Must be 18+ years old", "Valid ID proof (Aadhar/PAN)", "Proof of address in Kolhapur"].map((req, i) => (
                      <li key={i} className="flex items-center gap-4 text-white/60 font-black uppercase tracking-widest text-[10px]">
                        <CheckCircle2 size={16} className="text-accent-red" />
                        {req}
                      </li>
                    ))}
                  </ul>
                  <button className="bg-accent-red text-white w-full py-6 rounded-2xl font-black uppercase tracking-widest shadow-red-glow hover:bg-reddish-800 transition-all">
                    Register Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WorkersPage;
