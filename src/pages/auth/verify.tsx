// Página de Verificação do Magic Link
// Processa e valida tokens de autenticação

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { MagicLinkAuth } from '../../lib/auth/magic-link';
import { AuditSystem } from '../../lib/audit/audit-system';

interface VerifyState {
  status: 'loading' | 'success' | 'error' | 'expired';
  message: string;
  user?: any;
  countdown: number;
}

const Verify: React.FC = () => {
  const router = useRouter();
  const { token, redirect } = router.query;
  
  const [state, setState] = useState<VerifyState>({
    status: 'loading',
    message: 'Verificando seu acesso...',
    countdown: 5
  });

  // Função para obter IP do cliente
  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch('/api/client-ip');
      const data = await response.json();
      return data.ip || '127.0.0.1';
    } catch {
      return '127.0.0.1';
    }
  };

  // Função para verificar o token
  const verifyToken = async (tokenValue: string) => {
    try {
      const clientIP = await getClientIP();
      
      // Log da tentativa de verificação
      await AuditSystem.logSecurityEvent({
        type: 'login_attempt',
        severity: 'low',
        ip_address: clientIP,
        description: 'Tentativa de verificação de magic link',
        metadata: {
          token_provided: !!tokenValue,
          user_agent: navigator.userAgent
        }
      });
      
      const result = await MagicLinkAuth.verifyMagicLink(tokenValue, clientIP);
      
      if (result.success && result.user) {
        setState({
          status: 'success',
          message: `Bem-vindo(a), ${result.user.name}!`,
          user: result.user,
          countdown: 3
        });
        
        // Salvar token de sessão
        if (result.token) {
          localStorage.setItem('session_token', result.token);
          sessionStorage.setItem('user', JSON.stringify(result.user));
        }
        
        // Log de sucesso
        await AuditSystem.logSecurityEvent({
          type: 'login_attempt',
          severity: 'low',
          user_id: result.user.id,
          ip_address: clientIP,
          description: 'Login realizado com sucesso via magic link',
          metadata: {
            user_role: result.user.role,
            company_id: result.user.company_id
          }
        });
        
        // Redirecionar após countdown
        setTimeout(() => {
          const redirectUrl = (redirect as string) || '/dashboard';
          router.push(redirectUrl);
        }, 3000);
        
      } else {
        setState({
          status: 'error',
          message: result.message || 'Token inválido ou expirado',
          countdown: 0
        });
        
        // Log de falha
        await AuditSystem.logSecurityEvent({
          type: 'failed_login',
          severity: 'medium',
          ip_address: clientIP,
          description: `Falha na verificação do magic link: ${result.message}`,
          metadata: {
            error: result.error
          }
        });
      }
    } catch (error) {
      console.error('Erro na verificação:', error);
      setState({
        status: 'error',
        message: 'Erro interno do servidor. Tente novamente.',
        countdown: 0
      });
    }
  };

  // Efeito para verificar token quando a página carrega
  useEffect(() => {
    if (token && typeof token === 'string') {
      verifyToken(token);
    } else {
      setState({
        status: 'error',
        message: 'Token não fornecido ou inválido',
        countdown: 0
      });
    }
  }, [token]);

  // Countdown para redirecionamento
  useEffect(() => {
    if (state.status === 'success' && state.countdown > 0) {
      const timer = setTimeout(() => {
        setState(prev => ({
          ...prev,
          countdown: prev.countdown - 1
        }));
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [state.countdown, state.status]);

  // Função para tentar novamente
  const handleRetry = () => {
    router.push('/auth/login');
  };

  // Função para ir para dashboard
  const goToDashboard = () => {
    const redirectUrl = (redirect as string) || '/dashboard';
    router.push(redirectUrl);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Safety Vote
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Verificando seu acesso
          </p>
        </div>

        {/* Conteúdo principal */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            {/* Loading */}
            {state.status === 'loading' && (
              <div className="space-y-4">
                <div className="mx-auto h-16 w-16 relative">
                  <svg className="animate-spin h-16 w-16 text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  {state.message}
                </h3>
                <p className="text-sm text-gray-600">
                  Aguarde enquanto validamos suas credenciais...
                </p>
              </div>
            )}

            {/* Sucesso */}
            {state.status === 'success' && (
              <div className="space-y-4">
                <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-green-900">
                  Acesso Autorizado!
                </h3>
                <p className="text-sm text-gray-600">
                  {state.message}
                </p>
                
                {state.user && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4 mt-4">
                    <div className="text-sm">
                      <p className="font-medium text-green-900">Informações do usuário:</p>
                      <p className="text-green-700">Nome: {state.user.name}</p>
                      <p className="text-green-700">Email: {state.user.email}</p>
                      <p className="text-green-700">Perfil: {state.user.role}</p>
                    </div>
                  </div>
                )}
                
                {state.countdown > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">
                      Redirecionando em {state.countdown} segundos...
                    </p>
                    <div className="mt-2">
                      <button
                        onClick={goToDashboard}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Ir para Dashboard
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Erro */}
            {state.status === 'error' && (
              <div className="space-y-4">
                <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-red-900">
                  Acesso Negado
                </h3>
                <p className="text-sm text-gray-600">
                  {state.message}
                </p>
                
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mt-4">
                  <div className="text-sm text-red-700">
                    <p className="font-medium">Possíveis causas:</p>
                    <ul className="mt-2 list-disc list-inside space-y-1">
                      <li>Link expirado (válido por apenas 15 minutos)</li>
                      <li>Link já utilizado anteriormente</li>
                      <li>Token inválido ou corrompido</li>
                      <li>Usuário não encontrado no sistema</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-6 space-y-3">
                  <button
                    onClick={handleRetry}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Solicitar Novo Link
                  </button>
                  
                  <p className="text-xs text-gray-500">
                    Se o problema persistir, entre em contato com o RH da sua empresa.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Informações de segurança */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-center">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              🔒 Segurança do Sistema
            </h4>
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
              <div>
                <p className="font-medium">Criptografia</p>
                <p>AES-256</p>
              </div>
              <div>
                <p className="font-medium">Auditoria</p>
                <p>Completa</p>
              </div>
              <div>
                <p className="font-medium">Validade</p>
                <p>15 minutos</p>
              </div>
              <div>
                <p className="font-medium">Uso</p>
                <p>Único</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Todos os acessos são registrados para auditoria e segurança.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Verify;