import React, { useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';

const Services = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.02, 1]);

  const services = [
    {
      id: '01',
      title: 'Space Planning',
      body: 'Maximizing functionality and flow with architectural clarity and measured spatial intent.',
      media: '/service-1.png'
    },
    {
      id: '02',
      title: 'Custom Furniture',
      body: 'Bespoke sculptural pieces designed for ergonomics, comfort, and a lasting physical presence.',
      media: '/service-2.png'
    },
    {
      id: '03',
      title: 'Material Curation',
      body: 'A tactical palette that reflects your lifestyle—quiet, warm, and built from premium textures.',
      media: '/service-3.png'
    },
    {
      id: '04',
      title: '3D Visualization',
      body: 'High-fidelity photorealistic renderings to align spatial decisions before real-world execution.',
      media: '/service-4.png'
    }
  ];

  return (
    <section
      ref={containerRef}
      id="services-section"
      className="relative w-full min-h-[175vh] bg-[#050505] flex items-center justify-center overflow-hidden py-32 px-6 md:px-24"
    >
      <motion.div 
        style={{ y: bgY, scale }}
        className="absolute inset-0 pointer-events-none opacity-[0.2]"
      >
        <img 
          src="/services-bg.png" 
          alt="" 
          className="w-full h-full object-cover grayscale-[0.6] brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505]" />
      </motion.div>

      <div className="relative w-full max-w-7xl mx-auto z-20">
        <header className="mb-24 flex flex-col items-start gap-8 border-b border-white/5 pb-14">
          <div className="flex items-center gap-4">
             <div className="w-12 h-[1px] bg-[#A68A64]/40" />
             <span className="font-body text-[#A68A64] tracking-[0.5em] uppercase text-[9px] font-bold">Expertise</span>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between w-full gap-8">
            <h2 className="font-display text-casa-cream text-[clamp(2.5rem,7vw,4.5rem)] leading-[0.85] tracking-tighter">
              Engineering meet <br /> <span className="italic text-[#A68A64] font-serif pr-3">artistic</span> vision.
            </h2>
            <p className="max-w-xs font-body text-casa-cream/40 text-[10px] tracking-[0.3em] uppercase leading-relaxed lg:text-right">
              Delivering architectural excellence <br /> through meticulous detail.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14">
          {services.map((s, i) => (
            <ServiceCard key={s.id} s={s} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

const ServiceCard = ({ s, i }) => {
  const cardRef = useRef(null);
  const mediaRevealed = useInView(cardRef, { amount: 0.45, once: true });

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true, amount: 0.2 }}
      className="relative"
      ref={cardRef}
    >
      <div className="absolute -top-12 -left-6 text-[10rem] font-display text-white/[0.02] pointer-events-none select-none tracking-tighter italic font-serif z-0">
        {s.id}
      </div>

      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-10 lg:p-14 shadow-2xl flex flex-col gap-10 min-h-[460px]">
        {/* CINEMATIC GLASS MEDIA (ALWAYS VISIBLE BUT MUTED) */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <img 
            src={s.media} 
            alt="" 
            className={[
              'w-full h-full object-cover transition-all duration-[1400ms] ease-out',
              mediaRevealed ? 'opacity-60 grayscale-0 scale-105 blur-0' : 'opacity-20 grayscale scale-110 blur-[1px]'
            ].join(' ')}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/40 to-transparent" />
        </div>

        <div className="relative z-20 flex flex-col h-full">
          <div className="flex items-center gap-4 mb-8">
             <span className="text-[10px] font-mono text-[#A68A64] tracking-widest">{s.id}</span>
             <div className="flex-1 h-[1px] bg-white/10" />
          </div>

          <h3 className="font-display text-casa-cream text-4xl lg:text-5xl tracking-tight mb-8 italic drop-shadow-2xl">
            {s.title}
          </h3>
          
          <p className="font-body text-casa-cream/60 leading-relaxed text-[15px] lg:text-base font-light max-w-sm mb-12 mix-blend-difference">
            {s.body}
          </p>
        </div>

        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-white/5 to-transparent opacity-100 transition-opacity duration-1000 z-10" />
      </div>
    </motion.div>
  );
};

export default Services;
