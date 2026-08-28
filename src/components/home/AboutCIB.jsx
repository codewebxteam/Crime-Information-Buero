import React from 'react';
import { Shield, Users, FileText, Eye, Fingerprint, Handshake, Zap, Scale, UsersRound, Flag, GraduationCap, Heart, AlertOctagon } from 'lucide-react';

const features = [
  { title: "Crime Intelligence", desc: "Keeping a close watch on criminals and their activities.", icon: Fingerprint },
  { title: "Public Support", desc: "Providing guidance to the public for legal aid and protection.", icon: Handshake },
  { title: "Action Network", desc: "Eradicating corruption from the root with local administration.", icon: Zap },
  { title: "Legal Awareness", desc: "Making citizens aware of their rights and duties.", icon: Scale }
];

const joinRules = [
  { icon: UsersRound, text: "Your age must be above 21 years" },
  { icon: Flag, text: "You must be an Indian citizen with national service spirit" },
  { icon: GraduationCap, text: "Your education must be above intermediate" },
  { icon: Heart, text: "Both male and female can join this organization" },
  { icon: FileText, text: "Aadhar Card, Election Card and Police Verification are mandatory" },
  { icon: AlertOctagon, text: "Discussing caste or religion in the organization will be considered illegal" },
];

export default function AboutCIB() {
  const democracyContent = `Our democracy is a system that works for all religions. All Indian citizens are bound by the rules of the constitution which includes the judiciary, executive and legislature. Today, our society is seeing the growth of crime, violence and corruption. The youth of the country need to come forward to address these issues.`;

  const formationContent = `Crime Information Bureau was formed on 28 September 2012 under the Indian Act Section 1882. The main objective of this organization is to bring youth forward in creating a violence and corruption free India.`;

  return (
    <section className="py-24 bg-[#f8f9fa] dark:bg-[#0a0a0a] transition-colors duration-500 overflow-hidden relative">
      
      {/* Background Subtle Decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-700/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#002B5B]/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-[1400px] mx-auto px-6">
        
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h4 className="text-red-700 font-black uppercase tracking-[0.3em] text-sm mb-4">Who We Are</h4>
          <h2 className="text-5xl md:text-7xl font-[1000] text-[#002B5B] dark:text-white uppercase tracking-tighter leading-none mb-6">
            About <span className="text-red-700">CIB</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg md:text-xl max-w-4xl mx-auto leading-relaxed font-medium">
            {democracyContent}
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {[
            { number: "29", label: "States", icon: MapPin },
            { number: "700+", label: "Districts", icon: Shield },
            { number: "50K+", label: "Members", icon: Users },
            { number: "2012", label: "Established", icon: Calendar }
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-[#111] p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-white/5 text-center">
              <stat.icon className="w-8 h-8 text-red-700 mx-auto mb-3" />
              <p className="text-4xl font-black text-[#002B5B] dark:text-white">{stat.number}</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Formation Section */}
        <div className="bg-white dark:bg-[#111] rounded-[3rem] p-8 md:p-16 shadow-2xl border border-gray-100 dark:border-white/5 mb-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h4 className="text-red-700 font-black uppercase tracking-[0.3em] text-sm mb-4">Our Foundation</h4>
              <h3 className="text-3xl md:text-4xl font-[1000] text-[#002B5B] dark:text-white uppercase tracking-tighter mb-6">
                How We Started
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                {formationContent}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { year: "2012", event: "Organization Founded" },
                { year: "1882", event: "Act Reference" },
                { year: "29", event: "States Coverage" },
                { year: "100%", event: "Dedication" }
              ].map((item, i) => (
                <div key={i} className="bg-[#f8f9fa] dark:bg-white/5 p-4 rounded-xl">
                  <p className="text-2xl font-black text-red-700">{item.year}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs font-bold uppercase">{item.event}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-24">
          <h3 className="text-3xl md:text-4xl font-[1000] text-[#002B5B] dark:text-white uppercase tracking-tighter text-center mb-12">
            Our <span className="text-red-700">Mission</span>
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="bg-white dark:bg-[#111] p-8 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm hover:border-red-700 transition-all" whileHover={{ y: -5 }}>
                <div className="p-4 bg-red-700 text-white rounded-xl w-fit mb-4">
                  <feature.icon size={24} />
                </div>
                <h4 className="text-lg font-black text-[#002B5B] dark:text-white uppercase mb-2">{feature.title}</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Join Rules Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-24">
          <div className="bg-white dark:bg-[#111] p-10 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
            <h3 className="text-2xl font-black text-[#002B5B] dark:text-white uppercase mb-6 border-b-2 border-red-700 pb-2 flex items-center gap-3">
              <Shield className="text-red-700" /> Membership Criteria
            </h3>
            <div className="space-y-4">
              {joinRules.map((rule, i) => (
                <div key={i} className="flex items-center gap-3">
                  <rule.icon className="text-red-700 shrink-0" size={18} />
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{rule.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#002B5B] to-[#001a3d] dark:from-red-900 dark:to-red-800 p-10 rounded-2xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
            <div className="relative z-10">
              <Shield className="w-16 h-16 mb-6" />
              <h3 className="text-2xl font-black uppercase mb-4">Join The Movement</h3>
              <p className="text-white/80 mb-6 leading-relaxed">
                Become a part of India's largest citizen-driven crime prevention organization. Together we can make India crime-free.
              </p>
              <a href="/user" className="inline-flex items-center gap-2 bg-red-700 hover:bg-white hover:text-red-700 px-6 py-3 rounded-xl font-black uppercase tracking-widest transition-all">
                Apply Now <ArrowRight size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Vision Section */}
        <div className="text-center">
          <h3 className="text-2xl md:text-3xl font-[1000] text-[#002B5B] dark:text-white uppercase tracking-tighter mb-6">
            Our <span className="text-red-700">Vision</span>
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-3xl mx-auto leading-relaxed font-medium italic">
            "A crime-free India where every citizen lives in peace, free from corruption and violence."
          </p>
        </div>

      </div>
    </section>
  );
}

// Missing icons mock for demo
const MapPin = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>;
const Calendar = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>;
const ArrowRight = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>;
