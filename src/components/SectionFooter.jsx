import React, { useRef } from 'react';
import { useNavigation } from '../context/NavigationContext';

const SectionFooter = () => {
  const { lenisRef } = useNavigation();
  const containerRef = useRef(null);

  const scrollTo = (id) => {
    if (lenisRef?.scrollTo) {
       lenisRef.scrollTo(`#${id}`, { duration: 2.2 });
       return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const footerLinks = [
    { label: 'Start', name: 'Introduction', id: 'hero-section' },
    { label: 'Origin', name: 'About', id: 'mission-vision-wrapper' },
    { label: 'Craft', name: 'Process', id: 'archive-section' },
    { label: 'Works', name: 'Portfolio', id: 'archive-portfolio' }
  ];

  return (
    <section 
      ref={containerRef} 
      className="relative w-full min-h-screen bg-[#050505] flex flex-col items-center justify-center py-32 px-6 md:px-24 overflow-hidden border-t border-white/5"
    >
      {/* 1. ARCHITECTURAL WATERMARK (REBRANDED) */}
      <div className="absolute inset-x-0 bottom-0 pointer-events-none opacity-[0.03] select-none text-center overflow-hidden">
         <h2 className="text-[28vw] font-display font-medium text-white tracking-tighter leading-none translate-y-1/4">
            CASA DESIGN
         </h2>
      </div>

      {/* 2. DYNAMIC TERMINAL FOOTER */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-start gap-32">
        
        <header className="w-full flex flex-col md:flex-row items-end justify-between gap-12 border-b border-white/10 pb-20">
           <div className="flex flex-col gap-8 flex-1">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-[1px] bg-[#A68A64]/40" />
                 <span className="font-mono text-[#A68A64] text-[9px] uppercase tracking-[0.5em] font-bold">Studio Signature</span>
              </div>
              <h3 className="font-display text-white text-[clamp(2.5rem,7vw,4.5rem)] leading-none tracking-tighter">
                 Beyond the <span className="italic text-[#A68A64] font-serif pr-3">visible</span>, <br /> within the <span className="italic text-[#A68A64] font-serif pr-3">detailed</span>.
              </h3>
           </div>
           
           <div className="flex-shrink-0 flex flex-col items-start md:items-end gap-10">
              <div className="text-[10px] font-mono text-[#A68A64] border border-[#A68A64]/20 rounded-full py-2 px-6 bg-[#A68A64]/05 leading-none uppercase tracking-widest">
                 Established // 2026
              </div>
              <p className="max-w-xs text-white/40 font-body text-[10px] tracking-[0.2em] uppercase leading-relaxed text-left md:text-right">
                 Curating environments for individuals who seek spatial precision and material honesty.
              </p>
           </div>
        </header>

        {/* 3. NAVIGATION GRID */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-24">
           {footerLinks.map((link) => (
             <button
               key={link.id}
               onClick={() => scrollTo(link.id)}
               className="group flex flex-col items-start gap-6 border-l border-white/5 pl-8 hover:border-[#A68A64]/40 transition-all duration-700 hover:translate-x-4 h-full"
             >
                <span className="font-mono text-[#A68A64]/60 text-[9px] uppercase tracking-widest group-hover:text-[#A68A64] transition-colors">{link.label} //</span>
                <h4 className="font-display text-white text-3xl italic tracking-tight group-hover:text-[#A68A64] transition-colors">{link.name}</h4>
                <div className="w-0 h-[1px] bg-[#A68A64] group-hover:w-full transition-all duration-1000 mt-auto" />
             </button>
           ))}
        </div>

        <footer className="w-full flex flex-col md:flex-row items-center justify-between gap-12 py-10 border-t border-white/5 opacity-40 group/foot">
           <div className="flex flex-col gap-4">
              <p className="font-mono text-[9px] text-[#A68A64] tracking-[0.4em] uppercase">Connect // Socials</p>
              <div className="flex items-center gap-10">
                 <a href="https://instagram.com/casadesign" target="_blank" className="font-body text-white text-[10px] uppercase tracking-[0.3em] hover:text-[#A68A64] transition-all duration-500">Instagram</a>
                 <a href="https://linkedin.com/company/casadesign" target="_blank" className="font-body text-white text-[10px] uppercase tracking-[0.3em] hover:text-[#A68A64] transition-all duration-500">LinkedIn</a>
              </div>
           </div>
           
           <div className="text-center md:text-right">
              <h5 className="font-display italic text-white text-lg tracking-tight mb-2 group-hover/foot:tracking-widest transition-all duration-1000">CASA DESIGN Architectural Studio</h5>
              <p className="font-mono text-[9px] tracking-[0.2em] text-white/50 uppercase">© 2026 // Architectural Collectives</p>
           </div>

           <button 
             onClick={() => scrollTo('hero-section')}
             className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center group-hover/foot:border-[#A68A64]/40 transition-all hover:bg-white/5"
           >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="rotate-[-90deg]">
                 <path d="M1 8L15 8M15 8L8 1M15 8L8 15" stroke="#A68A64" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
           </button>
        </footer>

      </div>
    </section>
  );
};


export default SectionFooter;
