import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Download, FileSpreadsheet, FileText, Loader2, Calendar } from 'lucide-react';
import { Prescription } from '@/hooks/usePrescriptions';
import { Patient } from '@/hooks/usePatients';
import { format } from 'date-fns';
import { ar, fr } from 'date-fns/locale';

interface ExportReportsProps {
  prescriptions: Prescription[];
  patients: Patient[];
}

type ExportFormat = 'csv' | 'json';
type ExportType = 'prescriptions' | 'patients' | 'statistics';
type DateRange = 'all' | 'today' | 'week' | 'month' | 'year';

export const ExportReports: React.FC<ExportReportsProps> = ({ prescriptions, patients }) => {
  const { t, language } = useLanguage();
  const [exportType, setExportType] = useState<ExportType>('prescriptions');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [exporting, setExporting] = useState(false);

  const labels = {
    exportReports: language === 'ar' ? 'تصدير التقارير' : language === 'fr' ? 'Exporter les rapports' : 'Export Reports',
    exportType: language === 'ar' ? 'نوع التقرير' : language === 'fr' ? 'Type de rapport' : 'Report Type',
    format: language === 'ar' ? 'صيغة الملف' : language === 'fr' ? 'Format de fichier' : 'File Format',
    dateRange: language === 'ar' ? 'الفترة الزمنية' : language === 'fr' ? 'Période' : 'Date Range',
    export: language === 'ar' ? 'تصدير' : language === 'fr' ? 'Exporter' : 'Export',
    prescriptions: language === 'ar' ? 'الوصفات الطبية' : language === 'fr' ? 'Prescriptions' : 'Prescriptions',
    patients: language === 'ar' ? 'المرضى' : language === 'fr' ? 'Patients' : 'Patients',
    statistics: language === 'ar' ? 'الإحصائيات' : language === 'fr' ? 'Statistiques' : 'Statistics',
    all: language === 'ar' ? 'الكل' : language === 'fr' ? 'Tout' : 'All',
    today: language === 'ar' ? 'اليوم' : language === 'fr' ? "Aujourd'hui" : 'Today',
    week: language === 'ar' ? 'هذا الأسبوع' : language === 'fr' ? 'Cette semaine' : 'This Week',
    month: language === 'ar' ? 'هذا الشهر' : language === 'fr' ? 'Ce mois' : 'This Month',
    year: language === 'ar' ? 'هذه السنة' : language === 'fr' ? 'Cette année' : 'This Year',
    exportSuccess: language === 'ar' ? 'تم تصدير التقرير بنجاح' : language === 'fr' ? 'Rapport exporté avec succès' : 'Report exported successfully',
    noData: language === 'ar' ? 'لا توجد بيانات للتصدير' : language === 'fr' ? 'Aucune donnée à exporter' : 'No data to export',
  };

  const filterByDateRange = <T extends { created_at?: string }>(items: T[]): T[] => {
    if (dateRange === 'all') return items;

    const now = new Date();
    let startDate: Date;

    switch (dateRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - now.getDay()));
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        return items;
    }

    return items.filter(item => {
      const itemDate = new Date(item.created_at || '');
      return itemDate >= startDate;
    });
  };

  const generateCSV = (data: any[], headers: string[]): string => {
    const csvRows = [headers.join(',')];
    
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return String(value);
      });
      csvRows.push(values.join(','));
    });

    return '\uFEFF' + csvRows.join('\n'); // BOM for Arabic support
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    setExporting(true);

    try {
      const dateLocale = language === 'ar' ? ar : language === 'fr' ? fr : undefined;
      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm', { locale: dateLocale });
      let data: any[];
      let headers: string[];
      let filename: string;

      switch (exportType) {
        case 'prescriptions':
          data = filterByDateRange(prescriptions).map(p => ({
            id: p.id,
            patient_name: p.patient?.full_name || '',
            notes: p.notes || '',
            medications_count: p.medications?.length || 0,
            medications: p.medications?.map(m => m.medication_name).join('; ') || '',
            created_at: p.created_at ? format(new Date(p.created_at), 'yyyy-MM-dd HH:mm') : '',
          }));
          headers = ['id', 'patient_name', 'notes', 'medications_count', 'medications', 'created_at'];
          filename = `prescriptions_${timestamp}`;
          break;

        case 'patients':
          data = filterByDateRange(patients).map(p => ({
            id: p.id,
            full_name: p.full_name,
            date_of_birth: p.date_of_birth || '',
            gender: p.gender || '',
            phone: p.phone || '',
            allergies: p.allergies || '',
            chronic_diseases: p.chronic_diseases || '',
            notes: p.notes || '',
            created_at: p.created_at ? format(new Date(p.created_at), 'yyyy-MM-dd HH:mm') : '',
          }));
          headers = ['id', 'full_name', 'date_of_birth', 'gender', 'phone', 'allergies', 'chronic_diseases', 'notes', 'created_at'];
          filename = `patients_${timestamp}`;
          break;

        case 'statistics':
          const filteredPrescriptions = filterByDateRange(prescriptions);
          const filteredPatients = filterByDateRange(patients);
          
          // Aggregate statistics
          const medCounts: Record<string, number> = {};
          filteredPrescriptions.forEach(p => {
            p.medications?.forEach(med => {
              medCounts[med.medication_name] = (medCounts[med.medication_name] || 0) + 1;
            });
          });

          data = [
            { metric: 'Total Prescriptions', value: filteredPrescriptions.length },
            { metric: 'Total Patients', value: filteredPatients.length },
            { metric: 'Male Patients', value: filteredPatients.filter(p => p.gender === 'male').length },
            { metric: 'Female Patients', value: filteredPatients.filter(p => p.gender === 'female').length },
            { metric: 'Average Medications per Prescription', value: (filteredPrescriptions.reduce((sum, p) => sum + (p.medications?.length || 0), 0) / filteredPrescriptions.length || 0).toFixed(2) },
            ...Object.entries(medCounts).slice(0, 10).map(([name, count]) => ({
              metric: `Medication: ${name}`,
              value: count,
            })),
          ];
          headers = ['metric', 'value'];
          filename = `statistics_${timestamp}`;
          break;

        default:
          throw new Error('Invalid export type');
      }

      if (data.length === 0) {
        toast({ title: labels.noData, variant: 'destructive' });
        return;
      }

      let content: string;
      let mimeType: string;
      let extension: string;

      if (exportFormat === 'csv') {
        content = generateCSV(data, headers);
        mimeType = 'text/csv;charset=utf-8;';
        extension = 'csv';
      } else {
        content = JSON.stringify(data, null, 2);
        mimeType = 'application/json;charset=utf-8;';
        extension = 'json';
      }

      downloadFile(content, `${filename}.${extension}`, mimeType);
      toast({ title: labels.exportSuccess });

    } catch (error: any) {
      toast({ title: t.common.error, description: error.message, variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card className="glass border-border/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileSpreadsheet className="h-5 w-5 text-primary" />
          {labels.exportReports}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>{labels.exportType}</Label>
            <Select value={exportType} onValueChange={(v) => setExportType(v as ExportType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prescriptions">
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {labels.prescriptions}
                  </span>
                </SelectItem>
                <SelectItem value="patients">
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {labels.patients}
                  </span>
                </SelectItem>
                <SelectItem value="statistics">
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {labels.statistics}
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{labels.dateRange}</Label>
            <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{labels.all}</SelectItem>
                <SelectItem value="today">{labels.today}</SelectItem>
                <SelectItem value="week">{labels.week}</SelectItem>
                <SelectItem value="month">{labels.month}</SelectItem>
                <SelectItem value="year">{labels.year}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{labels.format}</Label>
            <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as ExportFormat)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <span className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    CSV (Excel)
                  </span>
                </SelectItem>
                <SelectItem value="json">
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    JSON
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleExport} disabled={exporting} className="w-full gap-2">
          {exporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {labels.export}
        </Button>
      </CardContent>
    </Card>
  );
};
