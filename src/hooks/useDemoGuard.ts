/**
 * Hook per bloccare le operazioni di scrittura in modalità demo
 *
 * Uso:
 * const { guardAction } = useDemoGuard();
 * guardAction(() => createItem(...)); // Bloccato in demo, eseguito altrimenti
 */

import { usePlanFeatures } from './usePlanFeatures';
import { showToast } from '../components/ui/Toast';

export function useDemoGuard() {
  const { isDemo, canWrite } = usePlanFeatures();

  /**
   * Protegge un'azione dalla modalità demo
   * Se in demo, mostra un toast di avviso e non esegue l'azione
   * @param action - Funzione da eseguire (sincrona o asincrona)
   * @returns Il risultato dell'azione o undefined se bloccata
   */
  const guardAction = <T>(action: () => T | Promise<T>): T | Promise<T> | undefined => {
    if (isDemo) {
      showToast('Versione DEMO: le modifiche non sono consentite', 'warning');
      return undefined;
    }
    return action();
  };

  /**
   * Controlla se un'azione è permessa e mostra toast se bloccata
   * @returns true se l'azione è permessa, false altrimenti
   */
  const checkCanWrite = (): boolean => {
    if (isDemo) {
      showToast('Versione DEMO: le modifiche non sono consentite', 'warning');
      return false;
    }
    return true;
  };

  return {
    isDemo,
    canWrite,
    guardAction,
    checkCanWrite,
  };
}
