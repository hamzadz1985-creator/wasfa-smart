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

// Helper function to generate signed URLs for private storage
export async function getSignedUrl(storedPath: string | null): Promise<string | null> {
  if (!storedPath) return null;
  
  // If it's already a signed URL or external URL, return as-is
  if (storedPath.startsWith('http://') || storedPath.startsWith('https://')) {
    // Extract the file path from stored public URL to generate signed URL
    const match = storedPath.match(/\/clinic-assets\/(.+)$/);
    if (match) {
      const filePath = match[1];
      const { data, error } = await supabase.storage
        .from('clinic-assets')
        .createSignedUrl(filePath, 3600); // 1 hour expiration
      
      if (!error && data?.signedUrl) {
        return data.signedUrl;
      }
    }
    return storedPath;
  }
  
  // If it's just a path, generate signed URL directly
  const { data, error } = await supabase.storage
    .from('clinic-assets')
    .createSignedUrl(storedPath, 3600); // 1 hour expiration
  
  if (error) {
    console.error('Error generating signed URL:', error);
    return null;
  }
  
  return data?.signedUrl || null;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [signedSignatureUrl, setSignedSignatureUrl] = useState<string | null>(null);
  const [signedLogoUrl, setSignedLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  // Generate signed URLs when profile/tenant changes
  useEffect(() => {
    const generateSignedUrls = async () => {
      if (profile?.signature_url) {
        const signedUrl = await getSignedUrl(profile.signature_url);
        setSignedSignatureUrl(signedUrl);
      } else {
        setSignedSignatureUrl(null);
      }
      
      if (tenant?.logo_url) {
        const signedUrl = await getSignedUrl(tenant.logo_url);
        setSignedLogoUrl(signedUrl);
      } else {
        setSignedLogoUrl(null);
      }
    };
    
    generateSignedUrls();
  }, [profile?.signature_url, tenant?.logo_url]);

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

  return { 
    profile, 
    tenant, 
    loading, 
    updateProfile, 
    updateTenant, 
    refetch: fetchProfile,
    // Expose signed URLs for display
    signedSignatureUrl,
    signedLogoUrl,
  };
}
