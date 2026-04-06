import React from 'react';

const FeaturedCollections = () => {
  const collections = [
    {
      title: 'Living',
      items: 'Sofas, Armchairs, Coffee Tables, and Media Units.',
      media: '/gallery-1.webp',
      alt: 'Warm-lit minimalist living room curation'
    },
    {
      title: 'Dining',
      items: 'Elegant Dining Tables, Sculptural Chairs, and Sideboards.',
      media: '/gallery-2.webp',
      alt: 'Sculptural dining table setting with designer chairs'
    },
    {
      title: 'Bedroom',
      items: 'Bespoke Beds, Nightstands, and Luxury Wardrobe Systems.',
      media: '/gallery-3.webp',
      alt: 'Luxury bedroom ambiance with soft lighting'
    },
    {
      title: 'Outdoor',
      items: 'Weather-resistant luxury seating and dining sets for gardens and terraces.',
      media: '/gallery-4.webp',
      alt: 'Outdoor terrace curation at dusk'
    },
    {
      title: 'Lighting & Decor',
      items: 'Statement chandeliers, floor lamps, and curated art pieces.',
      media: '/hero-liquid.jpg',
      alt: 'Architectural lighting and decor detail'
    }
  ];

  return (
    <section
      id="collections-section"
      className="relative w-[100vw] min-h-screen bg-[#050505] flex items-center justify-center overflow-hidden pointer-events-none"
      style={{ minHeight: '100vh' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(900px 420px at 80% 20%, rgba(200,169,126,0.12), transparent 60%), radial-gradient(900px 520px at 25% 80%, rgba(255,255,255,0.04), transparent 65%)'
        }}
      />

      <div className="relative w-full max-w-6xl mx-auto px-8 md:px-16 py-20 pointer-events-auto">
        <div className="flex items-end justify-between gap-8 flex-wrap border-b border-casa-cream/10 pb-6">
          <div>
            <p className="font-body text-casa-bronze tracking-[0.45em] uppercase text-[10px] font-semibold mb-4 opacity-90">
              Collections
            </p>
            <h2 className="font-display text-casa-cream text-4xl md:text-6xl tracking-tighter leading-none">
              The <span className="italic text-casa-bronze">CASA</span> Edit
            </h2>
          </div>
          <p className="font-body text-casa-cream/50 tracking-[0.32em] uppercase text-[10px]">
            Curated categories for modern living.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 md:auto-rows-[140px]">
          {collections.map((collection, idx) => (
            <div
              key={collection.title}
              className={[
                'group relative overflow-hidden rounded-3xl border border-casa-cream/10',
                'bg-casa-charcoal/40 backdrop-blur-xl',
                'p-8',
                'transition-all duration-700',
                'hover:border-casa-cream/20 hover:bg-casa-charcoal/35',
                'hover:shadow-[0_18px_70px_rgba(0,0,0,0.55)]',
                'magnetic-interactive',
                idx === 0 ? 'md:row-span-3' : '',
                idx === 1 ? 'md:row-span-2' : '',
                idx === 2 ? 'md:row-span-3' : '',
                idx === 3 ? 'md:row-span-2' : '',
                // Lighting & Decor: span both columns to "merge" the other grid cell and feel full-bleed.
                idx === 4 ? 'md:col-span-2 md:row-span-3' : ''
              ].join(' ')}
            >
              {/* Background media (fades in on hover) */}
              <div className="absolute inset-0 z-0 opacity-[0.06] group-hover:opacity-50 transition-opacity duration-700">
                <img
                  src={collection.media}
                  alt={collection.alt}
                  className="h-full w-full object-cover scale-[1.08] group-hover:scale-[1.02] transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              </div>

              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 55%), radial-gradient(600px 220px at 20% 20%, rgba(200,169,126,0.16), transparent 60%)'
                }}
              />
              <div className="relative z-10">
                <p className="font-body text-casa-bronze tracking-[0.45em] uppercase text-[9px] font-semibold opacity-90">
                  Category
                </p>
                <h3 className="mt-3 font-display text-casa-cream text-3xl tracking-tight italic">
                  {collection.title}
                </h3>
                <p className="mt-5 font-body text-casa-cream/60 leading-relaxed text-sm md:text-base">
                  {collection.items}
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
            href="#section-gallery"
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

export default FeaturedCollections;
