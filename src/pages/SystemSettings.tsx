import React, { useState } from 'react';
import { Settings, Save, RefreshCw, Shield, Database, Mail, Bell, Globe, Key, Users, Building2 } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

interface SystemConfig {
  general: {
    systemName: string;
    systemVersion: string;
    maintenanceMode: boolean;
    maxCompanies: number;
    maxUsersPerCompany: number;
  };
  security: {
    passwordMinLength: number;
    passwordRequireSpecialChars: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    twoFactorAuth: boolean;
  };
  email: {
    smtpServer: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
  };
  notifications: {
    emailNotifications: boolean;
    systemAlerts: boolean;
    electionReminders: boolean;
    reportGeneration: boolean;
  };
  database: {
    backupFrequency: string;
    retentionPeriod: number;
    autoCleanup: boolean;
  };
}

const SystemSettings: React.FC = () => {
  const [config, setConfig] = useState<SystemConfig>({
    general: {
      systemName: 'Safety Vote',
      systemVersion: '2.1.0',
      maintenanceMode: false,
      maxCompanies: 100,
      maxUsersPerCompany: 1000
    },
    security: {
      passwordMinLength: 8,
      passwordRequireSpecialChars: true,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      twoFactorAuth: false
    },
    email: {
      smtpServer: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: 'sistema@safety-vote.com',
      smtpPassword: '••••••••',
      fromEmail: 'noreply@safety-vote.com',
      fromName: 'Safety Vote'
    },
    notifications: {
      emailNotifications: true,
      systemAlerts: true,
      electionReminders: true,
      reportGeneration: false
    },
    database: {
      backupFrequency: 'daily',
      retentionPeriod: 90,
      autoCleanup: true
    }
  });

  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Simular salvamento
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSaving(false);
    alert('Configurações salvas com sucesso!');
  };

  const updateConfig = (section: keyof SystemConfig, field: string, value: string | number | boolean) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const tabs = [
    { id: 'general', label: 'Geral', icon: Settings },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'database', label: 'Banco de Dados', icon: Database }
  ];

  return (
    <DashboardLayout userType="admin-sistema">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900">Configurações do Sistema</h1>
            <p className="text-gray-600">Gerencie as configurações globais do sistema</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            {saving ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-5 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-blue-600" />
                    Configurações Gerais
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Nome do Sistema
                      </label>
                      <input
                        type="text"
                        value={config.general.systemName}
                        onChange={(e) => updateConfig('general', 'systemName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Versão do Sistema
                      </label>
                      <input
                        type="text"
                        value={config.general.systemVersion}
                        onChange={(e) => updateConfig('general', 'systemVersion', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Máximo de Empresas
                      </label>
                      <input
                        type="number"
                        value={config.general.maxCompanies}
                        onChange={(e) => updateConfig('general', 'maxCompanies', parseInt(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Máximo de Usuários por Empresa
                      </label>
                      <input
                        type="number"
                        value={config.general.maxUsersPerCompany}
                        onChange={(e) => updateConfig('general', 'maxUsersPerCompany', parseInt(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Opções do Sistema</h4>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="maintenanceMode"
                        checked={config.general.maintenanceMode}
                        onChange={(e) => updateConfig('general', 'maintenanceMode', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="maintenanceMode" className="ml-3 block text-sm text-gray-900">
                        <span className="font-medium">Modo de Manutenção</span>
                        <p className="text-gray-600 text-xs mt-1">Bloqueia o acesso de todos os usuários ao sistema</p>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    Configurações de Segurança
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Tamanho Mínimo da Senha
                      </label>
                      <input
                        type="number"
                        value={config.security.passwordMinLength}
                        onChange={(e) => updateConfig('security', 'passwordMinLength', parseInt(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Timeout de Sessão (minutos)
                      </label>
                      <input
                        type="number"
                        value={config.security.sessionTimeout}
                        onChange={(e) => updateConfig('security', 'sessionTimeout', parseInt(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Máximo de Tentativas de Login
                      </label>
                      <input
                        type="number"
                        value={config.security.maxLoginAttempts}
                        onChange={(e) => updateConfig('security', 'maxLoginAttempts', parseInt(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Políticas de Segurança</h4>
                  <div className="space-y-4">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="passwordRequireSpecialChars"
                          checked={config.security.passwordRequireSpecialChars}
                          onChange={(e) => updateConfig('security', 'passwordRequireSpecialChars', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="passwordRequireSpecialChars" className="ml-3 block text-sm text-gray-900">
                          <span className="font-medium">Exigir caracteres especiais na senha</span>
                          <p className="text-gray-600 text-xs mt-1">Força o uso de símbolos especiais nas senhas</p>
                        </label>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="twoFactorAuth"
                          checked={config.security.twoFactorAuth}
                          onChange={(e) => updateConfig('security', 'twoFactorAuth', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="twoFactorAuth" className="ml-3 block text-sm text-gray-900">
                          <span className="font-medium">Habilitar autenticação de dois fatores</span>
                          <p className="text-gray-600 text-xs mt-1">Adiciona uma camada extra de segurança no login</p>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Email Settings */}
            {activeTab === 'email' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-blue-600" />
                    Configurações de Email
                  </h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-800">
                      <strong>Importante:</strong> Configure corretamente o servidor SMTP para que o sistema possa enviar emails de notificação.
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Servidor SMTP</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Servidor SMTP
                      </label>
                      <input
                        type="text"
                        value={config.email.smtpServer}
                        onChange={(e) => updateConfig('email', 'smtpServer', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                        placeholder="smtp.gmail.com"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Porta SMTP
                      </label>
                      <input
                        type="number"
                        value={config.email.smtpPort}
                        onChange={(e) => updateConfig('email', 'smtpPort', parseInt(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                        placeholder="587"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Usuário SMTP
                      </label>
                      <input
                        type="email"
                        value={config.email.smtpUser}
                        onChange={(e) => updateConfig('email', 'smtpUser', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                        placeholder="sistema@safety-vote.com"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Senha SMTP
                      </label>
                      <input
                        type="password"
                        value={config.email.smtpPassword}
                        onChange={(e) => updateConfig('email', 'smtpPassword', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Configurações do Remetente</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Email Remetente
                      </label>
                      <input
                        type="email"
                        value={config.email.fromEmail}
                        onChange={(e) => updateConfig('email', 'fromEmail', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                        placeholder="noreply@safety-vote.com"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Nome Remetente
                      </label>
                      <input
                        type="text"
                        value={config.email.fromName}
                        onChange={(e) => updateConfig('email', 'fromName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                        placeholder="Safety Vote"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-blue-600" />
                    Configurações de Notificações
                  </h3>
                  <p className="text-gray-600 mb-6">Configure quais tipos de notificações o sistema deve enviar automaticamente.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="emailNotifications"
                        checked={config.notifications.emailNotifications}
                        onChange={(e) => updateConfig('notifications', 'emailNotifications', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="emailNotifications" className="ml-3 block text-sm text-gray-900">
                        <span className="font-medium">Notificações por Email</span>
                        <p className="text-gray-600 text-xs mt-1">Habilita o envio de notificações via email</p>
                      </label>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="systemAlerts"
                        checked={config.notifications.systemAlerts}
                        onChange={(e) => updateConfig('notifications', 'systemAlerts', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="systemAlerts" className="ml-3 block text-sm text-gray-900">
                        <span className="font-medium">Alertas do Sistema</span>
                        <p className="text-gray-600 text-xs mt-1">Notificações sobre problemas e manutenções</p>
                      </label>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="electionReminders"
                        checked={config.notifications.electionReminders}
                        onChange={(e) => updateConfig('notifications', 'electionReminders', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="electionReminders" className="ml-3 block text-sm text-gray-900">
                        <span className="font-medium">Lembretes de Eleições</span>
                        <p className="text-gray-600 text-xs mt-1">Lembrar usuários sobre eleições em andamento</p>
                      </label>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="reportGeneration"
                        checked={config.notifications.reportGeneration}
                        onChange={(e) => updateConfig('notifications', 'reportGeneration', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="reportGeneration" className="ml-3 block text-sm text-gray-900">
                        <span className="font-medium">Geração de Relatórios</span>
                        <p className="text-gray-600 text-xs mt-1">Notificar quando relatórios estiverem prontos</p>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Database Settings */}
            {activeTab === 'database' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Database className="w-5 h-5 text-blue-600" />
                    Configurações do Banco de Dados
                  </h3>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-amber-800">
                      <strong>Atenção:</strong> Alterações nas configurações de backup podem afetar a segurança dos dados. Configure com cuidado.
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Configurações de Backup</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Frequência de Backup
                      </label>
                      <select
                        value={config.database.backupFrequency}
                        onChange={(e) => updateConfig('database', 'backupFrequency', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                      >
                        <option value="hourly">A cada hora</option>
                        <option value="daily">Diário</option>
                        <option value="weekly">Semanal</option>
                        <option value="monthly">Mensal</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Período de Retenção (dias)
                      </label>
                      <input
                        type="number"
                        value={config.database.retentionPeriod}
                        onChange={(e) => updateConfig('database', 'retentionPeriod', parseInt(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                        placeholder="90"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Manutenção Automática</h4>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="autoCleanup"
                        checked={config.database.autoCleanup}
                        onChange={(e) => updateConfig('database', 'autoCleanup', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="autoCleanup" className="ml-3 block text-sm text-gray-900">
                        <span className="font-medium">Limpeza Automática de Dados Antigos</span>
                        <p className="text-gray-600 text-xs mt-1">Remove automaticamente dados expirados conforme o período de retenção</p>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SystemSettings;