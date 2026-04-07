import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PdfChatbotPanel from './chatbot/PdfChatbotPanel';

const DEFAULT_API_BASE =
  (import.meta?.env?.VITE_CHATBOT_API_URL || '').trim() || '';

const buildUrl = (base, path) => `${(base || '').replace(/\/+$/, '')}${path}`;

const resolveApiBase = (base) => {
  const trimmed = (base || '').trim();
  if (!trimmed) return '';
  if (typeof window === 'undefined') return trimmed;

  const host = (window.location?.hostname || '').toLowerCase();
  const isLocalHost =
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '[::1]';

  const pointsToLocal =
    /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(trimmed);

  // Prevent accidentally shipping a localhost base URL to production.
  if (!isLocalHost && pointsToLocal) return '';

  return trimmed;
};

const AIChatbot = ({ hasExperienced = false, activeSection = 'hero-section' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const isHeroSection = activeSection === 'hero-section';

  useEffect(() => {
    // Proactively wake the backend early (before the user's first question).
    const resolvedApiBase = resolveApiBase(DEFAULT_API_BASE);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    fetch(buildUrl(resolvedApiBase, '/health'), {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal
    })
      .catch(() => {})
      .finally(() => clearTimeout(timeout));

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (hasExperienced && isHeroSection && !isOpen) {
      const timer = setTimeout(() => setShowGreeting(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [hasExperienced, isHeroSection, isOpen]);

  useEffect(() => {
    if (isHeroSection) return;
    setShowGreeting(false);
  }, [isHeroSection]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      setIsOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    setShowGreeting(false);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            type="button"
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[9000] bg-black/40 backdrop-blur-[4px]"
            aria-label="Close chat overlay"
          />
        )}
      </AnimatePresence>

      {/* Launcher */}
      {!isOpen && (
        <div className="fixed right-8 bottom-8 z-[9001] flex flex-col items-end gap-4 pointer-events-none">
          <AnimatePresence>
            {showGreeting && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="glass-pill-premium px-6 py-4 rounded-[30px] border border-[#A68A64]/30 pointer-events-auto shadow-2xl relative"
              >
                <p className="text-[11px] font-mono text-[#A68A64] uppercase tracking-[0.28em] whitespace-nowrap mb-1 drop-shadow-[0_10px_22px_rgba(0,0,0,0.9)]">CASA Concierge</p>
                <p className="text-[14px] font-display italic text-white whitespace-nowrap drop-shadow-[0_14px_30px_rgba(0,0,0,0.9)]">How may I assist your design journey?</p>
                {/* Arrow hint towards button */}
                <div className="absolute right-8 -bottom-2 w-4 h-4 bg-[#121212] border-r border-b border-[#A68A64]/30 rotate-45" />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={handleOpen}
            className="pointer-events-auto group flex items-center gap-4 rounded-full border border-[#A68A64]/20 bg-black/60 backdrop-blur-2xl px-6 py-3.5 shadow-[0_25px_80px_rgba(0,0,0,0.85)] hover:border-[#A68A64]/40 transition-all relative overflow-hidden"
            aria-label="Open CASA AI"
          >
            <div className="flex animate-pulse items-center justify-center p-1.5 bg-[#A68A64]/10 rounded-full">
              <svg 
                className="w-4 h-4 text-[#A68A64]" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-body text-[11px] uppercase tracking-[0.42em] text-white/80 group-hover:text-white transition-colors drop-shadow-[0_10px_22px_rgba(0,0,0,0.9)]">
              CASA AI
            </span>
            {/* Ambient Pulse Ring */}
            <div className="absolute inset-0 rounded-full border border-[#A68A64]/20 animate-ping opacity-20 pointer-events-none" />
          </motion.button>
        </div>
      )}

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed right-8 bottom-24 z-[9001] pointer-events-auto">
            <PdfChatbotPanel onClose={() => setIsOpen(false)} />
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatbot;
