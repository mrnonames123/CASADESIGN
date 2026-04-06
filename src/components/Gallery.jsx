import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Gallery = () => {
  const sectionRef = useRef(null);
  const itemsRef = useRef([]);

  useGSAP(() => {
    gsap.fromTo(itemsRef.current,
      { y: 60, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        duration: 1, 
        stagger: 0.15, 
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
        }
      }
    );
  }, { scope: sectionRef });

  const placeholders = Array.from({ length: 6 });

  return (
    <section ref={sectionRef} id="gallery" className="py-24 md:py-32 px-6 md:px-12 bg-casa-cream">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 md:mb-24">
          <p className="text-casa-gold font-body tracking-[0.2em] uppercase text-sm mb-4">Portfolio</p>
          <h2 className="text-4xl md:text-6xl font-display text-casa-charcoal">Selected Works</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {placeholders.map((_, idx) => (
            <div 
              key={idx}
              ref={(el) => (itemsRef.current[idx] = el)}
              className="group relative overflow-hidden aspect-[4/5] bg-[#e5e0d8] cursor-pointer"
            >
              {/* Inner container for scaling effect so the outer div clips it */}
              <div className="absolute inset-0 bg-[#d5cfc4] transform transition-transform duration-700 ease-out group-hover:scale-105"></div>

              {/* Translucent Gold Overlay inserted on hover */}
              <div className="absolute inset-0 bg-casa-gold/0 group-hover:bg-casa-gold/30 transition-colors duration-500 z-10 flex items-center justify-center">
                <span className="text-casa-white font-display text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-4 group-hover:translate-y-0 tracking-widest drop-shadow-md">
                  View Project
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
