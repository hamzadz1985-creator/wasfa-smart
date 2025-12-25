import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Plus, 
  FileText, 
  Trash2,
  Calendar,
  User,
  Pill,
  Eye
} from 'lucide-react';
import { usePrescriptions, Prescription } from '@/hooks/usePrescriptions';
import { usePatients, Patient } from '@/hooks/usePatients';
import { PrescriptionDialog } from './PrescriptionDialog';
import { PrescriptionPreview } from './PrescriptionPreview';
import { toast } from '@/hooks/use-toast';

interface PrescriptionsListProps {
  initialPatient?: Patient | null;
}

export const PrescriptionsList: React.FC<PrescriptionsListProps> = ({ initialPatient }) => {
  const { t, dir, language } = useLanguage();
  const { prescriptions, loading, createPrescription, deletePrescription } = usePrescriptions();
  const { patients } = usePatients();
  
  const [dialogOpen, setDialogOpen] = useState(!!initialPatient);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(initialPatient || null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [prescriptionToDelete, setPrescriptionToDelete] = useState<Prescription | null>(null);
  const [previewPrescription, setPreviewPrescription] = useState<Prescription | null>(null);

  const handleCreatePrescription = () => {
    setSelectedPatient(null);
    setDialogOpen(true);
  };

  const handleDelete = (prescription: Prescription) => {
    setPrescriptionToDelete(prescription);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!prescriptionToDelete) return;
    
    const { error } = await deletePrescription(prescriptionToDelete.id);
    if (error) {
      toast({
        title: t.common.error,
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: t.common.success,
        description: t.common.delete,
      });
    }
    setDeleteDialogOpen(false);
    setPrescriptionToDelete(null);
  };

  const formatDate = (dateStr: string) => {
    const locale = language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US';
    return new Date(dateStr).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-foreground">{t.dashboard.prescriptions}</h2>
        <Button onClick={handleCreatePrescription} className="gap-2">
          <Plus className="h-4 w-4" />
          {t.prescription.new}
        </Button>
      </div>

      {/* Prescriptions Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">{t.common.noData}</p>
          <p className="text-sm mt-2">{t.dashboard.startCreatePrescription}</p>
          <Button onClick={handleCreatePrescription} variant="outline" className="mt-4 gap-2">
            <Plus className="h-4 w-4" />
            {t.prescription.new}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {prescriptions.map((prescription) => (
            <div
              key={prescription.id}
              className="glass rounded-xl border border-border/30 p-5 hover:border-primary/30 transition-all group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold text-foreground">
                        {prescription.patient?.full_name || '-'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(prescription.created_at)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Medications */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                  <Pill className="h-4 w-4" />
                  <span>{t.prescription.medications}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {prescription.medications?.slice(0, 3).map((med, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {med.medication_name}
                    </Badge>
                  ))}
                  {(prescription.medications?.length || 0) > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{(prescription.medications?.length || 0) - 3}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-border/50">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 gap-2"
                  onClick={() => setPreviewPrescription(prescription)}
                >
                  <Eye className="h-4 w-4" />
                  {language === 'ar' ? 'معاينة' : language === 'fr' ? 'Aperçu' : 'Preview'}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleDelete(prescription)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Prescription Dialog */}
      <PrescriptionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={createPrescription}
        patients={patients}
        selectedPatient={selectedPatient}
      />

      {/* Preview Dialog */}
      {previewPrescription && (
        <PrescriptionPreview
          open={!!previewPrescription}
          onOpenChange={(open) => !open && setPreviewPrescription(null)}
          prescription={previewPrescription}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent dir={dir}>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.common.confirm}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.prescription.delete}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              {t.common.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
