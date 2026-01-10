import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Users, 
  LayoutTemplate, 
  Settings,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles
} from 'lucide-react';

interface OnboardingStep {
  key: string;
  icon: typeof FileText;
  completed: boolean;
}

interface WelcomeCardProps {
  onNavigate: (section: string) => void;
  patientsCount: number;
  prescriptionsCount: number;
  templatesCount: number;
  hasSettings: boolean;
}

export const WelcomeCard: React.FC<WelcomeCardProps> = ({
  onNavigate,
  patientsCount,
  prescriptionsCount,
  templatesCount,
  hasSettings,
}) => {
  const { language, dir } = useLanguage();
  const { profile } = useProfile();
  const [dismissed, setDismissed] = useState(false);

  // Check if user has completed onboarding
  const completedSteps = [
    hasSettings,
    patientsCount > 0,
    prescriptionsCount > 0,
    templatesCount > 0,
  ].filter(Boolean).length;

  const isComplete = completedSteps >= 3;

  useEffect(() => {
    const dismissedKey = `onboarding_dismissed_${profile?.id}`;
    if (localStorage.getItem(dismissedKey) === 'true') {
      setDismissed(true);
    }
  }, [profile?.id]);

  const handleDismiss = () => {
    if (profile?.id) {
      localStorage.setItem(`onboarding_dismissed_${profile.id}`, 'true');
    }
    setDismissed(true);
  };

  if (dismissed || isComplete) return null;

  const content = {
    ar: {
      title: 'مرحباً بك في WASFA PRO!',
      subtitle: 'أكمل هذه الخطوات للبدء',
      step1: 'أكمل إعدادات الملف الشخصي',
      step2: 'أضف أول مريض',
      step3: 'أنشئ أول وصفة طبية',
      step4: 'أنشئ قالب وصفة',
      dismiss: 'تخطي',
      go: 'ابدأ',
    },
    fr: {
      title: 'Bienvenue sur WASFA PRO!',
      subtitle: 'Complétez ces étapes pour commencer',
      step1: 'Complétez les paramètres du profil',
      step2: 'Ajoutez votre premier patient',
      step3: 'Créez votre première ordonnance',
      step4: 'Créez un modèle de prescription',
      dismiss: 'Ignorer',
      go: 'Commencer',
    },
    en: {
      title: 'Welcome to WASFA PRO!',
      subtitle: 'Complete these steps to get started',
      step1: 'Complete profile settings',
      step2: 'Add your first patient',
      step3: 'Create your first prescription',
      step4: 'Create a prescription template',
      dismiss: 'Skip',
      go: 'Start',
    },
  };

  const t = content[language as keyof typeof content] || content.en;
  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const steps = [
    { key: 'settings', label: t.step1, icon: Settings, completed: hasSettings, section: 'settings' },
    { key: 'patients', label: t.step2, icon: Users, completed: patientsCount > 0, section: 'patients' },
    { key: 'prescriptions', label: t.step3, icon: FileText, completed: prescriptionsCount > 0, section: 'prescriptions' },
    { key: 'templates', label: t.step4, icon: LayoutTemplate, completed: templatesCount > 0, section: 'templates' },
  ];

  return (
    <div className="glass rounded-xl border border-primary/30 p-6 mb-6 animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">{t.title}</h3>
            <p className="text-sm text-muted-foreground">{t.subtitle}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleDismiss}>
          {t.dismiss}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {steps.map((step, index) => (
          <button
            key={step.key}
            onClick={() => onNavigate(step.section)}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
              step.completed 
                ? 'bg-success/10 border-success/30' 
                : 'bg-muted/30 border-border hover:border-primary/50 hover:bg-muted/50'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              step.completed ? 'bg-success/20' : 'bg-primary/10'
            }`}>
              {step.completed ? (
                <CheckCircle className="h-4 w-4 text-success" />
              ) : (
                <step.icon className="h-4 w-4 text-primary" />
              )}
            </div>
            <span className={`text-sm font-medium text-start flex-1 ${
              step.completed ? 'text-success line-through' : 'text-foreground'
            }`}>
              {step.label}
            </span>
            {!step.completed && (
              <ArrowIcon className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500"
            style={{ width: `${(completedSteps / 4) * 100}%` }}
          />
        </div>
        <span className="text-sm font-medium text-muted-foreground">
          {completedSteps}/4
        </span>
      </div>
    </div>
  );
};
