import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Patient } from '@/hooks/usePatients';
import { Medication } from '@/hooks/usePrescriptions';
import { toast } from '@/hooks/use-toast';
import { MedicationAutocomplete } from './MedicationAutocomplete';
import { useFavoriteMedications, FavoriteMedication } from '@/hooks/useFavoriteMedications';

interface PrescriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (patientId: string, medications: Omit<Medication, 'id' | 'prescription_id'>[], notes?: string) => Promise<{ error?: any }>;
  patients: Patient[];
  selectedPatient?: Patient | null;
}

const emptyMedication = (): Omit<Medication, 'id' | 'prescription_id'> => ({
  medication_name: '',
  dosage: '',
  form: '',
  frequency: '',
  duration: '',
  notes: '',
  sort_order: 0,
});

const medicationForms = [
  'tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops', 'suppository', 'inhaler'
];

const frequencies = [
  'once_daily', 'twice_daily', 'three_times', 'four_times', 'before_meals', 'after_meals', 'as_needed'
];

export const PrescriptionDialog: React.FC<PrescriptionDialogProps> = ({
  open,
  onOpenChange,
  onSave,
  patients,
  selectedPatient,
}) => {
  const { t, dir, language } = useLanguage();
  const { favorites, addFavorite } = useFavoriteMedications();
  const [loading, setLoading] = useState(false);
  const [patientId, setPatientId] = useState(selectedPatient?.id || '');
  const [notes, setNotes] = useState('');
  const [medications, setMedications] = useState<Omit<Medication, 'id' | 'prescription_id'>[]>([
    emptyMedication()
  ]);

  const getFormLabel = (form: string) => {
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

  const getFrequencyLabel = (freq: string) => {
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

  const addMedication = () => {
    setMedications([...medications, { ...emptyMedication(), sort_order: medications.length }]);
  };

  const removeMedication = (index: number) => {
    if (medications.length === 1) return;
    setMedications(medications.filter((_, i) => i !== index));
  };

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    const updated = [...medications];
    (updated[index] as any)[field] = value;
    setMedications(updated);
  };

  const handleSelectFavorite = (index: number, favorite: FavoriteMedication) => {
    const updated = [...medications];
    updated[index] = {
      medication_name: favorite.medication_name,
      dosage: favorite.dosage || '',
      form: favorite.form || '',
      frequency: favorite.frequency || '',
      duration: favorite.duration || '',
      notes: '',
      sort_order: index,
    };
    setMedications(updated);
  };

  const handleAddToFavorites = async (index: number) => {
    const med = medications[index];
    if (!med.medication_name.trim()) return;

    const { error } = await addFavorite({
      medication_name: med.medication_name,
      dosage: med.dosage || null,
      form: med.form || null,
      frequency: med.frequency || null,
      duration: med.duration || null,
    });

    if (error) {
      toast({
        title: t.common.error,
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: t.common.success,
        description: language === 'ar' ? 'تمت الإضافة للمفضلة' : 
                     language === 'fr' ? 'Ajouté aux favoris' : 
                     'Added to favorites',
      });
    }
  };

  const isMedicationFavorite = (medicationName: string) => {
    return favorites.some(f => 
      f.medication_name.toLowerCase() === medicationName.toLowerCase()
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!patientId) {
      toast({
        title: t.common.error,
        description: t.prescription.selectPatient,
        variant: 'destructive',
      });
      return;
    }

    const validMedications = medications.filter(m => m.medication_name.trim());
    if (validMedications.length === 0) {
      toast({
        title: t.common.error,
        description: t.prescription.addMedication,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const { error } = await onSave(patientId, validMedications, notes || undefined);
    setLoading(false);

    if (error) {
      toast({
        title: t.common.error,
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: t.common.success,
        description: t.prescription.created,
      });
      onOpenChange(false);
      setPatientId('');
      setNotes('');
      setMedications([emptyMedication()]);
    }
  };

  React.useEffect(() => {
    if (selectedPatient) {
      setPatientId(selectedPatient.id);
    }
  }, [selectedPatient]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto" dir={dir}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{t.prescription.new}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Patient Selection */}
          <div>
            <Label>{t.prescription.patient} *</Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={t.prescription.selectPatient} />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Medications */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-semibold">{t.prescription.medications}</Label>
              <Button type="button" variant="outline" size="sm" onClick={addMedication}>
                <Plus className="h-4 w-4 me-1" />
                {t.prescription.addMedication}
              </Button>
            </div>

            <div className="space-y-4">
              {medications.map((med, index) => (
                <div 
                  key={index} 
                  className="p-4 border border-border rounded-lg bg-muted/20 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <GripVertical className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {language === 'ar' ? `الدواء ${index + 1}` : 
                         language === 'fr' ? `Médicament ${index + 1}` : 
                         `Medication ${index + 1}`}
                      </span>
                    </div>
                    {medications.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeMedication(index)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                      <Label htmlFor={`med-name-${index}`}>{t.prescription.medicationName} *</Label>
                      <div className="mt-1">
                        <MedicationAutocomplete
                          id={`med-name-${index}`}
                          value={med.medication_name}
                          onChange={(value) => updateMedication(index, 'medication_name', value)}
                          onSelectFavorite={(fav) => handleSelectFavorite(index, fav)}
                          favorites={favorites}
                          onAddToFavorites={() => handleAddToFavorites(index)}
                          isFavorite={isMedicationFavorite(med.medication_name)}
                          placeholder={t.prescription.medicationName}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor={`med-dosage-${index}`}>{t.prescription.dosage}</Label>
                      <Input
                        id={`med-dosage-${index}`}
                        value={med.dosage || ''}
                        onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                        className="mt-1"
                        placeholder="500mg"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`med-form-${index}`}>{t.prescription.form}</Label>
                      <Select
                        value={med.form || ''}
                        onValueChange={(v) => updateMedication(index, 'form', v)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder={t.prescription.form} />
                        </SelectTrigger>
                        <SelectContent>
                          {medicationForms.map((form) => (
                            <SelectItem key={form} value={form}>
                              {getFormLabel(form)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor={`med-freq-${index}`}>{t.prescription.frequency}</Label>
                      <Select
                        value={med.frequency || ''}
                        onValueChange={(v) => updateMedication(index, 'frequency', v)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder={t.prescription.frequency} />
                        </SelectTrigger>
                        <SelectContent>
                          {frequencies.map((freq) => (
                            <SelectItem key={freq} value={freq}>
                              {getFrequencyLabel(freq)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor={`med-duration-${index}`}>{t.prescription.duration}</Label>
                      <Input
                        id={`med-duration-${index}`}
                        value={med.duration || ''}
                        onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                        className="mt-1"
                        placeholder={language === 'ar' ? '7 أيام' : language === 'fr' ? '7 jours' : '7 days'}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor={`med-notes-${index}`}>{t.prescription.notes}</Label>
                    <Input
                      id={`med-notes-${index}`}
                      value={med.notes || ''}
                      onChange={(e) => updateMedication(index, 'notes', e.target.value)}
                      className="mt-1"
                      placeholder={t.prescription.notes}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* General Notes */}
          <div>
            <Label htmlFor="prescription-notes">{t.prescription.notes}</Label>
            <Textarea
              id="prescription-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 min-h-[80px]"
              placeholder={t.prescription.notes}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t.common.loading : t.prescription.save}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
