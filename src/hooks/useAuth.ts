// Hook de autenticação para React
// Gerencia estado de autenticação no frontend

import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { useRouter } from 'next/router';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  company_id: string;
  email_verified: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, cpf?: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  verifyMagicLink: (token: string) => Promise<{ success: boolean; message: string; user?: User }>;
  validateSession: () => Promise<boolean>;
  isAuthenticated: boolean;
  hasRole: (roles: string | string[]) => boolean;
  isAdmin: boolean;
  isRH: boolean;
  isEleitor: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider de autenticação
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Verificar sessão ao carregar
  useEffect(() => {
    validateSession();
  }, []);

  // Função para fazer login (enviar magic link)
  const login = async (email: string, cpf?: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch('/api/auth/send-magic-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, cpf }),
      });

      const data = await response.json();
      return {
        success: data.success,
        message: data.message
      };
    } catch (error) {
      console.error('Erro no login:', error);
      return {
        success: false,
        message: 'Erro de conexão. Tente novamente.'
      };
    }
  };

  // Função para verificar magic link
  const verifyMagicLink = async (token: string): Promise<{ success: boolean; message: string; user?: User }> => {
    try {
      const response = await fetch('/api/auth/verify-magic-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      
      if (data.success && data.user && data.session_token) {
        // Salvar token na sessão
        localStorage.setItem('session_token', data.session_token);
        
        // Definir cookie para requisições automáticas
        document.cookie = `session_token=${data.session_token}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`;
        
        setUser(data.user);
        setLoading(false);
        
        return {
          success: true,
          message: data.message,
          user: data.user
        };
      }
      
      return {
        success: false,
        message: data.message
      };
    } catch (error) {
      console.error('Erro na verificação:', error);
      return {
        success: false,
        message: 'Erro de conexão. Tente novamente.'
      };
    }
  };

  // Função para validar sessão atual
  const validateSession = async (): Promise<boolean> => {
    try {
      const sessionToken = localStorage.getItem('session_token');
      
      if (!sessionToken) {
        setLoading(false);
        return false;
      }

      const response = await fetch('/api/auth/validate-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({ session_token: sessionToken }),
      });

      const data = await response.json();
      
      if (data.success && data.user) {
        setUser(data.user);
        setLoading(false);
        return true;
      } else {
        // Sessão inválida, limpar dados
        localStorage.removeItem('session_token');
        document.cookie = 'session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        setUser(null);
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Erro na validação de sessão:', error);
      setLoading(false);
      return false;
    }
  };

  // Função para logout
  const logout = async (): Promise<void> => {
    try {
      const sessionToken = localStorage.getItem('session_token');
      
      if (sessionToken) {
        // Chamar API de logout
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionToken}`
          },
          body: JSON.stringify({ session_token: sessionToken }),
        });
      }
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      // Limpar dados locais independentemente do resultado da API
      localStorage.removeItem('session_token');
      document.cookie = 'session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      setUser(null);
      
      // Redirecionar para login
      router.push('/auth/login');
    }
  };

  // Função para verificar se usuário tem determinada role
  const hasRole = (roles: string | string[]): boolean => {
    if (!user) return false;
    
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  // Propriedades computadas
  const isAuthenticated = !!user;
  const isAdmin = hasRole('admin');
  const isRH = hasRole(['admin', 'rh']);
  const isEleitor = hasRole(['admin', 'rh', 'eleitor']);

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    verifyMagicLink,
    validateSession,
    isAuthenticated,
    hasRole,
    isAdmin,
    isRH,
    isEleitor
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar o contexto de autenticação
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
}

// Hook para proteger páginas que requerem autenticação
export function useRequireAuth(redirectTo: string = '/auth/login') {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, loading, router, redirectTo]);

  return { isAuthenticated, loading };
}

// Hook para proteger páginas que requerem roles específicas
export function useRequireRole(roles: string | string[], redirectTo: string = '/unauthorized') {
  const { hasRole, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated && !hasRole(roles)) {
      router.push(redirectTo);
    }
  }, [hasRole, loading, isAuthenticated, router, redirectTo, roles]);

  return { hasRole: hasRole(roles), loading, isAuthenticated };
}

// Hook para redirecionar usuários já autenticados
export function useRedirectIfAuthenticated(redirectTo: string = '/dashboard') {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, loading, router, redirectTo]);

  return { isAuthenticated, loading };
}