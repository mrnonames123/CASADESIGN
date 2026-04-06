import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const CustomCursor = () => {
  const cursorRef = useRef(null);
  const ringRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const ring = ringRef.current;
    const text = textRef.current;
    if (!cursor || !ring) return;
    
    // Premium Lag Effect: The ring trails the main dot
    const cursorX = gsap.quickTo(cursor, 'x', { duration: 0.1, ease: 'power3.out' });
    const cursorY = gsap.quickTo(cursor, 'y', { duration: 0.1, ease: 'power3.out' });
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'expo.out' });
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'expo.out' });

    const onMouseMove = (e) => {
      cursorX(e.clientX);
      cursorY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    };

    window.addEventListener('mousemove', onMouseMove);

    const onMouseOver = (e) => {
      // Check for 3D hotspots or interactive luxury elements
      const isInteractive = e.target.closest('.magnetic-interactive, .view-detail-hover');
      if (isInteractive) {
        gsap.to(ring, { 
          scale: 2.2, 
          opacity: 1, 
          borderWidth: '0.5px',
          duration: 0.6, 
          ease: 'power4.out',
          backgroundColor: 'rgba(166, 138, 100, 0.05)'
        });
        gsap.to(cursor, { scale: 0.5, opacity: 0, duration: 0.3 });
        gsap.to(text, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(2)' });
      }
    };
    
    const onMouseOut = (e) => {
      const isInteractive = e.target.closest('.magnetic-interactive, .view-detail-hover');
      if (isInteractive) {
        gsap.to(ring, { 
          scale: 1, 
          opacity: 0.4, 
          borderWidth: '1px',
          duration: 0.5, 
          ease: 'power3.inOut',
          backgroundColor: 'transparent'
        });
        gsap.to(cursor, { scale: 1, opacity: 1, duration: 0.3 });
        gsap.to(text, { opacity: 0, y: 10, scale: 0.8, duration: 0.3 });
      }
    };

    window.addEventListener('mouseover', onMouseOver);
    window.addEventListener('mouseout', onMouseOut);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('mouseout', onMouseOut);
    };
  }, []);

  return (
    <>
      {/* Outer Ring with Lag */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-10 h-10 rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 z-[9999]"
        style={{
          transformOrigin: 'center center',
          border: '1px solid rgba(166,138,100,0.4)',
          boxShadow: '0 0 40px rgba(0,0,0,0.5)',
          opacity: 0.4,
          mixBlendMode: 'difference'
        }}
      />

      {/* Center Dot + Label */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-1.5 h-1.5 rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 z-[10000] bg-casa-cream flex items-center justify-center"
      >
        <span 
          ref={textRef} 
          className="opacity-0 font-body text-casa-cream font-medium text-[7px] tracking-[0.4em] pointer-events-none absolute uppercase whitespace-nowrap translate-y-0"
          style={{ transform: 'scale(0.8)' }}
        >
          VIEW DETAIL
        </span>
      </div>
    </>
  );
};

export default CustomCursor;
