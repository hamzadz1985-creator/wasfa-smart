import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'super_admin' | 'clinic_admin' | 'doctor' | 'assistant';

export interface UserRoleInfo {
  role: AppRole | null;
  roles: AppRole[];
  loading: boolean;
  isSuperAdmin: boolean;
  isClinicAdmin: boolean;
  isDoctor: boolean;
  isAssistant: boolean;
  canManageClinic: boolean;
  canCreatePrescription: boolean;
  canManagePatients: boolean;
  canManageTemplates: boolean;
  canViewStatistics: boolean;
}

export function useUserRole(): UserRoleInfo {
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserRoles();
  }, []);

  const fetchUserRoles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user roles:', error);
      } else if (data) {
        setRoles(data.map(r => r.role));
      }
    } catch (error) {
      console.error('Error in fetchUserRoles:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (role: AppRole): boolean => roles.includes(role);

  const isSuperAdmin = hasRole('super_admin');
  const isClinicAdmin = hasRole('clinic_admin');
  const isDoctor = hasRole('doctor');
  const isAssistant = hasRole('assistant');

  // Permission calculations
  const canManageClinic = isSuperAdmin || isClinicAdmin;
  const canCreatePrescription = isSuperAdmin || isClinicAdmin || isDoctor;
  const canManagePatients = isSuperAdmin || isClinicAdmin || isDoctor || isAssistant;
  const canManageTemplates = isSuperAdmin || isClinicAdmin || isDoctor;
  const canViewStatistics = isSuperAdmin || isClinicAdmin || isDoctor;

  return {
    role: roles[0] || null,
    roles,
    loading,
    isSuperAdmin,
    isClinicAdmin,
    isDoctor,
    isAssistant,
    canManageClinic,
    canCreatePrescription,
    canManagePatients,
    canManageTemplates,
    canViewStatistics,
  };
}
