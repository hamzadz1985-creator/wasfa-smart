import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface FavoriteMedication {
  id: string;
  medication_name: string;
  dosage: string | null;
  form: string | null;
  frequency: string | null;
  duration: string | null;
  created_at: string | null;
}

export function useFavoriteMedications() {
  const [favorites, setFavorites] = useState<FavoriteMedication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('favorite_medications')
        .select('*')
        .order('medication_name', { ascending: true });

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error('Error fetching favorite medications:', error);
    } finally {
      setLoading(false);
    }
  };

  const addFavorite = async (medication: Omit<FavoriteMedication, 'id' | 'created_at'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: { message: 'Not authenticated' } };

    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    if (!profile?.tenant_id) return { error: { message: 'Profile not found' } };

    const { data, error } = await supabase
      .from('favorite_medications')
      .insert({
        tenant_id: profile.tenant_id,
        created_by: user.id,
        medication_name: medication.medication_name,
        dosage: medication.dosage,
        form: medication.form,
        frequency: medication.frequency,
        duration: medication.duration,
      })
      .select()
      .single();

    if (!error) {
      setFavorites([...favorites, data]);
    }
    return { data, error };
  };

  const deleteFavorite = async (id: string) => {
    const { error } = await supabase
      .from('favorite_medications')
      .delete()
      .eq('id', id);

    if (!error) {
      setFavorites(favorites.filter(f => f.id !== id));
    }
    return { error };
  };

  return {
    favorites,
    loading,
    addFavorite,
    deleteFavorite,
    refetch: fetchFavorites,
  };
}
