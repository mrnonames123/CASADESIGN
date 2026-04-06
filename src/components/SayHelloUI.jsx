import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const SayHelloUI = ({ isVisible }) => {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const detailsRef = useRef(null);

  useGSAP(() => {
    if (!isVisible) return;

    // MISSION: serif reveal with SplitText style (replicated with spans)
    const tl = gsap.timeline({ delay: 0.5 });
    
    tl.fromTo(textRef.current, 
      { y: 60, opacity: 0, skewY: 5 },
      { y: 0, opacity: 1, skewY: 0, duration: 1.2, ease: 'expo.out' }
    )
    .fromTo(detailsRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.0, ease: 'power2.out' },
      '-=0.8'
    );
  }, { scope: containerRef, dependencies: [isVisible] });

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      style={{ zIndex: 100 }}
    >
      <div className="text-center overflow-hidden mb-6">
         <h2
           ref={textRef}
           className="font-display text-[8vw] md:text-[6.5rem] text-[#f5e6e8] leading-none tracking-tight italic"
         >
           Say Hello.
         </h2>
      </div>

      <div ref={detailsRef} className="max-w-md text-center">
         <p className="font-body text-[#f5e6e8]/60 text-[10px] uppercase tracking-[0.5em] mb-4">
           Let's design the casa
         </p>
         <div className="h-px w-24 bg-[#f5e6e8]/20 mx-auto mb-8" />
         <p className="font-body text-[#f5e6e8]/80 text-lg hover:text-[#f5e6e8] transition-colors pointer-events-auto cursor-pointer">
           studio@casa-design.ai
         </p>
      </div>
    </div>
  );
};

export default SayHelloUI;
