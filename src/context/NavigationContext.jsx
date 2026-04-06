import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const NavigationContext = createContext();

// FIX: Keeping provider and hook in one file is fine, 
// but ensure we aren't exporting raw objects/logic.
export const NavigationProvider = ({ children }) => {
  const [lenisRef, setLenisRef] = useState(null);

  const transitionToSection = useCallback(
    (fromIndex, toIndex) => {
      const map = {
        0: '#hero-section',
        1: '#section-room',
        2: '#section-interactive',
        3: '#section-gallery',
        4: '#contact-section'
      };

      const target = map[toIndex] ?? (typeof toIndex === 'string' ? toIndex : null);
      if (!target) return;

      if (lenisRef?.scrollTo) {
        lenisRef.scrollTo(target, { duration: 1.2 });
        return;
      }

      document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
    },
    [lenisRef]
  );

  const value = useMemo(
    () => ({ lenisRef, setLenisRef, transitionToSection }),
    [lenisRef, transitionToSection]
  );

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
