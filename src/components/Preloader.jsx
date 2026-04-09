import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion';
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
  
  const assetProgressRef = useRef(assetProgress);
  const hasRealProgressRef = useRef(false);
  const readyFiredRef = useRef(false);

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

  const logoOpacity = useTransform(progressMV, [0, 100], [0.1, 1]);
  const logoScale = useTransform(progressMV, [0, 100], [1.02, 1]);
  const logoBlurVal = useTransform(progressMV, [0, 80], [8, 0]);
  const logoBlur = useTransform(logoBlurVal, (v) => `blur(${v}px)`);
  
  const progressPercentWidth = useTransform(progressMV, (v) => `${v}%`);

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
    }, 800);
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
          className="fixed inset-0 z-[50000] flex flex-col items-center justify-center overflow-hidden bg-black select-none"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ 
            y: '-100%',
            transition: { duration: 0.8, ease: [0.77, 0, 0.175, 1] } 
          }}
        >
          {/* STUDIO NOIR BACKGROUND */}
          <div className="absolute inset-0 bg-black" />
          <div 
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(166, 138, 100, 0.04) 0%, transparent 70%)'
            }}
          />

          {/* NOISE OVERLAY */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              animation: 'casa-noise-drift 18s linear infinite both alternate'
            }}
          />

          {/* EDITORIAL GRID LINES */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-white" />
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white" />
          </div>

          {/* CORNER MARKS */}
          {[
            'top-8 left-8',
            'top-8 right-8',
            'bottom-8 left-8',
            'bottom-8 right-8'
          ].map((pos) => (
            <div key={pos} className={`absolute ${pos} w-10 h-10 opacity-20`}>
              <div className="absolute top-0 left-0 w-full h-px bg-white" />
              <div className="absolute top-0 left-0 h-full w-px bg-white" />
            </div>
          ))}

          {/* LOCKUP */}
          <motion.div 
            className="relative z-10 flex flex-col items-center"
            style={{ 
                opacity: logoOpacity, 
                scale: logoScale,
                filter: logoBlur
            }}
          >
            <div className="flex flex-col items-center">
                <span className="font-display text-[clamp(2rem,6vw,4rem)] text-white tracking-[0.5em] uppercase leading-none mb-4">
                    CASA DESIGN
                </span>
                <span className="font-body text-[9px] md:text-[11px] text-[#A68A64] tracking-[0.8em] uppercase opacity-80">
                    Architectural Intelligence
                </span>
            </div>
          </motion.div>

          {/* PROGRESS INTERFACE */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-[min(400px,80vw)] flex flex-col gap-6">
            <AnimatePresence mode="wait">
                {!showEnter ? (
                    <motion.div 
                        key="loading"
                        className="flex flex-col gap-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <div className="flex justify-between items-end text-[10px] uppercase font-body tracking-[0.3em] text-white/40">
                            <span>Initializing Core</span>
                            <LoadingText progressMV={progressMV} />
                        </div>
                        <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                                className="h-full bg-[#A68A64]" 
                                style={{ width: progressPercentWidth }}
                            />
                        </div>
                    </motion.div>
                ) : (
                    <motion.button
                        key="enter"
                        className="group relative flex flex-col items-center py-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        onClick={handleEnter}
                    >
                        <span className="text-[11px] uppercase tracking-[0.6em] text-white/90 group-hover:text-white transition-colors">
                            Enter Experience
                        </span>
                        <motion.div 
                            className="mt-4 w-12 h-px bg-[#A68A64]/40 group-hover:w-24 group-hover:bg-[#A68A64] transition-all duration-700"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    </motion.button>
                )}
            </AnimatePresence>
          </div>

          {/* VIGNETTE */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,transparent_20%,rgba(0,0,0,0.8)_100%)]" />

        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;
