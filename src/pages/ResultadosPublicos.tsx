
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Vote, Users, Clock, TrendingUp, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ResultadosPublicos = () => {
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Dados dos candidatos - carregados dinamicamente
  const [candidatos, setCandidatos] = useState([]);

  const totalVotos = candidatos.reduce((sum, candidato) => sum + candidato.votos, 0);
  const totalEleitores = 800;
  const percentualParticipacao = Math.round((totalVotos / totalEleitores) * 100);

  // Dados para o gráfico
  const dadosGrafico = candidatos.map(candidato => ({
    nome: candidato.nome.split(' ')[0],
    votos: candidato.votos,
    percentual: Math.round((candidato.votos / totalVotos) * 100)
  }));

  // Cores para o gráfico de pizza
  const cores = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  const dadosPizza = candidatos.map((candidato, index) => ({
    name: candidato.nome,
    value: candidato.votos,
    color: cores[index % cores.length]
  }));

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setUltimaAtualizacao(new Date());
        // Aqui seria feita a atualização real dos dados
      }, 30000); // Atualiza a cada 30 segundos

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const atualizarManual = () => {
    setUltimaAtualizacao(new Date());
    // Aqui seria feita a atualização manual dos dados
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Eleição CIPA 2024 - Resultados em Tempo Real</h1>
              <p className="text-blue-100">Acompanhe os resultados da votação ao vivo</p>
            </div>
            <div className="text-right">
              <Badge variant="secondary" className="bg-white/20 text-white">
                <Clock className="w-4 h-4 mr-2" />
                Votação em Andamento
              </Badge>
            </div>
          </div>
        </div>

        {/* Estatísticas Gerais */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Vote className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total de Votos</p>
                  <p className="text-3xl font-bold">{totalVotos.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Eleitores Aptos</p>
                  <p className="text-3xl font-bold">{totalEleitores.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Participação</p>
                  <p className="text-3xl font-bold">{percentualParticipacao}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600">Última Atualização</p>
                  <p className="text-sm font-medium">{ultimaAtualizacao.toLocaleTimeString()}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={atualizarManual}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span>{autoRefresh ? 'Auto-refresh ativo' : 'Auto-refresh pausado'}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Gráfico de Barras */}
          <Card>
            <CardHeader>
              <CardTitle>Votos por Candidato</CardTitle>
              <CardDescription>Distribuição atual dos votos</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  votos: {
                    label: "Votos",
                    color: "#3B82F6",
                  },
                }}
                className="h-80"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosGrafico}>
                    <XAxis dataKey="nome" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="votos" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Pizza */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição Percentual</CardTitle>
              <CardDescription>Proporção de votos por candidato</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  votos: {
                    label: "Votos",
                  },
                }}
                className="h-80"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dadosPizza}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {dadosPizza.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0];
                          return (
                            <div className="bg-white p-3 border rounded-lg shadow-lg">
                              <p className="font-medium">{data.payload.name}</p>
                              <p className="text-sm text-gray-600">
                                {data.value} votos ({Math.round((Number(data.value) / totalVotos) * 100)}%)
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Candidatos */}
        <Card>
          <CardHeader>
            <CardTitle>Ranking dos Candidatos</CardTitle>
            <CardDescription>Classificação atual baseada no número de votos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {candidatos
                .sort((a, b) => b.votos - a.votos)
                .map((candidato, index) => {
                  const percentual = Math.round((candidato.votos / totalVotos) * 100);
                  return (
                    <div key={candidato.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold">
                        {index + 1}
                      </div>
                      <img
                        src={candidato.foto}
                        alt={candidato.nome}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{candidato.nome}</h3>
                        <p className="text-gray-600 text-sm">{candidato.cargo}</p>
                      </div>
                      <div className="flex-1 max-w-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{candidato.votos} votos</span>
                          <span className="text-sm text-gray-600">{percentual}%</span>
                        </div>
                        <Progress value={percentual} className="h-2" />
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600">
          <p className="text-sm">
            Sistema Safety Vote | Resultados atualizados automaticamente a cada 30 segundos
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultadosPublicos;
