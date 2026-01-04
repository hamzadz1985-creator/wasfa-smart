import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Trash2, GripVertical, Pill } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { TemplateMedication } from '@/hooks/useTemplates';

interface TemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (
    name: string,
    description: string | null,
    medications: Omit<TemplateMedication, 'id' | 'template_id'>[]
  ) => Promise<{ error: any }>;
  initialData?: {
    name: string;
    description: string | null;
    medications?: TemplateMedication[];
  };
  mode: 'add' | 'edit';
}

const emptyMedication: Omit<TemplateMedication, 'id' | 'template_id'> = {
  medication_name: '',
  dosage: null,
  form: null,
  frequency: null,
  duration: null,
  notes: null,
  sort_order: 0,
};

export const TemplateDialog: React.FC<TemplateDialogProps> = ({
  open,
  onOpenChange,
  onSave,
  initialData,
  mode,
}) => {
  const { t, dir } = useLanguage();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [medications, setMedications] = useState<Omit<TemplateMedication, 'id' | 'template_id'>[]>([
    { ...emptyMedication, sort_order: 0 },
  ]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && initialData) {
      setName(initialData.name);
      setDescription(initialData.description || '');
      if (initialData.medications && initialData.medications.length > 0) {
        setMedications(
          initialData.medications.map((med, idx) => ({
            medication_name: med.medication_name,
            dosage: med.dosage,
            form: med.form,
            frequency: med.frequency,
            duration: med.duration,
            notes: med.notes,
            sort_order: idx,
          }))
        );
      } else {
        setMedications([{ ...emptyMedication, sort_order: 0 }]);
      }
    } else if (open) {
      setName('');
      setDescription('');
      setMedications([{ ...emptyMedication, sort_order: 0 }]);
    }
  }, [open, initialData]);

  const handleAddMedication = () => {
    setMedications([
      ...medications,
      { ...emptyMedication, sort_order: medications.length },
    ]);
  };

  const handleRemoveMedication = (index: number) => {
    if (medications.length > 1) {
      setMedications(medications.filter((_, i) => i !== index));
    }
  };

  const handleMedicationChange = (
    index: number,
    field: keyof Omit<TemplateMedication, 'id' | 'template_id' | 'sort_order'>,
    value: string
  ) => {
    const updated = [...medications];
    updated[index] = { ...updated[index], [field]: value || null };
    setMedications(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: t.common.error,
        description: 'Template name is required',
        variant: 'destructive',
      });
      return;
    }

    const validMeds = medications.filter(med => med.medication_name.trim());
    if (validMeds.length === 0) {
      toast({
        title: t.common.error,
        description: 'At least one medication is required',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    const { error } = await onSave(
      name.trim(),
      description.trim() || null,
      validMeds.map((med, idx) => ({ ...med, sort_order: idx }))
    );

    if (error) {
      toast({
        title: t.common.error,
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: t.common.success,
        description: mode === 'add' ? 'Template created successfully' : 'Template updated successfully',
      });
      onOpenChange(false);
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" dir={dir}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {mode === 'add' ? t.dashboard.newTemplate : t.common.edit}
            </DialogTitle>
            <DialogDescription>
              {t.dashboard.createTemplatesHint}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Template Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t.patient.fullName} *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Common Cold Treatment"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{t.prescription.notes}</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description..."
                  rows={2}
                />
              </div>
            </div>

            {/* Medications */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Pill className="h-4 w-4" />
                  {t.prescription.medications}
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddMedication}
                  className="gap-1"
                >
                  <Plus className="h-4 w-4" />
                  {t.prescription.addMedication}
                </Button>
              </div>

              <div className="space-y-3">
                {medications.map((med, index) => (
                  <div
                    key={index}
                    className="p-4 border border-border rounded-lg space-y-3 bg-muted/30"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">
                          #{index + 1}
                        </span>
                      </div>
                      {medications.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveMedication(index)}
                          className="h-8 w-8 text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="md:col-span-2">
                        <Input
                          placeholder={t.prescription.medicationName + ' *'}
                          value={med.medication_name}
                          onChange={(e) =>
                            handleMedicationChange(index, 'medication_name', e.target.value)
                          }
                        />
                      </div>
                      <Input
                        placeholder={t.prescription.dosage}
                        value={med.dosage || ''}
                        onChange={(e) =>
                          handleMedicationChange(index, 'dosage', e.target.value)
                        }
                      />
                      <Input
                        placeholder={t.prescription.form}
                        value={med.form || ''}
                        onChange={(e) =>
                          handleMedicationChange(index, 'form', e.target.value)
                        }
                      />
                      <Input
                        placeholder={t.prescription.frequency}
                        value={med.frequency || ''}
                        onChange={(e) =>
                          handleMedicationChange(index, 'frequency', e.target.value)
                        }
                      />
                      <Input
                        placeholder={t.prescription.duration}
                        value={med.duration || ''}
                        onChange={(e) =>
                          handleMedicationChange(index, 'duration', e.target.value)
                        }
                      />
                    </div>
                    <Textarea
                      placeholder={t.prescription.notes}
                      value={med.notes || ''}
                      onChange={(e) =>
                        handleMedicationChange(index, 'notes', e.target.value)
                      }
                      rows={2}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? t.common.loading : t.common.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
