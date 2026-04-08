import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const ArchiveSection = () => {
  const sectionRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section 
      ref={sectionRef}
      id="archive-section"
      className="relative w-full min-h-[165vh] bg-[#080808] flex items-start md:items-center justify-center overflow-hidden pt-48 pb-32 md:py-32 px-10 md:px-24 perspective-1000"
    >
      {/* 1. PARALLAX TECH GRID */}
      <motion.div 
        className="absolute inset-[-10%] pointer-events-none opacity-[0.2]" 
        style={{ 
          backgroundImage: `
            linear-gradient(to right, #333 1px, transparent 1px),
            linear-gradient(to bottom, #333 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          x: mousePos.x * -30,
          y: mousePos.y * -30
        }} 
      />

      {/* 2. DYNAMIC CURSOR LIGHT (SCANNER) */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 z-30 mix-blend-soft-light transition-opacity duration-1000"
        style={{ 
          background: `radial-gradient(600px circle at ${(mousePos.x + 0.5) * 100}% ${(mousePos.y + 0.5) * 100}%, rgba(166, 138, 100, 0.15), transparent 80%)` 
        }}
      />

      {/* 3. CINEMATIC OVERLAYS & NOISE */}
      <div className="absolute inset-0 pointer-events-none opacity-10 mix-blend-screen overflow-hidden">
        <div className="absolute inset-0 animate-grain-float" 
          style={{ 
            backgroundImage: 'url("/noise.svg?v=casa-1")',
            filter: 'brightness(1.5) contrast(1.2)'
          }}
        />
      </div>

      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center relative z-20">
        {/* Left: Technical Data */}
        <div className="lg:col-span-12 xl:col-span-4 flex flex-col items-start text-left">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, amount: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-6 group cursor-default">
            </div>
            
            <h2 className="text-[#FAF9F6] font-display text-[clamp(2.5rem,7vw,4.5rem)] leading-[0.85] tracking-tighter antialiased uppercase mix-blend-difference group">
              The Sculpted <br />
              <span className="italic text-[#A68A64] font-serif pr-2 opacity-80 group-hover:opacity-100 transition-opacity">Evolution</span>
            </h2>

            <div className="mt-14 max-w-sm space-y-12 relative">
               <div className="absolute -left-6 top-0 bottom-0 w-[1px] bg-[#A68A64]/10 shadow-[0_0_10px_rgba(166,138,100,0.1)]" />
              
               <div className="space-y-6">
                <p className="text-[#FAF9F6]/85 font-body text-[15px] md:text-[16px] leading-[1.8] tracking-wide font-light antialiased transition-opacity duration-700">
                  A multi-layered deconstruction of the CASA 01 series. Analysis of structural tension points and ergonomic fluidity in a high-fidelity drafting environment.
                </p>
                
                <div className="grid grid-cols-1 gap-6 text-[9px] uppercase tracking-[0.25em] text-[#A68A64]/70 font-mono">
                </div>
              </div>

              <div className="flex items-center gap-10 pt-4">
                 {[ { val: '1.04', label: 'Phi' }, { val: '0.00μ', label: 'Distort' } ].map((stat, i) => (
                   <div key={i} className="group cursor-crosshair">
                      <div className="text-[#FAF9F6] font-display text-3xl mb-1 group-hover:translate-y-[-2px] transition-transform duration-300">{stat.val}</div>
                      <div className="text-[8px] uppercase tracking-[0.3em] text-[#A68A64]/70 font-mono transition-colors">{stat.label}</div>
                   </div>
                 ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right: The Draft with Interactive Parallax */}
        <div className="lg:col-span-12 xl:col-span-8 relative group">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
            whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
            style={{ 
              rotateX: mousePos.y * 12, 
              rotateY: mousePos.x * 12, 
              transformStyle: 'preserve-3d' 
            }}
            transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1], rotateX: { duration: 0.2 }, rotateY: { duration: 0.2 } }}
            viewport={{ once: true, amount: 0.3 }}
            className="relative aspect-[4/5] lg:aspect-[1.6/1] w-full overflow-hidden border border-white/5 bg-black/40 backdrop-blur-3xl shadow-[0_60px_120px_-30px_rgba(0,0,0,1)] ring-1 ring-white/10"
          >
            <div className="absolute inset-0 z-20 pointer-events-none p-6 border-double border-4 border-white/[0.02]" />
            <div className="absolute top-0 right-0 p-8 text-[7px] font-mono text-[#A68A64]/40 flex flex-col items-end gap-1 z-20">
            </div>
            
            <div className="absolute inset-4 z-10 p-4 border border-white/5 overflow-hidden" style={{ transform: 'translateZ(20px)' }}>
              <img 
                src="/sofa-blueprint.png"
                alt="Architectural Blueprint"
                className="w-full h-full object-contain opacity-50 grayscale invert brightness-200 transition-all duration-1000 group-hover:scale-105 group-hover:opacity-90 mix-blend-screen"
                style={{ filter: `hue-rotate(0deg) brightness(1.2) drop-shadow(0 0 15px rgba(166,138,100,0.2))` }}
              />

              <motion.div 
                className="absolute inset-0 z-40 pointer-events-none bg-gradient-to-r from-transparent via-[#A68A64]/10 to-transparent skew-x-12"
                animate={{ x: mousePos.x * 200 }}
                transition={{ type: 'spring', damping: 20 }}
              />

              <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden mix-blend-screen">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#A68A64]/80 to-transparent shadow-[0_0_20px_rgba(166,138,100,0.8)] animate-laser-scroll" />
              </div>
            </div>
            
            <div className="absolute inset-0 z-50 pointer-events-none" style={{ transformStyle: 'preserve-3d' }}>
              <DataMarker pos={{ top: '22%', left: '35%' }} label="Shell_Pivot_01" delay={0} mousePos={mousePos} />
              <DataMarker pos={{ bottom: '30%', right: '28%' }} label="Support_Axis_X" delay={2} mousePos={mousePos} />
            </div>

            <div className="absolute bottom-6 left-8 text-[8px] font-mono text-white/15 uppercase tracking-[0.5em] z-20">
            </div>
            
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.8)_100%)] z-15" />
          </motion.div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes laser-scroll { 0% { transform: translateY(-100%); } 100% { transform: translateY(1000%); } }
        @keyframes flicker-lux { 0%, 100% { opacity: 1; } 45% { opacity: 0.7; } 50% { opacity: 0.3; } 55% { opacity: 0.9; } }
        @keyframes grain-float {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-5px, -10px); }
          30% { transform: translate(-10px, 5px); }
          50% { transform: translate(5px, -5px); }
          70% { transform: translate(-5px, 10px); }
          90% { transform: translate(10px, 5px); }
        }
        .animate-laser-scroll { animation: laser-scroll 6s linear infinite; }
        .animate-flicker-lux { animation: flicker-lux 4s step-end infinite; }
        .animate-grain-float { animation: grain-float 8s steps(10) infinite; }
      `}} />
    </section>
  );
};

const DataMarker = ({ pos, label, delay, mousePos }) => (
  <motion.div 
    className="absolute flex flex-col items-center gap-2"
    style={{ ...pos, transform: 'translateZ(50px)' }}
    animate={{ 
      y: [0, -5, 0], 
      opacity: [0.6, 1, 0.6],
      x: mousePos.x * 20 
    }}
    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay }}
  >
    <div className="w-5 h-5 rounded-full border border-[#A68A64]/40 flex items-center justify-center backdrop-blur-sm">
      <div className="w-1 h-1 bg-[#A68A64] rounded-full shadow-[0_0_10px_#A68A64]" />
    </div>
    <span className="text-[7px] text-[#A68A64] font-mono tracking-tighter uppercase whitespace-nowrap bg-black/60 px-2 py-0.5 border border-white/5">{label}</span>
  </motion.div>
);

export default ArchiveSection;
