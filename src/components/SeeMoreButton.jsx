import React from 'react';

const SeeMoreButton = ({ onClick, text = "See More" }) => {
  return (
    <div 
      onClick={onClick}
      className={`absolute bottom-12 right-12 z-50 flex items-center justify-center group pointer-events-auto`}
    >
      <div className="flex items-center bg-casa-bronze rounded-full h-14 w-14 group-hover:w-40 transition-all duration-700 ease-in-out shadow-[0_0_24px_rgba(166,138,100,0.3)] magnetic-interactive overflow-hidden relative cursor-none mix-blend-normal isolate">
         
         <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-casa-charcoal/40 group-hover:scale-0 transition-transform duration-300 z-10 pointer-events-none"></span>
         
         <span className="font-body text-casa-charcoal uppercase tracking-[0.2em] font-bold text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 transition-all duration-700 ease-in-out w-full text-center z-20 pointer-events-none absolute">
           {text}
         </span>
      </div>
    </div>
  );
};

export default SeeMoreButton;
