
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Building2, Users, Vote, TrendingUp, Search, Plus, Eye, Edit, Trash2, Settings, FileText, UserCog } from 'lucide-react';
import { companyService, Company, DashboardStats } from '@/services/companyService';
import DashboardLayout from '@/components/DashboardLayout';
import { useNavigate } from 'react-router-dom';

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [companiesData, statsData] = await Promise.all([
        companyService.getCompanies(),
        companyService.getDashboardStats()
      ]);
      setCompanies(companiesData);
      setStats(statsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchTerm(query);
    if (!query.trim()) {
      const allCompanies = await companyService.getCompanies();
      setCompanies(allCompanies);
      return;
    }

    try {
      setSearchLoading(true);
      const results = await companyService.searchCompanies(query);
      setCompanies(results);
    } catch (error) {
      console.error('Erro na busca:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleDeleteCompany = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta empresa?')) {
      try {
        await companyService.deleteCompany(id);
        setCompanies(companies.filter(company => company.id !== id));
        // Reload stats after deletion
        const newStats = await companyService.getDashboardStats();
        setStats(newStats);
      } catch (error) {
        console.error('Erro ao excluir empresa:', error);
      }
    }
  };

  if (loading) {
    return (
      <DashboardLayout userType="admin-sistema">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando dados...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="admin-sistema">
      <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrativo</h1>
          <p className="text-gray-600">Gerencie empresas e eleições do sistema</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            className="flex items-center space-x-2"
            onClick={() => navigate('/companies')}
          >
            <Plus className="w-4 h-4" />
            <span>Gerenciar Empresas</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Empresas</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCompanies}</div>
              <p className="text-xs text-muted-foreground">Empresas cadastradas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eleições Ativas</CardTitle>
              <Vote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeElections}</div>
              <p className="text-xs text-muted-foreground">Em andamento</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Votos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVotes.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Votos computados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Participação</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completionRate}%</div>
              <p className="text-xs text-muted-foreground">Média geral</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Companies Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Empresas Cadastradas</CardTitle>
              <CardDescription>Gerencie as empresas do sistema</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar empresas..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 w-64"
                />
                {searchLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Funcionários</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Última Eleição</TableHead>
                <TableHead>Próxima Eleição</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell>{company.cnpj}</TableCell>
                  <TableCell>{company.employees}</TableCell>
                  <TableCell>
                    <Badge variant={company.status === 'active' ? 'default' : 'secondary'}>
                      {company.status === 'active' ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {company.lastElection ? new Date(company.lastElection).toLocaleDateString('pt-BR') : '-'}
                  </TableCell>
                  <TableCell>
                    {company.nextElection ? new Date(company.nextElection).toLocaleDateString('pt-BR') : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteCompany(company.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {companies.length === 0 && (
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm ? 'Nenhuma empresa encontrada' : 'Nenhuma empresa cadastrada'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/companies')}
        >
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Gestão de Empresas</h3>
            <p className="text-sm text-gray-600">Gerenciar empresas cadastradas</p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/system-users')}
        >
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <UserCog className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">Usuários do Sistema</h3>
            <p className="text-sm text-gray-600">Gerenciar usuários e permissões</p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/system-settings')}
        >
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Settings className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">Configurações</h3>
            <p className="text-sm text-gray-600">Configurações globais do sistema</p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/system-reports')}
        >
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold mb-2">Relatórios</h3>
            <p className="text-sm text-gray-600">Relatórios e métricas globais</p>
          </CardContent>
        </Card>
      </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardAdmin;
