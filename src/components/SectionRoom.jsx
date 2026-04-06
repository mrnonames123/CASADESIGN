import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import SplitType from 'split-type';
import SeeMoreButton from './SeeMoreButton';
import { useNavigation } from '../context/NavigationContext';

const SectionRoom = () => {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const subTextRef = useRef(null);
  const { transitionToSection } = useNavigation();

  useGSAP(() => {
    if (!containerRef.current) return;
  }, { scope: containerRef });

  return (
    <section 
      ref={containerRef} 
      id="section-room"
      className="horizontal-slide w-[100vw] h-screen shrink-0 bg-[#121212] flex items-center justify-center pointer-events-none opacity-100 visible z-[10]"
      style={{ opacity: 1, visibility: 'visible', display: 'block', position: 'relative', minHeight: '100vh' }}
    >
      <div className="slide-content w-full h-full relative px-6 md:px-24 py-24 flex flex-col md:flex-row items-center justify-between gap-12 pointer-events-auto">
        <div className="w-full md:w-1/2 flex flex-col justify-center pointer-events-none z-20">
          <p className="font-body text-casa-bronze tracking-[0.4em] uppercase text-xs mb-6 font-semibold opacity-100">
            Internal Archive: 01
          </p>
          <h2 ref={textRef} className="text-6xl md:text-8xl font-display text-casa-cream mb-8 leading-[0.9] tracking-tighter opacity-100">
            The Living<br /><span className="italic text-casa-bronze">Atrium</span>
          </h2>
          <div ref={subTextRef} className="max-w-md opacity-100">
            <p className="font-body text-casa-cream/60 leading-relaxed text-sm md:text-base border-l border-casa-bronze/30 pl-6">
              A spatial experiment in brutalist warmth. Where light and shadow define the narrative of the inhabitant. 
              Meticulously curated to invoke a sense of timeless displacement.
            </p>
          </div>
          <div className="mt-12">
            <SeeMoreButton onClick={() => transitionToSection(1, 2)} text="Explore Space" />
          </div>
        </div>

        <div className="w-full md:w-1/2 h-[50vh] md:h-[70vh] relative z-0 pointer-events-auto overflow-hidden">
          {/* MISSION: CANVAS CONSOLIDATION (REPLACED LIQUIDIMAGE WITH STATIC DIV) */}
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat scale-110"
            style={{ backgroundImage: "url('/visionary-atrium.png')" }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#121212]/80 via-transparent to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
};

export default SectionRoom;
