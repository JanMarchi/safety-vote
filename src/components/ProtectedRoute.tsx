
import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '@/services/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedUserTypes: Array<'admin-sistema' | 'rh' | 'eleitor'>;
  redirectTo?: string;
}

const ProtectedRoute = ({ 
  children, 
  allowedUserTypes, 
  redirectTo = '/login' 
}: ProtectedRouteProps) => {
  const user = authService.getCurrentUser();

  // Se não estiver logado, redireciona para login
  if (!user || !authService.isAuthenticated()) {
    return <Navigate to={redirectTo} replace />;
  }

  // Se o tipo de usuário não estiver permitido, redireciona para dashboard apropriado
  if (!allowedUserTypes.includes(user.type)) {
    const dashboardPath = user.type === 'admin-sistema' 
      ? '/dashboard-admin' 
      : user.type === 'rh' 
        ? '/dashboard-rh' 
        : '/dashboard-eleitor';
    
    return <Navigate to={dashboardPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
