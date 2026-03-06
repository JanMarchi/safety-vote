import React from 'react';
import {
  Home,
  Users,
  UserCheck,
  Vote,
  BarChart3,
  Settings,
  FileText,
  Building2,
  Calendar,
  Plus,
  Key,
  Shield,
  Scale,
  Database,
  UserCog,
  Monitor
} from 'lucide-react';

const menuIcon = (Icon: React.ComponentType<{ className?: string }>) => {
  return React.createElement(Icon, { className: "w-5 h-5" });
};

const useMenuItems = (userType: string) => {
  const sharedItems = {
    // Itens específicos do Admin Sistema
    dashboardAdmin: { icon: menuIcon(Monitor), label: 'Dashboard Admin', path: '/dashboard-admin' },
    empresas: { icon: menuIcon(Building2), label: 'Gestão de Empresas', path: '/companies' },
    usuariosSistema: { icon: menuIcon(UserCog), label: 'Usuários do Sistema', path: '/system-users' },
    configuracoesSistema: { icon: menuIcon(Settings), label: 'Configurações do Sistema', path: '/system-settings' },
    seguranca: { icon: menuIcon(Shield), label: 'Segurança', path: '/security' },
    conformidadeCipa: { icon: menuIcon(Scale), label: 'Conformidade CIPA', path: '/cipa-compliance' },
    relatoriosSistema: { icon: menuIcon(BarChart3), label: 'Relatórios do Sistema', path: '/system-reports' },
    
    // Itens específicos do RH
    dashboardRH: { icon: menuIcon(Calendar), label: 'Dashboard RH', path: '/dashboard-rh' },
    eleicoes: { icon: menuIcon(Vote), label: 'Eleições', path: '/elections' },
    candidatos: { icon: menuIcon(UserCheck), label: 'Candidatos', path: '/candidates' },
    eleitores: { icon: menuIcon(Users), label: 'Eleitores', path: '/voters' },
    funcionarios: { icon: menuIcon(Users), label: 'Funcionários', path: '/employees' },
    relatoriosRH: { icon: menuIcon(BarChart3), label: 'Relatórios', path: '/rh-reports' },
    configuracoesRH: { icon: menuIcon(Settings), label: 'Configurações', path: '/settings' },
    
    // Itens específicos do Eleitor
    dashboardEleitor: { icon: menuIcon(Home), label: 'Meu Dashboard', path: '/dashboard-eleitor' },
    votacao: { icon: menuIcon(Vote), label: 'Votação', path: '/voting' },
    minhasChaves: { icon: menuIcon(Key), label: 'Minhas Chaves', path: '/minhas-chaves' },
    historico: { icon: menuIcon(FileText), label: 'Histórico', path: '/historico' },
    resultadosPublicos: { icon: menuIcon(BarChart3), label: 'Resultados Públicos', path: '/resultados-publicos' },
    privacidade: { icon: menuIcon(Settings), label: 'Privacidade', path: '/privacidade' }
  };

  switch (userType) {
    case 'admin-sistema':
      // Administrador do Sistema - Acesso total ao sistema, gestão de empresas e usuários
      return [
        { icon: sharedItems.dashboardAdmin.icon, label: sharedItems.dashboardAdmin.label, path: sharedItems.dashboardAdmin.path },
        { icon: sharedItems.empresas.icon, label: sharedItems.empresas.label, path: sharedItems.empresas.path },
        { icon: sharedItems.usuariosSistema.icon, label: sharedItems.usuariosSistema.label, path: sharedItems.usuariosSistema.path },
        { icon: sharedItems.relatoriosSistema.icon, label: sharedItems.relatoriosSistema.label, path: sharedItems.relatoriosSistema.path },
        { icon: sharedItems.seguranca.icon, label: sharedItems.seguranca.label, path: sharedItems.seguranca.path },
        { icon: sharedItems.conformidadeCipa.icon, label: sharedItems.conformidadeCipa.label, path: sharedItems.conformidadeCipa.path },
        { icon: sharedItems.configuracoesSistema.icon, label: sharedItems.configuracoesSistema.label, path: sharedItems.configuracoesSistema.path }
      ];
    
    case 'rh':
      // Recursos Humanos - Gestão de eleições, candidatos e eleitores da empresa
      return [
        { icon: sharedItems.dashboardRH.icon, label: sharedItems.dashboardRH.label, path: sharedItems.dashboardRH.path },
        { icon: sharedItems.eleicoes.icon, label: sharedItems.eleicoes.label, path: sharedItems.eleicoes.path },
        { icon: sharedItems.candidatos.icon, label: sharedItems.candidatos.label, path: sharedItems.candidatos.path },
        { icon: sharedItems.eleitores.icon, label: sharedItems.eleitores.label, path: sharedItems.eleitores.path },
        { icon: sharedItems.funcionarios.icon, label: sharedItems.funcionarios.label, path: sharedItems.funcionarios.path },
        { icon: sharedItems.relatoriosRH.icon, label: sharedItems.relatoriosRH.label, path: sharedItems.relatoriosRH.path },
        { icon: sharedItems.conformidadeCipa.icon, label: sharedItems.conformidadeCipa.label, path: sharedItems.conformidadeCipa.path },
        { icon: sharedItems.configuracoesRH.icon, label: sharedItems.configuracoesRH.label, path: '/rh-settings' }
      ];
    
    case 'eleitor':
      // Eleitor - Acesso limitado para votação e consulta de resultados
      return [
        { icon: sharedItems.dashboardEleitor.icon, label: sharedItems.dashboardEleitor.label, path: sharedItems.dashboardEleitor.path },
        { icon: sharedItems.votacao.icon, label: sharedItems.votacao.label, path: sharedItems.votacao.path },
        { icon: sharedItems.minhasChaves.icon, label: sharedItems.minhasChaves.label, path: sharedItems.minhasChaves.path },
        { icon: sharedItems.historico.icon, label: sharedItems.historico.label, path: sharedItems.historico.path },
        { icon: sharedItems.resultadosPublicos.icon, label: sharedItems.resultadosPublicos.label, path: sharedItems.resultadosPublicos.path },
        { icon: sharedItems.privacidade.icon, label: sharedItems.privacidade.label, path: sharedItems.privacidade.path }
      ];
    
    default:
      return [];
  }
};

export default useMenuItems;
