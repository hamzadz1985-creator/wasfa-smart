import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUserRole, AppRole } from '@/hooks/useUserRole';
import { Shield, Users, Stethoscope, UserCheck } from 'lucide-react';

const roleConfig: Record<AppRole, { icon: typeof Shield; color: string }> = {
  super_admin: { icon: Shield, color: 'text-destructive' },
  clinic_admin: { icon: Users, color: 'text-primary' },
  doctor: { icon: Stethoscope, color: 'text-info' },
  assistant: { icon: UserCheck, color: 'text-muted-foreground' },
};

export const RoleBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { language } = useLanguage();
  const { role } = useUserRole();

  if (!role) return null;

  const roleLabels: Record<AppRole, Record<string, string>> = {
    super_admin: { ar: 'مدير النظام', fr: 'Super Admin', en: 'Super Admin' },
    clinic_admin: { ar: 'مدير العيادة', fr: 'Admin Clinique', en: 'Clinic Admin' },
    doctor: { ar: 'طبيب', fr: 'Médecin', en: 'Doctor' },
    assistant: { ar: 'مساعد', fr: 'Assistant', en: 'Assistant' },
  };

  const config = roleConfig[role];
  const Icon = config.icon;
  const label = roleLabels[role][language] || roleLabels[role].en;

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <Icon className={`h-3.5 w-3.5 ${config.color}`} />
      <span className={`text-xs font-medium ${config.color}`}>{label}</span>
    </div>
  );
};
