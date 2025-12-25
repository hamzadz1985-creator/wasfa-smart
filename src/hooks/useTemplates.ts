import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TemplateMedication {
  id?: string;
  template_id?: string;
  medication_name: string;
  dosage: string | null;
  form: string | null;
  frequency: string | null;
  duration: string | null;
  notes: string | null;
  sort_order: number;
}

export interface PrescriptionTemplate {
  id: string;
  tenant_id: string;
  created_by: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  medications?: TemplateMedication[];
}

export function useTemplates() {
  const [templates, setTemplates] = useState<PrescriptionTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('prescription_templates')
        .select(`
          *,
          medications:template_medications(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates((data || []) as unknown as PrescriptionTemplate[]);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (
    name: string,
    description: string | null,
    medications: Omit<TemplateMedication, 'id' | 'template_id'>[]
  ) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: { message: 'Not authenticated' } };

    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    if (!profile) return { error: { message: 'Profile not found' } };

    const { data: template, error: templateError } = await supabase
      .from('prescription_templates')
      .insert({
        tenant_id: profile.tenant_id,
        created_by: user.id,
        name,
        description,
      })
      .select()
      .single();

    if (templateError) return { error: templateError };

    if (medications.length > 0) {
      const { error: medsError } = await supabase
        .from('template_medications')
        .insert(
          medications.map((med, index) => ({
            template_id: template.id,
            medication_name: med.medication_name,
            dosage: med.dosage,
            form: med.form,
            frequency: med.frequency,
            duration: med.duration,
            notes: med.notes,
            sort_order: index,
          }))
        );

      if (medsError) return { error: medsError };
    }

    await fetchTemplates();
    return { data: template, error: null };
  };

  const deleteTemplate = async (id: string) => {
    const { error } = await supabase
      .from('prescription_templates')
      .delete()
      .eq('id', id);

    if (!error) {
      setTemplates(templates.filter(t => t.id !== id));
    }
    return { error };
  };

  return { 
    templates, 
    loading, 
    createTemplate, 
    deleteTemplate,
    refetch: fetchTemplates 
  };
}
