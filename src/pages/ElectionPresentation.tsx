import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { X, Maximize } from 'lucide-react';
import { CANDIDATES, TOTAL_VOTES } from '@/lib/candidates';

const ElectionPresentation = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [electionName, setElectionName] = useState('Eleição CIPA 2024');
  const [liveTime, setLiveTime] = useState(new Date());
  const [animationPhase, setAnimationPhase] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const totalVoters = 450;
  const votesReceived = TOTAL_VOTES;

  const candidates = CANDIDATES;

  // Calcular layout dinamicamente baseado na altura
  const getLayoutClasses = () => {
    const count = candidates.length;

    // Determinar número de colunas
    let cols = 5;
    if (count <= 5) cols = 5;
    else if (count <= 6) cols = 6;
    else if (count <= 8) cols = 4;
    else if (count <= 10) cols = 5;
    else if (count <= 12) cols = 6;
    else if (count <= 15) cols = 5;
    else cols = count <= 20 ? 4 : 5;

    // Determinar tamanhos
    let posSize = 'w-10 h-10 text-xl';
    let nameSize = 'text-sm';
    const infoSize = 'text-xs';
    let imageHeight = 'h-32';
    let gap = 'gap-4';
    let p = 'p-2';

    if (count > 5 && count <= 8) {
      posSize = 'w-9 h-9 text-lg';
      imageHeight = 'h-28';
      gap = 'gap-3';
    } else if (count > 8 && count <= 12) {
      posSize = 'w-8 h-8 text-base';
      nameSize = 'text-xs';
      imageHeight = 'h-24';
      gap = 'gap-2';
      p = 'p-1.5';
    } else if (count > 12 && count <= 15) {
      posSize = 'w-7 h-7 text-sm';
      imageHeight = 'h-20';
      gap = 'gap-2';
      p = 'p-1';
    } else if (count > 15) {
      posSize = 'w-6 h-6 text-xs';
      nameSize = 'text-xs';
      imageHeight = 'h-16';
      gap = 'gap-1';
      p = 'p-1';
    }

    return { cols, posSize, nameSize, infoSize, imageHeight, gap, p };
  };

  const votersNotYetVoted = totalVoters - votesReceived;
  const participationPercentage = Math.round((votesReceived / totalVoters) * 100);

  const participationData = [
    { name: 'Votaram', value: votesReceived, fill: '#10b981' },
    { name: 'Faltam Votar', value: votersNotYetVoted, fill: '#ef4444' }
  ];

  const candidatesData = candidates.map(c => ({
    name: c.name.split(' ')[0],
    votes: c.votes,
    percentage: Math.round((c.votes / votesReceived) * 100)
  }));

  // Extrair nome da eleição da URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const name = params.get('name');
    if (name) {
      setElectionName(decodeURIComponent(name));
    }
  }, []);

  // Tentar entrar em tela cheia automaticamente
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        const elem = containerRef.current || document.documentElement;
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
          setIsFullscreen(true);
        } else if ((elem as any).mozRequestFullScreen) {
          await (elem as any).mozRequestFullScreen();
          setIsFullscreen(true);
        } else if ((elem as any).webkitRequestFullscreen) {
          await (elem as any).webkitRequestFullscreen();
          setIsFullscreen(true);
        } else if ((elem as any).msRequestFullscreen) {
          await (elem as any).msRequestFullscreen();
          setIsFullscreen(true);
        }
      } catch (err) {
        console.log('Tela cheia não disponível ou foi rejeitada');
      }
    };

    // Aguardar um pouco antes de tentar entrar em tela cheia
    const timer = setTimeout(enterFullscreen, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleFullscreen = async () => {
    try {
      const elem = containerRef.current || document.documentElement;
      if (!isFullscreen) {
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if ((elem as any).mozRequestFullScreen) {
          await (elem as any).mozRequestFullScreen();
        } else if ((elem as any).webkitRequestFullscreen) {
          await (elem as any).webkitRequestFullscreen();
        } else if ((elem as any).msRequestFullscreen) {
          await (elem as any).msRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        } else if ((document as any).mozFullScreenElement) {
          await (document as any).mozCancelFullScreen();
        } else if ((document as any).webkitFullscreenElement) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).msFullscreenElement) {
          await (document as any).msExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Erro ao alternar tela cheia:', err);
    }
  };

  // Atualizar hora em tempo real
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Animar fases da apresentação (com tempo maior para cada fase)
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 4);
    }, 12000); // 12 segundos por fase

    return () => clearInterval(timer);
  }, []);

  const closeWindow = () => {
    window.close();
  };

  // Detectar quando sair de tela cheia
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement || !!(document as any).mozFullScreenElement || !!(document as any).webkitFullscreenElement || !!(document as any).msFullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    (document as any).addEventListener('mozfullscreenchange', handleFullscreenChange);
    (document as any).addEventListener('webkitfullscreenchange', handleFullscreenChange);
    (document as any).addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      (document as any).removeEventListener('mozfullscreenchange', handleFullscreenChange);
      (document as any).removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      (document as any).removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-screen h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 overflow-hidden flex flex-col"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      {/* Header */}
      <div className="bg-black bg-opacity-50 backdrop-blur-sm p-3 border-b border-blue-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">{electionName}</h1>
            <p className="text-blue-300 text-sm">Acompanhamento em Tempo Real</p>
          </div>
          <div className="text-right flex-1 text-center">
            <p className="text-white text-xl font-mono">
              {liveTime.toLocaleTimeString('pt-BR')}
            </p>
          </div>
          <div className="flex gap-2 ml-4">
            <Button
              onClick={handleFullscreen}
              variant="outline"
              size="sm"
              className="bg-white bg-opacity-10 hover:bg-opacity-20 border-white border-opacity-30 text-white"
            >
              <Maximize className="w-4 h-4" />
            </Button>
            <Button
              onClick={closeWindow}
              variant="outline"
              size="sm"
              className="bg-white bg-opacity-10 hover:bg-opacity-20 border-white border-opacity-30 text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden p-4">
        <div className="w-full h-full flex flex-col">
          {/* Fase 1: Estatísticas e Participação */}
          {animationPhase === 0 && (
            <div className="space-y-3 animate-fade-in h-full flex flex-col">
              {/* KPIs */}
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg p-4 text-white shadow-lg">
                  <p className="text-blue-100 text-xs mb-1">Total de Eleitores</p>
                  <p className="text-3xl font-bold">{totalVoters}</p>
                  <p className="text-blue-200 text-xs mt-1">Colaboradores aptos</p>
                </div>
                <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-lg p-4 text-white shadow-lg">
                  <p className="text-green-100 text-xs mb-1">Votos Registrados</p>
                  <p className="text-3xl font-bold">{votesReceived}</p>
                  <p className="text-green-200 text-xs mt-1">{participationPercentage}% participação</p>
                </div>
                <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-lg p-4 text-white shadow-lg">
                  <p className="text-red-100 text-xs mb-1">Faltam Votar</p>
                  <p className="text-3xl font-bold">{votersNotYetVoted}</p>
                  <p className="text-red-200 text-xs mt-1">{100 - participationPercentage}% restante</p>
                </div>
                <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg p-4 text-white shadow-lg">
                  <p className="text-purple-100 text-xs mb-1">Votação Média</p>
                  <p className="text-3xl font-bold">{Math.round(votesReceived / candidates.length)}</p>
                  <p className="text-purple-200 text-xs mt-1">Votos por candidato</p>
                </div>
              </div>

              {/* Gráficos */}
              <div className="grid grid-cols-2 gap-3 flex-1">
                {/* Participação */}
                <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-gray-700 flex flex-col">
                  <h2 className="text-lg font-bold text-white mb-2">Participação na Eleição</h2>
                  <div className="flex-1 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={participationData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {participationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1f2937',
                            border: '1px solid #4b5563',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                          formatter={(value) => [`${value} votos`, '']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-6 mt-2">
                    <div className="text-center">
                      <p className="text-green-400 text-xs font-medium">Votaram</p>
                      <p className="text-white text-xl font-bold">{participationPercentage}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-red-400 text-xs font-medium">Faltam</p>
                      <p className="text-white text-xl font-bold">{100 - participationPercentage}%</p>
                    </div>
                  </div>
                </div>

                {/* Votos por Candidato */}
                <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-gray-700 flex flex-col">
                  <h2 className="text-lg font-bold text-white mb-2">Votos por Candidato</h2>
                  <div className="flex-1 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={candidatesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                        <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1f2937',
                            border: '1px solid #4b5563',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                        />
                        <Bar dataKey="votes" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fase 2: Top 3 Candidatos - Destaque */}
          {animationPhase === 1 && (
            <div className="space-y-3 animate-fade-in h-full flex flex-col overflow-hidden">
              <h2 className="text-2xl font-bold text-white">🏆 Pódio - 3 Melhores Colocados</h2>
              {(() => {
                const top3 = [...candidates].sort((a, b) => b.votes - a.votes).slice(0, 3);
                return (
                  <div className="grid gap-4 flex-1 overflow-hidden" style={{ gridTemplateColumns: `repeat(3, minmax(0, 1fr))` }}>
                    {top3.map((candidate, index) => {
                      const candidatePercentage = Math.round((candidate.votes / votesReceived) * 100);
                      const medals = ['🥇', '🥈', '🥉'];
                      return (
                        <div
                          key={candidate.id}
                          className="flex flex-col items-center animate-fade-in min-h-0"
                        >
                          {/* Posição com Medalha */}
                          <div className="mb-3 text-5xl">
                            {medals[index]}
                          </div>

                          {/* Imagem Grande */}
                          <div className="relative overflow-hidden w-full flex-1 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-2xl mb-3 flex-shrink-0 border-4 border-yellow-400">
                            <img
                              src={candidate.image}
                              alt={candidate.name}
                              className="w-full h-full object-cover object-center"
                            />
                          </div>

                          {/* Informações Abaixo */}
                          <div className="text-center space-y-2 w-full">
                            <div>
                              <h3 className="font-bold text-white text-lg line-clamp-2">{candidate.name}</h3>
                              <p className="text-gray-300 text-sm">{candidate.department}</p>
                            </div>

                            {/* Votos e Percentual */}
                            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg p-3 space-y-1">
                              <p className="text-white font-bold text-2xl">{candidate.votes}</p>
                              <p className="text-blue-200 font-bold text-lg">{candidatePercentage}%</p>
                              <p className="text-blue-100 text-xs">votos</p>
                            </div>

                            {/* Barra de Progresso */}
                            <div className="w-full bg-gray-700 rounded-full h-3">
                              <div
                                className="bg-gradient-to-r from-yellow-400 to-orange-600 h-3 rounded-full"
                                style={{ width: `${candidatePercentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Fase 3: Lista Completa em Colunas */}
          {animationPhase === 2 && (
            <div className="space-y-2 animate-fade-in h-full flex flex-col overflow-hidden">
              <h2 className="text-2xl font-bold text-white">Ranking Completo - Todos os Candidatos ({candidates.length})</h2>
              <div className="flex-1 overflow-hidden">
                {(() => {
                  const sortedCandidates = [...candidates].sort((a, b) => b.votes - a.votes);
                  const numCols = candidates.length > 12 ? 3 : 2;
                  const itemsPerCol = Math.ceil(sortedCandidates.length / numCols);
                  const cols = [];

                  for (let i = 0; i < numCols; i++) {
                    cols.push(sortedCandidates.slice(i * itemsPerCol, (i + 1) * itemsPerCol));
                  }

                  return (
                    <div className="grid gap-4 h-full" style={{ gridTemplateColumns: `repeat(${numCols}, minmax(0, 1fr))` }}>
                      {cols.map((column, colIndex) => (
                        <div key={colIndex} className="space-y-2 overflow-hidden">
                          {column.map((candidate, rowIndex) => {
                            const globalIndex = colIndex * itemsPerCol + rowIndex;
                            const candidatePercentage = Math.round((candidate.votes / votesReceived) * 100);
                            const medals = { 0: '🥇', 1: '🥈', 2: '🥉' };

                            return (
                              <div
                                key={candidate.id}
                                className="flex items-center gap-3 p-2 bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg border border-gray-700 hover:bg-opacity-70 transition-all"
                              >
                                {/* Posição */}
                                <div className="flex-shrink-0 text-center">
                                  {globalIndex < 3 ? (
                                    <span className="text-2xl">{medals[globalIndex as keyof typeof medals]}</span>
                                  ) : (
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-white text-xs bg-gradient-to-br from-blue-500 to-blue-700`}>
                                      {globalIndex + 1}
                                    </div>
                                  )}
                                </div>

                                {/* Imagem */}
                                <img
                                  src={candidate.image}
                                  alt={candidate.name}
                                  className="w-8 h-8 rounded-full border border-gray-600 flex-shrink-0 object-cover object-center"
                                />

                                {/* Informações */}
                                <div className="flex-1 min-w-0">
                                  <p className="text-white font-bold text-xs line-clamp-1">{candidate.name}</p>
                                  <p className="text-gray-400 text-xs line-clamp-1">{candidate.department}</p>
                                </div>

                                {/* Votos */}
                                <div className="text-right flex-shrink-0">
                                  <p className="text-white font-bold text-sm">{candidate.votes}</p>
                                  <p className="text-blue-300 text-xs">{candidatePercentage}%</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Fase 4: Mensagem com Logo */}
          {animationPhase === 3 && (
            <div className="flex items-center justify-center h-full animate-fade-in">
              <div className="text-center space-y-3">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <svg
                    className="w-12 h-12 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 12a3 3 0 100-6 3 3 0 000 6zm-9 1a9 9 0 0118 0v4H0v-4z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-4xl font-bold text-white mb-2">CIPA Digital</h2>
                  <p className="text-lg text-blue-300 mb-3">Sistema Digital de Eleições</p>
                  <p className="text-base text-gray-300">
                    Eleição em andamento - Acompanhamento em Tempo Real
                  </p>
                </div>
                <div className="space-y-1 pt-4">
                  <div className="text-sm text-gray-300">
                    <p className="mb-1">✓ {votesReceived} votos registrados</p>
                    <p className="mb-1">✓ {participationPercentage}% de participação</p>
                    <p>✓ {votersNotYetVoted} eleitores aguardando votação</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-black bg-opacity-50 backdrop-blur-sm p-2 border-t border-blue-500">
        <div className="flex items-center justify-between px-4 text-gray-400 text-xs">
          <span>CIPA Digital © 2024 - Eleição em Tempo Real</span>
          <div className="flex gap-1.5">
            {[0, 1, 2, 3].map(phase => (
              <div
                key={phase}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  animationPhase === phase ? 'bg-blue-500' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html, body {
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: #111827;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }

        /* Esconder barras de scroll */
        ::-webkit-scrollbar {
          display: none;
        }

        -ms-overflow-style: none;
        scrollbar-width: none;
      `}</style>
    </div>
  );
};

export default ElectionPresentation;
