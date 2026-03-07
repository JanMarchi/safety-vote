/**
 * Segurança (Security Page)
 * Story 5.3
 */

import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Segurança - Safety Vote',
  description: 'Safety Vote utiliza criptografia militar e conformidade LGPD para proteger eleições.',
  openGraph: {
    title: 'Segurança - Safety Vote',
    description: 'Segurança de nível enterprise para suas eleições',
  },
};

const securityFeatures = [
  {
    icon: '🔐',
    title: 'Criptografia AES-256-GCM',
    description: 'Votos criptografados com padrão militar. Cada voto tem sua própria chave de criptografia.',
  },
  {
    icon: '🔒',
    title: 'Row Level Security (RLS)',
    description: 'Isolamento de dados em nível de banco de dados. Dados de uma empresa nunca são visíveis para outra.',
  },
  {
    icon: '📋',
    title: 'Auditoria Imutável',
    description: 'Todas as ações são registradas em log imutável. Nenhuma alteração é realizada sem rastreamento.',
  },
  {
    icon: '🔑',
    title: 'Magic Link Auth',
    description: 'Autenticação sem senhas. Links únicos de acesso com expiração de 24 horas.',
  },
  {
    icon: '🛡️',
    title: 'JWT Tokens',
    description: 'Tokens assinados com chaves privadas. Sessões seguras e verificáveis.',
  },
  {
    icon: '⚙️',
    title: 'RBAC',
    description: 'Controle de acesso baseado em função (admin, rh, eleitor). Permissões granulares.',
  },
];

const compliance = [
  { standard: 'LGPD', description: 'Lei Geral de Proteção de Dados Pessoais (Brasil)' },
  { standard: 'WCAG 2.1 AA', description: 'Acessibilidade web para todas as pessoas' },
  { standard: 'ISO 27001', description: 'Gestão de segurança da informação' },
  { standard: 'SOC 2 Type II', description: 'Auditoria independente de segurança (em progresso)' },
];

const principles = [
  'Autenticação: Verificar identidade antes de qualquer ação',
  'Autorização: Validar permissões em banco de dados (RLS)',
  'Criptografia: Proteger dados em trânsito e em repouso',
  'Auditoria: Registrar todas as ações de forma imutável',
  'Segregação: Dados de diferentes empresas nunca se misturam',
];

export default function SegurancaPage() {
  return (
    <main className="min-h-screen bg-slate-950">
      {/* Hero */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Segurança de Nível Enterprise
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            Safety Vote implementa os mais altos padrões de segurança para proteger suas eleições.
          </p>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">
            Funcionalidades de Segurança
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {securityFeatures.map((feature, idx) => (
              <div key={idx} className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Principles */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8">Princípios de Segurança</h2>
          <div className="space-y-4">
            {principles.map((principle, idx) => (
              <div key={idx} className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                <p className="text-white">{principle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Conformidade & Certificações</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {compliance.map((item, idx) => (
              <div key={idx} className="bg-slate-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-blue-400 mb-2">{item.standard}</h3>
                <p className="text-slate-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Protection */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8">Proteção de Dados</h2>
          <div className="bg-slate-900 rounded-lg p-8 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Sigilo do Voto</h3>
              <p className="text-slate-400">
                Votos são criptografados imediatamente. Ninguém, nem os administradores, podem associar um voto
                a um eleitor.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Retenção de Dados</h3>
              <p className="text-slate-400">
                Dados são armazenados de forma segura. Você controla quanto tempo os dados são mantidos.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Backup & Recuperação</h3>
              <p className="text-slate-400">
                Backups automáticos diários com replicação geográfica. Recuperação garantida em caso de desastre.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Monitoramento Contínuo</h3>
              <p className="text-slate-400">
                Monitoramento 24/7 de segurança. Alertas automáticos para atividades suspeitas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Contact */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Política de Segurança</h2>
          <p className="text-blue-100 mb-8">
            Encontrou uma vulnerabilidade? Entre em contato com nosso time de segurança.
          </p>
          <a
            href="mailto:security@safetyvote.com"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-slate-100 transition-colors inline-block"
          >
            security@safetyvote.com
          </a>
        </div>
      </section>
    </main>
  );
}
