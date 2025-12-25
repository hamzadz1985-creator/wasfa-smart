import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Loader2, Save, Stethoscope, Building2 } from 'lucide-react';

export const SettingsPanel: React.FC = () => {
  const { t } = useLanguage();
  const { profile, tenant, loading, updateProfile, updateTenant } = useProfile();
  const [saving, setSaving] = useState(false);
  
  const [doctorForm, setDoctorForm] = useState({
    full_name: profile?.full_name || '',
    specialty: profile?.specialty || '',
    license_number: profile?.license_number || '',
    phone: profile?.phone || '',
  });

  const [clinicForm, setClinicForm] = useState({
    name: tenant?.name || '',
    address: tenant?.address || '',
    phone: tenant?.phone || '',
    footer_note: tenant?.footer_note || '',
  });

  React.useEffect(() => {
    if (profile) {
      setDoctorForm({
        full_name: profile.full_name || '',
        specialty: profile.specialty || '',
        license_number: profile.license_number || '',
        phone: profile.phone || '',
      });
    }
    if (tenant) {
      setClinicForm({
        name: tenant.name || '',
        address: tenant.address || '',
        phone: tenant.phone || '',
        footer_note: tenant.footer_note || '',
      });
    }
  }, [profile, tenant]);

  const handleSaveDoctor = async () => {
    setSaving(true);
    const { error } = await updateProfile(doctorForm) || {};
    setSaving(false);
    if (error) {
      toast({ title: t.common.error, description: error.message, variant: 'destructive' });
    } else {
      toast({ title: t.common.success, description: t.common.save });
    }
  };

  const handleSaveClinic = async () => {
    setSaving(true);
    const { error } = await updateTenant(clinicForm) || {};
    setSaving(false);
    if (error) {
      toast({ title: t.common.error, description: error.message, variant: 'destructive' });
    } else {
      toast({ title: t.common.success, description: t.common.save });
    }
  };

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-foreground">{t.dashboard.settings}</h2>

      {/* Doctor Info */}
      <div className="glass rounded-xl border border-border/30 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Stethoscope className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">{t.settings.doctorInfo}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label>{t.settings.fullName}</Label><Input value={doctorForm.full_name} onChange={(e) => setDoctorForm({...doctorForm, full_name: e.target.value})} className="mt-1" /></div>
          <div><Label>{t.settings.specialty}</Label><Input value={doctorForm.specialty} onChange={(e) => setDoctorForm({...doctorForm, specialty: e.target.value})} className="mt-1" /></div>
          <div><Label>{t.settings.licenseNumber}</Label><Input value={doctorForm.license_number} onChange={(e) => setDoctorForm({...doctorForm, license_number: e.target.value})} className="mt-1" /></div>
          <div><Label>{t.settings.phone}</Label><Input value={doctorForm.phone} onChange={(e) => setDoctorForm({...doctorForm, phone: e.target.value})} className="mt-1" dir="ltr" /></div>
        </div>
        <Button onClick={handleSaveDoctor} disabled={saving} className="mt-4 gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {t.common.save}
        </Button>
      </div>

      {/* Clinic Info */}
      <div className="glass rounded-xl border border-border/30 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-info" />
          </div>
          <h3 className="text-lg font-semibold">{t.settings.clinicInfo}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label>{t.settings.clinicName}</Label><Input value={clinicForm.name} onChange={(e) => setClinicForm({...clinicForm, name: e.target.value})} className="mt-1" /></div>
          <div><Label>{t.settings.phone}</Label><Input value={clinicForm.phone} onChange={(e) => setClinicForm({...clinicForm, phone: e.target.value})} className="mt-1" dir="ltr" /></div>
          <div className="md:col-span-2"><Label>{t.settings.address}</Label><Input value={clinicForm.address} onChange={(e) => setClinicForm({...clinicForm, address: e.target.value})} className="mt-1" /></div>
          <div className="md:col-span-2"><Label>{t.settings.prescriptionFooter}</Label><Textarea value={clinicForm.footer_note} onChange={(e) => setClinicForm({...clinicForm, footer_note: e.target.value})} className="mt-1" placeholder={t.settings.prescriptionFooterHint} /></div>
        </div>
        <Button onClick={handleSaveClinic} disabled={saving} className="mt-4 gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {t.common.save}
        </Button>
      </div>
    </div>
  );
};
