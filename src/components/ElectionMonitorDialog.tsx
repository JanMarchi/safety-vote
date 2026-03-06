import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Share2, Monitor, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CANDIDATES, Candidate } from '@/lib/candidates';

interface ElectionMonitorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  electionName: string;
  totalVoters: number;
  votesReceived: number;
}

const ElectionMonitorDialog = ({
  open,
  onOpenChange,
  electionName,
  totalVoters,
  votesReceived
}: ElectionMonitorDialogProps) => {
  const { toast } = useToast();
  const [liveTime, setLiveTime] = useState(new Date());

  // Usar candidatos do arquivo centralizado
  const candidates = CANDIDATES;

  const votersNotYetVoted = totalVoters - votesReceived;
  const participationPercentage = Math.round((votesReceived / totalVoters) * 100);

  // Dados para gráficos
  const participationData = [
    { name: 'Votaram', value: votesReceived, fill: '#10b981' },
    { name: 'Faltam Votar', value: votersNotYetVoted, fill: '#ef4444' }
  ];

  const candidatesData = candidates.map(c => ({
    name: c.name.split(' ')[0],
    votes: c.votes,
    percentage: Math.round((c.votes / votesReceived) * 100)
  }));

  // Simular atualização em tempo real
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleShareScreen = () => {
    toast({
      title: "Apresentação aberta",
      description: "A eleição está sendo transmitida em tempo real para a tela de apresentação.",
    });

    // Abre em uma nova janela/aba
    window.open(`/election-presentation?name=${encodeURIComponent(electionName)}`, 'presentation', 'width=1200,height=800');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">{electionName}</DialogTitle>
              <DialogDescription>
                Acompanhamento em tempo real da eleição
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{liveTime.toLocaleTimeString('pt-BR')}</span>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* SEÇÃO 1: CANDIDATOS NO TOPO */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Candidatos</h2>
            <div className="grid grid-cols-5 gap-3">
              {candidates.map((candidate, index) => {
                const candidatePercentage = Math.round((candidate.votes / votesReceived) * 100);
                const sortedCandidates = [...candidates].sort((a, b) => b.votes - a.votes);
                const rank = sortedCandidates.findIndex(c => c.id === candidate.id) + 1;

                return (
                  <Card key={candidate.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      {/* Posição */}
                      <div className="flex justify-between items-start mb-3">
                        <Badge className="bg-blue-100 text-blue-800 text-xs">
                          #{rank}
                        </Badge>
                        <span className="text-xs font-bold text-blue-600">{candidatePercentage}%</span>
                      </div>

                      {/* Imagem do candidato */}
                      <div className="flex justify-center mb-3">
                        <img
                          src={candidate.image}
                          alt={candidate.name}
                          className="w-16 h-16 rounded-full border-3 border-gray-200 object-cover object-center"
                        />
                      </div>

                      {/* Informações */}
                      <div className="text-center">
                        <h3 className="font-semibold text-sm text-gray-900 line-clamp-2">{candidate.name}</h3>
                        <p className="text-xs text-gray-600 mb-2">{candidate.department}</p>

                        {/* Votos */}
                        <div className="bg-blue-50 rounded p-2 mb-2">
                          <p className="text-lg font-bold text-blue-600">{candidate.votes}</p>
                          <p className="text-xs text-gray-600">votos</p>
                        </div>

                        {/* Barra de progresso */}
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${candidatePercentage}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* SEÇÃO 2: INDICADORES PRINCIPAIS */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Estatísticas Gerais</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-gray-600">Total de Eleitores</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{totalVoters}</p>
                  <p className="text-xs text-gray-500 mt-1">Colaboradores aptos</p>
                </CardContent>
              </Card>
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-green-800">Votos Registrados</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{votesReceived}</p>
                  <p className="text-xs text-green-700 mt-1">{participationPercentage}% de participação</p>
                </CardContent>
              </Card>
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-red-800">Faltam Votar</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{votersNotYetVoted}</p>
                  <p className="text-xs text-red-700 mt-1">{100 - participationPercentage}% restante</p>
                </CardContent>
              </Card>
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-blue-800">Votos por Candidato</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {Math.round(votesReceived / candidates.length)}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">Média de votos</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* SEÇÃO 3: GRÁFICOS */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Gráficos e Análises</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Gráfico de Participação */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Participação</CardTitle>
                  <CardDescription className="text-xs">Taxa de votação</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={participationData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {participationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Gráfico de Votação por Candidato */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Votos por Candidato</CardTitle>
                  <CardDescription className="text-xs">Distribuição de votos até o momento</CardDescription>
                </CardHeader>
                <CardContent className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={candidatesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="votes" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* SEÇÃO 4: PROGRESSO E EVENTOS */}
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Progresso da Votação */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Progresso da Votação</CardTitle>
                  <CardDescription className="text-xs">Evolução ao longo do tempo</CardDescription>
                </CardHeader>
                <CardContent className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { time: '08:00', votos: 50 },
                        { time: '09:00', votos: 120 },
                        { time: '10:00', votos: 220 },
                        { time: '11:00', votos: 310 },
                        { time: '12:00', votos: 387 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="votos"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Eventos Recentes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Eventos Recentes</CardTitle>
                  <CardDescription className="text-xs">Atividades na eleição</CardDescription>
                </CardHeader>
                <CardContent className="h-56 overflow-y-auto">
                  <div className="space-y-2">
                    {[
                      { time: '12:45', event: 'João Silva votou para Ana Silva' },
                      { time: '12:42', event: 'Maria Santos votou para Carlos Santos' },
                      { time: '12:38', event: 'Pedro Oliveira votou para Diana Costa' },
                      { time: '12:35', event: 'Eleição iniciada' },
                      { time: '12:30', event: 'Configuração finalizada' },
                    ].map((item, index) => (
                      <div key={index} className="flex gap-3 p-2 border-l-4 border-blue-500 bg-blue-50 rounded text-xs">
                        <p className="flex-1 text-gray-900 font-medium">{item.event}</p>
                        <p className="text-gray-600 flex-shrink-0 font-mono">{item.time}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* SEÇÃO 5: BOTÕES DE COMPARTILHAMENTO */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={handleShareScreen}
              className="flex-1 bg-purple-600 hover:bg-purple-700 h-12"
            >
              <Monitor className="w-4 h-4 mr-2" />
              Compartilhar em Tela
            </Button>
            <Button
              onClick={() => {
                toast({
                  title: "Copiado!",
                  description: "Link de compartilhamento copiado para a área de transferência.",
                });
              }}
              variant="outline"
              className="flex-1"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Copiar Link
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ElectionMonitorDialog;
