/**
 * Watermark per la versione DEMO
 *
 * Mostra un banner fisso in alto quando l'app è in modalità demo.
 * Il banner indica che le modifiche non sono consentite.
 */

import { usePlanFeatures } from '../hooks/usePlanFeatures';
import { Eye } from 'lucide-react';

export function DemoWatermark() {
  const { isDemo } = usePlanFeatures();

  if (!isDemo) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-center py-2 shadow-lg">
      <div className="flex items-center justify-center gap-2">
        <Eye className="w-4 h-4" />
        <span className="text-sm font-semibold">
          VERSIONE DEMO - Solo visualizzazione, le modifiche non verranno salvate
        </span>
        <Eye className="w-4 h-4" />
      </div>
    </div>
  );
}
