import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import DashboardLayout from '@/components/DashboardLayout';
import { Settings, Bell, Mail, Shield, Save, RefreshCw, AlertCircle, Ticket } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const RHSettings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Estados para configurações da empresa
  const [companySettings, setCompanySettings] = useState({
    companyName: '',
    cnpj: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: ''
  });

  // Estados para configurações de eleição
  const [electionSettings, setElectionSettings] = useState({
    defaultElectionDuration: 7,
    minCandidates: 2,
    maxCandidates: 20,
    allowSelfNomination: true,
    requireCandidateApproval: false,
    enableVoteReminder: true,
    reminderFrequency: 24
  });

  // Estados para notificações
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    electionStart: true,
    electionEnd: true,
    lowParticipation: true,
    candidateRegistration: true
  });

  // Estados para segurança
  const [securitySettings, setSecuritySettings] = useState({
    requireTwoFactor: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    auditLog: true
  });

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Configurações salvas",
        description: "As configurações foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenTicket = () => {
    toast({
      title: "Chamado aberto",
      description: "Um chamado foi enviado para o suporte da administração da plataforma.",
    });
  };

  return (
    <DashboardLayout userType="rh">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configurações RH</h1>
            <p className="text-gray-600">Gerencie as configurações da sua empresa e eleições</p>
          </div>
          <Button 
            onClick={handleSaveSettings}
            disabled={isLoading}
            className="mt-4 md:mt-0"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salvar Configurações
          </Button>
        </div>

        <Tabs defaultValue="company" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="company">Empresa</TabsTrigger>
            <TabsTrigger value="elections">Eleições</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
          </TabsList>

          {/* Configurações da Empresa */}
          <TabsContent value="company">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Informações da Empresa</span>
                </CardTitle>
                <CardDescription>
                  Informações básicas da sua empresa (somente leitura)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Aviso de Restrição */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-800">Alterações Restritas</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        As informações da empresa podem ser alteradas apenas pelo sistema de administração da plataforma. Se você precisa fazer alguma alteração, abra um chamado para que a equipe de suporte processe sua solicitação.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Nome da Empresa</Label>
                    <Input
                      id="companyName"
                      value={companySettings.companyName}
                      disabled={true}
                      className="bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input
                      id="cnpj"
                      value={companySettings.cnpj}
                      disabled={true}
                      className="bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      value={companySettings.address}
                      disabled={true}
                      className="bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={companySettings.phone}
                      disabled={true}
                      className="bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={companySettings.email}
                      disabled={true}
                      className="bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">CEP</Label>
                    <Input
                      id="zipCode"
                      value={companySettings.zipCode}
                      disabled={true}
                      className="bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleOpenTicket}
                    className="flex items-center space-x-2"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>Abrir Chamado para Alteração</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurações de Eleições */}
          <TabsContent value="elections">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Configurações de Eleições</span>
                </CardTitle>
                <CardDescription>
                  Configure os parâmetros padrão para eleições CIPA
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duração Padrão (dias)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={electionSettings.defaultElectionDuration}
                      onChange={(e) => setElectionSettings({...electionSettings, defaultElectionDuration: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minCandidates">Mínimo de Candidatos</Label>
                    <Input
                      id="minCandidates"
                      type="number"
                      value={electionSettings.minCandidates}
                      onChange={(e) => setElectionSettings({...electionSettings, minCandidates: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxCandidates">Máximo de Candidatos</Label>
                    <Input
                      id="maxCandidates"
                      type="number"
                      value={electionSettings.maxCandidates}
                      onChange={(e) => setElectionSettings({...electionSettings, maxCandidates: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reminderFreq">Frequência de Lembrete (horas)</Label>
                    <Input
                      id="reminderFreq"
                      type="number"
                      value={electionSettings.reminderFrequency}
                      onChange={(e) => setElectionSettings({...electionSettings, reminderFrequency: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Opções de Candidatura</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Permitir Auto-Candidatura</Label>
                        <p className="text-sm text-gray-600">Funcionários podem se candidatar diretamente</p>
                      </div>
                      <Switch
                        checked={electionSettings.allowSelfNomination}
                        onCheckedChange={(checked) => setElectionSettings({...electionSettings, allowSelfNomination: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Aprovação de Candidatos</Label>
                        <p className="text-sm text-gray-600">Candidaturas precisam ser aprovadas pelo RH</p>
                      </div>
                      <Switch
                        checked={electionSettings.requireCandidateApproval}
                        onCheckedChange={(checked) => setElectionSettings({...electionSettings, requireCandidateApproval: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Lembretes de Votação</Label>
                        <p className="text-sm text-gray-600">Enviar lembretes automáticos para votar</p>
                      </div>
                      <Switch
                        checked={electionSettings.enableVoteReminder}
                        onCheckedChange={(checked) => setElectionSettings({...electionSettings, enableVoteReminder: checked})}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurações de Notificações */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Notificações</span>
                </CardTitle>
                <CardDescription>
                  Configure como e quando receber notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Canais de Notificação</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Notificações por E-mail</Label>
                        <p className="text-sm text-gray-600">Receber notificações via e-mail</p>
                      </div>
                      <Switch
                        checked={notificationSettings.emailNotifications}
                        onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailNotifications: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Notificações por SMS</Label>
                        <p className="text-sm text-gray-600">Receber notificações via SMS</p>
                      </div>
                      <Switch
                        checked={notificationSettings.smsNotifications}
                        onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, smsNotifications: checked})}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Tipos de Notificação</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Início de Eleição</Label>
                        <p className="text-sm text-gray-600">Quando uma eleição é iniciada</p>
                      </div>
                      <Switch
                        checked={notificationSettings.electionStart}
                        onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, electionStart: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Fim de Eleição</Label>
                        <p className="text-sm text-gray-600">Quando uma eleição é finalizada</p>
                      </div>
                      <Switch
                        checked={notificationSettings.electionEnd}
                        onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, electionEnd: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Baixa Participação</Label>
                        <p className="text-sm text-gray-600">Quando a participação está baixa</p>
                      </div>
                      <Switch
                        checked={notificationSettings.lowParticipation}
                        onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, lowParticipation: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Registro de Candidatos</Label>
                        <p className="text-sm text-gray-600">Quando novos candidatos se registram</p>
                      </div>
                      <Switch
                        checked={notificationSettings.candidateRegistration}
                        onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, candidateRegistration: checked})}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurações de Segurança */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Segurança</span>
                </CardTitle>
                <CardDescription>
                  Configure as opções de segurança da conta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Autenticação de Dois Fatores</Label>
                      <p className="text-sm text-gray-600">Adicionar uma camada extra de segurança</p>
                    </div>
                    <Switch
                      checked={securitySettings.requireTwoFactor}
                      onCheckedChange={(checked) => setSecuritySettings({...securitySettings, requireTwoFactor: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Log de Auditoria</Label>
                      <p className="text-sm text-gray-600">Registrar todas as ações realizadas</p>
                    </div>
                    <Switch
                      checked={securitySettings.auditLog}
                      onCheckedChange={(checked) => setSecuritySettings({...securitySettings, auditLog: checked})}
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Timeout de Sessão (minutos)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passwordExpiry">Expiração de Senha (dias)</Label>
                    <Input
                      id="passwordExpiry"
                      type="number"
                      value={securitySettings.passwordExpiry}
                      onChange={(e) => setSecuritySettings({...securitySettings, passwordExpiry: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800">Recomendações de Segurança</h4>
                      <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                        <li>• Use senhas fortes com pelo menos 8 caracteres</li>
                        <li>• Ative a autenticação de dois fatores</li>
                        <li>• Mantenha o log de auditoria ativado</li>
                        <li>• Configure um timeout de sessão adequado</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default RHSettings;