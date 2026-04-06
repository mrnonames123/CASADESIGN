import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useNavigation } from '../context/NavigationContext';
import HeroLiquidImage from './HeroLiquidImage';

const SectionHero = () => {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const contentRef = useRef(null);
  const { transitionToSection } = useNavigation();
  
  useGSAP(() => {
    if (!textRef.current) return;

    gsap.to(textRef.current, {
      scale: 20,
      opacity: 0,
      ease: "power3.in",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "1000px",
        scrub: true,
      }
    });

  }, { scope: containerRef });

  const handleDiscoverClick = () => {
    if (!contentRef.current) return;

    // Depth Transition: Scale current view massive while blurring into the void
    gsap.to(contentRef.current, {
      scale: 2.5,
      opacity: 0,
      filter: "blur(30px)",
      duration: 1.5,
      ease: "expo.inOut",
      onComplete: () => {
        transitionToSection(0, 1);
        // Reset state for when user returns
        gsap.set(contentRef.current, { scale: 1, opacity: 1, filter: "blur(0px)" });
      }
    });
  };

  return (
    <section ref={containerRef} className="horizontal-slide w-[100vw] h-screen relative shrink-0 overflow-hidden bg-casa-charcoal">
      <div ref={contentRef} className="slide-content w-full h-full relative">
        
        <HeroLiquidImage />
        
        <div className="absolute inset-0 bg-casa-charcoal/30 pointer-events-none z-1"></div>

        <div className="relative w-full h-full flex flex-col items-center justify-center z-10">
          <h1 
            ref={textRef}
            className="massive-text text-casa-cream font-display text-[12vw] md:text-[14vw] font-bold tracking-tighter origin-center whitespace-nowrap z-10 drop-shadow-2xl text-center leading-none translate-y-8 md:translate-y-10"
          >
            CASA DESIGN
          </h1>
          
          <button 
            onClick={handleDiscoverClick}
            className="absolute bottom-16 flex flex-col items-center group cursor-pointer pointer-events-auto magnetic-interactive"
          >
            <span className="font-body text-casa-bronze tracking-[0.4em] uppercase text-[10px] mb-4 opacity-70 group-hover:opacity-100 transition-opacity">
              Discover More
            </span>
            <div className="w-px h-12 bg-casa-bronze/30 relative overflow-hidden">
               <div className="absolute inset-0 bg-casa-bronze transform -translate-y-full group-hover:translate-y-0 transition-transform duration-700"></div>
            </div>
            <svg 
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
              className="text-casa-bronze mt-2 group-hover:translate-y-2 transition-transform duration-500"
              strokeWidth="1"
            >
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </button>

          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 font-body text-casa-bronze/40 tracking-[0.6em] uppercase text-[8px]">
            Restricted Archives
          </p>
        </div>
      </div>
    </section>
  );
};

export default SectionHero;
