import React from 'react';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { Footer } from '@/components/landing/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

const Index: React.FC = () => {
  const { dir } = useLanguage();

  return (
    <div className="min-h-screen bg-background dark" dir={dir}>
      <LandingHeader />
      <main>
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;