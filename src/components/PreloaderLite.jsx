import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Keep it visible long enough to be perceived, but still effectively instant.
const MIN_VISIBLE_MS = 450;
const FADE_OUT_MS = 180;

const PreloaderLite = ({ onReady, onExited }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [showEnter, setShowEnter] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const readyFiredRef = useRef(false);

  const reduceMotion = useMemo(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    const startedAt = performance.now();
    const raf = window.requestAnimationFrame(() => {
      if (!readyFiredRef.current) {
        readyFiredRef.current = true;
        onReady?.();
      }

      const elapsed = performance.now() - startedAt;
      const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);
      window.setTimeout(() => setShowEnter(true), remaining);
    });
    return () => window.cancelAnimationFrame(raf);
  }, [onReady]);

  useEffect(() => {
    if (!isVisible) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isVisible]);

  const handleEnter = useCallback(() => {
    if (!showEnter) return;
    if (isExiting) return;
    setIsExiting(true);
    // Let exit animation play; AnimatePresence will fire onExitComplete -> onExited.
    window.setTimeout(() => setIsVisible(false), reduceMotion ? 0 : Math.max(0, FADE_OUT_MS - 40));
  }, [isExiting, reduceMotion, showEnter]);

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
          className="casa-preloader fixed inset-0 flex flex-col items-center justify-center overflow-hidden select-none"
          style={{ zIndex: 10000 }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: reduceMotion ? 0 : FADE_OUT_MS / 1000, ease: 'easeOut' }
          }}
          onClick={showEnter && !isExiting ? handleEnter : undefined}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(1100px 760px at 50% 60%, rgba(20,16,12,0.88) 0%, rgba(8,8,8,0.96) 58%, rgba(0,0,0,0.98) 100%)'
            }}
          />

          <div className="casa-preloader-lockup absolute left-0 right-0 z-10 flex flex-col items-center">
            <div
              className="text-center uppercase"
              style={{
                fontFamily: '"Cinzel", serif',
                letterSpacing: '0.52em',
                fontSize: 'clamp(40px, 9.5vw, 72px)',
                color: 'rgba(245,245,247,0.92)',
                textShadow: '0 18px 60px rgba(0,0,0,0.85)',
                transform: 'translateX(0.21em)'
              }}
            >
              CASA DESIGN
            </div>
            <div
              className="mt-3 text-center uppercase"
              style={{
                fontFamily: '"Inter", sans-serif',
                letterSpacing: '0.65em',
                fontSize: '12px',
                color: 'rgba(245,245,247,0.58)',
                transform: 'translateX(0.21em)'
              }}
            >
              ARCHITECTURAL INTELLIGENCE
            </div>
          </div>

          <AnimatePresence>
            {showEnter && !isExiting && (
              <motion.div
                className="casa-preloader-hint absolute left-1/2 z-20"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: reduceMotion ? 0 : 0.25, ease: 'easeOut' }}
              >
                <motion.span
                  className="casa-preloader-hint__text uppercase"
                  animate={reduceMotion ? undefined : { opacity: [0.55, 1, 0.55], y: [0, -2, 0] }}
                  transition={reduceMotion ? undefined : { duration: 2.2, ease: 'easeInOut', repeat: Infinity }}
                >
                  Proceed Now
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PreloaderLite;
