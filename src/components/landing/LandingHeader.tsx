import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSelector } from '@/components/LanguageSelector';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export const LandingHeader: React.FC = () => {
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">W</span>
            </div>
            <span className="text-xl font-bold text-foreground">WASFA PRO</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              {t.nav.features}
            </a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              {t.nav.pricing}
            </a>
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
              {t.nav.about}
            </a>
          </nav>

          {/* Right Side */}
          <div className="hidden lg:flex items-center gap-4">
            <LanguageSelector />
            <Link to="/auth">
              <Button variant="ghost">{t.nav.login}</Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button variant="hero">{t.nav.signup}</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <LanguageSelector />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border/30 py-4 animate-fade-in">
            <nav className="flex flex-col gap-4">
              <a
                href="#features"
                className="text-muted-foreground hover:text-foreground transition-colors px-2 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.nav.features}
              </a>
              <a
                href="#pricing"
                className="text-muted-foreground hover:text-foreground transition-colors px-2 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.nav.pricing}
              </a>
              <a
                href="#about"
                className="text-muted-foreground hover:text-foreground transition-colors px-2 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.nav.about}
              </a>
              <div className="flex flex-col gap-2 pt-4 border-t border-border/30">
                <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    {t.nav.login}
                  </Button>
                </Link>
                <Link to="/auth?mode=signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="hero" className="w-full">
                    {t.nav.signup}
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
