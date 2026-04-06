import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import ChairCanvas from './ChairCanvas';

const Section3D = () => {
  const containerRef = useRef(null);
  const titleLineOneRef = useRef(null);
  const titleLineTwoRef = useRef(null);
  const metaRef = useRef(null);
  const badgeRef = useRef(null);
  const lineRef = useRef(null);
  const underlineRef = useRef(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [isInView, setIsInView] = useState(false);

  // IntersectionObserver triggers GSAP text entrance once
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
        if (entry.isIntersecting && !hasEntered) setHasEntered(true);
      },
      { threshold: 0.25 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [hasEntered]);

  useGSAP(() => {
    if (!hasEntered) return;

    gsap.timeline({ defaults: { ease: 'expo.out' } })
      .fromTo(titleLineOneRef.current,
        { y: 130, opacity: 0, skewY: 8 },
        { y: 0, opacity: 1, skewY: 0, duration: 1.3 }
      )
      .fromTo(titleLineTwoRef.current,
        { y: 130, opacity: 0, skewY: 8 },
        { y: 0, opacity: 1, skewY: 0, duration: 1.3 },
        '-=1.0'
      )
      .fromTo(lineRef.current,
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 1, duration: 1.1, ease: 'power3.out' },
        '-=0.7'
      )
      .fromTo(underlineRef.current,
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 1, duration: 0.9, ease: 'power3.out' },
        '-=0.65'
      )
      .fromTo(metaRef.current,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9 },
        '-=0.6'
      )
      .fromTo(badgeRef.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.7, ease: 'back.out(2)' },
        '-=0.5'
      );
  }, { scope: containerRef, dependencies: [hasEntered] });

  return (
    <section
      ref={containerRef}
      id="section-interactive"
      className="relative shrink-0 overflow-hidden bg-transparent"
      style={{ width: '100vw', height: '100vh' }}
    >
      {/* Obsidian void: subtle radial gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          background: 'radial-gradient(1200px 820px at 62% 46%, #111111 0%, #050505 72%)'
        }}
      />

      {/* Chair: only rendered while this section is in view */}
      <div className="absolute inset-0" style={{ zIndex: 2, pointerEvents: 'none' }}>
        <ChairCanvas active={isInView} />
      </div>

      {/* Depth vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background: `
            linear-gradient(to right, rgba(7,6,5,0.92) 0%, rgba(7,6,5,0.38) 44%, transparent 66%),
            linear-gradient(to top, rgba(7,6,5,0.78) 0%, transparent 40%)
          `
        }}
      />

      {/* ── Editorial text overlay — bottom left ─── */}
      <div
        className="absolute bottom-0 left-0 px-8 md:px-16 pb-12 pointer-events-none"
        style={{ zIndex: 10 }}
      >
        <div
          ref={lineRef}
          style={{
            height: '1px',
            width: '44%',
            opacity: 0,
            marginBottom: '1.5rem',
            transformOrigin: 'left',
            background: 'linear-gradient(to right, rgba(200,169,126,0.7), transparent)'
          }}
        />

        <div style={{ overflow: 'hidden', marginBottom: '0.1em' }}>
          <h2
            ref={titleLineOneRef}
            className="font-display text-casa-cream leading-none tracking-tighter"
            style={{ fontSize: 'clamp(3.5rem, 7.5vw, 9rem)', opacity: 0 }}
          >
            Sculpting
          </h2>
        </div>

        <div style={{ overflow: 'hidden', marginBottom: '2rem' }}>
          <h2
            ref={titleLineTwoRef}
            className="font-display italic leading-none tracking-tighter"
            style={{ fontSize: 'clamp(3.5rem, 7.5vw, 9rem)', color: '#c8a97e', opacity: 0 }}
          >
            Ether.
          </h2>
        </div>

        <div ref={metaRef} className="flex items-start gap-8 flex-wrap" style={{ opacity: 0, maxWidth: '640px' }}>
          <div style={{ borderLeft: '2px solid rgba(200,169,126,0.35)', paddingLeft: '1.25rem' }}>
            <p className="font-body text-casa-cream/40 uppercase tracking-[0.4em] mb-1" style={{ fontSize: '9px' }}>Series</p>
            <div className="relative inline-block">
              <p className="font-display text-casa-cream italic tracking-widest" style={{ fontSize: '1.1rem' }}>
                004 — The Obsidian
              </p>
              <span
                ref={underlineRef}
                className="absolute left-0 -bottom-1 h-px w-full"
                style={{
                  background: '#D4AF37',
                  transformOrigin: 'left',
                  transform: 'scaleX(0)',
                  opacity: 0
                }}
              />
            </div>
          </div>
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.07)', paddingLeft: '1.5rem', maxWidth: '260px' }}>
            <p className="font-body text-casa-cream/50 leading-relaxed" style={{ fontSize: '0.78rem' }}>
              Interactive spatial design. Manipulation of object and air. The architecture of silence.
            </p>
          </div>
        </div>
      </div>

      {/* ── Top-right badge ── */}
      <div
        ref={badgeRef}
        className="absolute top-10 right-10 pointer-events-none flex flex-col items-end gap-2"
        style={{ zIndex: 10, opacity: 0 }}
      >
        <span
          className="font-body text-casa-bronze font-semibold uppercase"
          style={{ fontSize: '9px', letterSpacing: '0.55em' }}
        >
          High Performance Showroom
        </span>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-casa-bronze opacity-50" />
          <span
            className="font-body text-casa-cream/55 uppercase"
            style={{ fontSize: '9px', letterSpacing: '0.4em' }}
          >
            Unified Engine Active
          </span>
        </div>
      </div>

    </section>
  );
};

export default Section3D;
