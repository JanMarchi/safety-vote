
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, FileText, Download, Filter, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/hooks/use-toast';

const Historico = () => {
  const [filtroAno, setFiltroAno] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const { toast } = useToast();

  const historico = [
    {
      id: 1,
      eleicao: "Eleição CIPA 2024 - Matriz",
      dataVotacao: "16/03/2024 14:30",
      status: "Votação Realizada",
      candidatosEscolhidos: 3,
      totalCandidatos: 15,
      comprovante: "COMP-2024-001",
      ano: "2024"
    },
    {
      id: 2,
      eleicao: "Eleição CIPA 2023 - Matriz",
      dataVotacao: "12/03/2023 16:45",
      status: "Votação Realizada",
      candidatosEscolhidos: 5,
      totalCandidatos: 12,
      comprovante: "COMP-2023-001",
      ano: "2023"
    },
    {
      id: 3,
      eleicao: "Eleição CIPA 2022 - Matriz",
      dataVotacao: "08/03/2022 10:20",
      status: "Votação Realizada",
      candidatosEscolhidos: 4,
      totalCandidatos: 10,
      comprovante: "COMP-2022-001",
      ano: "2022"
    },
    {
      id: 4,
      eleicao: "Eleição CIPA - Filial Norte 2024",
      dataVotacao: "-",
      status: "Não Participou",
      candidatosEscolhidos: 0,
      totalCandidatos: 8,
      comprovante: "-",
      ano: "2024"
    }
  ];

  const historicoFiltrado = historico.filter(item => {
    const filtroAnoMatch = filtroAno === 'todos' || item.ano === filtroAno;
    const filtroStatusMatch = filtroStatus === 'todos' || 
      (filtroStatus === 'votou' && item.status === 'Votação Realizada') ||
      (filtroStatus === 'nao-votou' && item.status === 'Não Participou');
    
    return filtroAnoMatch && filtroStatusMatch;
  });

  const baixarComprovante = (comprovante: string) => {
    if (comprovante === '-') {
      toast({
        title: "Comprovante não disponível",
        description: "Não há comprovante para esta eleição.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Download iniciado",
      description: `Baixando comprovante ${comprovante}...`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Votação Realizada': return 'bg-green-100 text-green-800';
      case 'Não Participou': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Votação Realizada': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Não Participou': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const estatisticas = {
    totalEleicoes: historico.length,
    votacoesRealizadas: historico.filter(h => h.status === 'Votação Realizada').length,
    percentualParticipacao: Math.round((historico.filter(h => h.status === 'Votação Realizada').length / historico.length) * 100)
  };

  return (
    <DashboardLayout userType="eleitor">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Histórico de Votações</h1>
          <p className="text-gray-600">Acompanhe seu histórico de participação nas eleições CIPA</p>
        </div>

        {/* Estatísticas */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total de Eleições</p>
                  <p className="text-2xl font-bold">{estatisticas.totalEleicoes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Votações Realizadas</p>
                  <p className="text-2xl font-bold">{estatisticas.votacoesRealizadas}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Participação</p>
                  <p className="text-2xl font-bold">{estatisticas.percentualParticipacao}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filtros</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Ano:</label>
                <Select value={filtroAno} onValueChange={setFiltroAno}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o ano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os anos</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Status:</label>
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="votou">Votou</SelectItem>
                    <SelectItem value="nao-votou">Não Votou</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista do Histórico */}
        <div className="space-y-4">
          {historicoFiltrado.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(item.status)}
                    <div>
                      <CardTitle className="text-lg">{item.eleicao}</CardTitle>
                      <CardDescription>
                        {item.dataVotacao !== '-' ? `Votação em: ${item.dataVotacao}` : 'Não participou desta eleição'}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={getStatusColor(item.status)}>
                    {item.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Candidatos Escolhidos:</p>
                    <p className="font-medium">{item.candidatosEscolhidos} de {item.totalCandidatos}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Comprovante:</p>
                    <p className="font-medium">{item.comprovante}</p>
                  </div>
                  <div className="flex justify-end">
                    {item.comprovante !== '-' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => baixarComprovante(item.comprovante)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Baixar Comprovante
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {historicoFiltrado.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum histórico encontrado</h3>
              <p className="text-gray-600">Não há registros que correspondam aos filtros selecionados.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Historico;
