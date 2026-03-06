
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Vote, Clock, CheckCircle, Key, AlertCircle, Calendar, Users } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/hooks/use-toast';

const DashboardEleitor = () => {
  const [chaveVotacao, setChaveVotacao] = useState('');
  const { toast } = useToast();

  // Dados do eleitor e eleições - carregados dinamicamente
  const [eleitor, setEleitor] = useState(null);
  const [eleicoes, setEleicoes] = useState([]);

  const handleAcessarVotacao = () => {
    if (!chaveVotacao) {
      toast({
        title: "Chave obrigatória",
        description: "Por favor, digite sua chave de votação",
        variant: "destructive"
      });
      return;
    }

    // Simular validação da chave
    if (chaveVotacao.length < 8) {
      toast({
        title: "Chave inválida",
        description: "A chave de votação deve ter pelo menos 8 caracteres",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Redirecionando...",
      description: "Chave validada! Redirecionando para a tela de votação",
    });

    // Aqui redirecionaria para a tela de votação
    setTimeout(() => {
      console.log("Redirecionando para votação com chave:", chaveVotacao);
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativa': return 'bg-green-100 text-green-800';
      case 'Agendada': return 'bg-blue-100 text-blue-800';
      case 'Finalizada': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string, jaVotou: boolean) => {
    if (status === 'Finalizada') {
      return jaVotou ? 
        <CheckCircle className="w-5 h-5 text-green-600" /> : 
        <AlertCircle className="w-5 h-5 text-red-600" />;
    }
    if (status === 'Ativa') {
      return jaVotou ? 
        <CheckCircle className="w-5 h-5 text-green-600" /> : 
        <Vote className="w-5 h-5 text-blue-600" />;
    }
    return <Clock className="w-5 h-5 text-blue-600" />;
  };

  return (
    <DashboardLayout userType="eleitor">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bem-vindo, {eleitor.nome}!</h1>
          <p className="text-gray-600">Participe das eleições CIPA da sua empresa</p>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Email:</span>
              <p className="font-medium">{eleitor.email}</p>
            </div>
            <div>
              <span className="text-gray-600">Setor:</span>
              <p className="font-medium">{eleitor.setor}</p>
            </div>
            <div>
              <span className="text-gray-600">Função:</span>
              <p className="font-medium">{eleitor.funcao}</p>
            </div>
            <div>
              <span className="text-gray-600">Status:</span>
              <p className="font-medium text-green-600">Apto a votar</p>
            </div>
          </div>
        </div>

        {/* Votação Rápida */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="w-5 h-5 text-blue-600" />
              <span>Acesso Rápido à Votação</span>
            </CardTitle>
            <CardDescription>
              Digite sua chave de votação recebida por email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex-1">
                <Label htmlFor="chave">Chave de Votação</Label>
                <Input
                  id="chave"
                  value={chaveVotacao}
                  onChange={(e) => setChaveVotacao(e.target.value)}
                  placeholder="Digite sua chave única de votação"
                  className="mt-1"
                />
              </div>
              <Button 
                onClick={handleAcessarVotacao}
                className="bg-blue-600 hover:bg-blue-700 md:mb-0"
              >
                <Vote className="w-4 h-4 mr-2" />
                Acessar Votação
              </Button>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900">Importante:</p>
                  <ul className="list-disc list-inside text-blue-800 space-y-1 mt-1">
                    <li>Sua chave é única e válida apenas para uma votação</li>
                    <li>Após votar, a chave será automaticamente invalidada</li>
                    <li>Em caso de problemas, contate o setor de RH</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Eleições Disponíveis */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Eleições</h2>
          
          {eleicoes.map((eleicao) => (
            <Card key={eleicao.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(eleicao.status, eleicao.jaVotou)}
                    <div>
                      <CardTitle className="text-lg">{eleicao.nome}</CardTitle>
                      <CardDescription className="flex items-center space-x-2 mt-1">
                        <Calendar className="w-4 h-4" />
                        <span>{eleicao.periodo}</span>
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={getStatusColor(eleicao.status)}>
                    {eleicao.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Candidatos:</span>
                      <span className="font-medium">{eleicao.totalCandidatos}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Vagas Titular:</span>
                      <span className="font-medium">{eleicao.vagasTitular}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Vagas Suplente:</span>
                      <span className="font-medium">{eleicao.vagasSuplente}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Prazo:</span>
                      <span className="font-medium text-sm">{eleicao.dataLimite}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Seu Voto:</span>
                      <span className={`font-medium ${eleicao.jaVotou ? 'text-green-600' : 'text-orange-600'}`}>
                        {eleicao.jaVotou ? 'Computado' : 'Pendente'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center space-y-2">
                    {eleicao.status === 'Ativa' && !eleicao.jaVotou && (
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        <Vote className="w-4 h-4 mr-2" />
                        Votar Agora
                      </Button>
                    )}
                    {eleicao.status === 'Ativa' && eleicao.jaVotou && (
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-1" />
                        <p className="text-sm font-medium text-green-800">Voto Registrado</p>
                        <p className="text-xs text-green-600">Obrigado pela participação!</p>
                      </div>
                    )}
                    {eleicao.status === 'Agendada' && (
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <Clock className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                        <p className="text-sm font-medium text-blue-800">Aguardando Início</p>
                      </div>
                    )}
                    {eleicao.status === 'Finalizada' && (
                      <Button variant="outline" className="w-full">
                        Ver Resultado
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Instruções */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              <span>Como Votar</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Passos para votar:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Você receberá uma chave única por email quando a eleição iniciar</li>
                  <li>Digite a chave no campo "Acesso Rápido à Votação" acima</li>
                  <li>Você será direcionado para a tela de votação</li>
                  <li>Escolha seus candidatos conforme as instruções</li>
                  <li>Confirme seu voto - ele não poderá ser alterado</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Informações importantes:</h4>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Seu voto é secreto e anônimo</li>
                  <li>Cada eleitor pode votar apenas uma vez</li>
                  <li>Respeite o prazo limite da votação</li>
                  <li>Em caso de dúvidas, contate o RH</li>
                  <li>Participe! Sua voz é importante para a segurança no trabalho</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardEleitor;
