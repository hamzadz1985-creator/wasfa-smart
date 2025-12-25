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
import { toast } from '@/hooks/use-toast';

interface PatientFormData {
  full_name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | null;
  phone: string;
  allergies: string;
  chronic_diseases: string;
  notes: string;
}

interface PatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (patient: PatientFormData) => Promise<{ error?: any }>;
  initialData?: Partial<PatientFormData>;
  mode: 'add' | 'edit';
}

export const PatientDialog: React.FC<PatientDialogProps> = ({
  open,
  onOpenChange,
  onSave,
  initialData,
  mode,
}) => {
  const { t, dir } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PatientFormData>({
    full_name: initialData?.full_name || '',
    date_of_birth: initialData?.date_of_birth || '',
    gender: initialData?.gender || null,
    phone: initialData?.phone || '',
    allergies: initialData?.allergies || '',
    chronic_diseases: initialData?.chronic_diseases || '',
    notes: initialData?.notes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name.trim()) {
      toast({
        title: t.common.error,
        description: t.patient.fullName + ' ' + t.auth.emailRequired.replace('email', ''),
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const { error } = await onSave(formData);
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
        description: mode === 'add' ? t.patient.add : t.patient.edit,
      });
      onOpenChange(false);
      setFormData({
        full_name: '',
        date_of_birth: '',
        gender: null,
        phone: '',
        allergies: '',
        chronic_diseases: '',
        notes: '',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto" dir={dir}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {mode === 'add' ? t.patient.add : t.patient.edit}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="full_name">{t.patient.fullName} *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="date_of_birth">{t.patient.dateOfBirth}</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="gender">{t.patient.gender}</Label>
              <Select
                value={formData.gender || ''}
                onValueChange={(value) => setFormData({ ...formData, gender: value as 'male' | 'female' })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={t.patient.gender} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">{t.patient.male}</SelectItem>
                  <SelectItem value="female">{t.patient.female}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="phone">{t.patient.phone}</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1"
                dir="ltr"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="allergies">{t.patient.allergies}</Label>
              <Textarea
                id="allergies"
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                className="mt-1 min-h-[80px]"
                placeholder={t.patient.allergies}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="chronic_diseases">{t.patient.chronicDiseases}</Label>
              <Textarea
                id="chronic_diseases"
                value={formData.chronic_diseases}
                onChange={(e) => setFormData({ ...formData, chronic_diseases: e.target.value })}
                className="mt-1 min-h-[80px]"
                placeholder={t.patient.chronicDiseases}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="notes">{t.patient.notes}</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="mt-1 min-h-[80px]"
                placeholder={t.patient.notes}
              />
            </div>
          </div>

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
              {loading ? t.common.loading : t.common.save}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
