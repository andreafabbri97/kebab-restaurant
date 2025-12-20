/**
 * Hook per accedere alle funzionalità del piano licenza
 *
 * Fornisce un'interfaccia semplificata per controllare:
 * - Tipo di piano (demo, standard, premium)
 * - Se è modalità demo (solo lettura)
 * - Se può scrivere sul database
 * - Se può accedere a specifiche funzionalità
 */

import { useLicense, type PlanType } from '../context/LicenseContext';

export interface PlanFeatures {
  planType: PlanType;
  isDemo: boolean;
  isStandard: boolean;
  isPremium: boolean;
  canWrite: boolean;
  canAccessFeature: (feature: string) => boolean;
}

export function usePlanFeatures(): PlanFeatures {
  const { planType, isDemo, canWrite, canAccessFeature } = useLicense();

  return {
    planType,
    isDemo,
    isStandard: planType === 'standard' || planType === 'premium',
    isPremium: planType === 'premium',
    canWrite,
    canAccessFeature,
  };
}
