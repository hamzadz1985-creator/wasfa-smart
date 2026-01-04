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
import { Plus, LayoutTemplate, Trash2, Pill, Edit } from 'lucide-react';
import { useTemplates, TemplateMedication, PrescriptionTemplate } from '@/hooks/useTemplates';
import { TemplateDialog } from './TemplateDialog';
import { toast } from '@/hooks/use-toast';

interface TemplatesListProps {
  onApplyTemplate?: (medications: TemplateMedication[]) => void;
}

export const TemplatesList: React.FC<TemplatesListProps> = ({ onApplyTemplate }) => {
  const { t, dir, language } = useLanguage();
  const { templates, loading, createTemplate, deleteTemplate } = useTemplates();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedTemplate, setSelectedTemplate] = useState<PrescriptionTemplate | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<PrescriptionTemplate | null>(null);

  const handleAddTemplate = () => {
    setSelectedTemplate(null);
    setDialogMode('add');
    setDialogOpen(true);
  };

  const handleEditTemplate = (template: PrescriptionTemplate) => {
    setSelectedTemplate(template);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleDeleteClick = (template: PrescriptionTemplate) => {
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!templateToDelete) return;
    const { error } = await deleteTemplate(templateToDelete.id);
    if (error) {
      toast({ title: t.common.error, description: error.message, variant: 'destructive' });
    } else {
      toast({ title: t.common.success, description: t.common.delete });
    }
    setDeleteDialogOpen(false);
    setTemplateToDelete(null);
  };

  const handleSaveTemplate = async (
    name: string,
    description: string | null,
    medications: Omit<TemplateMedication, 'id' | 'template_id'>[]
  ) => {
    // For now, we only support creating new templates
    // Edit functionality would require updating the useTemplates hook
    return createTemplate(name, description, medications);
  };

  const handleApplyTemplate = (template: PrescriptionTemplate) => {
    if (onApplyTemplate && template.medications) {
      onApplyTemplate(template.medications);
      toast({ title: t.common.success, description: 'Template applied' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-foreground">{t.dashboard.templates}</h2>
        <Button onClick={handleAddTemplate} className="gap-2">
          <Plus className="h-4 w-4" />
          {t.dashboard.newTemplate}
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <LayoutTemplate className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">{t.dashboard.noTemplates}</p>
          <p className="text-sm mt-2">{t.dashboard.createTemplatesHint}</p>
          <Button onClick={handleAddTemplate} variant="outline" className="mt-4 gap-2">
            <Plus className="h-4 w-4" />
            {t.dashboard.newTemplate}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="glass rounded-xl border border-border/30 p-5 hover:border-primary/30 transition-all cursor-pointer group"
              onClick={() => handleApplyTemplate(template)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <LayoutTemplate className="h-5 w-5 text-accent" />
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditTemplate(template)}
                    className="h-8 w-8"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(template)}
                    className="h-8 w-8 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <h3 className="font-semibold text-foreground">{template.name}</h3>
              {template.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {template.description}
                </p>
              )}
              <div className="flex flex-wrap gap-1 mt-3">
                {template.medications?.slice(0, 3).map((med, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs gap-1">
                    <Pill className="h-3 w-3" />
                    {med.medication_name}
                  </Badge>
                ))}
                {template.medications && template.medications.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{template.medications.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Template Dialog */}
      <TemplateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSaveTemplate}
        initialData={selectedTemplate ? {
          name: selectedTemplate.name,
          description: selectedTemplate.description,
          medications: selectedTemplate.medications,
        } : undefined}
        mode={dialogMode}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent dir={dir}>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.common.confirm}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.common.delete} "{templateToDelete?.name}"?
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
