import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-casa-charcoal py-12 px-6 border-t border-casa-white/10 text-casa-white">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        
        {/* Logo */}
        <div className="text-casa-gold font-display text-2xl tracking-widest text-center md:text-left">
          CASA DESIGN
        </div>

        {/* Links */}
        <div className="flex gap-8 font-body text-sm tracking-widest uppercase text-casa-white/60">
          <a href="#" className="hover:text-casa-gold transition-colors">Instagram</a>
          <a href="#" className="hover:text-casa-gold transition-colors">LinkedIn</a>
          <a href="#" className="hover:text-casa-gold transition-colors">Pinterest</a>
        </div>

        {/* Copyright */}
        <div className="font-body text-xs text-casa-white/40 tracking-wider text-center md:text-right">
          &copy; {new Date().getFullYear()} Casa Design. All rights reserved.
        </div>

      </div>
    </footer>
  );
};

export default Footer;
