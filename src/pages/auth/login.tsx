// Página de Login com Magic Link
// Sistema seguro de autenticação para Safety Vote

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { MagicLinkAuth } from '../../lib/auth/magic-link';
import { AuditSystem } from '../../lib/audit/audit-system';

interface LoginFormData {
  email: string;
  cpf: string;
}

interface LoginState {
  isLoading: boolean;
  message: string;
  messageType: 'success' | 'error' | 'info';
  showCPFField: boolean;
}

const Login: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    cpf: ''
  });
  
  const [state, setState] = useState<LoginState>({
    isLoading: false,
    message: '',
    messageType: 'info',
    showCPFField: false
  });

  // Função para formatar CPF
  const formatCPF = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  // Função para validar email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

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

  // Handler para mudanças nos campos
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'cpf') {
      setFormData(prev => ({
        ...prev,
        [name]: formatCPF(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Limpar mensagens ao digitar
    if (state.message) {
      setState(prev => ({ ...prev, message: '' }));
    }
  };

  // Handler para envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (!formData.email.trim()) {
      setState(prev => ({
        ...prev,
        message: 'Email é obrigatório',
        messageType: 'error'
      }));
      return;
    }
    
    if (!validateEmail(formData.email)) {
      setState(prev => ({
        ...prev,
        message: 'Email inválido',
        messageType: 'error'
      }));
      return;
    }
    
    if (state.showCPFField && !formData.cpf.trim()) {
      setState(prev => ({
        ...prev,
        message: 'CPF é obrigatório',
        messageType: 'error'
      }));
      return;
    }
    
    setState(prev => ({ ...prev, isLoading: true, message: '' }));
    
    try {
      const clientIP = await getClientIP();
      const redirectTo = (router.query.redirect as string) || '/dashboard';
      
      // Log da tentativa de login
      await AuditSystem.logSecurityEvent({
        type: 'login_attempt',
        severity: 'low',
        ip_address: clientIP,
        description: `Tentativa de login para email: ${formData.email}`,
        metadata: {
          email: formData.email,
          has_cpf: !!formData.cpf,
          user_agent: navigator.userAgent
        }
      });
      
      // Enviar magic link
      const result = await MagicLinkAuth.sendMagicLink({
        email: formData.email.trim(),
        cpf: formData.cpf.replace(/\D/g, '') || undefined,
        redirectTo
      }, clientIP);
      
      if (result.success) {
        setState(prev => ({
          ...prev,
          message: result.message,
          messageType: 'success',
          isLoading: false
        }));
        
        // Limpar formulário
        setFormData({ email: '', cpf: '' });
      } else {
        setState(prev => ({
          ...prev,
          message: result.message,
          messageType: 'error',
          isLoading: false
        }));
        
        // Log de falha no login
        await AuditSystem.logSecurityEvent({
          type: 'failed_login',
          severity: 'medium',
          ip_address: clientIP,
          description: `Falha no login: ${result.message}`,
          metadata: {
            email: formData.email,
            error: result.error
          }
        });
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setState(prev => ({
        ...prev,
        message: 'Erro interno do servidor. Tente novamente.',
        messageType: 'error',
        isLoading: false
      }));
    }
  };

  // Toggle para mostrar campo CPF
  const toggleCPFField = () => {
    setState(prev => ({
      ...prev,
      showCPFField: !prev.showCPFField
    }));
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
            Sistema Seguro de Votação
          </p>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="seu.email@empresa.com"
                  disabled={state.isLoading}
                />
              </div>
            </div>

            {/* Campo CPF (opcional) */}
            {state.showCPFField && (
              <div>
                <label htmlFor="cpf" className="block text-sm font-medium text-gray-700">
                  CPF (opcional)
                </label>
                <div className="mt-1">
                  <input
                    id="cpf"
                    name="cpf"
                    type="text"
                    maxLength={14}
                    value={formData.cpf}
                    onChange={handleInputChange}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="000.000.000-00"
                    disabled={state.isLoading}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Adicione seu CPF para maior segurança
                </p>
              </div>
            )}

            {/* Botão para mostrar CPF */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={toggleCPFField}
                className="text-sm text-blue-600 hover:text-blue-500"
                disabled={state.isLoading}
              >
                {state.showCPFField ? 'Ocultar CPF' : 'Adicionar CPF para mais segurança'}
              </button>
            </div>

            {/* Mensagem */}
            {state.message && (
              <div className={`rounded-md p-4 ${
                state.messageType === 'success' ? 'bg-green-50 border border-green-200' :
                state.messageType === 'error' ? 'bg-red-50 border border-red-200' :
                'bg-blue-50 border border-blue-200'
              }`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    {state.messageType === 'success' && (
                      <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    {state.messageType === 'error' && (
                      <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                    {state.messageType === 'info' && (
                      <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm ${
                      state.messageType === 'success' ? 'text-green-800' :
                      state.messageType === 'error' ? 'text-red-800' :
                      'text-blue-800'
                    }`}>
                      {state.message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Botão de envio */}
            <div>
              <button
                type="submit"
                disabled={state.isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {state.isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando...
                  </>
                ) : (
                  'Enviar Link de Acesso'
                )}
              </button>
            </div>
          </form>

          {/* Informações de segurança */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                🔒 Acesso Seguro
              </h3>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Link válido por apenas 15 minutos</li>
                <li>• Uso único por link</li>
                <li>• Criptografia de ponta a ponta</li>
                <li>• Auditoria completa de acessos</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Problemas para acessar? Entre em contato com o RH da sua empresa.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;