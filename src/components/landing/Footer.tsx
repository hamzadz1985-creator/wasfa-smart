import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t, dir, language } = useLanguage();

  const contactInfo = {
    email: 'contact@wasfapro.com',
    phone: language === 'ar' ? '+966 50 000 0000' : '+33 1 23 45 67 89',
    location: language === 'ar' ? 'الرياض، السعودية' : language === 'fr' ? 'Paris, France' : 'Paris, France',
  };

  return (
    <footer id="about" className="bg-card border-t border-border/30" dir={dir}>
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">W</span>
              </div>
              <span className="text-xl font-bold text-foreground">WASFA PRO</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t.footer.description}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">{t.footer.product}</h4>
            <ul className="space-y-3">
              <li>
                <a href="#features" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t.nav.features}
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t.nav.pricing}
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t.footer.security}
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  API
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">{t.footer.resources}</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t.footer.documentation}
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t.footer.gettingStarted}
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t.footer.faq}
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t.footer.support}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">{t.footer.contact}</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                {contactInfo.email}
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                {contactInfo.phone}
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                {contactInfo.location}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border/30">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} WASFA PRO. {t.footer.allRightsReserved}
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {t.footer.legalNotice}
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {t.footer.privacyPolicy}
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {t.footer.terms}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};