import { useMemo } from 'react';
import { useProfile, Tenant } from './useProfile';

export type SubscriptionStatus = 'trial' | 'active' | 'expired' | 'suspended';

export interface SubscriptionInfo {
  status: SubscriptionStatus;
  isActive: boolean;
  canCreatePrescription: boolean;
  daysRemaining: number | null;
  trialEndsAt: Date | null;
  message: string;
}

export function useSubscription() {
  const { tenant, loading } = useProfile();

  const subscriptionInfo = useMemo<SubscriptionInfo>(() => {
    if (!tenant) {
      return {
        status: 'trial',
        isActive: false,
        canCreatePrescription: false,
        daysRemaining: null,
        trialEndsAt: null,
        message: '',
      };
    }

    const status = tenant.subscription_status || 'trial';
    const trialEndsAt = tenant.trial_ends_at ? new Date(tenant.trial_ends_at) : null;
    const now = new Date();
    
    let daysRemaining: number | null = null;
    if (trialEndsAt) {
      daysRemaining = Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }

    // Determine if subscription is active
    let isActive = false;
    let canCreatePrescription = false;

    switch (status) {
      case 'active':
        isActive = true;
        canCreatePrescription = true;
        break;
      case 'trial':
        if (trialEndsAt && now < trialEndsAt) {
          isActive = true;
          canCreatePrescription = true;
        } else {
          isActive = false;
          canCreatePrescription = false;
        }
        break;
      case 'expired':
      case 'suspended':
        isActive = false;
        canCreatePrescription = false;
        break;
    }

    // Generate appropriate message
    let message = '';
    if (status === 'trial' && daysRemaining !== null) {
      if (daysRemaining > 0) {
        message = `trial_days_remaining:${daysRemaining}`;
      } else {
        message = 'trial_expired';
      }
    } else if (status === 'expired') {
      message = 'subscription_expired';
    } else if (status === 'suspended') {
      message = 'subscription_suspended';
    }

    return {
      status,
      isActive,
      canCreatePrescription,
      daysRemaining,
      trialEndsAt,
      message,
    };
  }, [tenant]);

  return {
    ...subscriptionInfo,
    loading,
    tenant,
  };
}
