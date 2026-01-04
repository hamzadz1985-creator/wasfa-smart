import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  ArrowRight,
  User, 
  Calendar, 
  Phone, 
  AlertCircle,
  FileText,
  Pill,
  Activity,
  Plus
} from 'lucide-react';
import { Patient } from '@/hooks/usePatients';
import { supabase } from '@/integrations/supabase/client';
import { Prescription } from '@/hooks/usePrescriptions';

interface PatientDetailsProps {
  patient: Patient;
  onBack: () => void;
  onCreatePrescription: (patient: Patient) => void;
}

export const PatientDetails: React.FC<PatientDetailsProps> = ({
  patient,
  onBack,
  onCreatePrescription
}) => {
  const { t, dir, language } = useLanguage();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatientPrescriptions();
  }, [patient.id]);

  const fetchPatientPrescriptions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .select(`
          *,
          medications:prescription_medications(*)
        `)
        .eq('patient_id', patient.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrescriptions((data || []) as unknown as Prescription[]);
    } catch (error) {
      console.error('Error fetching patient prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dateOfBirth: string | null): string => {
    if (!dateOfBirth) return '-';
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} ${t.patient.years}`;
  };

  const formatDate = (dateStr: string) => {
    const locale = language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US';
    return new Date(dateStr).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <BackIcon className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{patient.full_name}</h1>
              <div className="flex items-center gap-4 text-muted-foreground mt-1">
                {patient.date_of_birth && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {calculateAge(patient.date_of_birth)}
                  </span>
                )}
                {patient.gender && (
                  <Badge variant="secondary">
                    {patient.gender === 'male' ? t.patient.male : t.patient.female}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
        <Button onClick={() => onCreatePrescription(patient)} className="gap-2">
          <Plus className="h-4 w-4" />
          {t.prescription.new}
        </Button>
      </div>

      {/* Patient Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass border-border/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Phone className="h-4 w-4" />
              {t.patient.phone}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold" dir="ltr">
              {patient.phone || '-'}
            </p>
          </CardContent>
        </Card>

        <Card className="glass border-border/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {t.patient.allergies}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {patient.allergies || '-'}
            </p>
          </CardContent>
        </Card>

        <Card className="glass border-border/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4" />
              {t.patient.chronicDiseases}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {patient.chronic_diseases || '-'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Medical Notes */}
      {patient.notes && (
        <Card className="glass border-border/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t.patient.notes}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground whitespace-pre-wrap">{patient.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Prescriptions History */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {t.dashboard.prescriptions}
          <Badge variant="secondary">{prescriptions.length}</Badge>
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : prescriptions.length === 0 ? (
          <Card className="glass border-border/30">
            <CardContent className="py-12 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t.dashboard.startCreatePrescription}</p>
              <Button 
                variant="outline" 
                className="mt-4 gap-2"
                onClick={() => onCreatePrescription(patient)}
              >
                <Plus className="h-4 w-4" />
                {t.prescription.new}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {prescriptions.map((prescription) => (
              <Card key={prescription.id} className="glass border-border/30 hover:border-primary/30 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {formatDate(prescription.created_at)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {prescription.medications?.map((med, idx) => (
                          <Badge key={idx} variant="secondary" className="gap-1">
                            <Pill className="h-3 w-3" />
                            {med.medication_name}
                            {med.dosage && ` - ${med.dosage}`}
                          </Badge>
                        ))}
                      </div>
                      {prescription.notes && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {prescription.notes}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline">
                      {prescription.medications?.length || 0} {t.prescription.medications}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
