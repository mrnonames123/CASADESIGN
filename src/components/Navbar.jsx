import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigation } from '../context/NavigationContext';

const Navbar = ({ hasExperienced, onExperience }) => {
  const { lenisRef } = useNavigation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { name: 'Introduction', id: 'hero-section' },
    { name: 'About', id: 'mission-vision-wrapper' },
    { name: 'Process', id: 'archive-section' },
    { name: 'Expertise', id: 'services-section' },
    { name: 'Portfolio', id: 'archive-portfolio' }
  ];

  const scrollTo = (id) => {
    if (!hasExperienced && id !== 'hero-section') {
       onExperience?.();
    }

    if (lenisRef?.scrollTo) {
       lenisRef.scrollTo(`#${id}`, { 
         duration: 2.5, 
         lock: true, 
         force: true 
       });
       return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-700 px-6 md:px-12 ${isScrolled ? 'py-4' : 'py-10'}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* BRAND SIGNATURE */}
        <div className="group cursor-pointer flex items-baseline gap-2.5 relative" onClick={() => scrollTo('hero-section')}>
           <h1 className="font-display text-white text-base md:text-xl tracking-wide leading-none group-hover:tracking-widest transition-all duration-700 flex items-baseline gap-2 uppercase">
             CASA <span className="italic font-light text-[#A68A64]">DESIGN</span>
           </h1>
        </div>

        {/* FLOATING GLASS BRIDGE NAVIGATION */}
        <div className="hidden lg:flex items-center gap-2 p-1.5 rounded-full border border-white/5 bg-black/20 backdrop-blur-2xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] transition-all hover:border-white/10 group/nav">
           {links.map((link) => (
             <button
               key={link.id}
               onClick={() => scrollTo(link.id)}
               className="px-7 py-2.5 rounded-full font-body text-[9px] uppercase tracking-[0.35em] text-white/40 hover:text-white hover:bg-white/5 transition-all duration-500 relative overflow-hidden"
             >
                <span className="relative z-10">{link.name}</span>
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-[#A68A64]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                />
             </button>
           ))}

           <div className="w-[1px] h-5 bg-white/5 mx-2" />
           
           <button 
             onClick={() => scrollTo('contact-section')}
             className="px-10 py-2.5 rounded-full border border-[#A68A64]/40 bg-[#A68A64]/10 text-white font-body text-[9px] uppercase tracking-[0.5em] hover:bg-[#A68A64] hover:text-black transition-all duration-700 group-hover/nav:scale-[1.02]"
           >
              Inquire
           </button>
        </div>

        {/* TERMINAL STATUS (RIGHT SIDE ON DESKTOP) */}
        <div className="flex items-center gap-4">
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
