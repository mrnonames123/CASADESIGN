import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SofaViewer from './SofaViewer';

gsap.registerPlugin(ScrollTrigger);

const Expertise = () => {
  const sectionRef = useRef(null);
  const itemsRef = useRef([]);

  useGSAP(() => {
    gsap.fromTo(itemsRef.current,
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        }
      }
    );
  }, { scope: sectionRef });

  const services = [
    { 
      title: 'Residential Design', 
      desc: 'Crafting intimate, highly personalized living environments that exude quiet luxury. Step into our spaces before they exist.',
      hasModel: true
    },
    { title: 'Commercial Spaces', desc: 'Elevating corporate and retail environments with state-of-the-art imperial aesthetics.' },
    { title: 'Turnkey Projects', desc: 'From conceptual blueprint to final installation, handing you the keys to absolute perfection.' },
    { title: 'Art Curation', desc: 'Sourcing and integrating global masterpieces conceptually matched to your interior.' },
  ];

  return (
    <section ref={sectionRef} id="expertise" className="py-24 md:py-32 px-6 md:px-12 bg-casa-charcoal text-casa-white">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 md:mb-24 pointer-events-none">
          <p className="text-casa-gold font-body tracking-[0.2em] uppercase text-sm mb-4">Our Services</p>
          <h2 className="text-4xl md:text-6xl font-display text-casa-white">Expertise</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {services.map((srv, idx) => (
            <div 
              key={idx}
              ref={(el) => (itemsRef.current[idx] = el)}
              className="group p-8 md:p-10 border border-casa-white/10 hover:border-casa-gold/50 transition-colors duration-500 bg-casa-charcoal relative overflow-hidden flex flex-col justify-between h-full min-h-[350px]"
            >
              <div className="absolute top-0 left-0 w-[2px] h-full bg-casa-gold transform scale-y-0 group-hover:scale-y-100 transition-transform duration-700 origin-top pointer-events-none z-10"></div>
              
              <div className="relative z-10 pointer-events-none mb-6">
                <h3 className="text-2xl font-display text-casa-white group-hover:text-casa-gold transition-colors duration-300 mb-4">{srv.title}</h3>
                <p className="font-body text-casa-cream/60 leading-relaxed font-light">{srv.desc}</p>
              </div>

              {srv.hasModel && (
                <div className="relative flex-grow pointer-events-auto h-64 -mx-6 -mb-6 md:-mx-8 md:-mb-8 mt-4 outline outline-1 outline-casa-white/5 bg-black/20 group-hover:bg-black/40 transition-colors duration-500 overflow-hidden">
                  <SofaViewer />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Expertise;
