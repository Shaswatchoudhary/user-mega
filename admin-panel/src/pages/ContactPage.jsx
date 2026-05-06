import React from 'react';
import PublicNavbar from '../components/PublicNavbar';
import { MessageCircle, Mail, MapPin, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';

const ContactPage = () => {
  return (
    <div className="bg-white min-h-screen font-outfit text-text-primary pt-20">
      <PublicNavbar />
      
      {/* Hero Section */}
      <section className="py-24 bg-[#FAFAFA] border-b border-reddish-900/5">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <h2 className="text-sm font-black text-accent-red uppercase tracking-[0.4em] mb-6">Contact Us</h2>
          <h1 className="text-5xl lg:text-7xl font-black text-reddish-900 uppercase tracking-tighter mb-8 leading-tight">
            We're Here <br/> To Support You
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed font-medium">
            Whether you're a customer with a question or a professional interested in joining us, our team is ready to help.
          </p>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col lg:flex-row gap-20">
            {/* Form Column */}
            <div className="flex-[1.5]">
              <div className="p-12 bg-white rounded-[4rem] border border-reddish-900/10 shadow-premium">
                <h3 className="text-2xl font-black text-reddish-900 mb-8 uppercase tracking-widest">Send Us A Message</h3>
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-4">Full Name</label>
                      <input type="text" className="w-full bg-[#FAFAFA] border border-transparent focus:border-accent-red/20 rounded-2xl p-5 font-medium outline-none transition-all" placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-4">Email Address</label>
                      <input type="email" className="w-full bg-[#FAFAFA] border border-transparent focus:border-accent-red/20 rounded-2xl p-5 font-medium outline-none transition-all" placeholder="john@example.com" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-4">Subject</label>
                    <select className="w-full bg-[#FAFAFA] border border-transparent focus:border-accent-red/20 rounded-2xl p-5 font-medium outline-none transition-all appearance-none">
                      <option>General Inquiry</option>
                      <option>Service Support</option>
                      <option>Partner Registration</option>
                      <option>Feedback</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-4">Message</label>
                    <textarea className="w-full bg-[#FAFAFA] border border-transparent focus:border-accent-red/20 rounded-2xl p-5 font-medium outline-none transition-all h-40 resize-none" placeholder="How can we help you today?"></textarea>
                  </div>
                  <button className="bg-accent-red text-white w-full py-6 rounded-2xl font-black uppercase tracking-widest shadow-red-glow hover:bg-reddish-800 transition-all flex items-center justify-center gap-3 group">
                    Send Message
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
              </div>
            </div>

            {/* Info Column */}
            <div className="flex-1 space-y-8">
              {[
                { icon: <Mail />, title: "Email Support", info: "support@workease.site", sub: "24/7 Response Time" },
                { icon: <MapPin />, title: "Our Headquarters", info: "Kolhapur, MH", sub: "Maharashtra, India" },
                { icon: <Clock />, title: "Office Hours", info: "9:00 AM - 7:00 PM", sub: "Monday - Saturday" }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-8 p-10 bg-[#FAFAFA] rounded-[3rem] border border-reddish-900/5 group hover:bg-white hover:shadow-premium transition-all">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-accent-red shadow-soft group-hover:scale-110 transition-transform shrink-0">
                    {React.cloneElement(item.icon, { size: 28 })}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">{item.title}</p>
                    <p className="text-xl font-black text-reddish-900 mb-1">{item.info}</p>
                    <p className="text-text-secondary font-medium text-sm">{item.sub}</p>
                  </div>
                </div>
              ))}
              
              <div className="p-10 bg-reddish-900 rounded-[3rem] text-white shadow-premium relative overflow-hidden">
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-accent-red/10 blur-3xl"></div>
                <h4 className="text-sm font-black text-accent-red uppercase tracking-[0.4em] mb-4">Quick Links</h4>
                <div className="space-y-4">
                  {["Frequently Asked Questions", "Terms of Service", "Privacy Policy"].map((link, i) => (
                    <a key={i} href="#" className="flex items-center gap-3 text-white/60 hover:text-white transition-all text-[11px] font-black uppercase tracking-widest">
                      <CheckCircle2 size={16} className="text-accent-red" />
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Map */}
      <section className="py-32 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-8">
          <div className="w-full h-[550px] bg-white rounded-[4rem] overflow-hidden shadow-premium border border-reddish-900/5 relative">
            <iframe 
              src="https://www.google.com/maps?q=Kolhapur,Maharashtra&output=embed" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="WorkEase Headquarters Kolhapur"
            ></iframe>
            {/* Map Overlay Badge */}
            <div className="absolute bottom-10 left-10 bg-reddish-900 text-white p-6 rounded-3xl shadow-premium z-10 border border-white/10 hidden md:block">
              <p className="text-[10px] font-black uppercase tracking-widest text-accent-red mb-2">Our Presence</p>
              <p className="text-sm font-black uppercase tracking-tight">Serving Kolhapur & Surrounding Areas</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
