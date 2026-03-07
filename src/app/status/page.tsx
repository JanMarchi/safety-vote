/**
 * Status (System Status Page)
 * Story 5.11
 */

'use client';

import React, { useState, useEffect } from 'react';

const services = [
  { name: 'API Gateway', status: 'operational' as const, uptime: 99.95 },
  { name: 'Authentication', status: 'operational' as const, uptime: 99.98 },
  { name: 'Database', status: 'operational' as const, uptime: 99.99 },
  { name: 'Email Service', status: 'operational' as const, uptime: 99.80 },
];

const incidents = [
  {
    date: '2026-02-28',
    title: 'Email Service Latency',
    status: 'resolved',
    duration: '15 minutes',
    impact: 'Some users experienced delays in sending votes',
  },
  {
    date: '2026-02-20',
    title: 'Database Maintenance',
    status: 'resolved',
    duration: '1 hour',
    impact: 'Planned maintenance window',
  },
];

const statusBadgeColor = (status: string) => {
  switch (status) {
    case 'operational':
      return 'bg-green-600 text-green-100';
    case 'degraded':
      return 'bg-yellow-600 text-yellow-100';
    case 'down':
      return 'bg-red-600 text-red-100';
    default:
      return 'bg-gray-600 text-gray-100';
  }
};

const statusDot = (status: string) => {
  switch (status) {
    case 'operational':
      return '🟢';
    case 'degraded':
      return '🟡';
    case 'down':
      return '🔴';
    default:
      return '⚪';
  }
};

export default function StatusPage() {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    setLastUpdated(new Date());
  }, []);

  return (
    <main className="min-h-screen bg-slate-950">
      {/* Header */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Status do Sistema</h1>
              <p className="text-slate-400">
                Atualizado: {lastUpdated?.toLocaleTimeString('pt-BR') || 'Carregando...'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl mb-2">🟢</div>
              <p className="text-green-400 font-semibold">Tudo Operacional</p>
            </div>
          </div>
        </div>
      </section>

      {/* Current Status */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6">Status dos Serviços</h2>
          <div className="space-y-4">
            {services.map((service, idx) => (
              <div key={idx} className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <span className="text-2xl">{statusDot(service.status)}</span>
                    <div>
                      <h3 className="font-semibold text-white">{service.name}</h3>
                      <p className="text-slate-400 text-sm">Uptime: {service.uptime}%</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded text-sm font-semibold ${statusBadgeColor(service.status)}`}>
                    Operacional
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Uptime Statistics */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8">Estatísticas de Uptime</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { label: '7 dias', uptime: '99.98%' },
              { label: '30 dias', uptime: '99.95%' },
              { label: '90 dias', uptime: '99.93%' },
              { label: '1 ano', uptime: '99.91%' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-slate-900 p-4 rounded-lg text-center border border-slate-700">
                <p className="text-slate-400 text-sm mb-2">{stat.label}</p>
                <p className="text-2xl font-bold text-green-400">{stat.uptime}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Incidents */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8">Histórico de Incidentes</h2>
          <div className="space-y-4">
            {incidents.map((incident, idx) => (
              <div key={idx} className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-white">{incident.title}</h3>
                    <p className="text-slate-400 text-sm">{incident.date}</p>
                  </div>
                  <span className="px-3 py-1 rounded text-sm bg-green-600 text-green-100 font-semibold">
                    Resolvido
                  </span>
                </div>
                <p className="text-slate-300 mb-2">{incident.impact}</p>
                <p className="text-slate-500 text-sm">Duração: {incident.duration}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Maintenance */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8">Manutenção Programada</h2>
          <div className="bg-slate-900 p-8 rounded-lg text-center border border-slate-700">
            <p className="text-slate-400">Nenhuma manutenção programada no momento</p>
          </div>
        </div>
      </section>

      {/* Subscribe */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Receba Atualizações</h2>
          <p className="text-blue-100 mb-6">
            Inscreva-se para receber alertas sobre status e incidentes.
          </p>
          <form className="flex gap-2 max-w-sm mx-auto">
            <input
              type="email"
              placeholder="seu-email@exemplo.com"
              className="flex-1 px-4 py-3 rounded-lg bg-white text-slate-950 outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="submit"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
            >
              Inscrever
            </button>
          </form>
        </div>
      </section>

      {/* SLA Info */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8">SLA Commitment</h2>
          <div className="bg-slate-900 p-8 rounded-lg border border-slate-700">
            <p className="text-slate-300 mb-4">
              Safety Vote se compromete com um SLA de <strong>99.9% de uptime</strong> para todos os serviços.
            </p>
            <p className="text-slate-400 text-sm">
              Consulte nossa <a href="/termos" className="text-blue-400 hover:text-blue-300">Política de SLA</a> para
              mais detalhes.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
