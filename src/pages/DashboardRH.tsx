
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Users, Vote, Clock, Plus, Eye, Edit, Play, Pause, BarChart3 } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import ElectionMonitorDialog from '@/components/ElectionMonitorDialog';
import { useNavigate } from 'react-router-dom';

const DashboardRH = () => {
  const navigate = useNavigate();
  const [monitorDialogOpen, setMonitorDialogOpen] = useState(false);
  const [selectedElectionForMonitor, setSelectedElectionForMonitor] = useState<any>(null);
  
  // Dados simulados
  const stats = [
    {
      title: "Eleições Ativas",
      value: "2",
      subtitle: "Em andamento",
      icon: <Vote className="w-6 h-6" />,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Eleições Agendadas",
      value: "1",
      subtitle: "Próximas 30 dias",
      icon: <Calendar className="w-6 h-6" />,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Total de Eleitores",
      value: "450",
      subtitle: "Colaboradores aptos",
      icon: <Users className="w-6 h-6" />,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Taxa de Participação",
      value: "87%",
      subtitle: "Média geral",
      icon: <BarChart3 className="w-6 h-6" />,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    }
  ];

  const eleicoes = [
    {
      id: 1,
      nome: "Eleição CIPA 2024 - Matriz",
      periodo: "15/03/2024 - 22/03/2024",
      status: "Ativa",
      totalEleitores: 450,
      votosRecebidos: 387,
      quorum: 86,
      vagas: { titular: 5, suplente: 5 },
      candidatos: 15
    },
    {
      id: 2,
      nome: "Eleição CIPA - Filial Sul",
      periodo: "20/03/2024 - 27/03/2024",
      status: "Agendada",
      totalEleitores: 150,
      votosRecebidos: 0,
      quorum: 0,
      vagas: { titular: 3, suplente: 3 },
      candidatos: 8
    },
    {
      id: 3,
      nome: "Eleição CIPA 2023 - Matriz",
      periodo: "10/03/2023 - 17/03/2023",
      status: "Finalizada",
      totalEleitores: 420,
      votosRecebidos: 378,
      quorum: 90,
      vagas: { titular: 5, suplente: 5 },
      candidatos: 12
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativa': return 'bg-green-100 text-green-800';
      case 'Agendada': return 'bg-blue-100 text-blue-800';
      case 'Finalizada': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getQuorumColor = (quorum: number) => {
    if (quorum >= 80) return 'text-green-600';
    if (quorum >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleNovaEleicao = () => {
    navigate('/elections/new');
  };

  const handleGerenciarEleitores = () => {
    navigate('/voters');
  };

  const handleRelatorios = () => {
    navigate('/rh-reports');
  };

  const handleViewEleicao = (id: number) => {
    navigate(`/election-results/${id}`);
  };

  const handleEditEleicao = (id: number) => {
    navigate(`/prepare-election/${id}`);
  };

  const handleStartEleicao = (id: number) => {
    // Lógica para iniciar eleição
    console.log('Iniciando eleição:', id);
  };

  const handleAcompanharEleicao = (eleicao: any) => {
    setSelectedElectionForMonitor(eleicao);
    setMonitorDialogOpen(true);
  };

  return (
    <DashboardLayout userType="rh">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard RH</h1>
            <p className="text-gray-600">Gerencie as eleições CIPA da sua empresa</p>
          </div>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 mt-4 md:mt-0"
            onClick={handleNovaEleicao}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Eleição
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.subtitle}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <div className={stat.color}>
                      {stat.icon}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Eleições Ativas - Destaque */}
        <div className="grid md:grid-cols-2 gap-6">
          {eleicoes.filter(e => e.status === 'Ativa').map((eleicao) => (
            <Card key={eleicao.id} className="border-l-4 border-l-green-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{eleicao.nome}</CardTitle>
                  <Badge className={getStatusColor(eleicao.status)}>
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                    {eleicao.status}
                  </Badge>
                </div>
                <CardDescription>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{eleicao.periodo}</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Votos recebidos:</span>
                    <p className="font-semibold">{eleicao.votosRecebidos} / {eleicao.totalEleitores}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Quórum:</span>
                    <p className={`font-semibold ${getQuorumColor(eleicao.quorum)}`}>
                      {eleicao.quorum}%
                    </p>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Progresso da Votação</span>
                    <span className="text-sm font-medium">{eleicao.quorum}%</span>
                  </div>
                  <Progress value={eleicao.quorum} className="h-2" />
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <p className="font-semibold">{eleicao.vagas.titular}</p>
                    <p className="text-gray-600">Titulares</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <p className="font-semibold">{eleicao.vagas.suplente}</p>
                    <p className="text-gray-600">Suplentes</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <p className="font-semibold">{eleicao.candidatos}</p>
                    <p className="text-gray-600">Candidatos</p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleAcompanharEleicao(eleicao)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Acompanhar
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Pause className="w-4 h-4 mr-1" />
                    Pausar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Todas as Eleições */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Eleições</CardTitle>
            <CardDescription>Todas as eleições da empresa</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Eleição</th>
                    <th className="text-left py-3 px-4 font-medium">Período</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Participação</th>
                    <th className="text-left py-3 px-4 font-medium">Quórum</th>
                    <th className="text-left py-3 px-4 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {eleicoes.map((eleicao) => (
                    <tr key={eleicao.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{eleicao.nome}</p>
                          <p className="text-sm text-gray-600">
                            {eleicao.candidatos} candidatos • {eleicao.vagas.titular + eleicao.vagas.suplente} vagas
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">{eleicao.periodo}</td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(eleicao.status)}>
                          {eleicao.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {eleicao.votosRecebidos} / {eleicao.totalEleitores}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${getQuorumColor(eleicao.quorum)}`}>
                          {eleicao.quorum}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewEleicao(eleicao.id)}
                            title="Visualizar eleição"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {eleicao.status === 'Agendada' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEditEleicao(eleicao.id)}
                              title="Editar eleição"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          {eleicao.status === 'Agendada' && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-green-600"
                              onClick={() => handleStartEleicao(eleicao.id)}
                              title="Iniciar eleição"
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={handleNovaEleicao}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Plus className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Criar Nova Eleição</h3>
              <p className="text-sm text-gray-600">Configure uma nova eleição CIPA</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={handleGerenciarEleitores}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Gerenciar Eleitores</h3>
              <p className="text-sm text-gray-600">Upload em massa e gestão de usuários</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={handleRelatorios}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Relatórios</h3>
              <p className="text-sm text-gray-600">Gerar relatórios e análises</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Election Monitor Dialog */}
      {selectedElectionForMonitor && (
        <ElectionMonitorDialog
          open={monitorDialogOpen}
          onOpenChange={setMonitorDialogOpen}
          electionName={selectedElectionForMonitor.nome}
          totalVoters={selectedElectionForMonitor.totalEleitores}
          votesReceived={selectedElectionForMonitor.votosRecebidos}
        />
      )}
    </DashboardLayout>
  );
};

export default DashboardRH;
