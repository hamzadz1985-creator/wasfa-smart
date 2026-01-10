import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSubscription } from '@/hooks/useSubscription';
import { AlertTriangle, Clock, XCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const SubscriptionBanner: React.FC = () => {
  const { language } = useLanguage();
  const { status, daysRemaining, isActive, message } = useSubscription();

  // Don't show banner for active subscriptions
  if (status === 'active') return null;

  const getBannerContent = () => {
    if (status === 'trial' && daysRemaining !== null && daysRemaining > 0) {
      const daysText = {
        ar: `باقي ${daysRemaining} يوم في الفترة التجريبية`,
        fr: `${daysRemaining} jours restants dans la période d'essai`,
        en: `${daysRemaining} days remaining in trial period`,
      };
      return {
        icon: Clock,
        text: daysText[language as keyof typeof daysText] || daysText.en,
        variant: daysRemaining <= 3 ? 'warning' : 'info',
        showUpgrade: true,
      };
    }

    if (status === 'trial' && (daysRemaining === null || daysRemaining <= 0)) {
      const expiredText = {
        ar: 'انتهت الفترة التجريبية. يرجى الترقية للاستمرار.',
        fr: 'La période d\'essai a expiré. Veuillez mettre à niveau.',
        en: 'Trial period has expired. Please upgrade to continue.',
      };
      return {
        icon: AlertTriangle,
        text: expiredText[language as keyof typeof expiredText] || expiredText.en,
        variant: 'error',
        showUpgrade: true,
      };
    }

    if (status === 'expired') {
      const expiredText = {
        ar: 'انتهى اشتراكك. يرجى التجديد للاستمرار.',
        fr: 'Votre abonnement a expiré. Veuillez renouveler.',
        en: 'Your subscription has expired. Please renew to continue.',
      };
      return {
        icon: XCircle,
        text: expiredText[language as keyof typeof expiredText] || expiredText.en,
        variant: 'error',
        showUpgrade: true,
      };
    }

    if (status === 'suspended') {
      const suspendedText = {
        ar: 'تم تعليق حسابك. يرجى التواصل مع الدعم.',
        fr: 'Votre compte est suspendu. Veuillez contacter le support.',
        en: 'Your account is suspended. Please contact support.',
      };
      return {
        icon: XCircle,
        text: suspendedText[language as keyof typeof suspendedText] || suspendedText.en,
        variant: 'error',
        showUpgrade: false,
      };
    }

    return null;
  };

  const content = getBannerContent();
  if (!content) return null;

  const variantStyles = {
    info: 'bg-info/10 border-info/30 text-info',
    warning: 'bg-warning/10 border-warning/30 text-warning',
    error: 'bg-destructive/10 border-destructive/30 text-destructive',
  };

  const upgradeText = {
    ar: 'ترقية الآن',
    fr: 'Mettre à niveau',
    en: 'Upgrade Now',
  };

  return (
    <div className={`border rounded-lg px-4 py-3 mb-4 flex items-center justify-between gap-4 ${variantStyles[content.variant as keyof typeof variantStyles]}`}>
      <div className="flex items-center gap-3">
        <content.icon className="h-5 w-5 flex-shrink-0" />
        <span className="text-sm font-medium">{content.text}</span>
      </div>
      {content.showUpgrade && (
        <Button 
          size="sm" 
          variant={content.variant === 'error' ? 'destructive' : 'default'}
          className="flex-shrink-0"
        >
          {upgradeText[language as keyof typeof upgradeText] || upgradeText.en}
        </Button>
      )}
    </div>
  );
};
