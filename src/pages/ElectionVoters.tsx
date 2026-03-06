
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import DashboardLayout from '@/components/DashboardLayout';
import { ArrowLeft, Search, Mail, Download, Users, CheckCircle, Clock } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const ElectionVoters = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const election = {
    name: "Eleição CIPA 2024 - Matriz",
    startDate: "2024-01-15",
    endDate: "2024-01-20",
    status: "ativa"
  };

  const voters = [
    {
      id: 1,
      name: "Maria Silva Santos",
      email: "maria.santos@empresa.com",
      department: "Administrativo",
      function: "Analista",
      hasVoted: true,
      voteTime: "2024-01-15 09:30",
      tokenSent: true
    },
    {
      id: 2,
      name: "João Carlos Oliveira",
      email: "joao.oliveira@empresa.com",
      department: "Produção",
      function: "Operador",
      hasVoted: true,
      voteTime: "2024-01-15 14:20",
      tokenSent: true
    },
    {
      id: 3,
      name: "Ana Paula Costa",
      email: "ana.costa@empresa.com",
      department: "Qualidade",
      function: "Técnica",
      hasVoted: false,
      voteTime: null,
      tokenSent: true
    },
    {
      id: 4,
      name: "Carlos Eduardo Lima",
      email: "carlos.lima@empresa.com",
      department: "Logística",
      function: "Coordenador",
      hasVoted: true,
      voteTime: "2024-01-15 11:45",
      tokenSent: true
    },
    {
      id: 5,
      name: "Fernanda Rocha",
      email: "fernanda.rocha@empresa.com",
      department: "RH",
      function: "Analista",
      hasVoted: false,
      voteTime: null,
      tokenSent: false
    }
  ];

  const stats = {
    total: voters.length,
    voted: voters.filter(v => v.hasVoted).length,
    pending: voters.filter(v => !v.hasVoted).length,
    tokensSent: voters.filter(v => v.tokenSent).length
  };

  const filteredVoters = voters.filter(voter =>
    voter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    voter.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    voter.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sendReminder = (voterEmail: string) => {
    toast({
      title: "Lembrete enviado",
      description: `E-mail de lembrete enviado para ${voterEmail}`,
    });
  };

  const sendBulkReminder = () => {
    const pendingCount = stats.pending;
    toast({
      title: "Lembretes enviados",
      description: `${pendingCount} lembretes enviados para eleitores pendentes`,
    });
  };

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
              <h1 className="text-3xl font-bold text-gray-900">Eleitores da Eleição</h1>
              <p className="text-gray-600">{election.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={sendBulkReminder}>
              <Mail className="w-4 h-4 mr-2" />
              Enviar Lembretes
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar Lista
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Eleitores</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Já Votaram</p>
                  <p className="text-2xl font-bold text-green-600">{stats.voted}</p>
                  <p className="text-xs text-gray-500">{((stats.voted / stats.total) * 100).toFixed(1)}%</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pendentes</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
                  <p className="text-xs text-gray-500">{((stats.pending / stats.total) * 100).toFixed(1)}%</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tokens Enviados</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.tokensSent}</p>
                  <p className="text-xs text-gray-500">{((stats.tokensSent / stats.total) * 100).toFixed(1)}%</p>
                </div>
                <Mail className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Eleitores */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Lista de Eleitores</CardTitle>
                <CardDescription>Acompanhe o status de votação de cada eleitor</CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar eleitores..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Horário do Voto</TableHead>
                  <TableHead>Token</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVoters.map((voter) => (
                  <TableRow key={voter.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{voter.name}</p>
                        <p className="text-sm text-gray-600">{voter.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{voter.department}</TableCell>
                    <TableCell>{voter.function}</TableCell>
                    <TableCell>
                      {voter.hasVoted ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Votou
                        </Badge>
                      ) : (
                        <Badge className="bg-orange-100 text-orange-800">
                          <Clock className="w-3 h-3 mr-1" />
                          Pendente
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {voter.voteTime ? (
                        <span className="text-sm">{voter.voteTime}</span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {voter.tokenSent ? (
                        <Badge className="bg-blue-100 text-blue-800">Enviado</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">Não enviado</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {!voter.hasVoted && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => sendReminder(voter.email)}
                        >
                          <Mail className="w-4 h-4 mr-1" />
                          Lembrar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ElectionVoters;
