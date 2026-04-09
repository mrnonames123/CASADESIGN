import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Contact = () => {
  const apiBase = useMemo(
    () => (import.meta?.env?.VITE_CHATBOT_API_URL || '').trim(),
    []
  );

  const resolvedApiBase = useMemo(() => {
    const trimmed = (apiBase || '').trim();
    if (!trimmed) return '';

    if (typeof window === 'undefined') return trimmed;

    const host = (window.location?.hostname || '').toLowerCase();
    const isLocalHost =
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '[::1]';

    const pointsToLocal =
      /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(trimmed);

    if (!isLocalHost && pointsToLocal) return '';
    return trimmed.replace(/\/+$/, '');
  }, [apiBase]);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    project: '',
    projectType: '',
    budgetRange: '',
    timeline: '',
    preferredContact: 'email',
    hp_website: ''
  });
  const [status, setStatus] = useState('idle'); // idle | sending | error | success | config
  const [errorMessage, setErrorMessage] = useState('');

  const nextStep = () => setStep(s => Math.min(s + 1, 3));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const canAdvance = useMemo(() => {
    if (status === 'sending') return false;
    if (step === 1) return formData.name.trim().length >= 2 && /\S+@\S+\.\S+/.test(formData.email.trim());
    if (step === 2) return formData.project.trim().length >= 2;
    return false;
  }, [formData.email, formData.name, formData.project, status, step]);

  const errors = useMemo(() => {
    if (step === 1) {
      const e = [];
      if (formData.name.trim() && formData.name.trim().length < 2) e.push('Name too short');
      if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email.trim())) e.push('Invalid email');
      return e;
    }
    if (step === 2) {
      if (formData.project.trim() && formData.project.trim().length < 2) return ['Brief too short'];
    }
    return [];
  }, [formData.email, formData.name, formData.project, step]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!canAdvance) return;

    setStatus('sending');
    setErrorMessage('');

    try {
      const endpoint = resolvedApiBase ? `${resolvedApiBase}/inquiry` : '/api/inquiry';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          message: formData.project.trim(),
          projectType: (formData.projectType || '').trim(),
          budgetRange: (formData.budgetRange || '').trim(),
          timeline: (formData.timeline || '').trim(),
          preferredContact: (formData.preferredContact || '').trim(),
          hp_website: formData.hp_website || ''
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 501) {
          setStatus('config');
          setStep(3);
          return;
        }
        throw new Error(errorData?.error || `Transmission failed (${response.status}).`);
      }

      setStatus('success');
      setStep(3); // Move to success step
      setFormData({
        name: '',
        email: '',
        project: '',
        projectType: '',
        budgetRange: '',
        timeline: '',
        preferredContact: 'email',
        hp_website: ''
      });
    } catch (err) {
      console.error('Contact error:', err);
      setStatus('error');
      setErrorMessage(err.message || 'The studio server is currently unreachable.');
    }
  };

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
                   <div className="flex flex-col gap-2">
                     {/* Honeypot (hidden) */}
                     <input
                       type="text"
                       name="hp_website"
                       tabIndex={-1}
                       autoComplete="off"
                       value={formData.hp_website}
                       onChange={handleInputChange}
                       className="hidden"
                     />
                     <input 
                       type="text" 
                       name="name"
                       value={formData.name}
                       onChange={handleInputChange}
                       placeholder="Full Name"
                       className="w-full bg-transparent border-b border-white/10 py-4 font-body text-white focus:border-[#A68A64] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-casa-bronze/70"
                     />
                     <input 
                       type="email" 
                       name="email"
                       value={formData.email}
                       onChange={handleInputChange}
                       placeholder="Email Address"
                       className="w-full bg-transparent border-b border-white/10 py-4 font-body text-white focus:border-[#A68A64] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-casa-bronze/70"
                     />
                   </div>

                   {errors.length > 0 && (
                     <p className="text-[#A68A64] text-[9px] uppercase tracking-widest animate-pulse">{errors.join(' • ')}</p>
                   )}

                   <button 
                     type="button"
                     onClick={() => {
                       if (!canAdvance) return;
                       nextStep();
                     }}
                     disabled={!canAdvance}
                     className="mt-4 w-full py-5 rounded-full border border-[#A68A64]/30 bg-[#A68A64]/10 text-white font-body text-[10px] uppercase tracking-[0.5em] hover:bg-[#A68A64]/30 transition-all group overflow-hidden relative disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-casa-bronze/70"
                   >
                      <span className="relative z-10 transition-transform group-hover:tracking-[0.8em]">
                        {!formData.name || !formData.email ? 'Enter Details' : errors.length ? 'Fix Errors' : 'Next Step'}
                      </span>
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

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <div className="flex flex-col gap-2">
                       <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">
                         Project Type
                       </span>
                       <select
                         name="projectType"
                         value={formData.projectType}
                         onChange={handleInputChange}
                         className="w-full bg-transparent border-b border-white/10 py-4 font-body text-white/90 focus:border-[#A68A64] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-casa-bronze/70"
                       >
                         <option value="" className="bg-[#050505]">
                           Select…
                         </option>
                         <option value="Interior design" className="bg-[#050505]">
                           Interior design
                         </option>
                         <option value="Architectural visualization" className="bg-[#050505]">
                           Architectural visualization
                         </option>
                         <option value="FF&E / Product" className="bg-[#050505]">
                           FF&amp;E / Product
                         </option>
                         <option value="Brand / Website" className="bg-[#050505]">
                           Brand / Website
                         </option>
                         <option value="Other" className="bg-[#050505]">
                           Other
                         </option>
                       </select>
                     </div>

                     <div className="flex flex-col gap-2">
                       <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">
                         Budget Range
                       </span>
                       <select
                         name="budgetRange"
                         value={formData.budgetRange}
                         onChange={handleInputChange}
                         className="w-full bg-transparent border-b border-white/10 py-4 font-body text-white/90 focus:border-[#A68A64] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-casa-bronze/70"
                       >
                         <option value="" className="bg-[#050505]">
                           Select…
                         </option>
                         <option value="Not sure yet" className="bg-[#050505]">
                           Not sure yet
                         </option>
                         <option value="Under $2k" className="bg-[#050505]">
                           Under $2k
                         </option>
                         <option value="$2k–$5k" className="bg-[#050505]">
                           $2k–$5k
                         </option>
                         <option value="$5k–$10k" className="bg-[#050505]">
                           $5k–$10k
                         </option>
                         <option value="$10k+" className="bg-[#050505]">
                           $10k+
                         </option>
                       </select>
                     </div>

                     <div className="flex flex-col gap-2">
                       <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">
                         Timeline
                       </span>
                       <select
                         name="timeline"
                         value={formData.timeline}
                         onChange={handleInputChange}
                         className="w-full bg-transparent border-b border-white/10 py-4 font-body text-white/90 focus:border-[#A68A64] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-casa-bronze/70"
                       >
                         <option value="" className="bg-[#050505]">
                           Select…
                         </option>
                         <option value="ASAP (1–2 weeks)" className="bg-[#050505]">
                           ASAP (1–2 weeks)
                         </option>
                         <option value="2–4 weeks" className="bg-[#050505]">
                           2–4 weeks
                         </option>
                         <option value="1–2 months" className="bg-[#050505]">
                           1–2 months
                         </option>
                         <option value="Flexible" className="bg-[#050505]">
                           Flexible
                         </option>
                       </select>
                     </div>

                     <div className="flex flex-col gap-2">
                       <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">
                         Preferred Contact
                       </span>
                       <select
                         name="preferredContact"
                         value={formData.preferredContact}
                         onChange={handleInputChange}
                         className="w-full bg-transparent border-b border-white/10 py-4 font-body text-white/90 focus:border-[#A68A64] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-casa-bronze/70"
                       >
                         <option value="email" className="bg-[#050505]">
                           Email
                         </option>
                         <option value="whatsapp" className="bg-[#050505]">
                           WhatsApp
                         </option>
                         <option value="phone" className="bg-[#050505]">
                           Phone call
                         </option>
                       </select>
                     </div>
                   </div>

                   <textarea 
                     name="project"
                     value={formData.project}
                     onChange={handleInputChange}
                     placeholder="Project brief (share scope, style, space, and any links). If you prefer WhatsApp/phone, include your number here."
                     rows="4"
                     className="w-full bg-transparent border-b border-white/10 py-4 font-body text-white focus:border-[#A68A64] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-casa-bronze/70 resize-none"
                   />

                   {errors.length > 0 && (
                     <p className="text-[#A68A64] text-[9px] uppercase tracking-widest text-center animate-pulse">{errors.join(' • ')}</p>
                   )}
                   {errorMessage && (
                     <p className="text-red-400 text-[9px] uppercase tracking-widest text-center">{errorMessage}</p>
                   )}

                   <div className="flex flex-col sm:flex-row gap-4">
                     <button
                       type="button"
                       onClick={prevStep}
                       disabled={status === 'sending'}
                       className="w-full py-5 rounded-full border border-white/10 bg-white/[0.03] text-white/70 font-body text-[10px] uppercase tracking-[0.5em] hover:bg-white/[0.06] transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-casa-bronze/70"
                     >
                       Back
                     </button>

                     <button 
                       type="button"
                       onClick={handleSubmit}
                       disabled={!canAdvance}
                       className="w-full py-5 rounded-full border border-[#A68A64]/30 bg-[#A68A64]/10 text-white font-body text-[10px] uppercase tracking-[0.5em] hover:bg-[#A68A64]/30 transition-all group overflow-hidden relative disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-casa-bronze/70"
                     >
                        <span className="relative z-10 transition-transform group-hover:tracking-[0.8em]">
                          {status === 'sending' ? 'Sending…' : !formData.project ? 'Describe Project' : errors.length ? 'Check Length' : 'Send Inquiry'}
                        </span>
                        <motion.div className="absolute inset-0 bg-[#A68A64]/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-700" />
                     </button>
                   </div>
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
                   {status === 'success' && (
                     <>
                       <h3 className="font-display text-3xl text-white italic">Message Sent</h3>
                       <p className="text-white/40 font-body text-[10px] uppercase tracking-[0.4em] leading-loose">
                         Your inquiry has been received. <br /> We will review the details and reach out within 24 hours.
                       </p>
                     </>
                   )}

                   {status === 'config' && (
                     <>
                       <h3 className="font-display text-3xl text-white italic">Almost Ready</h3>
                       <p className="text-white/40 font-body text-[10px] uppercase tracking-[0.4em] leading-loose">
                         Email delivery isn’t configured yet. Please email us at <a className="text-white underline underline-offset-4" href="mailto:studio@casadesign.ai">studio@casadesign.ai</a>.
                       </p>
                     </>
                   )}

                   {status === 'error' && (
                     <>
                       <h3 className="font-display text-3xl text-white italic">Transmission Failed</h3>
                       <p className="text-white/40 font-body text-[10px] uppercase tracking-[0.4em] leading-loose">
                         {errorMessage || 'Please try again.'}
                       </p>
                       <button
                         type="button"
                         onClick={() => {
                           setStatus('idle');
                           setErrorMessage('');
                           setStep(1);
                         }}
                         className="mt-2 px-8 py-4 rounded-full border border-[#A68A64]/35 bg-[#A68A64]/10 text-white font-body text-[10px] uppercase tracking-[0.5em] hover:bg-[#A68A64]/25 transition-colors"
                       >
                         Try again
                       </button>
                     </>
                   )}
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
