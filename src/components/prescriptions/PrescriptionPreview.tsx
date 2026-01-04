import React, { useRef, useState } from 'react';
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
import { Printer, Download, Stethoscope, Building2, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
  const [exporting, setExporting] = useState(false);

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
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
          body {
            font-family: 'Cairo', 'Tajawal', sans-serif;
            padding: 20px;
            direction: ${dir};
            background: white;
            color: black;
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
          img {
            max-width: 100%;
            height: auto;
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

  const handleExportPDF = async () => {
    const element = printRef.current;
    if (!element) return;

    setExporting(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
      const fileName = `prescription_${prescription.patient?.full_name?.replace(/\s+/g, '_') || 'patient'}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      toast({
        title: t.common.success,
        description: language === 'ar' ? 'تم تصدير الوصفة بنجاح' : language === 'fr' ? 'Ordonnance exportée avec succès' : 'Prescription exported successfully',
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: t.common.error,
        description: language === 'ar' ? 'حدث خطأ أثناء التصدير' : language === 'fr' ? 'Erreur lors de l\'export' : 'Error exporting PDF',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto" dir={dir}>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{language === 'ar' ? 'معاينة الوصفة' : language === 'fr' ? 'Aperçu de l\'ordonnance' : 'Prescription Preview'}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={exporting}>
                {exporting ? (
                  <Loader2 className="h-4 w-4 me-1 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 me-1" />
                )}
                {t.prescription.export}
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 me-1" />
                {t.prescription.print}
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div ref={printRef} className="bg-white text-black p-6 rounded-lg" style={{ direction: dir }}>
          {/* Header */}
          <div className="prescription-header text-center border-b-2 border-teal-600 pb-4 mb-6">
            {/* Clinic Logo */}
            {tenant?.logo_url && (
              <div className="mb-3">
                <img 
                  src={tenant.logo_url} 
                  alt="Clinic Logo" 
                  className="h-16 mx-auto object-contain"
                  crossOrigin="anonymous"
                />
              </div>
            )}
            <div className="flex items-center justify-center gap-3 mb-2">
              {!tenant?.logo_url && <Stethoscope className="h-8 w-8 text-teal-600" />}
              <div className="doctor-name text-2xl font-bold text-teal-600">
                {language === 'ar' ? 'د.' : 'Dr.'} {profile?.full_name || ''}
              </div>
            </div>
            {profile?.specialty && (
              <div className="specialty text-gray-600">{profile.specialty}</div>
            )}
            {profile?.license_number && (
              <div className="text-sm text-gray-600 mt-1">
                {t.settings.licenseNumber}: {profile.license_number}
              </div>
            )}
            {tenant && (
              <div className="clinic-info flex items-center justify-center gap-2 mt-2 text-sm text-gray-600">
                <Building2 className="h-4 w-4" />
                <span>{tenant.name}</span>
                {tenant.address && <span>• {tenant.address}</span>}
                {tenant.phone && <span>• {tenant.phone}</span>}
              </div>
            )}
          </div>

          {/* Date */}
          <div className="text-end text-sm text-gray-600 mb-4">
            {formatDate(prescription.created_at)}
          </div>

          {/* Patient Info */}
          <div className="patient-info bg-gray-100 p-4 rounded-lg mb-6">
            <div className="font-semibold mb-2 text-gray-700">{t.prescription.patient}:</div>
            <div className="font-bold text-lg text-black">{prescription.patient?.full_name}</div>
            {prescription.patient?.date_of_birth && (
              <div className="text-sm text-gray-600 mt-1">
                {t.patient.dateOfBirth}: {formatDate(prescription.patient.date_of_birth)}
              </div>
            )}
          </div>

          {/* Medications */}
          <div className="mb-6">
            <div className="font-semibold mb-3 text-gray-700">{t.prescription.medications}:</div>
            <table className="medications-table w-full border-collapse">
              <thead>
                <tr className="bg-teal-600 text-white">
                  <th className="border border-gray-300 p-3 text-start">#</th>
                  <th className="border border-gray-300 p-3 text-start">{t.prescription.medicationName}</th>
                  <th className="border border-gray-300 p-3 text-start">{t.prescription.dosage}</th>
                  <th className="border border-gray-300 p-3 text-start">{t.prescription.form}</th>
                  <th className="border border-gray-300 p-3 text-start">{t.prescription.frequency}</th>
                  <th className="border border-gray-300 p-3 text-start">{t.prescription.duration}</th>
                </tr>
              </thead>
              <tbody>
                {prescription.medications?.map((med, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="border border-gray-300 p-3">{idx + 1}</td>
                    <td className="border border-gray-300 p-3 font-medium">{med.medication_name}</td>
                    <td className="border border-gray-300 p-3">{med.dosage || '-'}</td>
                    <td className="border border-gray-300 p-3">{getFormLabel(med.form)}</td>
                    <td className="border border-gray-300 p-3">{getFrequencyLabel(med.frequency)}</td>
                    <td className="border border-gray-300 p-3">{med.duration || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Notes */}
          {prescription.notes && (
            <div className="mb-6 p-4 border border-gray-300 rounded-lg bg-gray-50">
              <div className="font-semibold mb-2 text-gray-700">{t.prescription.notes}:</div>
              <div className="text-sm text-black">{prescription.notes}</div>
            </div>
          )}

          {/* Signature */}
          <div className="signature mt-12 text-start">
            <div className="text-sm text-gray-600 mb-8">
              {language === 'ar' ? 'التوقيع والختم' : language === 'fr' ? 'Signature et cachet' : 'Signature and stamp'}
            </div>
            {profile?.signature_url && (
              <img 
                src={profile.signature_url} 
                alt="Signature" 
                className="h-16 object-contain"
                crossOrigin="anonymous"
              />
            )}
          </div>

          {/* Footer */}
          {tenant?.footer_note && (
            <div className="footer border-t border-gray-300 pt-4 mt-8 text-center text-sm text-gray-600">
              {tenant.footer_note}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
