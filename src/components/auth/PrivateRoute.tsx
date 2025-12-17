import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
  permission?: string;
}

export function PrivateRoute({ children, permission }: PrivateRouteProps) {
  const { isAuthenticated, isLoading, hasPermission } = useAuth();
  const location = useLocation();

  // Mostra loading mentre verifica autenticazione
  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-dark-400 mt-4">Caricamento...</p>
        </div>
      </div>
    );
  }

  // Redirect al login se non autenticato
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Controlla permesso specifico se richiesto
  if (permission && !hasPermission(permission)) {
    // Redirect alla prima pagina disponibile in base al ruolo
    return <Navigate to="/orders/new" replace />;
  }

  return <>{children}</>;
}
