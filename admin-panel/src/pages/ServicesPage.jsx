import React from 'react';
import PublicNavbar from '../components/PublicNavbar';
import { Smartphone, Zap, Users, MapPin, CheckCircle2, Star, Clock, ShieldCheck, Hammer, Sparkles } from 'lucide-react';

const ServicesPage = () => {
  return (
    <div className="bg-white min-h-screen font-outfit text-text-primary pt-20">
      <PublicNavbar />
      
      {/* Hero Section */}
      <section className="py-24 bg-[#FAFAFA] border-b border-reddish-900/5">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <h2 className="text-sm font-black text-accent-red uppercase tracking-[0.4em] mb-6">Our Portfolio</h2>
          <h1 className="text-5xl lg:text-7xl font-black text-reddish-900 uppercase tracking-tighter mb-8">
            Expert Services for <br/> Every Household
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed font-medium">
            From emergency repairs to premium grooming, we bring Kolhapur's most trusted professionals directly to your doorstep.
          </p>
        </div>
      </section>

      {/* Main Services Grid */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[
              { 
                icon: <Zap />, 
                title: "Electrician", 
                desc: "Certified electricians for wiring, installations, and fault repairs. Safe, reliable, and available for emergencies.",
                features: ["Safety certified", "Transparent pricing", "Emergency support"]
              },
              { 
                icon: <ShieldCheck />, 
                title: "Plumber", 
                desc: "Expert plumbers to fix leakages, install high-end fixtures, and handle complex drainage issues.",
                features: ["Quick turnaround", "Fair estimates", "Quality spares"]
              },
              { 
                icon: <Hammer />, 
                title: "Carpenter", 
                desc: "Custom furniture work, repairs, and woodwork maintenance by skilled local artisans.",
                features: ["Custom designs", "Reliable finish", "Material advice"]
              },
              { 
                icon: <Smartphone />, 
                title: "Appliance Repair", 
                desc: "Specialized AC, Refrigerator, and home appliance maintenance and repair services.",
                features: ["90-day warranty", "Pro equipment", "Odor removal"]
              },
              { 
                icon: <Sparkles />, 
                title: "Self-Care (Men)", 
                desc: "Premium salon and grooming services at home for men, using professional branded products.",
                features: ["Branded products", "Hygienic setup", "Pro stylists"]
              },
              { 
                icon: <Users />, 
                title: "Self-Care (Women)", 
                desc: "Luxury salon, spa, and beauty treatments delivered at home by certified female professionals.",
                features: ["Privacy assured", "Premium kits", "Expert care"]
              }
            ].map((service, i) => (
              <div key={i} className="group p-10 rounded-[3rem] bg-white border border-reddish-900/10 hover:shadow-premium transition-all">
                <div className="w-16 h-16 bg-accent-red/10 rounded-2xl flex items-center justify-center text-accent-red mb-8 group-hover:scale-110 transition-transform">
                  {React.cloneElement(service.icon, { size: 32 })}
                </div>
                <h3 className="text-2xl font-black text-reddish-900 mb-4">{service.title}</h3>
                <p className="text-text-secondary mb-8 leading-relaxed font-medium">{service.desc}</p>
                <div className="space-y-3">
                  {service.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <CheckCircle2 size={16} className="text-accent-red" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-32 bg-reddish-900 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 relative z-10 text-center">
          <h2 className="text-sm font-black text-accent-red uppercase tracking-[0.4em] mb-12">The WorkEase Standard</h2>
          <div className="grid md:grid-cols-3 gap-16">
            {[
              { icon: <ShieldCheck size={40} />, title: "Verified Pros", desc: "100% background-checked and skill-verified professionals." },
              { icon: <Clock size={40} />, title: "On-Time Arrival", desc: "We value your time. Guaranteed arrival within the slot." },
              { icon: <Star size={40} />, title: "Post-Service Warranty", desc: "Exclusive 30-day warranty on all repairs and services." }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="text-accent-red mb-6">{item.icon}</div>
                <h4 className="text-xl font-black text-white mb-4 uppercase tracking-widest">{item.title}</h4>
                <p className="text-white/60 leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-32 bg-white">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-4xl lg:text-6xl font-black text-reddish-900 mb-8 uppercase tracking-tighter">Ready to experience <br/> the best service?</h2>
          <button className="bg-accent-red text-white px-12 py-6 rounded-2xl font-black uppercase tracking-widest shadow-red-glow hover:bg-reddish-800 transition-all">
            Book a Service Now
          </button>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
