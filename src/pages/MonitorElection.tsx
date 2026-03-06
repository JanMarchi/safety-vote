
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/DashboardLayout';
import { ArrowLeft, Users, Vote, TrendingUp, Clock, Eye, RefreshCw } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

const MonitorElection = () => {
  const { id } = useParams();
  const [realTimeData, setRealTimeData] = useState({
    totalVotes: 127,
    totalVoters: 200,
    quorum: 63.5,
    votingRate: 2.3 // votos por hora
  });

  // Simulação de dados em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        ...prev,
        totalVotes: prev.totalVotes + Math.floor(Math.random() * 3),
        quorum: ((prev.totalVotes + Math.floor(Math.random() * 3)) / prev.totalVoters) * 100
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Dados da eleição - carregados dinamicamente
  const [election, setElection] = useState(null);
  const [hourlyData, setHourlyData] = useState([]);
  const [votersByDepartment, setVotersByDepartment] = useState([]);

  return (
    <DashboardLayout userType="rh">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/elections">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Monitoramento em Tempo Real</h1>
              <p className="text-gray-600">{election.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-green-100 text-green-800 animate-pulse">
              <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
              Ao Vivo
            </Badge>
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Votos</p>
                  <p className="text-3xl font-bold text-blue-600">{realTimeData.totalVotes}</p>
                  <p className="text-xs text-gray-500">+{Math.floor(realTimeData.votingRate)} por hora</p>
                </div>
                <Vote className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Quórum</p>
                  <p className="text-3xl font-bold text-green-600">{realTimeData.quorum.toFixed(1)}%</p>
                  <Progress value={realTimeData.quorum} className="h-2 mt-2" />
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pendentes</p>
                  <p className="text-3xl font-bold text-orange-600">{realTimeData.totalVoters - realTimeData.totalVotes}</p>
                  <p className="text-xs text-gray-500">eleitores restantes</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Participação</p>
                  <p className="text-3xl font-bold text-purple-600">{realTimeData.totalVoters}</p>
                  <p className="text-xs text-gray-500">eleitores totais</p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Participação por Hora */}
        <Card>
          <CardHeader>
            <CardTitle>Participação por Hora</CardTitle>
            <CardDescription>Votos computados ao longo do dia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-4">
              {hourlyData.map((data, index) => (
                <div key={index} className="text-center">
                  <div className="h-32 flex items-end justify-center mb-2">
                    <div 
                      className="w-8 bg-blue-500 rounded-t-lg transition-all duration-500"
                      style={{ height: `${(data.votes / 50) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm font-medium">{data.votes}</p>
                  <p className="text-xs text-gray-500">{data.hour}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Participação por Departamento */}
        <Card>
          <CardHeader>
            <CardTitle>Participação por Departamento</CardTitle>
            <CardDescription>Acompanhe a participação de cada setor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {votersByDepartment.map((dept, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{dept.department}</span>
                    <span className="text-sm text-gray-600">
                      {dept.voted}/{dept.total} ({dept.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={dept.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ações Rápidas */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to={`/elections/${id}/voters`}>
                <Button variant="outline" className="w-full justify-start">
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Lista de Eleitores
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reenviar Convites
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status da Eleição</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Início:</span>
                  <span className="font-medium">{election.startDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Término:</span>
                  <span className="font-medium">{election.endDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge className="bg-green-100 text-green-800">Ativa</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MonitorElection;
