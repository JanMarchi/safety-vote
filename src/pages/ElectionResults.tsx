
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import DashboardLayout from '@/components/DashboardLayout';
import { ArrowLeft, Download, Users, Trophy, Medal, Award, CheckCircle } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

const ElectionResults = () => {
  const { id } = useParams();

  // Dados da eleição e resultados - carregados dinamicamente
  const [election, setElection] = useState(null);
  const [results, setResults] = useState({ titulares: [], suplentes: [] });

  const [votingStats, setVotingStats] = useState([]);

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
              <h1 className="text-3xl font-bold text-gray-900">Resultados da Eleição</h1>
              <p className="text-gray-600">{election.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="w-4 h-4 mr-1" />
              Finalizada
            </Badge>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Relatório PDF
            </Button>
          </div>
        </div>

        {/* Resumo da Eleição */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-sm text-green-700">Total de Votos</p>
                <p className="text-3xl font-bold text-green-800">{election.totalVotes}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-green-700">Quórum Alcançado</p>
                <p className="text-3xl font-bold text-green-800">{election.quorum}%</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-green-700">Período</p>
                <p className="text-lg font-semibold text-green-800">{election.startDate} - {election.endDate}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-green-700">Participação</p>
                <p className="text-3xl font-bold text-green-800">{election.totalVoters}</p>
                <p className="text-sm text-green-700">eleitores</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Membros Eleitos - Titulares */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-6 h-6 text-yellow-600" />
              <span>Membros Titulares Eleitos</span>
            </CardTitle>
            <CardDescription>Os 3 candidatos mais votados para vagas de titular</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.titulares.map((candidate, index) => (
                <div key={candidate.id} className="flex items-center space-x-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img 
                        src={candidate.photo} 
                        alt={candidate.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{index + 1}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{candidate.name}</h3>
                      <p className="text-gray-600 text-sm">{candidate.department}</p>
                      <Badge className="bg-yellow-100 text-yellow-800 mt-1">
                        <Medal className="w-3 h-3 mr-1" />
                        Titular
                      </Badge>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Votos recebidos</span>
                      <span className="font-semibold">{candidate.votes} votos ({candidate.percentage}%)</span>
                    </div>
                    <Progress value={candidate.percentage} className="h-3" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Membros Eleitos - Suplentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="w-6 h-6 text-blue-600" />
              <span>Membros Suplentes Eleitos</span>
            </CardTitle>
            <CardDescription>Os 3 candidatos seguintes mais votados para vagas de suplente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.suplentes.map((candidate, index) => (
                <div key={candidate.id} className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img 
                        src={candidate.photo} 
                        alt={candidate.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{index + 1}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{candidate.name}</h3>
                      <p className="text-gray-600 text-sm">{candidate.department}</p>
                      <Badge className="bg-blue-100 text-blue-800 mt-1">
                        <Award className="w-3 h-3 mr-1" />
                        Suplente
                      </Badge>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Votos recebidos</span>
                      <span className="font-semibold">{candidate.votes} votos ({candidate.percentage}%)</span>
                    </div>
                    <Progress value={candidate.percentage} className="h-3" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas de Participação */}
        <Card>
          <CardHeader>
            <CardTitle>Participação por Departamento</CardTitle>
            <CardDescription>Percentual de participação de cada setor na eleição</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {votingStats.map((dept, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{dept.department}</span>
                    <span className="text-sm text-gray-600">
                      {dept.votes}/{dept.total} eleitores ({dept.percentage}%)
                    </span>
                  </div>
                  <Progress value={dept.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ElectionResults;
