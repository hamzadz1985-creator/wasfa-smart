import React from 'react';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { Footer } from '@/components/landing/Footer';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-background dark">
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
