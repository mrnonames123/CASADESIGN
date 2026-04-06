import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';

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
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7.5deg", "-7.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7.5deg", "7.5deg"]);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true, amount: 0.2 }}
      className="group relative"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      ref={cardRef}
      style={{ perspective: 1200 }}
    >
      <div className="absolute -top-12 -left-6 text-[10rem] font-display text-white/[0.02] pointer-events-none select-none tracking-tighter group-hover:text-[#A68A64]/10 transition-colors duration-1000 italic font-serif z-0">
        {s.id}
      </div>

      <motion.div 
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-10 lg:p-14 transition-colors duration-700 hover:border-[#A68A64]/40 hover:bg-white/[0.06] shadow-2xl flex flex-col gap-10 min-h-[460px]"
      >
        {/* CINEMATIC GLASS MEDIA (ALWAYS VISIBLE BUT MUTED) */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden translate-z-[-10px]">
          <img 
            src={s.media} 
            alt="" 
            className="w-full h-full object-cover opacity-20 grayscale scale-110 blur-[1px] transition-all duration-1000 group-hover:opacity-60 group-hover:grayscale-0 group-hover:scale-105 group-hover:blur-0" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/40 to-transparent" />
        </div>

        {/* INTERACTIVE SCANNER LENS */}
        <motion.div
           className="absolute inset-0 pointer-events-none z-10 mix-blend-soft-light opacity-0 group-hover:opacity-100 transition-opacity duration-700"
           style={{
             background: useTransform(
               [mouseXSpring, mouseYSpring],
               ([xS, yS]) => `radial-gradient(400px circle at ${(xS + 0.5) * 100}% ${(yS + 0.5) * 100}%, rgba(166,138,100,0.3), transparent 80%)`
             )
           }}
        />

        <div className="relative z-20 flex flex-col h-full translate-z-20">
          <div className="flex items-center gap-4 mb-8">
             <span className="text-[10px] font-mono text-[#A68A64] tracking-widest">{s.id}</span>
             <div className="flex-1 h-[1px] bg-white/10 group-hover:bg-[#A68A64]/30 transition-colors" />
          </div>

          <h3 className="font-display text-casa-cream text-4xl lg:text-5xl tracking-tight mb-8 italic drop-shadow-2xl">
            {s.title}
          </h3>
          
          <p className="font-body text-casa-cream/60 leading-relaxed text-[15px] lg:text-base font-light max-w-sm mb-12 mix-blend-difference">
            {s.body}
          </p>

          <div className="mt-auto flex items-center gap-3 group/btn cursor-pointer">
            <span className="text-[#A68A64] font-body uppercase tracking-[0.4em] text-[9px] font-bold">View Detail</span>
            <div className="flex-1 h-[1px] bg-white/10 relative overflow-hidden">
               <motion.div 
                 className="absolute inset-0 bg-[#A68A64]/40 translate-x-[-100%]"
                 whileHover={{ x: '0%' }}
                 transition={{ duration: 0.5 }}
               />
            </div>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="group-hover/btn:translate-x-1 transition-transform">
               <path d="M1 11L11 1.00002M11 1.00002H3M11 1.00002V9" stroke="#A68A64" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 z-10" />
      </motion.div>

      <style dangerouslySetInnerHTML={{ __html: `
        .translate-z-20 { transform: translateZ(20px); }
        .translate-z-\[-10px\] { transform: translateZ(-10px); }
      `}} />
    </motion.div>
  );
};

export default Services;
