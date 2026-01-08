import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFavoriteMedications, FavoriteMedication } from '@/hooks/useFavoriteMedications';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { toast } from '@/hooks/use-toast';
import { 
  Plus, 
  Search, 
  Pill, 
  Trash2, 
  Loader2,
  Star,
  Package
} from 'lucide-react';

export const FavoriteMedicationsList: React.FC = () => {
  const { t } = useLanguage();
  const { favorites, loading, addFavorite, deleteFavorite, refetch } = useFavoriteMedications();
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<FavoriteMedication | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    medication_name: '',
    dosage: '',
    form: '',
    frequency: '',
    duration: '',
  });

  const resetForm = () => {
    setFormData({
      medication_name: '',
      dosage: '',
      form: '',
      frequency: '',
      duration: '',
    });
  };

  const handleOpenAdd = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.medication_name.trim()) {
      toast({
        title: t.common.error,
        description: t.prescription.medicationName + ' ' + t.auth.emailRequired,
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      await addFavorite(formData);
      toast({ title: t.common.success });
      setDialogOpen(false);
      resetForm();
      refetch();
    } catch (error: any) {
      toast({
        title: t.common.error,
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMedication) return;

    try {
      await deleteFavorite(selectedMedication.id);
      toast({ title: t.common.success });
      setDeleteDialogOpen(false);
      setSelectedMedication(null);
      refetch();
    } catch (error: any) {
      toast({
        title: t.common.error,
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const filteredFavorites = favorites.filter((med) =>
    med.medication_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    med.form?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Star className="h-6 w-6 text-accent" />
            {t.dashboard.favorites || 'الأدوية المفضلة'}
          </h2>
          <p className="text-muted-foreground mt-1">
            {t.dashboard.favoritesDescription || 'إدارة قائمة الأدوية المفضلة لاستخدامها بسرعة في الوصفات'}
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          {t.common.add}
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t.common.search + '...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="ps-10"
        />
      </div>

      {/* List */}
      {filteredFavorites.length === 0 ? (
        <div className="glass rounded-xl border border-border/30 p-12 text-center">
          <Package className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-foreground mb-2">
            {searchQuery ? t.common.noData : (t.dashboard.noFavorites || 'لا توجد أدوية مفضلة')}
          </p>
          <p className="text-muted-foreground mb-6">
            {t.dashboard.addFavoritesHint || 'أضف أدويتك المستخدمة بشكل متكرر لتوفير الوقت'}
          </p>
          {!searchQuery && (
            <Button onClick={handleOpenAdd} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              {t.common.add}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFavorites.map((med) => (
            <div
              key={med.id}
              className="glass rounded-xl border border-border/30 p-5 hover:border-primary/30 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <Pill className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{med.medication_name}</h3>
                    {med.form && (
                      <span className="text-xs text-muted-foreground">{med.form}</span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    setSelectedMedication(med);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2 text-sm">
                {med.dosage && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.prescription.dosage}</span>
                    <span className="text-foreground">{med.dosage}</span>
                  </div>
                )}
                {med.frequency && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.prescription.frequency}</span>
                    <span className="text-foreground">{med.frequency}</span>
                  </div>
                )}
                {med.duration && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.prescription.duration}</span>
                    <span className="text-foreground">{med.duration}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-primary" />
              {t.common.add} {t.prescription.medicationName || 'دواء مفضل'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>{t.prescription.medicationName} *</Label>
              <Input
                value={formData.medication_name}
                onChange={(e) => setFormData({ ...formData, medication_name: e.target.value })}
                className="mt-1"
                placeholder="مثال: باراسيتامول"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t.prescription.dosage}</Label>
                <Input
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  className="mt-1"
                  placeholder="500mg"
                />
              </div>
              <div>
                <Label>{t.prescription.form}</Label>
                <Input
                  value={formData.form}
                  onChange={(e) => setFormData({ ...formData, form: e.target.value })}
                  className="mt-1"
                  placeholder="أقراص"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t.prescription.frequency}</Label>
                <Input
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  className="mt-1"
                  placeholder="3 مرات يومياً"
                />
              </div>
              <div>
                <Label>{t.prescription.duration}</Label>
                <Input
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="mt-1"
                  placeholder="7 أيام"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {t.common.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.common.delete}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.common.confirm} {selectedMedication?.medication_name}؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              {t.common.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
