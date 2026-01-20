import React, { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Save, Stethoscope, Building2, Upload, Image, PenTool, X } from 'lucide-react';

export const SettingsPanel: React.FC = () => {
  const { t } = useLanguage();
  const { profile, tenant, loading, updateProfile, updateTenant, refetch, signedSignatureUrl, signedLogoUrl } = useProfile();
  const [saving, setSaving] = useState(false);
  const [uploadingSignature, setUploadingSignature] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  
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

  const uploadFile = async (
    file: File, 
    folder: 'signatures' | 'logos',
    setUploading: (v: boolean) => void
  ) => {
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user's tenant_id for proper folder structure
      const { data: profileData } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single();
      
      if (!profileData?.tenant_id) throw new Error('No tenant found');

      const fileExt = file.name.split('.').pop();
      // Store files under tenant folder for proper RLS access
      const fileName = `${profileData.tenant_id}/${folder}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('clinic-assets')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Store just the file path in the database, not a public URL
      // The signed URL will be generated when displaying
      return fileName;
    } catch (error: any) {
      toast({ title: t.common.error, description: error.message, variant: 'destructive' });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadFile(file, 'signatures', setUploadingSignature);
    if (url) {
      await updateProfile({ signature_url: url });
      await refetch();
      toast({ title: t.common.success });
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadFile(file, 'logos', setUploadingLogo);
    if (url) {
      await updateTenant({ logo_url: url });
      await refetch();
      toast({ title: t.common.success });
    }
  };

  const removeSignature = async () => {
    await updateProfile({ signature_url: null });
    await refetch();
    toast({ title: t.common.success });
  };

  const removeLogo = async () => {
    await updateTenant({ logo_url: null });
    await refetch();
    toast({ title: t.common.success });
  };

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
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-2xl font-bold text-foreground">{t.dashboard.settings}</h2>

      {/* Doctor Info */}
      <div className="glass rounded-xl border border-border/30 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Stethoscope className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">{t.settings.doctorInfo}</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label>{t.settings.fullName}</Label>
              <Input value={doctorForm.full_name} onChange={(e) => setDoctorForm({...doctorForm, full_name: e.target.value})} className="mt-1" />
            </div>
            <div>
              <Label>{t.settings.specialty}</Label>
              <Input value={doctorForm.specialty} onChange={(e) => setDoctorForm({...doctorForm, specialty: e.target.value})} className="mt-1" />
            </div>
            <div>
              <Label>{t.settings.licenseNumber}</Label>
              <Input value={doctorForm.license_number} onChange={(e) => setDoctorForm({...doctorForm, license_number: e.target.value})} className="mt-1" />
            </div>
            <div>
              <Label>{t.settings.phone}</Label>
              <Input value={doctorForm.phone} onChange={(e) => setDoctorForm({...doctorForm, phone: e.target.value})} className="mt-1" dir="ltr" />
            </div>
          </div>
          
          {/* Signature Upload */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <PenTool className="h-4 w-4" />
              التوقيع الرقمي
            </Label>
            <div className="border-2 border-dashed border-border rounded-xl p-4 text-center relative group">
              {profile?.signature_url && signedSignatureUrl ? (
                <div className="relative">
                  <img 
                    src={signedSignatureUrl} 
                    alt="Signature" 
                    className="max-h-32 mx-auto object-contain"
                  />
                  <button
                    onClick={removeSignature}
                    className="absolute top-0 end-0 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => signatureInputRef.current?.click()}
                  className="cursor-pointer py-8 hover:bg-muted/30 rounded-lg transition-colors"
                >
                  {uploadingSignature ? (
                    <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
                  ) : (
                    <>
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">انقر لرفع التوقيع</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">PNG, JPG (أقصى 2MB)</p>
                    </>
                  )}
                </div>
              )}
              <input
                ref={signatureInputRef}
                type="file"
                accept="image/*"
                onChange={handleSignatureUpload}
                className="hidden"
              />
            </div>
            {profile?.signature_url && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => signatureInputRef.current?.click()}
                disabled={uploadingSignature}
              >
                <Upload className="h-4 w-4 me-2" />
                تغيير التوقيع
              </Button>
            )}
          </div>
        </div>
        
        <Button onClick={handleSaveDoctor} disabled={saving} className="mt-6 gap-2">
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label>{t.settings.clinicName}</Label>
              <Input value={clinicForm.name} onChange={(e) => setClinicForm({...clinicForm, name: e.target.value})} className="mt-1" />
            </div>
            <div>
              <Label>{t.settings.phone}</Label>
              <Input value={clinicForm.phone} onChange={(e) => setClinicForm({...clinicForm, phone: e.target.value})} className="mt-1" dir="ltr" />
            </div>
            <div>
              <Label>{t.settings.address}</Label>
              <Input value={clinicForm.address} onChange={(e) => setClinicForm({...clinicForm, address: e.target.value})} className="mt-1" />
            </div>
            <div>
              <Label>{t.settings.prescriptionFooter}</Label>
              <Textarea 
                value={clinicForm.footer_note} 
                onChange={(e) => setClinicForm({...clinicForm, footer_note: e.target.value})} 
                className="mt-1" 
                placeholder={t.settings.prescriptionFooterHint}
                rows={3}
              />
            </div>
          </div>
          
          {/* Logo Upload */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              شعار العيادة
            </Label>
            <div className="border-2 border-dashed border-border rounded-xl p-4 text-center relative group">
              {tenant?.logo_url && signedLogoUrl ? (
                <div className="relative">
                  <img 
                    src={signedLogoUrl} 
                    alt="Clinic Logo" 
                    className="max-h-32 mx-auto object-contain"
                  />
                  <button
                    onClick={removeLogo}
                    className="absolute top-0 end-0 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => logoInputRef.current?.click()}
                  className="cursor-pointer py-8 hover:bg-muted/30 rounded-lg transition-colors"
                >
                  {uploadingLogo ? (
                    <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
                  ) : (
                    <>
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">انقر لرفع الشعار</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">PNG, JPG (أقصى 2MB)</p>
                    </>
                  )}
                </div>
              )}
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </div>
            {tenant?.logo_url && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => logoInputRef.current?.click()}
                disabled={uploadingLogo}
              >
                <Upload className="h-4 w-4 me-2" />
                تغيير الشعار
              </Button>
            )}
          </div>
        </div>
        
        <Button onClick={handleSaveClinic} disabled={saving} className="mt-6 gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {t.common.save}
        </Button>
      </div>
    </div>
  );
};
