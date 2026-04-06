import React from 'react';

const ServicesGrid = () => {
  const services = [
    {
      title: 'Residential Design',
      body:
        'Tailored interior solutions for luxury homes, focusing on harmony, light, and premium materials.'
    },
    {
      title: 'Commercial Spaces',
      body:
        'Sophisticated environments for offices, boutiques, and hospitality venues that leave a lasting impression.'
    },
    {
      title: 'Furniture Curation',
      body:
        'Exclusive access to international luxury brands, including bespoke pieces crafted to fit your specific dimensions.'
    },
    {
      title: 'Consultation',
      body:
        'Expert guidance from concept to completion, ensuring every detail aligns with your vision.'
    }
  ];

  return (
    <section
      id="services-section"
      className="relative w-[100vw] min-h-screen bg-[#050505] flex items-center justify-center overflow-hidden pointer-events-none"
      style={{ minHeight: '100vh' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.0) 35%, rgba(255,255,255,0.02) 100%)'
        }}
      />

      <div className="relative w-full max-w-6xl mx-auto px-8 md:px-16 py-20 pointer-events-auto">
        <div className="flex items-end justify-between gap-8 flex-wrap border-b border-casa-cream/10 pb-6">
          <div>
            <p className="font-body text-casa-bronze tracking-[0.45em] uppercase text-[10px] font-semibold mb-4 opacity-90">
              Services
            </p>
            <h2 className="font-display text-casa-cream text-4xl md:text-6xl tracking-tighter leading-none italic">
              Crafted Offerings
            </h2>
          </div>
          <p className="font-body text-casa-cream/50 tracking-[0.32em] uppercase text-[10px]">
            Precision. Restraint. Impact.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          {services.map((service) => (
            <div
              key={service.title}
              className="group rounded-3xl border border-casa-cream/10 bg-casa-cream/5 hover:bg-casa-cream/10 transition-colors p-8 overflow-hidden relative"
            >
              <div
                className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                style={{
                  background:
                    'radial-gradient(500px 180px at 20% 10%, rgba(200,169,126,0.18), transparent 70%)'
                }}
              />
              <div className="relative">
                <h3 className="font-display text-casa-cream text-2xl md:text-3xl tracking-tight">
                  {service.title}
                </h3>
                <div className="h-px w-16 bg-casa-bronze/40 mt-5 mb-5" />
                <p className="font-body text-casa-cream/60 leading-relaxed text-sm md:text-base">
                  {service.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col sm:flex-row gap-4">
          <a
            href="#contact-section"
            className="magnetic-interactive inline-flex items-center justify-center rounded-full border border-casa-bronze/45 bg-casa-bronze/10 hover:bg-casa-bronze/15 transition-colors px-6 py-3"
          >
            <span className="font-body text-casa-cream tracking-[0.28em] uppercase text-[10px]">
              Schedule a Consultation
            </span>
          </a>
          <a
            href="#collections-section"
            className="magnetic-interactive inline-flex items-center justify-center rounded-full border border-casa-cream/10 bg-casa-cream/5 hover:bg-casa-cream/10 transition-colors px-6 py-3"
          >
            <span className="font-body text-casa-cream/85 tracking-[0.28em] uppercase text-[10px]">
              Explore the Collection
            </span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default ServicesGrid;
