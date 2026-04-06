import React, { useState } from 'react';

const ContactForm = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await new Promise(resolve => setTimeout(resolve, 900));
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      console.error('Submission failed:', err);
      setStatus('error');
    }
  };

  return (
    <section
      className="w-[100vw] h-screen shrink-0 bg-[#0a0a0a] flex items-center justify-center overflow-hidden relative pointer-events-none"
      style={{ minHeight: '100vh' }}
    >
      <div className="absolute inset-0 bg-casa-charcoal pointer-events-none" />
      <div className="relative w-full max-w-5xl mx-auto px-8 md:px-16 py-20 pointer-events-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div>
            <p className="font-body text-casa-bronze tracking-[0.45em] uppercase text-[10px] font-semibold mb-6 opacity-90">
              Contact
            </p>
            <h2 className="font-display text-casa-cream text-4xl md:text-6xl tracking-tighter leading-[0.92]">
              Transform your space <span className="italic text-casa-bronze">today.</span>
            </h2>
            <p className="mt-6 font-body text-casa-cream/60 leading-relaxed text-sm md:text-base border-l border-casa-bronze/25 pl-7">
              Visit our showroom or connect with a designer online. Share your vision and we’ll curate a proposal that
              fits your space, timeline, and taste.
            </p>
            <div className="mt-10 flex gap-4 flex-wrap">
              <span className="inline-flex items-center rounded-full border border-casa-cream/10 bg-casa-cream/5 px-4 py-2">
                <span className="font-body text-casa-cream/70 tracking-[0.28em] uppercase text-[10px]">
                  Milan · Paris · London
                </span>
              </span>
              <span className="inline-flex items-center rounded-full border border-casa-bronze/35 bg-casa-bronze/10 px-4 py-2">
                <span className="font-body text-casa-cream/80 tracking-[0.28em] uppercase text-[10px]">
                  Casa Standard
                </span>
              </span>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-casa-cream/10 bg-casa-cream/5 backdrop-blur-3xl p-8 md:p-10 shadow-[0_16px_64px_rgba(0,0,0,0.5)]"
          >
            <div className="grid grid-cols-1 gap-5">
              <label className="block">
                <span className="sr-only">Name</span>
                <input
                  type="text"
                  placeholder="Name"
                  className="w-full bg-transparent border-b border-casa-cream/10 focus:border-casa-bronze/40 outline-none py-3 font-body text-casa-cream/80 tracking-wide"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </label>
              <label className="block">
                <span className="sr-only">Email</span>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full bg-transparent border-b border-casa-cream/10 focus:border-casa-bronze/40 outline-none py-3 font-body text-casa-cream/80 tracking-wide"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </label>
              <label className="block">
                <span className="sr-only">Message</span>
                <textarea
                  placeholder="Tell us about your space..."
                  className="w-full bg-transparent border-b border-casa-cream/10 focus:border-casa-bronze/40 outline-none py-3 font-body text-casa-cream/80 tracking-wide h-28 resize-none"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />
              </label>

              <button
                type="submit"
                className="magnetic-interactive mt-4 inline-flex items-center justify-center rounded-full border border-casa-bronze/45 bg-casa-bronze/85 hover:bg-casa-bronze transition-colors px-6 py-3"
              >
                <span className="font-body text-casa-charcoal tracking-[0.28em] uppercase text-[10px] font-semibold">
                  {status === 'loading' ? 'Sending…' : 'Schedule a Consultation'}
                </span>
              </button>

              {status === 'success' && (
                <p className="font-body text-casa-bronze/80 tracking-[0.28em] uppercase text-[9px]">
                  Message received. We’ll respond shortly.
                </p>
              )}
              {status === 'error' && (
                <p className="font-body text-red-400/80 tracking-[0.28em] uppercase text-[9px]">
                  Submission failed. Please try again.
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;

