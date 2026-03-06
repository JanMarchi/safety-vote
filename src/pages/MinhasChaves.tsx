
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Key, Clock, CheckCircle, AlertCircle, Copy, Eye, EyeOff } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/hooks/use-toast';

const MinhasChaves = () => {
  const [mostrarChaves, setMostrarChaves] = useState<Record<number, boolean>>({});
  const { toast } = useToast();

  const chaves = [
    {
      id: 1,
      eleicao: "Eleição CIPA 2024 - Matriz",
      chave: "CIPA2024-MX-7891234",
      status: "Ativa",
      dataEnvio: "15/03/2024 09:30",
      dataLimite: "22/03/2024 18:00",
      utilizada: false,
      whatsapp: "(11) 98765-4321"
    },
    {
      id: 2,
      eleicao: "Eleição CIPA - Filial Sul",
      chave: "CIPA2024-FS-5647890",
      status: "Agendada",
      dataEnvio: "Será enviada em 20/03/2024",
      dataLimite: "27/03/2024 18:00",
      utilizada: false,
      whatsapp: "(11) 98765-4321"
    },
    {
      id: 3,
      eleicao: "Eleição CIPA 2023 - Matriz",
      chave: "CIPA2023-MX-1234567",
      status: "Utilizada",
      dataEnvio: "10/03/2023 08:45",
      dataLimite: "17/03/2023 18:00",
      utilizada: true,
      whatsapp: "(11) 98765-4321"
    }
  ];

  const copiarChave = (chave: string) => {
    navigator.clipboard.writeText(chave);
    toast({
      title: "Chave copiada!",
      description: "A chave foi copiada para a área de transferência.",
    });
  };

  const toggleMostrarChave = (id: number) => {
    setMostrarChaves(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativa': return 'bg-green-100 text-green-800';
      case 'Agendada': return 'bg-blue-100 text-blue-800';
      case 'Utilizada': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Ativa': return <Key className="w-4 h-4 text-green-600" />;
      case 'Agendada': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'Utilizada': return <CheckCircle className="w-4 h-4 text-gray-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <DashboardLayout userType="eleitor">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Minhas Chaves de Votação</h1>
          <p className="text-gray-600">Gerencie suas chaves de acesso às eleições CIPA</p>
        </div>

        <div className="grid gap-4">
          {chaves.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(item.status)}
                    <div>
                      <CardTitle className="text-lg">{item.eleicao}</CardTitle>
                      <CardDescription>Enviada via WhatsApp: {item.whatsapp}</CardDescription>
                    </div>
                  </div>
                  <Badge className={getStatusColor(item.status)}>
                    {item.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Data de Envio:</Label>
                    <p className="text-sm">{item.dataEnvio}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Válida até:</Label>
                    <p className="text-sm">{item.dataLimite}</p>
                  </div>
                </div>

                {item.status !== 'Agendada' && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">Chave de Acesso:</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type={mostrarChaves[item.id] ? "text" : "password"}
                        value={item.chave}
                        readOnly
                        className="font-mono"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleMostrarChave(item.id)}
                      >
                        {mostrarChaves[item.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copiarChave(item.chave)}
                        disabled={item.utilizada}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {item.status === 'Ativa' && !item.utilizada && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">Chave Ativa</p>
                        <p className="text-sm text-green-700">
                          Você pode usar esta chave para votar até {item.dataLimite}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {item.utilizada && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">Voto Registrado</p>
                        <p className="text-sm text-gray-700">
                          Esta chave já foi utilizada para votação
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              <span>Informações Importantes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <p>Cada chave é única e válida apenas para uma eleição específica</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <p>As chaves são enviadas via WhatsApp pelo setor de RH</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <p>Após usar uma chave para votar, ela será automaticamente invalidada</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <p>Mantenha suas chaves em segurança e não as compartilhe</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <p>Em caso de problemas, contate o RH imediatamente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MinhasChaves;
