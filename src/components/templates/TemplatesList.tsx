import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, LayoutTemplate, Trash2, Pill } from 'lucide-react';
import { useTemplates } from '@/hooks/useTemplates';
import { toast } from '@/hooks/use-toast';

export const TemplatesList: React.FC = () => {
  const { t, language } = useLanguage();
  const { templates, loading, deleteTemplate } = useTemplates();

  const handleDelete = async (id: string) => {
    const { error } = await deleteTemplate(id);
    if (error) {
      toast({ title: t.common.error, description: error.message, variant: 'destructive' });
    } else {
      toast({ title: t.common.success, description: t.common.delete });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-foreground">{t.dashboard.templates}</h2>
        <Button className="gap-2">
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
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div key={template.id} className="glass rounded-xl border border-border/30 p-5 hover:border-primary/30 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <LayoutTemplate className="h-5 w-5 text-accent" />
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(template.id)} className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <h3 className="font-semibold text-foreground">{template.name}</h3>
              {template.description && <p className="text-sm text-muted-foreground mt-1">{template.description}</p>}
              <div className="flex flex-wrap gap-1 mt-3">
                {template.medications?.slice(0, 3).map((med, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">{med.medication_name}</Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
