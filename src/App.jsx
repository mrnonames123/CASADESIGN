import React, { Suspense, useEffect, useRef, useState } from 'react';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { useGSAP } from '@gsap/react';
import Lenis from 'lenis';
import { Route, Routes, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

import { NavigationProvider, useNavigation } from './context/NavigationContext';
const SectionRoom = React.lazy(() => import('./components/SectionRoom'));
const Section3D = React.lazy(() => import('./components/Section3D'));
const SectionGallery = React.lazy(() => import('./components/SectionGallery'));
import SectionFooter from './components/SectionFooter';
import Preloader from './components/Preloader';
import Hero from './components/Hero';
import SayHelloUI from './components/SayHelloUI';
import Services from './components/Services';
import Portfolio from './components/Portfolio';
import Contact from './components/Contact';
import Navbar from './components/Navbar';
import ArchiveSection from './components/ArchiveSection';
import MainBackgroundCanvas from './components/MainBackgroundCanvas';
import CustomCursor from './components/CustomCursor';
const AIChatbot = React.lazy(() => import('./components/AIChatbot'));
import AboutPage from './pages/AboutPage';
import SideHUDNavigator from './components/SideHUDNavigator';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

function AppScene() {
  const containerRef = useRef(null);
  const [appLoaded, setAppLoaded] = useState(false);
  const [preloaderActive, setPreloaderActive] = useState(true);
  const [hasExperienced, setHasExperienced] = useState(false);
  const [heroTitleShown, setHeroTitleShown] = useState(false);
  // Keep a ref for high-frequency scroll updates so the 3D canvas doesn't re-render on every scroll tick.
  const scrollProgressRef = useRef(0);
  // UI can use a state snapshot (updated at most once per rAF).
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollRafRef = useRef(0);
  const [currentView, setCurrentView] = useState('hero-section'); 
  const { setLenisRef, lenisRef } = useNavigation();
  const hasExperiencedRef = useRef(hasExperienced);
  const gateMetricsRef = useRef({ active: false, progress: 0, time: 0, duration: 0, pastEnd: false });
  const [canvasMounted, setCanvasMounted] = useState(false);

  useEffect(() => {
    // Priority mounting to ensure no visual pop-in during preloader transition.
    setCanvasMounted(true);
  }, []);

  useEffect(() => {
    hasExperiencedRef.current = hasExperienced;
  }, [hasExperienced]);

  useEffect(() => {
    if (!hasExperienced) setHeroTitleShown(false);
  }, [hasExperienced]);

  useEffect(() => {
    const originalWarn = console.warn;
    console.warn = (...args) => {
      if (args[0]?.includes?.('THREE.Clock: This module has been deprecated')) return;
      originalWarn.apply(console, args);
    };

    document.body.style.background = '#0a0a0a';
  }, []);

  const handleExperience = () => {
    setHasExperienced(true);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    ScrollTrigger.clearScrollMemory();
    window.history.scrollRestoration = 'manual';

    if (!appLoaded) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const isTouchDevice =
      typeof window !== 'undefined' &&
      ((window.matchMedia && window.matchMedia('(pointer: coarse)').matches) ||
        navigator.maxTouchPoints > 0);

    const lenis = new Lenis({
      // Keep the "slow premium" feel, but avoid laggy/uneven scroll on phones.
      lerp: prefersReducedMotion ? 1 : (isTouchDevice ? 0.22 : 0.14),
      syncTouch: false,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.05,
      smoothWheel: !prefersReducedMotion,
      smoothTouch: !prefersReducedMotion && isTouchDevice,
      infinite: false,
    });

    setLenisRef(lenis);

    lenis.on('scroll', (e) => {
      ScrollTrigger.update();
      
      // Calculate global scroll progress for 3D state
      const progress = e.animatedScroll / (e.limit || 1);
      scrollProgressRef.current = progress;

      if (!scrollRafRef.current) {
        scrollRafRef.current = window.requestAnimationFrame(() => {
          scrollRafRef.current = 0;
          setScrollProgress(scrollProgressRef.current);
        });
      }

      // If users scroll on mobile/desktop, treat it as the "experience" intent and keep scrolling natural.
      if (!hasExperiencedRef.current && e.scroll > 40) {
        setHasExperienced(true);
      }

      // Reset when scrolling back to the very top
      if (e.scroll < 10 && hasExperiencedRef.current) {
        setHasExperienced(false);
      }
    });
    
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    return () => {
      if (scrollRafRef.current) {
        window.cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = 0;
      }
      lenis.destroy();
    };
  }, [appLoaded, setLenisRef]);

  // Initial Narrative Sequence (Act I: Delaying title) - handled in Hero.jsx
  // Act II: Transition (The Warp) - triggered onExperience

  useGSAP(() => {
    if (!appLoaded) return;

    // Visibility triggers for layout sections
    const sections = [
      { id: 'hero-section', label: '01: ENTRY_AURA', short: 'ENTRY' },
      { id: 'archive-section', label: '02: BLUEPRINTS', short: 'PLAN' },
      { id: 'services-section', label: '03: MASTERY', short: 'CORE' },
      { id: 'archive-portfolio', label: '04: ARCHIVAL', short: 'WORK' },
      { id: 'contact-section', label: '05: INQUIRY', short: 'CHAT' }
    ];

    sections.forEach(marker => {
      ScrollTrigger.create({
        trigger: `#${marker.id}`,
        start: 'top 80%',
        end: 'bottom 20%',
        onToggle: (self) => {
          if (self.isActive) setCurrentView(marker.id);
        }
      });
    });

    // SEQUENCE I: RED CARPET NARRATIVE PRECISION
    gsap.set('.vision-gate, .mission-gate, .culmination-gate', { autoAlpha: 0, y: 30 });
    gsap.set('.vision-title, .mission-title', { letterSpacing: '-0.02em' });
    gsap.set('.stat-item', { opacity: 0, scale: 0.8 });

    let gateTL;
    gateTL = gsap.timeline({
      scrollTrigger: {
        trigger: '#mission-vision-wrapper',
        start: 'top top',
        endTrigger: '#archive-section',
        end: 'bottom top',
        scrub: 2.2,
        invalidateOnRefresh: true,
        onEnter: () => { gateMetricsRef.current.pastEnd = false; },
        onEnterBack: () => { gateMetricsRef.current.pastEnd = false; },
        onLeave: () => { gateMetricsRef.current.pastEnd = true; },
        onLeaveBack: () => { gateMetricsRef.current.pastEnd = false; },
        onToggle: (self) => {
          gateMetricsRef.current.active = self.isActive;
        },
        onUpdate: (self) => {
          if (!gateTL) return;
          gateMetricsRef.current.active = self.isActive;
          gateMetricsRef.current.progress = self.progress;
          gateMetricsRef.current.time = gateTL.time();
          gateMetricsRef.current.duration = gateTL.duration();
        }
      }
    });

    gateTL
      // 1. PHASE 1: ELEVATING SPACES (LEFT)
      .to('.vision-gate', { autoAlpha: 1, y: 0, duration: 2 })
      .to('.vision-title', { letterSpacing: '0.005em', duration: 3, ease: 'power2.out' }, 0)
      .to('.vision-gate', { autoAlpha: 0, y: -40, duration: 1.5 }, 5)
      
      // 2. PHASE 2: TURNING IDEAS (RIGHT)
      .fromTo('.mission-gate', 
        { autoAlpha: 0, y: 40 },
        { autoAlpha: 1, y: 0, duration: 2, ease: 'power2.out' }, 
        7
      )
      .to('.mission-title', { letterSpacing: '0.005em', duration: 3, ease: 'power2.out' }, 7)
      .to('.mission-gate', { autoAlpha: 0, y: -40, filter: 'blur(10px)', duration: 1.5 }, 12)

      // 3. PHASE 3: THE CULMINATION (ABOUT & STATS)
      .to('.culmination-gate', { autoAlpha: 1, y: 0, duration: 2.5 }, 15)
      .to('.stat-item', { 
        opacity: 1, scale: 1, 
        stagger: 0.2, 
        duration: 1.5, 
        ease: 'back.out(1.7)' 
      }, 17)
      // 4. PHASE 4: THE HOLD (Giving the user time to read the About section)
      .to({}, { duration: 16 });
    // Fade and parallax for general sections
    gsap.utils.toArray('.casa-section').forEach(section => {
      gsap.fromTo(section, 
        { opacity: 0, y: 50 },
        { 
          opacity: 1, y: 0, 
          duration: 1.5, 
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 90%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });

  }, { scope: containerRef, dependencies: [appLoaded] });

  return (
    <div
      ref={containerRef}
      className={`min-h-screen bg-transparent text-[#FAF9F6] font-[Inter,sans-serif] font-light selection:bg-[#A68A64] selection:text-black relative`}
    >
      <div className="casa-grain"></div>
      
      {/* GLOBAL 3D CANVAS (Shared Camera & Lights) */}
      {!preloaderActive && (
        <MainBackgroundCanvas 
          scrollProgressRef={scrollProgressRef}
          scrollProgress={0}
          hasExperienced={hasExperienced}
          heroTitleShown={heroTitleShown}
          gateMetricsRef={gateMetricsRef}
        />
      )}

      <CustomCursor />

      {preloaderActive && (
        <Preloader
          onReady={() => setAppLoaded(true)}
          onExited={() => setPreloaderActive(false)}
        />
      )}

      {appLoaded && (
        <Navbar 
          hasExperienced={hasExperienced} 
          onExperience={handleExperience} 
        />
      )}
      {appLoaded && <SideHUDNavigator activeSection={currentView} scrollProgress={scrollProgress} />}

      {appLoaded && (
        <Suspense fallback={null}>
          <AIChatbot hasExperienced={hasExperienced} />
        </Suspense>
      )}

      <Helmet>
        <title>Casa Design | Architecture of Silence</title>
        <meta name="description" content="Cinematic luxury architectural design studio." />
      </Helmet>

      {/* SCROLLING NARRATIVE STACK */}
      <div id="scrolling-stack" className="relative">
        
        {/* ACT I: THE AURA */}
        <div id="hero-section" className="relative z-10">
          <Hero 
            animateIn={appLoaded && !preloaderActive} 
            onExperience={handleExperience}
            hasExperienced={hasExperienced}
            onTitleShown={() => setHeroTitleShown(true)}
          />
        </div>

        {/* ACT III & IV: THE RED CARPET INTRODUCTION (Vision, Mission & The Proof) */}
          <div id="mission-vision-wrapper" className="relative z-20">
           
           {/* PINNED NARRATIVE STACK */}
           <div className="pinned-content relative h-screen sticky top-0 flex flex-col items-center justify-center overflow-hidden pointer-events-none px-6 z-[25]">
             {/* Readability scrim (keeps typography consistent + visible over 3D) */}
            <div className="absolute inset-0 z-0 pointer-events-none backdrop-blur-[1.5px] bg-[radial-gradient(circle_at_50%_45%,rgba(0,0,0,0.30)_0%,rgba(0,0,0,0.74)_62%,rgba(0,0,0,0.94)_100%)]" />
            
            {/* STAGE 1: ELEVATING SPACES (LEFT ALIGNED) */}
            <div className="vision-gate absolute inset-0 z-10 flex flex-col items-start justify-center text-left px-8 md:px-12 lg:px-40">
                <div className="relative group">
                  <p className="font-mono text-[#A68A64] text-[9px] uppercase tracking-[0.5em] mb-6 opacity-85 font-bold flex items-center gap-4 drop-shadow-[0_10px_26px_rgba(0,0,0,0.85)]">
                    <span className="w-8 h-[1px] bg-[#A68A64]/30" /> // 01_THE_VISION
                  </p>
                 <div className="relative">
                   <motion.h2 
                     className="vision-title font-display italic text-[clamp(2.8rem,9vw,6.8vw)] text-white leading-[0.9] max-w-2xl tracking-[-0.03em] drop-shadow-[0_25px_60px_rgba(0,0,0,0.8)]"
                   >
                     Elevating <br/><span className="not-italic text-[#A68A64]">Spaces.</span>
                   </motion.h2>
                   
                    <div className="mt-12 w-full max-w-[85vw] md:max-w-sm glass-pill-premium p-8 rounded-[40px] border-l-4 border-l-[#A68A64]">
                      <p className="vision-desc font-body text-white/90 text-[12px] md:text-sm uppercase tracking-[0.32em] leading-[2] font-medium drop-shadow-[0_10px_22px_rgba(0,0,0,0.85)]">
                        Redefining interiors through <br/>the lens of <span className="text-white">architectural silence</span> and industrial warmth.
                      </p>
                    </div>
                 </div>
               </div>
            </div>

            {/* STAGE 2: TURNING IDEAS INTO REALITY (RIGHT SIDE BALANCE) */}
            <div className="mission-gate absolute inset-0 z-10 flex flex-col items-end justify-center text-right px-8 md:px-12 lg:px-40">
                <div className="relative group flex flex-col items-end">
                  <p className="font-mono text-[#A68A64] text-[9px] uppercase tracking-[0.5em] mb-6 opacity-85 font-bold flex items-center gap-4 drop-shadow-[0_10px_26px_rgba(0,0,0,0.85)]">
                    // 02_THE_MISSION <span className="w-8 h-[1px] bg-[#A68A64]/30" />
                  </p>
                 <div className="relative flex flex-col items-end">
                   <motion.h2 
                     className="mission-title font-display italic text-[clamp(2.8rem,9vw,6.8vw)] text-white leading-[0.9] max-w-2xl tracking-[-0.03em] drop-shadow-[0_25px_60px_rgba(0,0,0,0.8)]"
                   >
                     Turning Ideas <br/><span className="not-italic text-[#A68A64]">Into Reality.</span>
                   </motion.h2>
                   
                    <div className="mt-12 w-full max-w-[85vw] md:max-w-sm glass-pill-premium p-8 rounded-[40px] border-r-4 border-r-[#A68A64] text-right">
                      <p className="mission-desc font-body text-white/90 text-[12px] md:text-sm uppercase tracking-[0.32em] leading-[2] font-medium drop-shadow-[0_10px_22px_rgba(0,0,0,0.85)]">
                        Bridging the gap between <br/>pure <span className="text-white">conceptualization</span> and physical craftsmanship.
                      </p>
                    </div>
                 </div>
               </div>
            </div>

            {/* STAGE 3: THE CULMINATION (ABOUT & STATS) */}
            <div className="culmination-gate absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6 md:px-12">
               <div className="max-w-6xl w-full">
                 <div className="flex flex-col items-center mb-12">
                   <span className="text-[11px] md:text-sm uppercase tracking-[0.8em] text-[#A68A64] font-bold mb-6 flex items-center gap-6">
                     <span className="w-12 h-[1px] bg-[#A68A64]/40" /> THE DIGITAL ARTISAN <span className="w-12 h-[1px] bg-[#A68A64]/40" />
                   </span>
                   <h2
                     className="font-display text-[clamp(2.4rem,12vw,7.5vw)] leading-[0.85] text-white italic drop-shadow-[0_30px_90px_rgba(0,0,0,0.9)]"
                   >
                     About <span className="not-italic text-[#A68A64]">CASA</span>
                   </h2>
                 </div>
                 
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-stretch">
                    <div className="casa-about-card flex flex-col justify-center glass-pill-premium p-10 md:p-14 rounded-[50px] border border-white/10">
                      <p className="casa-about-copy text-white/90 font-body text-left text-base md:text-xl leading-relaxed tracking-wide">
                        CASA DESIGNS is built on engineering precision and artistic intuition. 
                        Every spatial visualization is a masterwork of light, texture, and 
                        craftsmanship, bridging the gap between digital ideation and physical built-environments.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-12 pt-16 border-t border-white/5 w-full">
                    {[
                      { l: "Proprietary Designs", v: "150+" },
                      { l: "Architectural Nodes", v: "12" },
                      { l: "Masterworks", v: "42" },
                      { l: "Archival Series", v: "04" }
                    ].map((s, i) => (
                      <div key={i} className="stat-item flex flex-col gap-2">
                        <span className="text-[18px] md:text-3xl font-display text-white italic">{s.v}</span>
                        <span className="casa-about-stat-label text-[7px] md:text-[9px] font-mono text-white/65 uppercase tracking-[0.4em] leading-tight">{s.l}</span>
                      </div>
                    ))}
                  </div>
                 </div>
               </div>
            </div>

          </div>

          {/* TOTAL SCROLL WEIGHT FOR THE RED CARPET SEQUENCE */}
          <div id="gate-scroll-track" className="h-[1600vh]" />
        </div>

        {/* ACT II/III: THE CRAFT (Archive detail) */}
        <div id="archive-section" className="relative z-10 casa-section">
          <ArchiveSection />
        </div>

        <div id="services-section" className="relative z-10 casa-section">
          <Services />
        </div>

        {/* ACT IV: THE PROOF */}
        <div id="archive-portfolio" className="relative z-10 casa-section">
          <Portfolio />
          <Suspense fallback={null}>
            <SectionGallery />
          </Suspense>
        </div>

        {/* ACT V: THE DIALOGUE */}
        <div id="contact-section" className="relative z-10 casa-section">
          <Contact />
          <SectionFooter />
        </div>

        {/* MAGNETIC SNAP STABILIZER */}
        <div className="snap-stop" />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        html, body { scroll-behavior: auto !important; height: auto; }
        ::-webkit-scrollbar { display: none; }
        .casa-section { min-height: 100vh; display: flex; flex-direction: column; justify-content: center; }
        .font-display { font-family: 'Playfair Display', serif !important; font-weight: 500; }
        .font-body { font-family: 'Inter', sans-serif !important; font-weight: 300; }
        body { font-family: 'Inter', sans-serif; font-weight: 300; background: #050505; }
        h2 { font-family: 'Playfair Display', serif; }
      `}} />
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <NavigationProvider>
        <Routes>
          <Route path="/" element={<AppScene />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </NavigationProvider>
    </HelmetProvider>
  );
}

export default App;
