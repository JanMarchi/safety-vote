/**
 * Recursos (Features & Resources Page)
 * Story 5.1
 */

import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Recursos & Funcionalidades - Safety Vote',
  description:
    'Conheça as principais funcionalidades do Safety Vote: segurança, criptografia, auditoria e muito mais.',
  openGraph: {
    title: 'Recursos & Funcionalidades - Safety Vote',
    description: 'Plataforma segura para votações e eleições digitais',
    url: 'https://safetyvote.com/recursos',
  },
};

const features = [
  {
    icon: '🔐',
    title: 'Criptografia AES-256',
    description: 'Votos protegidos com criptografia militar end-to-end',
  },
  {
    icon: '🔒',
    title: 'Row Level Security (RLS)',
    description: 'Isolamento de dados por empresa com validação em banco de dados',
  },
  {
    icon: '📋',
    title: 'Auditoria Completa',
    description: 'Log imutável de todas as ações e acessos no sistema',
  },
  {
    icon: '🌐',
    title: 'Multi-tenant',
    description: 'Suporte para múltiplas empresas em uma única instância',
  },
  {
    icon: '♿',
    title: 'Acessibilidade WCAG 2.1 AA',
    description: 'Compatível com leitores de tela e navegação por teclado',
  },
  {
    icon: '⚡',
    title: 'Real-time Updates',
    description: 'Resultados e status atualizados em tempo real',
  },
  {
    icon: '📱',
    title: 'Responsive Design',
    description: 'Funciona perfeitamente em desktop, tablet e mobile',
  },
  {
    icon: '🔗',
    title: 'Integração API',
    description: 'REST API completa para integração com sistemas terceiros',
  },
];

const benefits = [
  'Eleições 100% seguras e secretas',
  'Conformidade LGPD e regulatória',
  'Implementação rápida em dias',
  'Suporte técnico dedicado',
  'Uptime SLA de 99.9%',
  'Escalável para qualquer volume',
];

export default function RecursosPage() {
  return (
    <main className="min-h-screen bg-slate-950">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Funcionalidades Poderosas
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            Safety Vote oferece todas as ferramentas necessárias para eleições digitais seguras,
            transparentes e acessíveis.
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
            Comece Agora
          </button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">
            Principais Funcionalidades
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors"
              >
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Benefícios</h2>
          <ul className="space-y-4">
            {benefits.map((benefit, idx) => (
              <li key={idx} className="flex items-center text-white">
                <span className="text-green-500 mr-3 text-xl">✓</span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Pronto para começar?</h2>
          <p className="text-blue-100 mb-8">
            Entre em contato com nosso time para uma demonstração gratuita.
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-slate-100 transition-colors">
            Agendar Demo
          </button>
        </div>
      </section>
    </main>
  );
}
