import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  FileText, 
  Users, 
  LayoutTemplate, 
  Download, 
  Shield, 
  Globe 
} from 'lucide-react';

const featureIcons = {
  prescription: FileText,
  patients: Users,
  templates: LayoutTemplate,
  export: Download,
  security: Shield,
  multiLang: Globe,
};

export const FeaturesSection: React.FC = () => {
  const { t, dir } = useLanguage();

  const features = [
    { key: 'prescription', ...t.features.prescription },
    { key: 'patients', ...t.features.patients },
    { key: 'templates', ...t.features.templates },
    { key: 'export', ...t.features.export },
    { key: 'security', ...t.features.security },
    { key: 'multiLang', ...t.features.multiLang },
  ];

  return (
    <section id="features" className="py-24 bg-background relative overflow-hidden" dir={dir}>
      {/* Background Elements */}
      <div className="absolute top-0 start-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 end-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {t.features.title}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t.features.subtitle}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = featureIcons[feature.key as keyof typeof featureIcons];
            return (
              <div
                key={feature.key}
                className="group relative p-6 lg:p-8 rounded-2xl glass border border-border/30 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="h-7 w-7 text-primary" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold mb-3 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover Gradient */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};