import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id: string;
  tenant_id: string;
  full_name: string;
  specialty: string | null;
  license_number: string | null;
  phone: string | null;
  signature_url: string | null;
  avatar_url: string | null;
}

export interface Tenant {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  logo_url: string | null;
  footer_note: string | null;
  subscription_status: 'trial' | 'active' | 'expired' | 'suspended';
  trial_ends_at: string | null;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData as Profile);

        const { data: tenantData } = await supabase
          .from('tenants')
          .select('*')
          .eq('id', profileData.tenant_id)
          .maybeSingle();

        if (tenantData) {
          setTenant(tenantData as Tenant);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return;

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profile.id);

    if (!error) {
      setProfile({ ...profile, ...updates });
    }
    return { error };
  };

  const updateTenant = async (updates: Partial<Tenant>) => {
    if (!tenant) return;

    const { error } = await supabase
      .from('tenants')
      .update(updates)
      .eq('id', tenant.id);

    if (!error) {
      setTenant({ ...tenant, ...updates });
    }
    return { error };
  };

  return { profile, tenant, loading, updateProfile, updateTenant, refetch: fetchProfile };
}
