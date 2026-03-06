
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, TrendingUp, Download, Calendar, Users, Vote, FileText } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

const RHReportsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('ultimo-mes');

  // Dados para gráficos - carregados dinamicamente
  const [participationData, setParticipationData] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);

  return (
    <DashboardLayout userType="rh">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
            <p className="text-gray-600">Estatísticas e análises das eleições da empresa</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ultima-semana">Última Semana</SelectItem>
                <SelectItem value="ultimo-mes">Último Mês</SelectItem>
                <SelectItem value="ultimo-trimestre">Último Trimestre</SelectItem>
                <SelectItem value="ultimo-ano">Último Ano</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Eleições da Empresa</p>
                  <p className="text-2xl font-bold text-gray-900">8</p>
                  <p className="text-sm text-green-600">Neste ano</p>
                </div>
                <Vote className="w-6 h-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Taxa de Participação</p>
                  <p className="text-2xl font-bold text-gray-900">89%</p>
                  <p className="text-sm text-green-600">Média geral</p>
                </div>
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Eleitores</p>
                  <p className="text-2xl font-bold text-gray-900">450</p>
                  <p className="text-sm text-green-600">Colaboradores aptos</p>
                </div>
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Votos Registrados</p>
                  <p className="text-2xl font-bold text-gray-900">8.5k</p>
                  <p className="text-sm text-green-600">Em todas as eleições</p>
                </div>
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Tables */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Participation Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo de Participação</CardTitle>
              <CardDescription>Taxa de participação nas eleições</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {participationData.map((eleicao, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{eleicao.eleicao}</span>
                        <span className="text-sm text-gray-600">{eleicao.participacao}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${eleicao.participacao}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{eleicao.votos} votos</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Growth */}
          <Card>
            <CardHeader>
              <CardTitle>Crescimento Mensal</CardTitle>
              <CardDescription>Eleições nos últimos meses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyStats.map((stat, index) => (
                  <div key={index} className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">{stat.mes}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Eleições</p>
                      <p className="text-lg font-bold text-blue-600">{stat.eleicoes}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Votos</p>
                      <p className="text-lg font-bold text-green-600">{stat.votos}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Elections & Participation Details */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Eleições Recentes</CardTitle>
              <CardDescription>Últimas eleições da empresa</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[].map((eleicao, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 rounded-full mt-2 bg-blue-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{eleicao.nome}</p>
                      <p className="text-sm text-gray-600">{eleicao.periodo}</p>
                      <span className="text-xs text-gray-500">{eleicao.participacao}% de participação</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estatísticas Detalhadas</CardTitle>
              <CardDescription>Informações sobre as eleições</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { metrica: "Eleições Ativas", valor: "2", status: "excellent" },
                  { metrica: "Eleições Agendadas", valor: "1", status: "good" },
                  { metrica: "Eleições Finalizadas", valor: "5", status: "good" },
                  { metrica: "Taxa de Participação Média", valor: "87%", status: "excellent" },
                  { metrica: "Quórum Médio", valor: "86%", status: "excellent" }
                ].map((stat, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">{stat.metrica}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold">{stat.valor}</span>
                      <div className={`w-3 h-3 rounded-full ${
                        stat.status === 'excellent' ? 'bg-green-500' :
                        stat.status === 'good' ? 'bg-blue-500' : 'bg-yellow-500'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle>Exportar Relatórios</CardTitle>
            <CardDescription>Gere relatórios personalizados da empresa</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                <FileText className="w-6 h-6 mb-2" />
                <span>Relatório Geral</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                <BarChart3 className="w-6 h-6 mb-2" />
                <span>Análise de Participação</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                <Calendar className="w-6 h-6 mb-2" />
                <span>Relatório Mensal</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default RHReportsPage;
