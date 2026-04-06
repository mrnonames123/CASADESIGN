import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';

const STAT_ITEMS = [
  { value: 15, suffix: '+', label: 'Years Experience' },
  { value: 300, suffix: '+', label: 'Projects Completed' },
  { value: 24, suffix: '', label: 'Design Awards' },
  { value: 100, suffix: '%', label: 'Client Satisfaction' }
];

const useCountUp = ({ to, durationMs = 1200, enabled }) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    const start = performance.now();

    const tick = (now) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(to * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [durationMs, enabled, to]);

  return value;
};

const Stat = ({ value, suffix, label, active }) => {
  const v = useCountUp({ to: value, durationMs: 1400, enabled: active });

  return (
    <div className="flex flex-col items-start gap-2 min-w-[140px]">
      <div
        style={{
          fontFamily: '"Bodoni Moda","Didot","Bodoni MT","Playfair Display",serif',
          letterSpacing: '0.06em',
          fontSize: 'clamp(1.6rem, 3.6vw, 2.5rem)',
          color: '#D4AF37',
          lineHeight: 1
        }}
      >
        {v}
        {suffix}
      </div>
      <div
        className="uppercase"
        style={{
          fontFamily: '"Inter",sans-serif',
          letterSpacing: '0.48em',
          fontSize: '9px',
          color: 'rgba(245,245,247,0.55)'
        }}
      >
        {label}
      </div>
    </div>
  );
};

const AboutSection = () => {
  const sectionRef = useRef(null);
  const imageWrapRef = useRef(null);
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: '-20% 0px -20% 0px' });

  const { scrollYProgress } = useScroll({
    target: imageWrapRef,
    offset: ['start end', 'end start']
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [18, -18]);

  const containerVariants = useMemo(() => ({
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.18, delayChildren: 0.05 }
    }
  }), []);

  const itemVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.85, ease: 'easeOut' } }
  }), []);

  const lineVariants = useMemo(() => ({
    hidden: { scaleX: 0, opacity: 0 },
    visible: { scaleX: 1, opacity: 1, transition: { duration: 0.9, ease: 'easeOut' } }
  }), []);

  return (
    <section
      ref={sectionRef}
      id="about-section"
      className="relative w-[100vw] min-h-screen overflow-hidden"
      style={{ background: '#050505' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(1000px 520px at 18% 24%, rgba(212,175,55,0.12), transparent 62%), radial-gradient(900px 520px at 85% 62%, rgba(255,255,255,0.05), transparent 65%)'
        }}
      />

      <div className="relative w-full max-w-6xl mx-auto px-8 md:px-14 pt-28 md:pt-32 pb-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.32 }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Centered content (3D chair remains central focus) */}
          <motion.p
            variants={itemVariants}
            className="uppercase"
            style={{
              color: '#D4AF37',
              fontFamily: '"Inter",sans-serif',
              letterSpacing: '0.42em',
              fontSize: '10px'
            }}
          >
            ESTABLISHED 2024
          </motion.p>

          <motion.h2
            variants={itemVariants}
            className="mt-6 text-casa-cream"
            style={{
              fontFamily: '"Bodoni Moda","Didot","Bodoni MT","Playfair Display",serif',
              letterSpacing: '0.02em',
              lineHeight: 1.1,
              fontSize: 'clamp(3rem, 6vw, 4.5rem)'
            }}
          >
            About CASA DESIGNS
          </motion.h2>

          <motion.div
            variants={lineVariants}
            className="mt-8 h-px w-32 mx-auto"
            style={{
              background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)'
            }}
          />

          <motion.p
            variants={itemVariants}
            className="mt-10 max-w-2xl mx-auto"
            style={{
              color: 'rgba(245,245,247,0.62)',
              fontFamily: '"Inter",sans-serif',
              fontSize: '16px',
              lineHeight: 1.9
            }}
          >
            CASA DESIGNS is built on engineering precision—budget clarity, schedule discipline, and materials that age
            beautifully. We redefine the engineering of spaces by pairing architectural intelligence with a calm,
            cinematic finish: thoughtful lighting, tactile surfaces, and details that feel inevitable.
          </motion.p>

          <motion.p
            variants={itemVariants}
            className="mt-8 max-w-xl mx-auto"
            style={{
              color: 'rgba(245,245,247,0.45)',
              fontFamily: '"Inter",sans-serif',
              fontSize: '14px',
              lineHeight: 1.9
            }}
          >
            From first measurement to final handover, every decision is measured—so the result looks effortless.
          </motion.p>
        </motion.div>

        {/* Legacy stats bar */}
        <div ref={statsRef} className="mt-16 md:mt-20">
          <div className="h-px w-full" style={{ background: 'rgba(212,175,55,0.12)' }} />
          <div className="mt-10 flex flex-wrap gap-10 md:gap-14 items-start">
            {STAT_ITEMS.map((s) => (
              <Stat
                key={s.label}
                value={s.value}
                suffix={s.suffix}
                label={s.label}
                active={statsInView}
              />
            ))}
          </div>
          <div className="mt-10 h-px w-full" style={{ background: 'rgba(212,175,55,0.10)' }} />
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
