import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigation } from '../../context/NavigationContext';

// Prefer an explicit deploy-time URL, otherwise use same-origin (works on production).
// In dev, Vite proxies `/chat` to the local server (see `vite.config.js`).
const DEFAULT_API_BASE =
  (import.meta?.env?.VITE_CHATBOT_API_URL || '').trim() || '';

const buildUrl = (base, path) => `${base.replace(/\/+$/, '')}${path}`;

const PANEL_VARIANTS = {
  hidden: { opacity: 0, scale: 0.9, filter: 'blur(10px)' },
  visible: { opacity: 1, scale: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, scale: 0.96, filter: 'blur(10px)' }
};

const PdfChatbotPanel = ({ apiBase = DEFAULT_API_BASE, onClose }) => {
  const { lenisRef } = useNavigation();
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState(() => ([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Ask me anything — CASA AI is here to help you.'
    }
  ]));

  const listRef = useRef(null);

  const canSend = useMemo(() => !isSending && input.trim().length > 0, [input, isSending]);

  useEffect(() => {
    // When the chat is open, prevent Lenis from hijacking wheel/touch events
    // so the message list can scroll normally.
    lenisRef?.stop?.();

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prevOverflow;
      lenisRef?.start?.();
    };
  }, [lenisRef]);

  const quickInquiries = useMemo(
    () => ([
      { label: 'Interior Packages', prompt: 'Tell me about your interior packages.' },
      { label: 'Material Standards', prompt: 'What material standards do you follow?' },
      { label: 'Consultation Process', prompt: 'Explain your consultation process step-by-step.' },
      { label: 'Warranty Details', prompt: 'Share your warranty details and coverage.' }
    ]),
    []
  );

  const scrollToBottom = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  const send = useCallback(async (overrideText) => {
    const text = (overrideText ?? input).trim();
    if (!text || isSending) return;

    const userMsg = { id: `u_${Date.now()}`, role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsSending(true);

    // allow layout to paint before scrolling
    queueMicrotask(scrollToBottom);

    try {
      const res = await fetch(buildUrl(apiBase, '/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text })
      });

      const data = await res.json().catch(() => ({}));

      const answer =
        (res.ok && typeof data.answer === 'string' && data.answer.trim()) ? data.answer :
          (typeof data.error === 'string' && data.error.trim()) ? data.error :
            `Request failed (${res.status}).`;

      setMessages((prev) => [
        ...prev,
        { id: `a_${Date.now()}`, role: 'assistant', content: answer }
      ]);
      queueMicrotask(scrollToBottom);
    } catch (e) {
      const raw = e?.message || 'Failed to reach chatbot server.';
      const message = /failed to fetch/i.test(raw)
        ? 'Chatbot server unreachable. If developing locally, run `npm run chatbot:server`. If deployed, set `VITE_CHATBOT_API_URL` to your backend URL.'
        : raw;
      setMessages((prev) => [
        ...prev,
        { id: `a_${Date.now()}`, role: 'assistant', content: message }
      ]);
      queueMicrotask(scrollToBottom);
    } finally {
      setIsSending(false);
    }
  }, [apiBase, input, isSending, scrollToBottom]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={PANEL_VARIANTS}
      transition={{ duration: 0.45, ease: [0.22, 0.9, 0.24, 1] }}
      className="w-[min(92vw,440px)] h-[min(560px,78vh)] rounded-[28px] overflow-hidden flex flex-col backdrop-blur-[25px] saturate-150 bg-[rgba(15,15,15,0.6)] border border-[rgba(212,175,55,0.2)] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)]"
      style={{
        WebkitBackdropFilter: 'blur(25px) saturate(150%)'
      }}
    >
      <div className="flex items-center justify-between px-6 py-5">
        <div className="flex flex-col">
          <span
            className="uppercase"
            style={{
              color: 'rgba(245,245,247,0.92)',
              fontFamily: '"Bodoni Moda","Didot","Bodoni MT","Playfair Display",serif',
              letterSpacing: '0.3em',
              fontSize: '12px'
            }}
          >
            CASA AI
          </span>
          <div className="mt-2 flex items-center gap-2">
            <motion.span
              className="h-1 w-1 rounded-full"
              style={{ background: '#D4AF37', boxShadow: '0 0 18px rgba(212,175,55,0.35)' }}
              animate={{ opacity: [0.35, 1, 0.35] }}
              transition={{ duration: 1.6, ease: 'easeInOut', repeat: Infinity }}
            />
            <span
              className="uppercase"
              style={{
                color: 'rgba(245,245,247,0.55)',
                fontFamily: '"Inter",sans-serif',
                letterSpacing: '0.55em',
                fontSize: '7px'
              }}
            >
              SYSTEM ACTIVE
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="uppercase"
          style={{
            color: 'rgba(245,245,247,0.75)',
            fontFamily: '"Bodoni Moda","Didot","Bodoni MT","Playfair Display",serif',
            letterSpacing: '0.28em',
            fontSize: '10px'
          }}
        >
          EXIT
        </button>
      </div>

      <div className="h-px w-full" style={{ background: 'rgba(212,175,55,0.12)' }} />

      <div
        ref={listRef}
        className="casa-chat-scroll flex-1 min-h-0 overflow-y-auto px-6 py-5 overscroll-contain touch-pan-y"
        data-lenis-prevent
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        <AnimatePresence initial={false}>
          {messages.map((m, idx) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.45, ease: 'easeOut', delay: idx === messages.length - 1 ? 0.2 : 0 }}
              className="py-4"
            >
              <div className="flex items-start justify-between gap-6">
                <span
                  className="uppercase shrink-0"
                  style={{
                    color: m.role === 'user' ? 'rgba(212,175,55,0.9)' : 'rgba(245,245,247,0.42)',
                    fontFamily: '"Inter",sans-serif',
                    letterSpacing: '0.55em',
                    fontSize: '7px',
                    paddingTop: '2px'
                  }}
                >
                  {m.role === 'user' ? 'YOU' : 'CASA'}
                </span>
                <p
                  className="flex-1 whitespace-pre-wrap"
                  style={{
                    color: m.role === 'user' ? 'rgba(245,245,247,0.92)' : 'rgba(245,245,247,0.85)',
                    fontFamily: '"Inter",sans-serif',
                    fontSize: '12px',
                    lineHeight: 1.7
                  }}
                >
                  {m.content}
                </p>
              </div>
              {idx !== messages.length - 1 && (
                <div className="mt-4 h-px w-full" style={{ background: 'rgba(212,175,55,0.08)' }} />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="h-px w-full" style={{ background: 'rgba(212,175,55,0.12)' }} />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="px-6 py-5"
      >
        <div className="mb-4 flex flex-wrap gap-2">
          {quickInquiries.map((q) => (
            <button
              key={q.label}
              type="button"
              disabled={isSending}
              onClick={() => send(q.prompt)}
              className="px-3 py-2 rounded-full uppercase transition-colors"
              style={{
                border: '1px solid rgba(212,175,55,0.28)',
                color: 'rgba(245,245,247,0.78)',
                fontFamily: '"Inter",sans-serif',
                letterSpacing: '0.32em',
                fontSize: '8px',
                background: 'rgba(0,0,0,0.12)'
              }}
            >
              {q.label}
            </button>
          ))}
        </div>
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <textarea
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isSending ? 'Processing…' : 'Inquire about our design philosophy...'}
              className="w-full resize-none bg-transparent outline-none"
              style={{
                color: 'rgba(245,245,247,0.88)',
                fontFamily: '"Bodoni Moda","Didot","Bodoni MT","Playfair Display",serif',
                fontStyle: input.trim().length ? 'normal' : 'italic',
                fontSize: '14px',
                lineHeight: 1.45
              }}
            />
            <div
              className="mt-3 h-px w-full"
              style={{
                background: canSend ? 'rgba(212,175,55,0.55)' : 'rgba(212,175,55,0.22)'
              }}
            />
          </div>
          <button
            type="submit"
            disabled={!canSend}
            className="uppercase"
            style={{
              color: canSend ? 'rgba(212,175,55,0.95)' : 'rgba(245,245,247,0.25)',
              fontFamily: '"Inter",sans-serif',
              letterSpacing: '0.45em',
              fontSize: '9px'
            }}
          >
            SUBMIT →
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default PdfChatbotPanel;
