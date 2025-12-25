import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Medication {
  id?: string;
  prescription_id?: string;
  medication_name: string;
  dosage: string | null;
  form: string | null;
  frequency: string | null;
  duration: string | null;
  notes: string | null;
  sort_order: number;
}

export interface Prescription {
  id: string;
  tenant_id: string;
  patient_id: string;
  doctor_id: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  medications?: Medication[];
  patient?: {
    full_name: string;
    date_of_birth: string | null;
    gender: 'male' | 'female' | null;
  };
}

export function usePrescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .select(`
          *,
          patient:patients(full_name, date_of_birth, gender),
          medications:prescription_medications(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrescriptions((data || []) as unknown as Prescription[]);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPrescription = async (
    patientId: string, 
    medications: Omit<Medication, 'id' | 'prescription_id'>[],
    notes?: string
  ) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: { message: 'Not authenticated' } };

    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    if (!profile) return { error: { message: 'Profile not found' } };

    // Create prescription
    const { data: prescription, error: prescriptionError } = await supabase
      .from('prescriptions')
      .insert({
        tenant_id: profile.tenant_id,
        patient_id: patientId,
        doctor_id: user.id,
        notes,
      })
      .select()
      .single();

    if (prescriptionError) return { error: prescriptionError };

    // Add medications
    if (medications.length > 0) {
      const { error: medsError } = await supabase
        .from('prescription_medications')
        .insert(
          medications.map((med, index) => ({
            prescription_id: prescription.id,
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

    await fetchPrescriptions();
    return { data: prescription, error: null };
  };

  const deletePrescription = async (id: string) => {
    const { error } = await supabase
      .from('prescriptions')
      .delete()
      .eq('id', id);

    if (!error) {
      setPrescriptions(prescriptions.filter(p => p.id !== id));
    }
    return { error };
  };

  return { 
    prescriptions, 
    loading, 
    createPrescription, 
    deletePrescription,
    refetch: fetchPrescriptions 
  };
}
