import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from '../context/NavigationContext';

const sections = [
  { id: 'hero-section', label: '01: ENTRY_AURA', short: 'ENTRY' },
  { id: 'archive-section', label: '02: BLUEPRINTS', short: 'PLAN' },
  { id: 'services-section', label: '03: MASTERY', short: 'CORE' },
  { id: 'archive-portfolio', label: '04: ARCHIVAL', short: 'WORK' },
  { id: 'contact-section', label: '05: INQUIRY', short: 'CHAT' }
];

const SideHUDNavigator = ({ activeSection: activeSectionProp, scrollProgress }) => {
  const { lenisRef } = useNavigation();
  const [activeSection, setActiveSection] = useState(activeSectionProp ?? sections[0].id);
  const trackRef = useRef(null);
  const [tooltipId, setTooltipId] = useState(null);
  const tooltipTimeoutRef = useRef(0);
  const isCoarsePointer = useMemo(() => {
    if (typeof window === 'undefined') return false;
    if (!window.matchMedia) return false;
    return window.matchMedia('(pointer: coarse)').matches;
  }, []);

  const progress = useMemo(() => {
    const value = typeof scrollProgress === 'number' ? scrollProgress : 0;
    if (!Number.isFinite(value)) return 0;
    return Math.min(1, Math.max(0, value));
  }, [scrollProgress]);

  useEffect(() => {
    if (activeSectionProp) return undefined;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, { threshold: 0.5 });

    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [activeSectionProp]);

  useEffect(() => {
    if (!activeSectionProp) return;
    setActiveSection(activeSectionProp);
  }, [activeSectionProp]);

  const scrollTo = (id) => {
     const target = `#${id}`;
     if (lenisRef?.scrollTo) {
       lenisRef.scrollTo(target, { duration: 1.4 });
       return;
     }
     document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        window.clearTimeout(tooltipTimeoutRef.current);
        tooltipTimeoutRef.current = 0;
      }
    };
  }, []);

  return (
    <div className="fixed right-4 md:right-12 top-1/2 -translate-y-1/2 z-[100] flex flex-col items-end gap-6 md:gap-10">
      
      {/* VERTICAL TRACK LINE */}
      <div ref={trackRef} className="absolute right-[3px] top-0 bottom-0 w-[1px] bg-white/5 pointer-events-none" />

      {/* SCROLL PROGRESS THUMB */}
      <motion.div
        className="absolute right-[3px] w-[7px] h-[7px] rounded-full border border-[#A68A64]/40 bg-black/30 shadow-[0_0_18px_rgba(166,138,100,0.35)] pointer-events-none translate-x-1/2 -translate-y-1/2"
        style={{ top: `${progress * 100}%` }}
        aria-hidden="true"
      />

      {sections.map((s) => (
        <div
          key={s.id}
          className="relative flex items-center group"
          onMouseEnter={() => {
            if (isCoarsePointer) return;
            setTooltipId(s.id);
          }}
          onMouseLeave={() => {
            if (isCoarsePointer) return;
            setTooltipId(null);
          }}
        >
          
          <motion.button
            onClick={() => {
              scrollTo(s.id);
              setTooltipId(s.id);
              if (tooltipTimeoutRef.current) window.clearTimeout(tooltipTimeoutRef.current);
              tooltipTimeoutRef.current = window.setTimeout(() => setTooltipId(null), 1200);
            }}
            className="flex items-center justify-center p-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-casa-bronze/70"
            aria-label={`Scroll to ${s.short}`}
          >
             {/* INDICATOR DOT */}
             <div className="relative flex items-center justify-center">
                <AnimatePresence>
                 {activeSection === s.id && (
                    <motion.div 
                       initial={{ opacity: 0, scale: 0 }}
                       animate={{ opacity: 1, scale: 1 }}
                       exit={{ opacity: 0, scale: 0 }}
                       className="absolute inset-[-6px] border border-[#A68A64]/30 rounded-full"
                    />
                  )}
                </AnimatePresence>
                
                <div className={`w-1.5 h-1.5 rounded-full z-10 transition-all duration-500 ${activeSection === s.id ? 'bg-[#A68A64] shadow-[0_0_12px_#A68A64]' : 'bg-white/10 group-hover:bg-white/40'}`} />
             </div>
          </motion.button>

          <AnimatePresence>
            {tooltipId === s.id && (
              <motion.div
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                className="pointer-events-none absolute right-10 whitespace-nowrap rounded-full border border-white/10 bg-black/60 px-3 py-2 backdrop-blur-md"
              >
                <span className="font-mono text-[9px] tracking-[0.35em] uppercase text-white/70">
                  {s.short}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* HOVER SCAN BAR */}
          <motion.div 
            className="absolute -right-4 w-[2px] h-full bg-[#A68A64] opacity-0 group-hover:opacity-100 transition-opacity"
            layoutId="scan-bar"
          />
        </div>
      ))}
    </div>
  );
};

export default React.memo(SideHUDNavigator);
