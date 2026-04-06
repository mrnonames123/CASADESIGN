import React from 'react';

const AIPortalButton = () => {
  const handleClick = () => {
    console.log("AI Chatbot coming soon.");
  };

  return (
    <button 
      onClick={handleClick}
      // MISSION: AI PORTAL Z-INDEX 9999 + FIXED
      className="fixed bottom-8 right-8 z-[9999] w-20 h-20 rounded-full bg-casa-charcoal/20 backdrop-blur-md border border-casa-bronze/40 flex items-center justify-center group hover:bg-casa-bronze/10 transition-all duration-700 overflow-hidden shadow-2xl active-pulse-glow magnetic-interactive"
    >
      <div className="flex flex-col items-center justify-center p-2 text-center relative z-10">
        <span className="text-casa-bronze font-body text-[9px] font-bold tracking-[0.25em] leading-tight group-hover:scale-110 transition-transform duration-700">
          AI<br/>CONSULTANT
        </span>
      </div>
      
      <div className="absolute inset-0 bg-casa-bronze/5 group-hover:bg-casa-bronze/10 transition-colors duration-700"></div>
      <div className="absolute inset-0 rounded-full border border-casa-bronze/40 animate-pulse opacity-50 pointer-events-none ring-offset-2 ring-casa-bronze/20 ring-4"></div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes activeGlow {
          0% { box-shadow: 0 0 10px 0px rgba(166, 138, 100, 0.2); }
          50% { box-shadow: 0 0 30px 5px rgba(166, 138, 100, 0.4); }
          100% { box-shadow: 0 0 10px 0px rgba(166, 138, 100, 0.2); }
        }
        .active-pulse-glow {
          animation: activeGlow 3s infinite ease-in-out;
        }
      `}} />
    </button>
  );
};

export default AIPortalButton;
