import React, { useState } from "react";
import { motion } from "framer-motion";
import "./cib.css";
import logo from "../assets/logo.png";
import {
  Shield, Mail, Phone, MapPin, Send,
  Facebook, Twitter, Instagram, Youtube,
  BadgeCheck, Globe, Clock
} from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
  viewport: { once: true },
};

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", subject: "", message: "", agree: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Bureau Report Submitted:", formData);
  };

  return (
    <section className="py-20 bg-[#f8f9fa] dark:bg-[#0a0a0a] transition-colors duration-500 overflow-hidden relative">

      {/* Background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-700/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#002B5B]/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-[1400px] mx-auto px-6">

        {/* HEADER */}
        <motion.div
          className="flex flex-col md:flex-row items-center gap-10 mb-16 border-b-4 border-red-700 pb-10"
          {...fadeUp}
        >
          <div className="relative group shrink-0">
            <div className="absolute -inset-2 bg-red-700/20 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <img
              src={logo}
              alt="CIB Official Seal"
              className="w-28 h-28 md:w-36 md:h-36 object-contain bg-white dark:bg-[#111] p-4 rounded-xl border-2 border-[#002B5B] shadow-2xl relative z-10"
            />
          </div>

          <div className="text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-2 bg-[#002B5B] text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-3">
              <BadgeCheck size={14} className="text-red-500" /> Bureau Communication Portal
            </div>

            {/* FIXED SMALL HEADING */}
            <h1 className="text-3xl md:text-5xl font-black text-[#002B5B] dark:text-white uppercase tracking-tight mb-3 leading-tight">
              Contact <span className="text-red-700 italic">Bureau</span>
            </h1>

            <p className="text-sm md:text-base font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest max-w-2xl">
              Establishing a direct link between Citizens and Law Enforcement Intelligence.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* FORM */}
          <motion.div className="lg:col-span-7" {...fadeUp}>
            <div className="bg-white dark:bg-[#111] p-8 md:p-12 rounded-[2rem] shadow-xl border border-gray-100 dark:border-white/5">

              <h3 className="text-2xl font-black text-[#002B5B] dark:text-white uppercase mb-8 border-l-4 border-red-700 pl-6">
                Direct <span className="text-red-700">Intelligence</span> Report
              </h3>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="space-y-2 group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Full Name</label>
                  <input type="text" name="name" onChange={handleChange} required
                    placeholder="Enter your full name"
                    className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 p-4 rounded-xl text-sm font-bold outline-none
                    focus:border-red-700 focus:ring-2 focus:ring-red-700/20 transition-all group-hover:border-red-400" />
                </div>

                <div className="space-y-2 group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Official Email</label>
                  <input type="email" name="email" onChange={handleChange} required
                    placeholder="example@email.com"
                    className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 p-4 rounded-xl text-sm font-bold outline-none
                    focus:border-red-700 focus:ring-2 focus:ring-red-700/20 transition-all group-hover:border-red-400" />
                </div>

                <div className="space-y-2 group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Phone</label>
                  <input type="tel" name="phone" onChange={handleChange}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 p-4 rounded-xl text-sm font-bold outline-none
                    focus:border-red-700 focus:ring-2 focus:ring-red-700/20 transition-all group-hover:border-red-400" />
                </div>

                <div className="space-y-2 group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Subject</label>
                  <input type="text" name="subject" onChange={handleChange} required
                    placeholder="Nature of report"
                    className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 p-4 rounded-xl text-sm font-bold outline-none
                    focus:border-red-700 focus:ring-2 focus:ring-red-700/20 transition-all group-hover:border-red-400" />
                </div>

                <div className="space-y-2 md:col-span-2 group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Detailed Message</label>
                  <textarea name="message" onChange={handleChange} rows="5" required
                    placeholder="Provide detailed intelligence or complaint..."
                    className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 p-4 rounded-xl text-sm font-bold outline-none resize-none
                    focus:border-red-700 focus:ring-2 focus:ring-red-700/20 transition-all group-hover:border-red-400" />
                </div>

                <div className="md:col-span-2 flex items-start gap-3">
                  <input type="checkbox" name="agree" onChange={handleChange} required className="mt-1 accent-red-700" />
                  <label className="text-[11px] font-bold text-gray-400">
                    I confirm that the information provided is accurate and verifiable.
                  </label>
                </div>

                <button type="submit"
                  className="md:col-span-2 bg-[#002B5B] hover:bg-red-700 text-white font-black uppercase tracking-[0.25em] py-5 rounded-2xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3">
                  <Send size={18} /> Submit Transmission
                </button>

              </form>
            </div>
          </motion.div>

          {/* RIGHT SIDE */}
          <div className="lg:col-span-5 space-y-6">

            <motion.div className="bg-[#002B5B] text-white p-6 rounded-3xl shadow-xl" {...fadeUp}>
              <h4 className="text-lg font-black mb-4 flex items-center gap-2">
                <Globe className="text-red-500" /> Headquarters
              </h4>

              <p className="text-sm mb-2">Gorakhpur, Uttar Pradesh</p>
              <p className="text-sm">+91 94535 91912</p>
              <p className="text-sm">cibindia11@gmail.com</p>
            </motion.div>

            {/* MAP */}
            <motion.div className="rounded-3xl overflow-hidden shadow-lg" {...fadeUp}>
              <iframe
                title="Location Map"
                src="https://www.google.com/maps?q=26.753694,83.377111&z=15&output=embed"
                width="100%"
                height="260"
                style={{ border: 0 }}
                loading="lazy"
              ></iframe>
            </motion.div>

            <motion.div className="bg-white dark:bg-[#111] p-6 rounded-3xl shadow-sm" {...fadeUp}>
              <h4 className="text-sm font-black mb-4 flex items-center gap-2">
                <Clock className="text-red-700" /> Timings
              </h4>
              <p className="text-xs">Emergency: 24/7</p>
              <p className="text-xs">Office: 10 AM - 6 PM</p>
            </motion.div>

            <div className="flex justify-between items-center bg-red-700 p-5 rounded-3xl">
              <span className="text-white text-xs font-bold">Connect</span>
              <div className="flex gap-3">
                {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                  <a key={i} href="#" className="p-2 bg-white/20 rounded-lg text-white">
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-16 py-6 border-t text-center text-xs font-bold text-gray-400">
          © CIB INDIA • Jai Hind
        </div>

      </div>
    </section>
  );
};

export default Contact;