// Componente para proteção de rotas
// Controla acesso baseado em autenticação e permissões

import React, { ReactNode } from 'react';
import { useAuth, useRequireAuth, useRequireRole } from '../../hooks/useAuth';
import { Loader2, Shield, AlertTriangle } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requiredRoles?: string | string[];
  fallback?: ReactNode;
  redirectTo?: string;
}

// Componente de loading
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Verificando autenticação...</h2>
        <p className="text-gray-600">Por favor, aguarde enquanto validamos suas credenciais.</p>
      </div>
    </div>
  );
}

// Componente de acesso negado
function AccessDeniedScreen({ requiredRoles }: { requiredRoles?: string | string[] }) {
  const { user, logout } = useAuth();
  
  const roleText = Array.isArray(requiredRoles) 
    ? requiredRoles.join(', ') 
    : requiredRoles || 'adequadas';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h1>
          <p className="text-gray-600">
            Você não possui as permissões necessárias para acessar esta página.
          </p>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-2">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <span className="font-medium text-red-800">Permissões Necessárias</span>
          </div>
          <p className="text-red-700 text-sm">
            Esta página requer permissões de: <strong>{roleText}</strong>
          </p>
          {user && (
            <p className="text-red-600 text-sm mt-2">
              Sua permissão atual: <strong>{user.role}</strong>
            </p>
          )}
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Voltar
          </button>
          
          <button
            onClick={logout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Fazer Logout
          </button>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Se você acredita que deveria ter acesso a esta página, 
            entre em contato com o administrador do sistema.
          </p>
        </div>
      </div>
    </div>
  );
}

// Componente de não autenticado
function UnauthenticatedScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <Shield className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Autenticação Necessária</h1>
          <p className="text-gray-600">
            Você precisa estar logado para acessar esta página.
          </p>
        </div>
        
        <div className="space-y-3">
          <a
            href="/auth/login"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Fazer Login
          </a>
          
          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
}

// Componente principal de proteção de rotas
export default function ProtectedRoute({
  children,
  requireAuth = true,
  requiredRoles,
  fallback,
  redirectTo
}: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();
  
  // Se está carregando, mostrar tela de loading
  if (loading) {
    return fallback || <LoadingScreen />;
  }
  
  // Se requer autenticação mas não está autenticado
  if (requireAuth && !isAuthenticated) {
    return fallback || <UnauthenticatedScreen />;
  }
  
  // Se tem roles específicas requeridas
  if (requiredRoles && isAuthenticated) {
    const { hasRole } = useAuth();
    
    if (!hasRole(requiredRoles)) {
      return fallback || <AccessDeniedScreen requiredRoles={requiredRoles} />;
    }
  }
  
  // Se passou por todas as verificações, renderizar children
  return <>{children}</>;
}

// Componentes específicos para diferentes tipos de proteção
export function AdminRoute({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <ProtectedRoute requiredRoles="admin" fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}

export function RHRoute({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={['admin', 'rh']} fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}

export function EleitorRoute({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={['admin', 'rh', 'eleitor']} fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}

export function AuthenticatedRoute({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <ProtectedRoute requireAuth={true} fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}

export function PublicRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requireAuth={false}>
      {children}
    </ProtectedRoute>
  );
}