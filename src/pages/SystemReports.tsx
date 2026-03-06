import React, { useState, useEffect } from 'react';
import { BarChart3, Download, Calendar, TrendingUp, Users, Building2, Vote, Activity, Filter, RefreshCw } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

interface SystemMetrics {
  totalCompanies: number;
  activeCompanies: number;
  totalUsers: number;
  activeUsers: number;
  totalElections: number;
  activeElections: number;
  totalVotes: number;
  systemUptime: string;
}

interface CompanyMetric {
  id: string;
  name: string;
  users: number;
  elections: number;
  votes: number;
  lastActivity: string;
  status: 'active' | 'inactive';
}

const SystemReports: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalCompanies: 0,
    activeCompanies: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalElections: 0,
    activeElections: 0,
    totalVotes: 0,
    systemUptime: '0 dias'
  });

  const [companyMetrics, setCompanyMetrics] = useState<CompanyMetric[]>([]);
  const [dateRange, setDateRange] = useState('30');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    setLoading(true);
    
    try {
      // TODO: Implementar chamadas para APIs reais
      // const metricsResponse = await systemService.getMetrics();
      // const companiesResponse = await systemService.getCompanyMetrics();
      
      // Inicializar com dados vazios/zerados
      const emptyMetrics: SystemMetrics = {
        totalCompanies: 0,
        activeCompanies: 0,
        totalUsers: 0,
        activeUsers: 0,
        totalElections: 0,
        activeElections: 0,
        totalVotes: 0,
        systemUptime: '0 dias'
      };
      
      const emptyCompanyMetrics: CompanyMetric[] = [];
      
      setMetrics(emptyMetrics);
      setCompanyMetrics(emptyCompanyMetrics);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados do sistema:', error);
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const exportReport = () => {
    // Simular exportação
    alert('Relatório exportado com sucesso!');
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatusText = (status: string) => {
    return status === 'active' ? 'Ativa' : 'Inativa';
  };

  return (
    <DashboardLayout userType="admin-sistema">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Relatórios do Sistema</h1>
            <p className="text-gray-600">Métricas e análises globais do sistema</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
            <button
              onClick={exportReport}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Período:</span>
            </div>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
              <option value="365">Último ano</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Carregando relatórios...</p>
          </div>
        ) : (
          <>
            {/* Main Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Building2 className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Empresas Ativas</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {metrics.activeCompanies}/{metrics.totalCompanies}
                    </p>
                    <p className="text-xs text-green-600">
                      {((metrics.activeCompanies / metrics.totalCompanies) * 100).toFixed(1)}% ativas
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Usuários Ativos</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {metrics.activeUsers.toLocaleString()}
                    </p>
                    <p className="text-xs text-green-600">
                      {((metrics.activeUsers / metrics.totalUsers) * 100).toFixed(1)}% ativos
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Vote className="w-8 h-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Eleições Ativas</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {metrics.activeElections}
                    </p>
                    <p className="text-xs text-blue-600">
                      {metrics.totalElections} total
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <TrendingUp className="w-8 h-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total de Votos</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {metrics.totalVotes.toLocaleString()}
                    </p>
                    <p className="text-xs text-green-600">
                      Sistema ativo há {metrics.systemUptime}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* System Health */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Status do Sistema
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Activity className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="font-medium text-gray-900">Sistema Online</h3>
                    <p className="text-sm text-gray-600">Uptime: {metrics.systemUptime}</p>
                    <div className="mt-2">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Operacional
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <BarChart3 className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="font-medium text-gray-900">Performance</h3>
                    <p className="text-sm text-gray-600">Tempo de resposta médio</p>
                    <div className="mt-2">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        &lt; 200ms
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="font-medium text-gray-900">Usuários Online</h3>
                    <p className="text-sm text-gray-600">Conectados agora</p>
                    <div className="mt-2">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                        247 usuários
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Company Performance */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Performance por Empresa
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Empresa
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuários
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Eleições
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Votos
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Última Atividade
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {companyMetrics.map((company) => (
                      <tr key={company.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{company.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {company.users}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {company.elections}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {company.votes.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(company.status)}`}>
                            {getStatusText(company.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(company.lastActivity).toLocaleDateString('pt-BR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Usage Trends */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Tendências de Uso
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Crescimento de Empresas</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Este mês</span>
                        <span className="text-green-600">+3 empresas</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{width: '75%'}}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Atividade de Usuários</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Taxa de engajamento</span>
                        <span className="text-blue-600">87.9%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{width: '88%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SystemReports;