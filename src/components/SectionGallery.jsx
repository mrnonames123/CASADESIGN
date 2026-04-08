import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import SplitType from 'split-type';
import SeeMoreButton from './SeeMoreButton';
import { useNavigation } from '../context/NavigationContext';

const SectionGallery = () => {
  const containerRef = useRef(null);
  const itemsRef = useRef([]);
  const headerRef = useRef(null);
  const { transitionToSection } = useNavigation();

  const galleryImages = [
    "/gallery-1.webp",
    "/gallery-2.webp",
    "/gallery-3.webp",
    "/gallery-4.webp",
    "/gallery-5.png",
    "/gallery-6.png",
  ];

  useGSAP(() => {
    if (!containerRef.current) return;
  }, { scope: containerRef });

  const gridItems = Array.from({ length: 6 });

  return (
    <section
      ref={containerRef}
      id="section-gallery"
      className="horizontal-slide w-[100vw] h-screen shrink-0 bg-[#0a0a0a] flex items-center justify-center pointer-events-none opacity-100 visible z-[10]"
      style={{ opacity: 1, visibility: 'visible', display: 'block', position: 'relative', minHeight: '100vh' }}
    >
      <div className="slide-content w-full h-full relative px-6 md:px-16 py-16 pt-32 md:pt-16 flex flex-col justify-center max-w-[90rem] mx-auto pointer-events-auto">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-casa-cream/10 pb-6 w-full pointer-events-none z-20">
          <h2 ref={headerRef} className="text-4xl md:text-7xl font-display text-casa-cream tracking-tight leading-none italic">Archival Series</h2>
          <p className="font-body text-casa-bronze tracking-[0.4em] uppercase text-[9px] md:text-xs mt-6 md:mt-0 font-semibold md:pb-2 opacity-100">
            Restricted Case Studies
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 lg:grid-rows-2 gap-6 h-[60vh] max-h-[800px] w-full z-20">
          {gridItems.map((_, idx) => (
            <div
              key={idx}
              ref={(el) => (itemsRef.current[idx] = el)}
              className={`group overflow-hidden relative cursor-pointer ${idx === 0 ? "col-span-2 row-span-2" :
                  idx === 1 ? "col-span-2 row-span-1" :
                    "col-span-1 row-span-1"
                } outline outline-1 outline-casa-cream/5 shadow-inner hover:shadow-2xl transition-all duration-700 bg-casa-charcoal opacity-100`}
            >

              <div
                className="absolute inset-0 z-0 pointer-events-auto filter saturate-50 group-hover:saturate-100 transition-all duration-700 bg-cover bg-center"
                style={{ backgroundImage: `url(${galleryImages[idx % galleryImages.length]})` }}
              >
              </div>

              <div className="absolute inset-0 z-10 bg-casa-charcoal/0 group-hover:bg-casa-bronze/10 transition-colors duration-500 flex items-center justify-center backdrop-blur-[0px] pointer-events-none shadow-[inset_0_0_120px_rgba(0,0,0,0.5)] opacity-100">
                <span className="font-display text-casa-cream text-2xl md:text-4xl opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-700 drop-shadow-[0_2px_12px_rgba(0,0,0,1)] italic tracking-widest font-bold">
                  {String(idx + 1).padStart(2, '0')}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default SectionGallery;
