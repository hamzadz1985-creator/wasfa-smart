import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Sparkles, Shield, Zap, Clock } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { t, dir } = useLanguage();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero" dir={dir}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-hero-pattern opacity-50" />
      
      {/* Animated Gradient Orbs */}
      <div className="absolute top-1/4 start-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 end-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      
      <div className="container mx-auto px-4 pt-24 pb-16 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-fade-in">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-sm text-muted-foreground">
              {t.pricing.freeTrial}
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in">
            <span className="text-foreground">{t.hero.title}</span>
            <br />
            <span className="text-gradient-primary">{t.hero.titleHighlight}</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {t.hero.subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Link to="/auth?mode=signup">
              <Button variant="hero" size="xl" className="group">
                {t.hero.cta}
                <Arrow className="h-5 w-5 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 ms-2" />
              </Button>
            </Link>
            <Button variant="glass" size="xl">
              {t.hero.ctaSecondary}
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">بيانات مشفرة وآمنة</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-accent" />
              <span className="text-sm text-muted-foreground">إعداد في دقيقتين</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{t.hero.trustedBy}</span>
              <span className="text-sm font-bold text-primary">+1000</span>
              <span className="text-sm text-muted-foreground">{t.hero.doctors}</span>
            </div>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-16 max-w-5xl mx-auto animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <div className="relative">
            {/* Glow Effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 rounded-2xl blur-2xl opacity-60" />
            
            {/* Dashboard Mockup */}
            <div className="relative glass rounded-2xl border border-border/50 overflow-hidden shadow-2xl">
              {/* Browser Bar */}
              <div className="flex items-center gap-2 px-4 py-3 bg-secondary/50 border-b border-border/50">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive/70" />
                  <div className="w-3 h-3 rounded-full bg-warning/70" />
                  <div className="w-3 h-3 rounded-full bg-success/70" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="h-6 bg-background/50 rounded-md w-64 mx-auto" />
                </div>
              </div>
              
              {/* Dashboard Content */}
              <div className="p-6 bg-background/30">
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-24 rounded-xl bg-card/50 border border-border/30 p-4">
                      <div className="h-3 w-16 bg-muted rounded mb-2" />
                      <div className="h-6 w-12 bg-primary/30 rounded" />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 h-64 rounded-xl bg-card/50 border border-border/30 p-4">
                    <div className="h-3 w-32 bg-muted rounded mb-4" />
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-10 rounded-lg bg-secondary/50 flex items-center px-4 gap-4">
                          <div className="w-8 h-8 rounded-full bg-primary/20" />
                          <div className="flex-1 h-3 bg-muted rounded" />
                          <div className="w-20 h-3 bg-accent/30 rounded" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="h-64 rounded-xl bg-card/50 border border-border/30 p-4">
                    <div className="h-3 w-24 bg-muted rounded mb-4" />
                    <div className="h-40 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};