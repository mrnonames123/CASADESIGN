import React, { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';

const CustomCursor = () => {
  const cursorRef = useRef(null);
  const ringRef = useRef(null);
  const isPointerFine = useMemo(() => {
    if (typeof window === 'undefined') return false;
    if (!window.matchMedia) return false;
    return window.matchMedia('(pointer: fine)').matches && window.matchMedia('(hover: hover)').matches;
  }, []);

  useEffect(() => {
    if (!isPointerFine) return undefined;
    const cursor = cursorRef.current;
    const ring = ringRef.current;
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
      }
    };

    window.addEventListener('mouseover', onMouseOver);
    window.addEventListener('mouseout', onMouseOut);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('mouseout', onMouseOut);
    };
  }, [isPointerFine]);

  if (!isPointerFine) return null;

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
      </div>
    </>
  );
};

export default CustomCursor;
