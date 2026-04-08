import React, { useEffect, useCallback, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigation } from '../context/NavigationContext';

const Navbar = ({ hasExperienced, onExperience }) => {
  const { lenisRef } = useNavigation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleBtnRef = useRef(null);
  const firstMenuItemRef = useRef(null);
  const mobilePanelRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { name: 'Introduction', id: 'hero-section' },
    { name: 'About', id: 'mission-vision-wrapper' },
    { name: 'Process', id: 'archive-section' },
    { name: 'Expertise', id: 'services-section' },
    { name: 'Portfolio', id: 'archive-portfolio' }
  ];

  const scrollTo = useCallback((id) => {
    if (!hasExperienced && id !== 'hero-section') {
       onExperience?.();
    }

    if (lenisRef?.scrollTo) {
       lenisRef.scrollTo(`#${id}`, { 
         duration: 2.5, 
         lock: true, 
         force: true 
       });
       return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, [hasExperienced, lenisRef, onExperience]);

  useEffect(() => {
    if (!isMenuOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) return;

    const onKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      setIsMenuOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) return;

    const onKeyDown = (e) => {
      if (e.key !== 'Tab') return;

      const panel = mobilePanelRef.current;
      if (!panel) return;

      const focusables = Array.from(
        panel.querySelectorAll(
          'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => el && el.offsetParent !== null);

      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (e.shiftKey) {
        if (active === first || !panel.contains(active)) {
          e.preventDefault();
          last.focus();
        }
        return;
      }

      if (active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const t = setTimeout(() => firstMenuItemRef.current?.focus?.(), 0);
    return () => clearTimeout(t);
  }, [isMenuOpen]);

  useEffect(() => {
    if (isMenuOpen) return;
    toggleBtnRef.current?.focus?.();
  }, [isMenuOpen]);

  return (
    <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-700 px-6 md:px-12 ${isScrolled ? 'py-4' : 'py-10'}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* BRAND SIGNATURE */}
        <div className="group cursor-pointer flex items-baseline gap-2.5 relative" onClick={() => scrollTo('hero-section')}>
           <h1 className="font-display text-white text-base md:text-xl tracking-wide leading-none group-hover:tracking-widest transition-all duration-700 flex items-baseline gap-2 uppercase">
             CASA <span className="italic font-light text-[#A68A64]">DESIGN</span>
           </h1>
        </div>

        {/* MOBILE/TABLET MENU TOGGLE */}
        <button
          type="button"
          className="lg:hidden pointer-events-auto relative h-11 w-11 rounded-full border border-white/10 bg-black/25 backdrop-blur-xl flex items-center justify-center hover:border-white/20 transition-colors"
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-nav-panel"
          onClick={() => setIsMenuOpen((v) => !v)}
          ref={toggleBtnRef}
        >
          <span className="sr-only">{isMenuOpen ? 'Close menu' : 'Open menu'}</span>
          <div className="flex flex-col gap-1.5">
            <span className="block h-[2px] w-5 bg-white/70" />
            <span className="block h-[2px] w-5 bg-white/70" />
            <span className="block h-[2px] w-5 bg-white/70" />
          </div>
        </button>

        {/* FLOATING GLASS BRIDGE NAVIGATION */}
        <div className="hidden lg:flex items-center gap-2 p-1.5 rounded-full border border-white/10 bg-black/40 backdrop-blur-2xl shadow-[0_40px_90px_-20px_rgba(0,0,0,0.88)] transition-all hover:border-white/15 group/nav">
           {links.map((link) => (
             <button
               key={link.id}
               onClick={() => scrollTo(link.id)}
               className="px-7 py-2.5 rounded-full font-body text-[9px] uppercase tracking-[0.35em] text-white/70 hover:text-white hover:bg-white/7 transition-all duration-500 relative overflow-hidden drop-shadow-[0_10px_24px_rgba(0,0,0,0.85)]"
             >
                <span className="relative z-10">{link.name}</span>
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-[#A68A64]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                />
             </button>
           ))}

           <div className="w-[1px] h-5 bg-white/5 mx-2" />
           
           <button 
             onClick={() => scrollTo('contact-section')}
             className="px-10 py-2.5 rounded-full border border-[#A68A64]/40 bg-[#A68A64]/10 text-white font-body text-[9px] uppercase tracking-[0.5em] hover:bg-[#A68A64] hover:text-black transition-all duration-700 group-hover/nav:scale-[1.02]"
           >
              Inquire
           </button>
         </div>

        {/* TERMINAL STATUS (RIGHT SIDE ON DESKTOP) */}
        <div className="hidden lg:flex items-center gap-4">
        </div>

      </div>

      {/* MOBILE/TABLET MENU PANEL */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.button
              type="button"
              className="fixed inset-0 z-[9400] bg-black/70 backdrop-blur-[2px] lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              aria-label="Close menu overlay"
              onClick={() => setIsMenuOpen(false)}
            />

            <motion.div
              id="mobile-nav-panel"
              role="dialog"
              aria-modal="true"
              aria-label="Site navigation"
              ref={mobilePanelRef}
              className="fixed left-4 right-4 top-[88px] md:top-[104px] z-[9500] lg:hidden rounded-[28px] border border-white/10 bg-[rgba(10,10,10,0.78)] backdrop-blur-2xl shadow-[0_30px_90px_rgba(0,0,0,0.9)] overflow-hidden"
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.22, 0.9, 0.24, 1] }}
            >
              <div className="px-5 py-4">
                <div className="text-[8px] font-mono uppercase tracking-[0.55em] text-white/35">
                  Navigation
                </div>
              </div>
              <div className="h-px w-full bg-white/10" />

              <div className="p-4 flex flex-col gap-2">
                {links.map((link, idx) => (
                  <button
                    key={`m_${link.id}`}
                    type="button"
                    ref={idx === 0 ? firstMenuItemRef : undefined}
                    onClick={() => {
                      setIsMenuOpen(false);
                      scrollTo(link.id);
                    }}
                    className="w-full text-left px-5 py-4 rounded-2xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/10 transition-colors"
                  >
                    <div className="font-body text-[10px] uppercase tracking-[0.38em] text-white/80">
                      {link.name}
                    </div>
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    scrollTo('contact-section');
                  }}
                  className="mt-2 w-full px-5 py-4 rounded-2xl border border-[#A68A64]/40 bg-[#A68A64]/10 text-white font-body text-[10px] uppercase tracking-[0.5em] hover:bg-[#A68A64] hover:text-black transition-all duration-700"
                >
                  Inquire
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
