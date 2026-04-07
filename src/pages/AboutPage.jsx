import React, { Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import AboutSection from '../components/AboutSection';

const AIChatbot = React.lazy(() => import('../components/AIChatbot'));

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-transparent text-[#FAF9F6] font-['Outfit',sans-serif] selection:bg-[#A68A64] selection:text-black relative">
      <div className="casa-grain"></div>

      <Navbar />
      <Suspense fallback={null}>
        <AIChatbot activeSection="about-page" />
      </Suspense>

      <Helmet>
        <title>About | Casa Design</title>
        <meta name="description" content="About CASA DESIGNS — legacy, precision, and architectural intelligence." />
      </Helmet>

      <AboutSection />
    </div>
  );
};

export default AboutPage;
