import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Patient {
  id: string;
  tenant_id: string;
  full_name: string;
  date_of_birth: string | null;
  gender: 'male' | 'female' | null;
  phone: string | null;
  allergies: string | null;
  chronic_diseases: string | null;
  notes: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('is_archived', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPatients((data || []) as Patient[]);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPatient = async (patient: Omit<Patient, 'id' | 'tenant_id' | 'is_archived' | 'created_at' | 'updated_at'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: { message: 'Not authenticated' } };

    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    if (!profile) return { error: { message: 'Profile not found' } };

    const { data, error } = await supabase
      .from('patients')
      .insert({
        ...patient,
        tenant_id: profile.tenant_id,
        created_by: user.id,
      })
      .select()
      .single();

    if (!error && data) {
      setPatients([data as Patient, ...patients]);
    }
    return { data, error };
  };

  const updatePatient = async (id: string, updates: Partial<Patient>) => {
    const { data, error } = await supabase
      .from('patients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      setPatients(patients.map(p => p.id === id ? data as Patient : p));
    }
    return { data, error };
  };

  const archivePatient = async (id: string) => {
    const { error } = await supabase
      .from('patients')
      .update({ is_archived: true })
      .eq('id', id);

    if (!error) {
      setPatients(patients.filter(p => p.id !== id));
    }
    return { error };
  };

  const searchPatients = async (query: string) => {
    if (!query.trim()) {
      return fetchPatients();
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('is_archived', false)
        .ilike('full_name', `%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPatients((data || []) as Patient[]);
    } catch (error) {
      console.error('Error searching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  return { 
    patients, 
    loading, 
    addPatient, 
    updatePatient, 
    archivePatient, 
    searchPatients,
    refetch: fetchPatients 
  };
}
