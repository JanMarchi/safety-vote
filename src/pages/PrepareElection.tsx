
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import DashboardLayout from '@/components/DashboardLayout';
import { ArrowLeft, Users, UserCheck, Mail, Settings, Play, CheckCircle, AlertCircle } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const PrepareElection = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [checklist, setChecklist] = useState({
    eleitores: false,
    candidatos: false,
    tokens: false,
    emails: false,
    configuracoes: false
  });

  // Dados da eleição - serão carregados da API
  const [election, setElection] = useState(null);
  
  useEffect(() => {
    // Carregar dados da eleição
    const loadElection = async () => {
      try {
        // TODO: Implementar chamada para API real
        // const response = await electionService.getElection(id);
        // setElection(response.data);
        
        // Por enquanto, dados vazios
        setElection({
          name: "Nova Eleição CIPA",
          startDate: "",
          endDate: "",
          totalVoters: 0,
          registeredVoters: 0,
          candidates: 0,
          vacancies: { titular: 0, suplente: 0 }
        });
      } catch (error) {
        console.error('Erro ao carregar eleição:', error);
      }
    };
    
    loadElection();
  }, [id]);

  const tasks = [
    {
      id: 'eleitores',
      title: 'Cadastrar Eleitores',
      description: '120 de 150 eleitores cadastrados',
      completed: checklist.eleitores,
      progress: (120/150) * 100,
      action: `/elections/${id}/voters`,
      icon: Users
    },
    {
      id: 'candidatos',
      title: 'Revisar Candidatos',
      description: '8 candidatos inscritos',
      completed: checklist.candidatos,
      progress: 100,
      action: '/candidates',
      icon: UserCheck
    },
    {
      id: 'tokens',
      title: 'Gerar Chaves de Votação',
      description: 'Chaves únicas para cada eleitor',
      completed: checklist.tokens,
      progress: 0,
      action: '#',
      icon: Settings
    },
    {
      id: 'emails',
      title: 'Enviar Convites',
      description: 'E-mails com instruções e chaves',
      completed: checklist.emails,
      progress: 0,
      action: '#',
      icon: Mail
    }
  ];

  const completedTasks = Object.values(checklist).filter(Boolean).length;
  const overallProgress = (completedTasks / Object.keys(checklist).length) * 100;

  const toggleTask = (taskId: keyof typeof checklist) => {
    setChecklist(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const startElection = () => {
    if (completedTasks < 4) {
      toast({
        title: "Eleição não pode ser iniciada",
        description: "Complete todas as tarefas de preparação primeiro",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Eleição iniciada com sucesso!",
      description: "Os eleitores já podem votar",
    });
  };

  return (
    <DashboardLayout userType="rh">
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link to="/elections">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Preparar Eleição</h1>
            <p className="text-gray-600">{election.name}</p>
          </div>
        </div>

        {/* Progresso Geral */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Progresso da Preparação</span>
              <Badge variant={overallProgress === 100 ? "default" : "secondary"}>
                {completedTasks}/4 tarefas completas
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={overallProgress} className="h-3 mb-4" />
            <div className="flex justify-between text-sm text-gray-600">
              <span>Preparação {Math.round(overallProgress)}% completa</span>
              <span>{election.startDate} - {election.endDate}</span>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Tarefas */}
        <div className="grid gap-4">
          {tasks.map((task) => {
            const Icon = task.icon;
            return (
              <Card key={task.id} className={`transition-all ${task.completed ? 'border-green-200 bg-green-50' : 'hover:shadow-md'}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${task.completed ? 'bg-green-100' : 'bg-blue-100'}`}>
                        <Icon className={`w-6 h-6 ${task.completed ? 'text-green-600' : 'text-blue-600'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900">{task.title}</h3>
                          {task.completed && <CheckCircle className="w-5 h-5 text-green-600" />}
                        </div>
                        <p className="text-gray-600 text-sm">{task.description}</p>
                        {task.progress > 0 && task.progress < 100 && (
                          <Progress value={task.progress} className="h-2 mt-2 w-48" />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {task.action.startsWith('/') ? (
                        <Link to={task.action}>
                          <Button variant="outline" size="sm">
                            {task.completed ? 'Revisar' : 'Configurar'}
                          </Button>
                        </Link>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toggleTask(task.id as keyof typeof checklist)}
                        >
                          {task.completed ? 'Revisar' : 'Configurar'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Ação Principal */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Play className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">Iniciar Eleição</h3>
                  <p className="text-blue-700 text-sm">
                    {overallProgress === 100 
                      ? 'Tudo pronto! Você pode iniciar a eleição agora.' 
                      : 'Complete todas as tarefas para iniciar a eleição.'}
                  </p>
                </div>
              </div>
              <Button 
                onClick={startElection}
                disabled={overallProgress < 100}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Iniciar Eleição
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PrepareElection;
