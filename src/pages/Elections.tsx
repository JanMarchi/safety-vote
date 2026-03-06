
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import DashboardLayout from '@/components/DashboardLayout';
import { Plus, Search, Calendar, Users, Vote, Clock, BarChart3, Edit, Trash2, Copy, Star, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Election {
  id: number;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  totalVotes: number;
  totalVoters: number;
  quorum: number;
  vacancies: {
    titular: number;
    suplente: number;
  };
}

const Elections = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const elections = [
    {
      id: 1,
      name: "Eleição CIPA 2024 - Matriz",
      status: "ativa",
      startDate: "2024-01-15",
      endDate: "2024-01-20",
      totalVotes: 127,
      totalVoters: 200,
      quorum: 63.5,
      vacancies: { titular: 3, suplente: 3 }
    },
    {
      id: 2,
      name: "Eleição CIPA 2024 - Filial SP",
      status: "agendada",
      startDate: "2024-02-01",
      endDate: "2024-02-05",
      totalVotes: 0,
      totalVoters: 150,
      quorum: 0,
      vacancies: { titular: 2, suplente: 2 }
    },
    {
      id: 3,
      name: "Eleição CIPA 2023 - Matriz",
      status: "finalizada",
      startDate: "2023-01-15",
      endDate: "2023-01-20",
      totalVotes: 185,
      totalVoters: 195,
      quorum: 94.9,
      vacancies: { titular: 3, suplente: 3 }
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ativa':
        return <Badge className="bg-green-100 text-green-800 animate-pulse">Ativa</Badge>;
      case 'agendada':
        return <Badge className="bg-blue-100 text-blue-800">Agendada</Badge>;
      case 'finalizada':
        return <Badge className="bg-gray-100 text-gray-800">Finalizada</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getQuorumBadge = (quorum: number) => {
    if (quorum >= 90) {
      return (
        <div className="flex items-center space-x-1 text-green-600">
          <Star className="w-4 h-4 fill-current" />
          <span className="text-xs font-medium">Alta Participação</span>
        </div>
      );
    }
    return null;
  };

  const getPrimaryAction = (election: Election) => {
    switch (election.status) {
      case 'ativa':
        return (
          <Link to={`/elections/${election.id}/monitor`}>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <TrendingUp className="w-4 h-4 mr-2" />
              Monitorar Agora
            </Button>
          </Link>
        );
      case 'agendada':
        return (
          <Link to={`/elections/${election.id}/edit`}>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Edit className="w-4 h-4 mr-2" />
              Preparar Eleição
            </Button>
          </Link>
        );
      case 'finalizada':
        return (
          <Link to={`/elections/${election.id}/results`}>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Ver Resultados
            </Button>
          </Link>
        );
      default:
        return null;
    }
  };

  const handleDuplicate = (election: Election) => {
    setIsLoading(true);
    setTimeout(() => {
      toast({
        title: "Eleição duplicada!",
        description: `Nova eleição criada baseada em "${election.name}"`,
      });
      setIsLoading(false);
    }, 1000);
  };

  const handleDelete = (electionName: string) => {
    toast({
      title: "Eleição excluída",
      description: `"${electionName}" foi removida permanentemente`,
      variant: "destructive"
    });
  };

  const filteredElections = elections.filter(election =>
    election.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedElections = [...filteredElections].sort((a, b) => {
    const statusOrder = { 'ativa': 0, 'agendada': 1, 'finalizada': 2 };
    return statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder];
  });

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) {
      return text;
    }
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <TooltipProvider>
      <DashboardLayout userType="rh">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="animate-fade-in">
              <h1 className="text-3xl font-bold text-gray-900">Gestão de Eleições</h1>
              <p className="text-gray-600">Gerencie todas as eleições CIPA da sua empresa</p>
            </div>
            <Link to="/elections/new">
              <Button className="bg-blue-600 hover:bg-blue-700 hover:scale-105 transition-all duration-200 w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Nova Eleição
              </Button>
            </Link>
          </div>

          <Card className="animate-fade-in">
            <CardContent className="pt-6">
              <div className="flex space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar eleições..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  />
                  {searchTerm && (
                    <div className="absolute right-3 top-3 text-xs text-gray-500">
                      {filteredElections.length} resultado(s)
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6">
            {sortedElections.map((election, index) => (
              <Card 
                key={election.id} 
                className="hover:shadow-lg transition-all duration-300 animate-fade-in border-0 shadow-md"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">
                        {highlightText(election.name, searchTerm)}
                      </CardTitle>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {election.startDate} - {election.endDate}
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {election.vacancies.titular}T + {election.vacancies.suplente}S vagas
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(election.status)}
                      {getQuorumBadge(election.quorum)}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="bg-blue-50 rounded-lg p-4 hover:bg-blue-100 transition-colors cursor-help">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Total de Votos</p>
                              <p className="text-2xl font-bold text-blue-600">{election.totalVotes}</p>
                            </div>
                            <Vote className="w-8 h-8 text-blue-600" />
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Número total de votos computados</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="bg-green-50 rounded-lg p-4 hover:bg-green-100 transition-colors cursor-help">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Eleitores</p>
                              <p className="text-2xl font-bold text-green-600">{election.totalVoters}</p>
                            </div>
                            <Users className="w-8 h-8 text-green-600" />
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Total de eleitores cadastrados</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="bg-purple-50 rounded-lg p-4 hover:bg-purple-100 transition-colors cursor-help">
                          <div className="flex flex-col">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="text-sm text-gray-600">Quórum</p>
                                <p className="text-xl font-bold text-purple-600">{election.quorum}%</p>
                              </div>
                              <BarChart3 className="w-6 h-6 text-purple-600" />
                            </div>
                            <Progress 
                              value={election.quorum} 
                              className="h-2"
                            />
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Percentual de participação na eleição</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="bg-orange-50 rounded-lg p-4 hover:bg-orange-100 transition-colors cursor-help">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Status</p>
                              <p className="text-lg font-bold text-orange-600 capitalize">{election.status}</p>
                            </div>
                            <Clock className="w-8 h-8 text-orange-600" />
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Status atual da eleição</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex flex-wrap gap-2">
                      {getPrimaryAction(election)}
                      
                      {election.status === 'ativa' && (
                        <Link to={`/elections/${election.id}/voters`}>
                          <Button variant="outline" size="sm">
                            <Users className="w-4 h-4 mr-2" />
                            Eleitores
                          </Button>
                        </Link>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDuplicate(election)}
                            disabled={isLoading}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Duplicar eleição</p>
                        </TooltipContent>
                      </Tooltip>
                      
                      <AlertDialog>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Excluir eleição</p>
                          </TooltipContent>
                        </Tooltip>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Tem certeza que deseja excluir esta eleição?</AlertDialogTitle>
                            <AlertDialogDescription>
                              A eleição "{election.name}" será removida permanentemente. 
                              Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(election.name)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Sim, excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredElections.length === 0 && (
            <Card className="animate-fade-in">
              <CardContent className="text-center py-12">
                <Vote className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm ? 'Nenhuma eleição encontrada' : 'Nenhuma eleição criada ainda'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm 
                    ? 'Tente ajustar os termos de busca ou limpe o filtro' 
                    : 'Que tal começarmos criando sua primeira eleição? É rápido e fácil!'
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {searchTerm && (
                    <Button 
                      variant="outline" 
                      onClick={() => setSearchTerm('')}
                      className="hover:scale-105 transition-transform"
                    >
                      Limpar Busca
                    </Button>
                  )}
                  <Link to="/elections/new">
                    <Button className="bg-blue-600 hover:bg-blue-700 hover:scale-105 transition-all duration-200">
                      <Plus className="w-4 h-4 mr-2" />
                      {searchTerm ? 'Criar Nova Eleição' : 'Comece Agora com 1 Clique'}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </TooltipProvider>
  );
};

export default Elections;
