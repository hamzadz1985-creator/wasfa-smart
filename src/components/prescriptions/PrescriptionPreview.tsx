import React, { useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Prescription } from '@/hooks/usePrescriptions';
import { Printer, Download, Stethoscope, Building2 } from 'lucide-react';

interface PrescriptionPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prescription: Prescription;
}

export const PrescriptionPreview: React.FC<PrescriptionPreviewProps> = ({
  open,
  onOpenChange,
  prescription,
}) => {
  const { t, dir, language } = useLanguage();
  const { profile, tenant } = useProfile();
  const printRef = useRef<HTMLDivElement>(null);

  const formatDate = (dateStr: string) => {
    const locale = language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US';
    return new Date(dateStr).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getFormLabel = (form: string | null) => {
    if (!form) return '';
    const labels: Record<string, Record<string, string>> = {
      tablet: { ar: 'أقراص', fr: 'Comprimé', en: 'Tablet' },
      capsule: { ar: 'كبسولات', fr: 'Capsule', en: 'Capsule' },
      syrup: { ar: 'شراب', fr: 'Sirop', en: 'Syrup' },
      injection: { ar: 'حقنة', fr: 'Injection', en: 'Injection' },
      cream: { ar: 'كريم', fr: 'Crème', en: 'Cream' },
      drops: { ar: 'قطرات', fr: 'Gouttes', en: 'Drops' },
      suppository: { ar: 'تحاميل', fr: 'Suppositoire', en: 'Suppository' },
      inhaler: { ar: 'بخاخ', fr: 'Inhalateur', en: 'Inhaler' },
    };
    return labels[form]?.[language] || form;
  };

  const getFrequencyLabel = (freq: string | null) => {
    if (!freq) return '';
    const labels: Record<string, Record<string, string>> = {
      once_daily: { ar: 'مرة واحدة يومياً', fr: 'Une fois par jour', en: 'Once daily' },
      twice_daily: { ar: 'مرتين يومياً', fr: 'Deux fois par jour', en: 'Twice daily' },
      three_times: { ar: 'ثلاث مرات يومياً', fr: 'Trois fois par jour', en: 'Three times daily' },
      four_times: { ar: 'أربع مرات يومياً', fr: 'Quatre fois par jour', en: 'Four times daily' },
      before_meals: { ar: 'قبل الوجبات', fr: 'Avant les repas', en: 'Before meals' },
      after_meals: { ar: 'بعد الوجبات', fr: 'Après les repas', en: 'After meals' },
      as_needed: { ar: 'عند الحاجة', fr: 'Au besoin', en: 'As needed' },
    };
    return labels[freq]?.[language] || freq;
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="${dir}">
      <head>
        <title>Prescription</title>
        <style>
          body {
            font-family: 'Cairo', 'Tajawal', sans-serif;
            padding: 20px;
            direction: ${dir};
          }
          .prescription-header {
            text-align: center;
            border-bottom: 2px solid #0d9488;
            padding-bottom: 16px;
            margin-bottom: 20px;
          }
          .doctor-name {
            font-size: 24px;
            font-weight: bold;
            color: #0d9488;
          }
          .specialty {
            color: #666;
            margin-top: 4px;
          }
          .clinic-info {
            font-size: 12px;
            color: #666;
            margin-top: 8px;
          }
          .patient-info {
            background: #f5f5f5;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .medications-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          .medications-table th,
          .medications-table td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: ${dir === 'rtl' ? 'right' : 'left'};
          }
          .medications-table th {
            background: #0d9488;
            color: white;
          }
          .footer {
            border-top: 1px solid #ddd;
            padding-top: 16px;
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          .signature {
            margin-top: 40px;
            text-align: ${dir === 'rtl' ? 'left' : 'right'};
          }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto" dir={dir}>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{language === 'ar' ? 'معاينة الوصفة' : language === 'fr' ? 'Aperçu de l\'ordonnance' : 'Prescription Preview'}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 me-1" />
                {t.prescription.print}
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div ref={printRef} className="bg-white text-black p-6 rounded-lg">
          {/* Header */}
          <div className="prescription-header text-center border-b-2 border-primary pb-4 mb-6">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Stethoscope className="h-8 w-8 text-primary" />
              <div className="doctor-name text-2xl font-bold text-primary">
                {language === 'ar' ? 'د.' : 'Dr.'} {profile?.full_name || ''}
              </div>
            </div>
            {profile?.specialty && (
              <div className="specialty text-muted-foreground">{profile.specialty}</div>
            )}
            {profile?.license_number && (
              <div className="text-sm text-muted-foreground mt-1">
                {t.settings.licenseNumber}: {profile.license_number}
              </div>
            )}
            {tenant && (
              <div className="clinic-info flex items-center justify-center gap-2 mt-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span>{tenant.name}</span>
                {tenant.address && <span>• {tenant.address}</span>}
                {tenant.phone && <span>• {tenant.phone}</span>}
              </div>
            )}
          </div>

          {/* Date */}
          <div className="text-end text-sm text-muted-foreground mb-4">
            {formatDate(prescription.created_at)}
          </div>

          {/* Patient Info */}
          <div className="patient-info bg-muted/50 p-4 rounded-lg mb-6">
            <div className="font-semibold mb-2">{t.prescription.patient}:</div>
            <div className="font-bold text-lg">{prescription.patient?.full_name}</div>
            {prescription.patient?.date_of_birth && (
              <div className="text-sm text-muted-foreground mt-1">
                {t.patient.dateOfBirth}: {formatDate(prescription.patient.date_of_birth)}
              </div>
            )}
          </div>

          {/* Medications */}
          <div className="mb-6">
            <div className="font-semibold mb-3">{t.prescription.medications}:</div>
            <table className="medications-table w-full border-collapse">
              <thead>
                <tr className="bg-primary text-primary-foreground">
                  <th className="border border-border p-3 text-start">#</th>
                  <th className="border border-border p-3 text-start">{t.prescription.medicationName}</th>
                  <th className="border border-border p-3 text-start">{t.prescription.dosage}</th>
                  <th className="border border-border p-3 text-start">{t.prescription.form}</th>
                  <th className="border border-border p-3 text-start">{t.prescription.frequency}</th>
                  <th className="border border-border p-3 text-start">{t.prescription.duration}</th>
                </tr>
              </thead>
              <tbody>
                {prescription.medications?.map((med, idx) => (
                  <tr key={idx} className="odd:bg-muted/30">
                    <td className="border border-border p-3">{idx + 1}</td>
                    <td className="border border-border p-3 font-medium">{med.medication_name}</td>
                    <td className="border border-border p-3">{med.dosage || '-'}</td>
                    <td className="border border-border p-3">{getFormLabel(med.form)}</td>
                    <td className="border border-border p-3">{getFrequencyLabel(med.frequency)}</td>
                    <td className="border border-border p-3">{med.duration || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Notes */}
          {prescription.notes && (
            <div className="mb-6 p-4 border border-border rounded-lg">
              <div className="font-semibold mb-2">{t.prescription.notes}:</div>
              <div className="text-sm">{prescription.notes}</div>
            </div>
          )}

          {/* Signature */}
          <div className="signature mt-12 text-start">
            <div className="text-sm text-muted-foreground mb-8">
              {language === 'ar' ? 'التوقيع والختم' : language === 'fr' ? 'Signature et cachet' : 'Signature and stamp'}
            </div>
            {profile?.signature_url && (
              <img src={profile.signature_url} alt="Signature" className="h-16 object-contain" />
            )}
          </div>

          {/* Footer */}
          {tenant?.footer_note && (
            <div className="footer border-t border-border pt-4 mt-8 text-center text-sm text-muted-foreground">
              {tenant.footer_note}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
