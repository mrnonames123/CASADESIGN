import React, { useCallback, useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useNavigation } from '../context/NavigationContext';

const AutoColorImage = ({ src, alt = '', className = '', initialClassName = '', activeClassName = '', amount = 0.45 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { amount, once: true });
  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      className={[className, inView ? activeClassName : initialClassName].filter(Boolean).join(' ')}
    />
  );
};

const ArchivalSeries = () => {
  const { lenisRef } = useNavigation();
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);

  const scrollToContact = useCallback(() => {
    const target = '#contact-section';
    if (lenisRef?.scrollTo) {
      lenisRef.scrollTo(target, { duration: 1.6 });
      return;
    }
    document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
  }, [lenisRef]);

  return (
    <section 
      ref={sectionRef}
      id="archive-portfolio"
      className="relative w-full min-h-[190vh] bg-[#050505] py-32 px-6 md:px-24 overflow-hidden"
    >
      {/* ELITE OBSIDIAN BG */}
      <motion.div 
        style={{ y: bgY }}
        className="absolute inset-0 pointer-events-none opacity-[0.2]"
      >
        <img 
          src="/portfolio-bg.png" 
          alt="" 
          className="w-full h-full object-cover grayscale-[0.4] brightness-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]" />
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-28 pb-16 border-b border-white/5">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
            </div>
            <h2 className="text-white font-display text-[clamp(2.8rem,9vw,5.5rem)] leading-[0.85] tracking-[-0.04em]">
               Restricted <br /> <span className="italic text-[#A68A64]">Case</span> Studies.
            </h2>
          </div>
          <div className="max-w-sm glass-pill-premium p-8 rounded-[40px] text-left lg:text-right border-l-4 lg:border-l-0 lg:border-r-4 border-[#A68A64]">
             <p className="text-white/60 font-body text-[11px] tracking-[0.28em] uppercase leading-[2]">
               A proprietary collection of architectural narratives meticulously curated for the distinguished inhabitant. 
             </p>
          </div>
        </header>

        {/* ASYMETRICAL BENTO GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-auto lg:h-[1100px]">
          
          {/* Primary Masterwork */}
          <motion.div 
             initial={{ opacity: 0, scale: 0.98 }}
             whileInView={{ opacity: 1, scale: 1 }}
             transition={{ duration: 1.2 }}
             className="lg:col-span-7 lg:row-span-2 relative overflow-hidden rounded-[50px] border border-white/5 bg-[#121212]"
          >
             <AutoColorImage
               src="/portfolio-1.png"
               className="absolute inset-0 w-full h-full object-cover transition-all duration-[1400ms] ease-out"
               initialClassName="grayscale-[0.35] brightness-75 scale-[1.02]"
               activeClassName="grayscale-0 brightness-100 scale-105"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent opacity-80" />

             <div className="absolute bottom-12 left-12 z-10 max-w-lg">
                <span className="text-[10px] font-mono text-[#A68A64] uppercase tracking-[0.6em] block mb-6 px-4 py-1.5 border border-[#A68A64]/30 rounded-full w-fit bg-[#121212]/40 backdrop-blur-md">
                   REF: ATRIUM_0X8F
                </span>
                <h3 className="text-white font-display text-5xl md:text-7xl italic leading-tight tracking-[-0.02em]">The Living <span className="not-italic text-white/40">Atrium.</span></h3>
                <p className="text-white/30 font-body text-[11px] uppercase tracking-[0.3em] mt-8 leading-relaxed">
                  A multi-layered spatial experiment in warmth and architectural silence.
                </p>
             </div>
          </motion.div>

          {/* Secondary Masterwork */}
          <motion.div 
             initial={{ opacity: 0, x: 40 }}
             whileInView={{ opacity: 1, x: 0 }}
             transition={{ duration: 1.2, delay: 0.2 }}
             className="lg:col-span-5 relative overflow-hidden rounded-[40px] border border-white/5 bg-[#121212]"
          >
             <AutoColorImage
               src="/portfolio-2.png"
               className="absolute inset-0 w-full h-full object-cover transition-all duration-[1200ms] ease-out"
               initialClassName="grayscale-[0.45] brightness-75 scale-[1.02]"
               activeClassName="grayscale-0 brightness-100 scale-105"
             />
             <div className="absolute inset-0 bg-black/30" />
             
             <div className="absolute bottom-10 left-10">
                <span className="text-[8px] font-mono text-[#A68A64] uppercase tracking-[0.5em] mb-4 block">FOLDER_02 // RESIDENTIAL</span>
                <h4 className="text-white font-display text-4xl italic tracking-tight">Master Suite</h4>
             </div>
          </motion.div>

          {/* Split Detail Panels */}
          <motion.div 
             initial={{ opacity: 0, y: 40 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 1.2, delay: 0.4 }}
             className="lg:col-span-5 grid grid-cols-1 md:grid-cols-2 gap-8"
          >
             <div className="relative overflow-hidden rounded-[30px] border border-white/5 h-[450px] md:h-[350px]">
                <AutoColorImage
                  src="/portfolio-3.png"
                  className="w-full h-full object-cover transition-all duration-[1200ms] ease-out"
                  initialClassName="grayscale-[0.55] brightness-75"
                  activeClassName="grayscale-0 brightness-100"
                  amount={0.5}
                />
                <div className="absolute inset-0 bg-[#A68A64]/10 opacity-0 pointer-events-none" />
             </div>
             <div className="relative overflow-hidden rounded-[30px] border border-white/5 h-[450px] md:h-[350px]">
                <AutoColorImage
                  src="/portfolio-4.png"
                  className="w-full h-full object-cover transition-all duration-[1200ms] ease-out"
                  initialClassName="grayscale-[0.55] brightness-75"
                  activeClassName="grayscale-0 brightness-100"
                  amount={0.5}
                />
                <div className="absolute inset-0 bg-[#A68A64]/10 opacity-0 pointer-events-none" />
             </div>
          </motion.div>

          {/* Archival Call-to-Action Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.6 }}
            className="lg:col-span-12 flex flex-col lg:flex-row items-center justify-between gap-10 py-12 px-14 rounded-[40px] glass-pill-premium mt-10"
          >
             <div className="flex flex-col md:flex-row items-center gap-10">
                <div className="flex flex-col gap-2">
                   <p className="text-white/40 font-body text-[10px] uppercase tracking-[0.4em]">Every project is a structural manifesto against the noise.</p>
                </div>
             </div>
             
             <div className="flex flex-col md:flex-row items-center gap-10 md:gap-14 w-full md:w-auto">
                <a href="mailto:portfolio@casadesign.ai" className="font-body text-[#A68A64] text-[10px] uppercase tracking-[0.5em] hover:text-white transition-colors flex items-center gap-4 group">
                  <div className="hidden md:block w-8 h-[1px] bg-[#A68A64]/30 group-hover:w-12 group-hover:bg-white transition-all" />
                  Request Full Portfolio
                </a>
                 <button 
                  onClick={scrollToContact}
                  className="font-body text-white text-[10px] uppercase tracking-[0.6em] group flex items-center gap-3 hover:gap-6 transition-all bg-[#A68A64] px-10 py-4 md:py-5 rounded-full text-black font-bold border-none w-full md:w-auto justify-center"
                 >
                    Inquire 
                   <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M1 13L13 1M13 1H3M13 1V11" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                   </svg>
                </button>
             </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default ArchivalSeries;
