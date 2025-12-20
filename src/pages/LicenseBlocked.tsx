/**
 * Pagina mostrata quando la licenza non è valida
 */

import { ShieldX, Phone, Mail, RefreshCw } from 'lucide-react';
import { useLicense } from '../context/LicenseContext';

export function LicenseBlocked() {
  const { licenseStatus, recheckLicense, isChecking } = useLicense();

  const getBlockMessage = () => {
    switch (licenseStatus?.reason) {
      case 'expired':
        return {
          title: 'Licenza Scaduta',
          subtitle: `La tua licenza è scaduta il ${licenseStatus.expiryDate}`,
          description: 'Contatta Andrea Fabbri per rinnovare la licenza e continuare ad utilizzare il software.',
        };
      case 'suspended':
        return {
          title: 'Licenza Sospesa',
          subtitle: 'Il tuo account è stato temporaneamente sospeso',
          description: 'Potrebbe esserci un problema con il pagamento. Contatta Andrea Fabbri per maggiori informazioni.',
        };
      case 'cancelled':
        return {
          title: 'Licenza Cancellata',
          subtitle: 'Il contratto è stato terminato',
          description: 'Se ritieni ci sia un errore, contatta Andrea Fabbri.',
        };
      case 'not_found':
        return {
          title: 'Licenza Non Trovata',
          subtitle: 'Questa installazione non è registrata',
          description: 'Il software deve essere attivato. Contatta Andrea Fabbri per completare la configurazione.',
        };
      default:
        return {
          title: 'Licenza Non Valida',
          subtitle: licenseStatus?.message || 'Si è verificato un problema con la licenza',
          description: 'Contatta Andrea Fabbri per assistenza.',
        };
    }
  };

  const message = getBlockMessage();

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-dark-800 rounded-xl shadow-2xl p-8 text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldX className="w-10 h-10 text-red-500" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-white mb-2">{message.title}</h1>
        <p className="text-red-400 mb-4">{message.subtitle}</p>
        <p className="text-dark-300 mb-8">{message.description}</p>

        {/* Contact Info */}
        <div className="bg-dark-700 rounded-lg p-4 mb-6">
          <p className="text-sm text-dark-400 mb-3">Contatta il supporto:</p>
          <div className="space-y-2">
            <a
              href="tel:+393331234567"
              className="flex items-center justify-center gap-2 text-primary-400 hover:text-primary-300"
            >
              <Phone className="w-4 h-4" />
              <span>+39 333 123 4567</span>
            </a>
            <a
              href="mailto:andrea.fabbri@example.com"
              className="flex items-center justify-center gap-2 text-primary-400 hover:text-primary-300"
            >
              <Mail className="w-4 h-4" />
              <span>andrea.fabbri@example.com</span>
            </a>
          </div>
        </div>

        {/* Retry Button */}
        <button
          onClick={recheckLicense}
          disabled={isChecking}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
          {isChecking ? 'Verifica in corso...' : 'Ricontrolla Licenza'}
        </button>

        {/* Version */}
        <p className="text-xs text-dark-500 mt-6">
          Restaurant Manager v2.5 - Powered by Andrea Fabbri
        </p>
      </div>
    </div>
  );
}
