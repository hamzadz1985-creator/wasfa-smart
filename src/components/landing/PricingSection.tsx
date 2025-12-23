import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export const PricingSection: React.FC = () => {
  const { t } = useLanguage();
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      key: 'solo',
      name: t.pricing.solo.name,
      description: t.pricing.solo.description,
      price: isYearly ? 39 : 49,
      features: t.pricing.solo.features,
      popular: false,
    },
    {
      key: 'clinic',
      name: t.pricing.clinic.name,
      description: t.pricing.clinic.description,
      price: isYearly ? 79 : 99,
      features: t.pricing.clinic.features,
      popular: true,
    },
    {
      key: 'enterprise',
      name: t.pricing.enterprise.name,
      description: t.pricing.enterprise.description,
      price: null,
      features: t.pricing.enterprise.features,
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-background to-secondary/20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {t.pricing.title}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t.pricing.subtitle}
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={cn(
            "text-sm font-medium transition-colors",
            !isYearly ? "text-foreground" : "text-muted-foreground"
          )}>
            {t.pricing.monthly}
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className={cn(
              "relative w-14 h-7 rounded-full transition-colors",
              isYearly ? "bg-primary" : "bg-secondary"
            )}
          >
            <div
              className={cn(
                "absolute top-1 w-5 h-5 bg-primary-foreground rounded-full transition-all",
                isYearly ? "left-8" : "left-1"
              )}
            />
          </button>
          <span className={cn(
            "text-sm font-medium transition-colors",
            isYearly ? "text-foreground" : "text-muted-foreground"
          )}>
            {t.pricing.yearly}
          </span>
          {isYearly && (
            <span className="px-2 py-1 bg-accent/20 text-accent text-xs font-medium rounded-full">
              {t.pricing.save}
            </span>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.key}
              className={cn(
                "relative rounded-2xl p-6 lg:p-8 transition-all duration-300",
                plan.popular
                  ? "glass border-2 border-primary/50 shadow-lg shadow-primary/10 scale-105 z-10"
                  : "glass border border-border/30 hover:border-primary/30"
              )}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                    <Sparkles className="h-3 w-3" />
                    {t.pricing.popular}
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                {plan.price ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}€</span>
                    <span className="text-muted-foreground">{t.pricing.perMonth}</span>
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-muted-foreground">
                    Sur devis
                  </div>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link to="/auth?mode=signup">
                <Button
                  variant={plan.popular ? "hero" : "outline"}
                  className="w-full"
                  size="lg"
                >
                  {plan.price ? t.pricing.startTrial : t.pricing.contact}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Free Trial Note */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          {t.pricing.freeTrial} • Aucune carte de crédit requise
        </p>
      </div>
    </section>
  );
};
