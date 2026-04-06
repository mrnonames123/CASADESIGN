import React, { forwardRef } from 'react';

const TransitionPortal = forwardRef((props, ref) => {
  return (
    <div
      ref={ref}
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 5000,
        backgroundColor: 'rgba(255, 255, 255, 0)',
        backdropFilter: 'blur(0px)',
        WebkitBackdropFilter: 'blur(0px)',
        willChange: 'backdrop-filter, background-color',
      }}
    />
  );
});

TransitionPortal.displayName = 'TransitionPortal';

export default TransitionPortal;
