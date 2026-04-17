export const isTouchDevice = () => {
  if (typeof window === 'undefined') return false;
  return (
    ('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0) ||
    (navigator.msMaxTouchPoints > 0) ||
    (window.matchMedia && window.matchMedia('(pointer: coarse)').matches)
  );
};

export const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const getDeviceDPR = () => {
  if (typeof window === 'undefined') return 1;
  const dpr = window.devicePixelRatio || 1;
  if (isTouchDevice()) {
    return Math.min(dpr, 1.5); // Cap at 1.5 for mobile/touch to save GPU
  }
  return Math.min(dpr, 2); // Cap at 2 for desktop
};
