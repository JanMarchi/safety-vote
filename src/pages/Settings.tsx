
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Shield, Bell, Database, Mail, Globe, Save } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

const SettingsPage = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  return (
    <DashboardLayout userType="admin-sistema">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
            <p className="text-gray-600">Gerencie as configurações do sistema</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 mt-4 md:mt-0">
            <Save className="w-4 h-4 mr-2" />
            Salvar Alterações
          </Button>
        </div>

        <Tabs defaultValue="geral" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="geral">Geral</TabsTrigger>
            <TabsTrigger value="seguranca">Segurança</TabsTrigger>
            <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="sistema">Sistema</TabsTrigger>
          </TabsList>

          {/* Configurações Gerais */}
          <TabsContent value="geral">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Configurações Gerais
                  </CardTitle>
                  <CardDescription>Configurações básicas do sistema</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="system-name">Nome do Sistema</Label>
                      <Input id="system-name" defaultValue="Safety Vote" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="system-version">Versão</Label>
                      <Input id="system-version" defaultValue="1.0.0" disabled />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="system-description">Descrição</Label>
                    <Textarea 
                      id="system-description" 
                      defaultValue="Sistema de votação digital para eleições da CIPA conforme NR-5"
                      rows={3}
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Fuso Horário</Label>
                      <Select defaultValue="america-sao_paulo">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="america-sao_paulo">América/São Paulo</SelectItem>
                          <SelectItem value="america-rio_branco">América/Rio Branco</SelectItem>
                          <SelectItem value="america-manaus">América/Manaus</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="language">Idioma</Label>
                      <Select defaultValue="pt-br">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pt-br">Português (Brasil)</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Configurações de Segurança */}
          <TabsContent value="seguranca">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Segurança e Autenticação
                  </CardTitle>
                  <CardDescription>Configurações de segurança do sistema</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="session-timeout">Timeout de Sessão (minutos)</Label>
                      <Input id="session-timeout" type="number" defaultValue="60" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-length">Tamanho Mínimo da Senha</Label>
                      <Input id="password-length" type="number" defaultValue="8" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Autenticação de Dois Fatores</Label>
                        <p className="text-sm text-gray-600">Require 2FA para todos os usuários</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Forçar HTTPS</Label>
                        <p className="text-sm text-gray-600">Redirecionar todo tráfego para HTTPS</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Log de Auditoria</Label>
                        <p className="text-sm text-gray-600">Registrar todas as ações dos usuários</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Configurações de Notificações */}
          <TabsContent value="notificacoes">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="w-5 h-5 mr-2" />
                    Notificações
                  </CardTitle>
                  <CardDescription>Configure as notificações do sistema</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Notificações por Email</Label>
                        <p className="text-sm text-gray-600">Enviar notificações importantes por email</p>
                      </div>
                      <Switch 
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Alertas do Sistema</Label>
                        <p className="text-sm text-gray-600">Notificar sobre problemas do sistema</p>
                      </div>
                      <Switch 
                        checked={systemAlerts}
                        onCheckedChange={setSystemAlerts}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Relatórios Automáticos</Label>
                        <p className="text-sm text-gray-600">Enviar relatórios periódicos</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notification-frequency">Frequência dos Relatórios</Label>
                    <Select defaultValue="semanal">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="diario">Diário</SelectItem>
                        <SelectItem value="semanal">Semanal</SelectItem>
                        <SelectItem value="mensal">Mensal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Configurações de Email */}
          <TabsContent value="email">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mail className="w-5 h-5 mr-2" />
                    Configurações de Email
                  </CardTitle>
                  <CardDescription>Configure o servidor de email</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtp-server">Servidor SMTP</Label>
                      <Input id="smtp-server" placeholder="smtp.seuservidor.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp-port">Porta</Label>
                      <Input id="smtp-port" type="number" defaultValue="587" />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtp-user">Usuário</Label>
                      <Input id="smtp-user" placeholder="usuario@seudominio.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp-password">Senha</Label>
                      <Input id="smtp-password" type="password" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="from-email">Email Remetente</Label>
                    <Input id="from-email" placeholder="noreply@sistema.com" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Usar TLS/SSL</Label>
                      <p className="text-sm text-gray-600">Conexão segura com o servidor SMTP</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Button variant="outline">
                    Testar Configuração
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Configurações do Sistema */}
          <TabsContent value="sistema">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="w-5 h-5 mr-2" />
                    Sistema e Manutenção
                  </CardTitle>
                  <CardDescription>Configurações avançadas do sistema</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Modo de Manutenção</Label>
                      <p className="text-sm text-gray-600">Bloquear acesso ao sistema para manutenção</p>
                    </div>
                    <Switch 
                      checked={maintenanceMode}
                      onCheckedChange={setMaintenanceMode}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="backup-frequency">Frequência de Backup</Label>
                    <Select defaultValue="diario">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6h">A cada 6 horas</SelectItem>
                        <SelectItem value="12h">A cada 12 horas</SelectItem>
                        <SelectItem value="diario">Diário</SelectItem>
                        <SelectItem value="semanal">Semanal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="log-retention">Retenção de Logs (dias)</Label>
                    <Input id="log-retention" type="number" defaultValue="90" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="text-blue-600">
                      <Database className="w-4 h-4 mr-2" />
                      Backup Manual
                    </Button>
                    <Button variant="outline" className="text-red-600">
                      <Globe className="w-4 h-4 mr-2" />
                      Limpar Cache
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
