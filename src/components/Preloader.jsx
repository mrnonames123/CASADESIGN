import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useProgress } from '@react-three/drei';

// Fine-grained local updater for loading text to avoid parent re-renders
const LoadingText = ({ progressMV }) => {
  const textRef = useRef(null);
  useEffect(() => {
    return progressMV.on('change', (v) => {
      if (textRef.current) textRef.current.textContent = `${Math.round(v)}%`;
    });
  }, [progressMV]);
  return <span ref={textRef} className="uppercase tabular-nums font-mono">0%</span>;
};

const Preloader = ({ setAppLoaded, onReady, onExited }) => {
  const { progress: assetProgress } = useProgress();
  const progressMV = useMotionValue(0);
  const [showEnter, setShowEnter] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  
  // PARALLAX MOUSE TRACKING
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { damping: 50, stiffness: 200 });
  const springY = useSpring(mouseY, { damping: 50, stiffness: 200 });

  const assetProgressRef = useRef(assetProgress);
  const hasRealProgressRef = useRef(false);
  const readyFiredRef = useRef(false);

  useEffect(() => {
    const handleMove = (e) => {
      const { clientX, clientY } = e;
      const x = (clientX - window.innerWidth / 2) / 45;
      const y = (clientY - window.innerHeight / 2) / 45;
      mouseX.set(x);
      mouseY.set(y);
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [mouseX, mouseY]);

  useEffect(() => {
    assetProgressRef.current = assetProgress;
    if (assetProgress > 0) hasRealProgressRef.current = true;
  }, [assetProgress]);

  // Smoothed loading progress (kickstarts even before real assets report progress).
  useEffect(() => {
    let raf;
    let current = 0;
    const start = performance.now();
    let last = start;

    const tick = (now) => {
      const real = assetProgressRef.current || 0;
      if (real >= 100) {
        progressMV.set(100);
        return;
      }

      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;

      // Kickoff: show some movement even while the first assets haven't reported progress yet.
      const kickoff = Math.min(15, ((now - start) / 500) * 15);
      const target = hasRealProgressRef.current ? Math.min(99.5, real) : kickoff;

      // Smoothly approach the target
      const alpha = 1 - Math.exp(-9.0 * dt);
      const desired = current + (target - current) * alpha;

      const maxUpPerSec = hasRealProgressRef.current ? 60 : 25;
      const maxStep = maxUpPerSec * dt;
      current = Math.min(desired, current + maxStep);

      progressMV.set(Math.max(0, Math.min(99.5, current)));
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progressMV]);

  // Transition to "Proceed Now" logic
  useEffect(() => {
    if (showEnter || isExiting) return undefined;
    
    // Auto-proceed to Enter state when assets are ready
    const checkReady = () => {
      if (assetProgress >= 100) {
        setShowEnter(true);
      }
    };

    const interval = setInterval(checkReady, 100);
    return () => clearInterval(interval);
  }, [assetProgress, isExiting, showEnter]);

  // LOGO VISUALS
  const logoOpacity = useTransform(progressMV, [0, 80], [0, 0.95]);
  const logoScale = useTransform(progressMV, [0, 100], [1.08, 1]);
  const logoBlurVal = useTransform(progressMV, [0, 95], [25, 0]);
  const logoBlur = useTransform(logoBlurVal, (v) => `blur(${v}px)`);
  
  const progressPercentWidth = useTransform(progressMV, (v) => `${v}%`);

  // DECORATIVE MOTION
  const particlesX = useTransform(springX, (v) => v * -1.5);
  const particlesY = useTransform(springY, (v) => v * -1.5);
  
  const bgX = useTransform(springX, (v) => v * 0.8);
  const bgY = useTransform(springY, (v) => v * 0.8);
  
  const gridX = useTransform(springX, v => v * 0.2);
  const gridY = useTransform(springY, v => v * 0.2);
  
  const cornerX = useTransform(springX, v => v * 0.5);
  const cornerY = useTransform(springY, v => v * 0.5);

  const handleEnter = useCallback(() => {
    if (isExiting) return;
    setIsExiting(true);

    if (!readyFiredRef.current) {
      readyFiredRef.current = true;
      onReady?.();
      if (setAppLoaded) setAppLoaded(true);
    }

    setTimeout(() => {
        setIsVisible(false);
    }, 1200);
  }, [isExiting, onReady, setAppLoaded]);

  useEffect(() => {
    if (!showEnter || isExiting) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleEnter();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleEnter, isExiting, showEnter]);

  return (
    <AnimatePresence onExitComplete={() => onExited?.()}>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[50000] flex flex-col items-center justify-center overflow-hidden bg-[#050505] select-none"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { duration: 1.2, ease: [0.77, 0, 0.175, 1] } 
          }}
        >
          {/* STUDIO NOIR BACKGROUND WITH DYNAMIC GLOW */}
          <div className="absolute inset-0 bg-black" />
          <motion.div 
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(166, 138, 100, 0.08) 0%, transparent 65%)',
              x: bgX,
              y: bgY
            }}
          />

          {/* NOISE OVERLAY */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              animation: 'casa-noise-drift 18s linear infinite both alternate'
            }}
          />

          {/* ATMOSPHERIC BOKEH (Floating Dust Particles) */}
          <motion.div className="absolute inset-0 pointer-events-none" style={{ x: particlesX, y: particlesY }}>
             {[...Array(22)].map((_, i) => (
                <div 
                    key={i}
                    className="absolute bg-white/20 rounded-full blur-[2px]"
                    style={{
                        width: Math.random() * 3 + 1 + 'px',
                        height: Math.random() * 3 + 1 + 'px',
                        left: Math.random() * 100 + '%',
                        top: Math.random() * 100 + '%',
                        opacity: Math.random() * 0.3 + 0.1,
                        animation: `casa-float ${Math.random() * 20 + 20}s linear infinite`
                    }}
                />
             ))}
          </motion.div>

          {/* EDITORIAL GRID LINES (Slight Parallax) */}
          <motion.div 
            className="absolute inset-0 pointer-events-none opacity-[0.06]"
            style={{ x: gridX, y: gridY }}
          >
            <div className="absolute top-1/2 left-0 right-0 h-px bg-white/40" />
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/40" />
            <div className="absolute top-1/4 left-0 right-0 h-px bg-white/10" />
            <div className="absolute top-3/4 left-0 right-0 h-px bg-white/10" />
            <div className="absolute left-1/4 top-0 bottom-0 w-px bg-white/10" />
            <div className="absolute left-3/4 top-0 bottom-0 w-px bg-white/10" />
          </motion.div>

          {/* CORNER MARKS (Stronger Parallax) */}
          {[
            'top-10 left-10',
            'top-10 right-10',
            'bottom-10 left-10',
            'bottom-10 right-10'
          ].map((pos) => (
            <motion.div 
                key={pos} 
                className={`absolute ${pos} w-14 h-14 opacity-30`}
                style={{ x: cornerX, y: cornerY }}
            >
              <div className="absolute top-0 left-0 w-full h-px bg-white" />
              <div className="absolute top-0 left-0 h-full w-px bg-white" />
            </motion.div>
          ))}

          {/* LOCKUP CENTERPIECE */}
          <motion.div 
            className="relative z-10 flex flex-col items-center"
            style={{ 
                opacity: logoOpacity, 
                scale: logoScale,
                filter: logoBlur,
                x: springX,
                y: springY
            }}
          >
            <div className="flex flex-col items-center text-center">
                <h1 className="flex items-baseline gap-x-[0.2em] font-display text-[clamp(2.4rem,7vw,4.8rem)] tracking-[-0.03em] leading-none mb-6">
                    <span className="text-white uppercase casa-shimmer-white">CASA</span>
                    <span className="italic font-light text-[#A68A64] casa-shimmer-bronze">DESIGN</span>
                </h1>
                <div className="relative flex flex-col items-center">
                    <span className="font-body text-[10px] md:text-[12px] text-white/40 tracking-[1.1em] uppercase ml-[1.1em]">
                        Architectural Intelligence
                    </span>
                    <motion.div 
                        className="mt-6 w-8 h-[1px] bg-[#A68A64]/30"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 1.5, delay: 0.8 }}
                    />
                </div>
            </div>
          </motion.div>

          {/* PROGRESS INTERFACE */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[min(480px,84vw)] flex flex-col gap-8">
            <AnimatePresence mode="wait">
                {!showEnter ? (
                    <motion.div 
                        key="loading"
                        className="flex flex-col gap-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="flex justify-between items-end text-[9px] uppercase font-body tracking-[0.45em] text-white/50">
                            <span className="flex items-center gap-3">
                                <motion.span 
                                    className="w-1.5 h-1.5 bg-[#A68A64] rounded-full"
                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                />
                                Synchronizing
                            </span>
                            <LoadingText progressMV={progressMV} />
                        </div>
                        <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                                className="h-full bg-gradient-to-r from-transparent via-[#A68A64] to-[#A68A64]" 
                                style={{ width: progressPercentWidth }}
                            />
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="enter-wrap"
                        className="flex flex-col items-center"
                    >
                        <motion.button
                            className="group relative px-16 py-5 rounded-full border border-white/5 bg-white/[0.02] backdrop-blur-md overflow-hidden transition-all duration-700 hover:border-[#A68A64]/40"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleEnter}
                        >
                            <span className="relative z-10 text-[11px] uppercase tracking-[0.65em] text-white/80 group-hover:text-white transition-colors ml-[0.65em]">
                                Experience Now
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#A68A64]/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                        </motion.button>
                        
                        <motion.div 
                            className="mt-8 font-body text-[8px] uppercase tracking-[0.4em] text-white/20"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            Press Enter to Proceed
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
          </div>

          {/* VIGNETTE & LIGHT LEAK */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_45%,transparent_20%,rgba(0,0,0,0.85)_100%)]" />
          <motion.div 
            className="absolute -top-1/4 -left-1/4 w-full h-full bg-[#A68A64]/5 blur-[120px] rounded-full pointer-events-none"
            animate={{ 
                x: [0, 50, 0],
                y: [0, 30, 0],
                opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />

        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;
