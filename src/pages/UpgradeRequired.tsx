/**
 * Pagina mostrata quando l'utente tenta di accedere a una funzionalità
 * non disponibile nel suo piano licenza attuale.
 */

import { Lock, Crown, ArrowLeft, Phone, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlanFeatures } from '../hooks/usePlanFeatures';
import { useLicense } from '../context/LicenseContext';

interface UpgradeRequiredProps {
  feature?: string;
  requiredPlan?: 'standard' | 'premium';
}

// Mappa delle funzionalità con nomi leggibili
const FEATURE_NAMES: Record<string, string> = {
  'reports': 'Report e Statistiche',
  'smac': 'Tessere Fidelity (SMAC)',
  'inventory': 'Gestione Magazzino',
  'recipes': 'Ricette e Ingredienti',
  'staff': 'Gestione Personale',
  'users': 'Gestione Utenti',
  'dish-costs': 'Costo Piatti',
  'cash-register': 'Chiusura Cassa',
};

export function UpgradeRequired({ feature, requiredPlan = 'premium' }: UpgradeRequiredProps) {
  const navigate = useNavigate();
  const { planType } = usePlanFeatures();
  const { adminSettings } = useLicense();

  const featureName = feature ? FEATURE_NAMES[feature] || feature : 'Questa funzionalità';
  const planName = requiredPlan === 'premium' ? 'Premium' : 'Standard';

  const getPlanBadgeColor = () => {
    switch (planType) {
      case 'demo':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
      case 'standard':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'premium':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
    }
  };

  const getPlanLabel = () => {
    switch (planType) {
      case 'demo':
        return 'DEMO';
      case 'standard':
        return 'STANDARD';
      case 'premium':
        return 'PREMIUM';
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-dark-800 rounded-xl shadow-2xl p-8 text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-10 h-10 text-primary-400" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-white mb-2">
          Funzionalità {planName}
        </h1>

        {/* Current Plan Badge */}
        <div className="flex justify-center mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPlanBadgeColor()}`}>
            Il tuo piano: {getPlanLabel()}
          </span>
        </div>

        {/* Message */}
        <p className="text-dark-300 mb-6">
          <span className="text-white font-medium">{featureName}</span> richiede il piano{' '}
          <span className="text-primary-400 font-semibold">{planName}</span>.
        </p>

        {/* Features List */}
        <div className="bg-dark-700 rounded-lg p-4 mb-6 text-left">
          <div className="flex items-center gap-2 text-primary-400 mb-3">
            <Crown className="w-5 h-5" />
            <span className="font-semibold">Piano {planName} include:</span>
          </div>
          <ul className="space-y-2 text-sm text-dark-300">
            {requiredPlan === 'premium' ? (
              <>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary-400 rounded-full" />
                  Report e statistiche avanzate
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary-400 rounded-full" />
                  Tessere fidelity (SMAC)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary-400 rounded-full" />
                  Gestione magazzino e inventario
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary-400 rounded-full" />
                  Ricette e calcolo costi
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary-400 rounded-full" />
                  Gestione personale e turni
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary-400 rounded-full" />
                  Utenti illimitati
                </li>
              </>
            ) : (
              <>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary-400 rounded-full" />
                  Gestione ordini completa
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary-400 rounded-full" />
                  Gestione menu e tavoli
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary-400 rounded-full" />
                  Modifica credenziali utente
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Contact Info */}
        <div className="bg-dark-700 rounded-lg p-4 mb-6">
          <p className="text-sm text-dark-400 mb-3">Per effettuare l'upgrade, contatta:</p>
          <div className="space-y-2">
            {adminSettings?.blocked_contact_phone && (
              <a
                href={`tel:${adminSettings.blocked_contact_phone.replace(/\s/g, '')}`}
                className="flex items-center justify-center gap-2 text-primary-400 hover:text-primary-300 text-sm"
              >
                <Phone className="w-4 h-4" />
                <span>{adminSettings.blocked_contact_phone}</span>
              </a>
            )}
            {adminSettings?.blocked_contact_email && (
              <a
                href={`mailto:${adminSettings.blocked_contact_email}?subject=Richiesta upgrade piano ${planName}`}
                className="flex items-center justify-center gap-2 text-primary-400 hover:text-primary-300 text-sm"
              >
                <Mail className="w-4 h-4" />
                <span>{adminSettings.blocked_contact_email}</span>
              </a>
            )}
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-dark-700 text-white rounded-lg hover:bg-dark-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Torna indietro
        </button>
      </div>
    </div>
  );
}
