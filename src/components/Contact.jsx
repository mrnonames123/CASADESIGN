import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Contact = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', email: '', project: '' });

  const nextStep = () => setStep(s => Math.min(s + 1, 3));

  return (
    <section 
      id="contact-section"
      className="relative w-full min-h-[150vh] bg-[#050505] flex items-center justify-center overflow-hidden py-32 px-6 md:px-24"
    >
      {/* ELITE BACKGROUND (DESIGNER DESK) */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.15]">
        <img 
          src="/contact-bg.png" 
          alt="" 
          className="w-full h-full object-cover grayscale-[0.5] brightness-50 blur-[20px]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20 lg:gap-32">
        
        {/* TEXTUAL CONTENT */}
        <div className="flex-1 flex flex-col gap-10">
          <div className="flex items-center gap-4">
          </div>
          
          <h2 className="font-display text-white text-[clamp(2.5rem,7vw,4.5rem)] leading-[0.85] tracking-tighter">
            Let's design with <br /> <span className="italic text-[#A68A64] font-serif pr-3">certainty</span>.
          </h2>
          
          <p className="max-w-md font-body text-white/40 text-base leading-relaxed">
            Share your scope and constraints. We'll respond with a clear next step—timeline-first, detail-true. 
          </p>

          <div className="flex flex-col gap-4 p-8 border border-white/5 rounded-3xl bg-white/[0.01] backdrop-blur-md">
             <span className="text-[8px] font-mono text-[#A68A64] uppercase tracking-[0.4em]">Direct Link</span>
             <a href="mailto:studio@casadesign.ai" className="text-xl font-display italic text-white hover:text-[#A68A64] transition-colors">
                STUDIO@CASADESIGN.AI
             </a>
          </div>
        </div>

        {/* INTERACTIVE FORM CARD */}
        <div className="flex-1 w-full max-w-xl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.03] backdrop-blur-3xl p-10 lg:p-14 shadow-2xl flex flex-col gap-12"
          >
            {/* SUBMISSION FLOW INDICATOR */}
            <header className="flex items-center justify-between">
               <div className="flex flex-col gap-2">
                  <div className="w-48 h-[1px] bg-white/10 relative">
                     <motion.div 
                        className="absolute inset-0 bg-[#A68A64]"
                        animate={{ width: `${(step / 3) * 100}%` }}
                     />
                  </div>
               </div>
               <span className="font-mono text-[#A68A64] text-[10px] tracking-widest">{Math.round((step/3)*100)}%</span>
            </header>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col gap-10"
                >
                   <div className="flex items-baseline gap-4">
                      <span className="text-4xl font-display italic text-[#A68A64]">01</span>
                      <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Basics</span>
                   </div>
                   <input 
                     type="text" 
                     placeholder="Your Identity // Name"
                     className="w-full bg-transparent border-b border-white/10 py-4 font-body text-white focus:border-[#A68A64] transition-colors outline-none"
                   />
                   <input 
                     type="email" 
                     placeholder="Transmission Path // Email"
                     className="w-full bg-transparent border-b border-white/10 py-4 font-body text-white focus:border-[#A68A64] transition-colors outline-none"
                   />
                   <button 
                     onClick={nextStep}
                     className="mt-4 w-full py-5 rounded-full border border-[#A68A64]/30 bg-[#A68A64]/10 text-white font-body text-[10px] uppercase tracking-[0.5em] hover:bg-[#A68A64]/30 transition-all group overflow-hidden relative"
                   >
                      <span className="relative z-10 transition-transform group-hover:tracking-[0.8em]">Advance Sequence</span>
                      <motion.div className="absolute inset-0 bg-[#A68A64]/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-700" />
                   </button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col gap-10"
                >
                   <div className="flex items-baseline gap-4">
                      <span className="text-4xl font-display italic text-[#A68A64]">02</span>
                      <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Scope</span>
                   </div>
                   <textarea 
                     placeholder="Mission Constraints // Requirements"
                     rows="4"
                     className="w-full bg-transparent border-b border-white/10 py-4 font-body text-white focus:border-[#A68A64] transition-colors outline-none resize-none"
                   />
                   <button 
                     onClick={nextStep}
                     className="mt-4 w-full py-5 rounded-full border border-[#A68A64]/30 bg-[#A68A64]/10 text-white font-body text-[10px] uppercase tracking-[0.5em] hover:bg-[#A68A64]/30 transition-all group overflow-hidden relative"
                   >
                      <span className="relative z-10 transition-transform group-hover:tracking-[0.8em]">Finalize Metadata</span>
                   </button>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                   key="step3"
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="flex flex-col items-center justify-center text-center gap-8 py-10"
                >
                   <div className="w-20 h-20 rounded-full border border-[#A68A64] flex items-center justify-center mb-4">
                      <motion.div 
                         initial={{ scale: 0 }}
                         animate={{ scale: 1 }}
                         transition={{ type: "spring", damping: 10 }}
                         className="w-10 h-10 bg-[#A68A64] rounded-full"
                      />
                   </div>
                   <h3 className="font-display text-3xl text-white italic">Transmission Successful</h3>
                   <p className="text-white/40 font-body text-[10px] uppercase tracking-[0.4em] leading-loose">
                      The archive has received your parameters. <br /> Our studio will decrypt and respond within 24 standard cycles.
                   </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* TECHNICAL ACCENT */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#A68A64]/05 to-transparent pointer-events-none" />
          </motion.div>
        </div>

      </div>
    </section>
  );
};

export default Contact;
