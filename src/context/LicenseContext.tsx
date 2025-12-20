/**
 * License Verification Context
 *
 * Verifica la validità della licenza del software.
 * La licenza viene controllata dal server centrale (Supabase di Andrea Fabbri).
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// Configurazione del server licenze (Supabase di Andrea Fabbri)
const LICENSE_SERVER_URL = 'https://jhyidrhckhoavlmmmlwq.supabase.co';
const LICENSE_SERVER_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoeWlkcmhja2hvYXZsbW1tbHdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5ODkzMzIsImV4cCI6MjA4MTU2NTMzMn0.8l7i5EJiF_xJZSO__y83S7kw-bDq2PVH24sl4f5ESyM';

// ID del client - viene configurato durante il setup del fork
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID || 'kebab-san-marino';

interface LicenseStatus {
  valid: boolean;
  reason?: string;
  message?: string;
  plan?: string;
  expiryDate?: string;
}

interface LicenseContextType {
  isLicenseValid: boolean;
  licenseStatus: LicenseStatus | null;
  isChecking: boolean;
  recheckLicense: () => Promise<void>;
}

const LicenseContext = createContext<LicenseContextType | null>(null);

export function LicenseProvider({ children }: { children: ReactNode }) {
  const [licenseStatus, setLicenseStatus] = useState<LicenseStatus | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  const checkLicense = async () => {
    setIsChecking(true);
    try {
      // Chiamata RPC al server licenze
      const response = await fetch(`${LICENSE_SERVER_URL}/rest/v1/rpc/check_license`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': LICENSE_SERVER_KEY,
          'Authorization': `Bearer ${LICENSE_SERVER_KEY}`,
        },
        body: JSON.stringify({ p_client_id: CLIENT_ID }),
      });

      if (!response.ok) {
        // Se il server non risponde, permetti l'uso (grace period)
        console.warn('License server unreachable, using grace period');
        setLicenseStatus({ valid: true, reason: 'grace_period' });
        return;
      }

      const result = await response.json();
      setLicenseStatus(result);
    } catch (error) {
      // In caso di errore di rete, permetti l'uso temporaneo
      console.warn('License check failed, using grace period:', error);
      setLicenseStatus({ valid: true, reason: 'grace_period' });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkLicense();

    // Ricontrolla ogni ora
    const interval = setInterval(checkLicense, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const isLicenseValid = licenseStatus?.valid ?? true; // Default true durante il check

  return (
    <LicenseContext.Provider value={{
      isLicenseValid,
      licenseStatus,
      isChecking,
      recheckLicense: checkLicense
    }}>
      {children}
    </LicenseContext.Provider>
  );
}

export function useLicense() {
  const context = useContext(LicenseContext);
  if (!context) {
    throw new Error('useLicense must be used within a LicenseProvider');
  }
  return context;
}
