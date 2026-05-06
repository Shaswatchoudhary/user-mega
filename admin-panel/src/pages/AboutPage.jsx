import React from 'react';
import PublicNavbar from '../components/PublicNavbar';
import { Target, Heart, Users, MapPin, CheckCircle2 } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="bg-white min-h-screen font-outfit text-text-primary pt-20">
      <PublicNavbar />
      
      {/* Hero Section */}
      <section className="py-32 bg-[#FAFAFA] overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-8 relative z-10 text-center">
          <h2 className="text-sm font-black text-accent-red uppercase tracking-[0.4em] mb-6">Our Story</h2>
          <h1 className="text-5xl lg:text-8xl font-black text-reddish-900 uppercase tracking-tighter leading-[0.9] mb-8">
            Redefining <br/> Home Services.
          </h1>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed font-medium mb-16">
            WorkEase was founded with a singular vision: to bring professional, high-quality, and transparent home services to the historic city of Kolhapur.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <img src="https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&q=80&w=800" alt="Cleaning" className="rounded-[3rem] shadow-premium h-64 w-full object-cover grayscale-[40%] hover:grayscale-0 transition-all" />
            <img src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800" alt="Repair" className="rounded-[3rem] shadow-premium h-64 w-full object-cover transform translate-y-8 grayscale-[40%] hover:grayscale-0 transition-all" />
            <img src="https://images.unsplash.com/photo-1521207418485-99c705420785?auto=format&fit=crop&q=80&w=800" alt="Salon" className="rounded-[3rem] shadow-premium h-64 w-full object-cover grayscale-[40%] hover:grayscale-0 transition-all" />
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col lg:flex-row gap-24 items-center">
            <div className="flex-1">
              <div className="p-16 bg-reddish-900 rounded-[4rem] text-white shadow-premium relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent-red/20 blur-3xl"></div>
                <h3 className="text-sm font-black text-accent-red uppercase tracking-[0.4em] mb-8">The Core</h3>
                <div className="space-y-12">
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <Target className="text-accent-red" size={24} />
                      <p className="text-xl font-black uppercase tracking-widest">Our Mission</p>
                    </div>
                    <p className="text-white/60 font-medium leading-relaxed">
                      To empower every skilled professional in Kolhapur with technology and to provide every household with premium, reliable service experiences.
                    </p>
                  </div>
                  <div className="h-[1px] bg-white/10 w-full"></div>
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <Heart className="text-accent-red" size={24} />
                      <p className="text-xl font-black uppercase tracking-widest">Our Values</p>
                    </div>
                    <p className="text-white/60 font-medium leading-relaxed">
                      Trust, transparency, and top-tier quality. We believe in building long-term relationships through exceptional service and fair opportunities.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-black text-accent-red uppercase tracking-[0.4em] mb-8">Why We Exist</h2>
              <h4 className="text-4xl lg:text-5xl font-black text-reddish-900 mb-8 leading-tight uppercase tracking-tighter">
                Built For Kolhapur, <br/> By Professionals.
              </h4>
              <p className="text-text-secondary text-lg mb-10 leading-relaxed font-medium">
                We noticed that while Kolhapur is rich with skilled talent, there was a gap in connecting these experts with families who value quality. WorkEase bridges this gap by providing a technology platform that ensures security, punctuality, and professional standards.
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-4xl font-black text-reddish-900 mb-2">500+</p>
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Verified Pros</p>
                </div>
                <div>
                  <p className="text-4xl font-black text-reddish-900 mb-2">10,000+</p>
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Happy Homes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-32 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-24">
            <h2 className="text-sm font-black text-accent-red uppercase tracking-[0.4em] mb-4">Local Impact</h2>
            <h3 className="text-4xl lg:text-6xl font-black text-reddish-900 uppercase tracking-tighter">More Than Just An App</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="p-12 rounded-[4rem] bg-white border border-reddish-900/5 hover:shadow-premium transition-all">
              <Users className="text-accent-red mb-8" size={48} />
              <h5 className="text-2xl font-black text-reddish-900 mb-4 uppercase tracking-widest">Empowering Local Pros</h5>
              <p className="text-text-secondary font-medium leading-relaxed">
                We provide our partners with skill training, financial literacy support, and a steady stream of income to ensure they thrive as independent business owners.
              </p>
            </div>
            <div className="p-12 rounded-[4rem] bg-white border border-reddish-900/5 hover:shadow-premium transition-all">
              <MapPin className="text-accent-red mb-8" size={48} />
              <h5 className="text-2xl font-black text-reddish-900 mb-4 uppercase tracking-widest">Rooted in Kolhapur</h5>
              <p className="text-text-secondary font-medium leading-relaxed">
                We understand the unique needs of our city. Our platform is tailored to the local service culture while elevating it to modern professional standards.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
