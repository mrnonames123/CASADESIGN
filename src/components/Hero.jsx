import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useNavigation } from '../context/NavigationContext';

const Hero = ({ animateIn = false, onExperience, hasExperienced, onTitleShown }) => {
  const { lenisRef } = useNavigation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const didNotifyTitleRef = useRef(false);

  // MOUSE PARALLAX
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { damping: 40, stiffness: 150 });
  const springY = useSpring(mouseY, { damping: 40, stiffness: 150 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const moveX = (clientX - window.innerWidth / 2) / 60;
      const moveY = (clientY - window.innerHeight / 2) / 60;
      mouseX.set(moveX);
      mouseY.set(moveY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  useEffect(() => {
    if (animateIn && !hasExperienced) {
      const timer = setTimeout(() => setShowTitle(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [animateIn, hasExperienced]);

  useEffect(() => {
    if (!animateIn || hasExperienced) {
      didNotifyTitleRef.current = false;
      setShowTitle(false);
    }
  }, [animateIn, hasExperienced]);

  useEffect(() => {
    if (!showTitle || didNotifyTitleRef.current) return;
    didNotifyTitleRef.current = true;
    onTitleShown?.();
  }, [onTitleShown, showTitle]);

  useEffect(() => {
    if (!hasExperienced) {
      setIsTransitioning(false);
    }
  }, [hasExperienced]);

  const handleExperience = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    onExperience?.();
    const target = '#mission-vision-wrapper';
    setTimeout(() => {
      if (lenisRef?.scrollTo) {
        lenisRef.scrollTo(target, { 
          duration: 3.2, 
          easing: (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
          lock: true,
          force: true
        });
        return;
      }
      document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
    }, 600);
  }, [lenisRef, onExperience, isTransitioning]);

  return (
    <section
      id="section-hero"
      className="relative w-full min-h-[170vh] bg-transparent overflow-hidden"
      style={{ zIndex: 2 }}
    >
      {/* GLOWING DYNAMIC AURA (Cursor Follower) - More pronounced */}
      <motion.div 
        className="fixed top-0 left-0 w-[60vw] h-[60vw] bg-[#A68A64]/10 rounded-full blur-[140px] pointer-events-none"
        style={{ 
          x: springX, 
          y: springY, 
          translateX: '-50%', 
          translateY: '-50%',
          opacity: showTitle ? 1 : 0
        }}
      />

      {/* VIEWPORT-RELATIVE STICKY CONTAINER */}
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden pointer-events-none">
        
        <motion.div
          className="relative flex flex-col items-center justify-center w-full h-[120vh]"
          style={{ zIndex: 10, x: springX, y: springY }}
          animate={isTransitioning ? { opacity: 0, y: -100, scale: 1.1, filter: 'blur(10px)' } : { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Main Title Centerpiece - Elevated Spatial Composition */}
          <div className="relative text-center px-6 -translate-y-[12vh]">
            <div className="relative z-10">
              <div className="relative z-10 flex flex-col items-center translate-y-[8vh]">
                <h1
                  className="casa-hero-title font-display font-medium antialiased flex flex-wrap justify-center gap-x-[0.1em] text-[clamp(4.2rem,14.5vw,10.2rem)] leading-[0.85] tracking-[-0.05em] uppercase px-4 select-none"
                >
                  {/* WORD 1: CASA */}
                  <div className="flex casa-shimmer-white">
                    {"CASA".split("").map((char, i) => (
                      <span
                        key={`c-${i}`}
                        style={{ animationDelay: `${i * 0.25}s` }}
                        className="inline-block"
                      >
                        {char}
                      </span>
                    ))}
                  </div>

                  {/* SPACING */}
                  <div className="w-[0.2em]" />

                  {/* WORD 2: DESIGN (ITALIC) */}
                  <div className="flex casa-shimmer-bronze">
                    {"DESIGN".split("").map((char, i) => (
                      <span
                        key={`d-${i}`}
                        style={{ animationDelay: `${1.2 + (i * 0.25)}s` }}
                        className="italic font-light inline-block"
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                </h1>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Button & Indicator (Optimized Glassmorphism) */}
        {!hasExperienced && (
          <div className="absolute bottom-[8vh] md:bottom-[10vh] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center w-full px-6 pointer-events-auto">
            <motion.div 
              className="flex flex-col items-center gap-10 w-full"
              initial={{ opacity: 0, y: 40 }}
              animate={showTitle ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1.5, delay: 1.2, ease: "circOut" }}
            >
              <motion.button
                onClick={handleExperience}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="group relative px-20 py-5 rounded-full overflow-hidden glass-pill-premium transition-all duration-700"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
                <span className="relative font-body text-[10px] uppercase tracking-[0.8em] text-white/70 group-hover:text-white transition-all transform translate-x-[0.4em]">
                  Explore Archive
                </span>
              </motion.button>
              
              <div className="flex flex-col items-center gap-6">
                <div className="flex flex-col items-center gap-4">
                  <div className="text-[8px] font-mono text-[#A68A64]/40 tracking-[0.5em] uppercase">
                    System_Ready // Scroll_Trigger_Active
                  </div>
                  <motion.div 
                    animate={{ 
                      height: [40, 70, 40],
                      opacity: [0.2, 0.6, 0.2] 
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="w-[1px] bg-gradient-to-b from-white/20 to-transparent" 
                  />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Hero;
