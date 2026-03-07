/**
 * API Documentation Portal
 * Story 5.4
 */

import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'API Documentation - Safety Vote',
  description: 'Documentação completa da API REST do Safety Vote com exemplos de código.',
  openGraph: {
    title: 'API Documentation - Safety Vote',
  },
};

const endpoints = [
  {
    method: 'POST',
    path: '/api/elections',
    description: 'Criar uma nova eleição',
  },
  {
    method: 'GET',
    path: '/api/elections/{id}',
    description: 'Obter detalhes de uma eleição',
  },
  {
    method: 'POST',
    path: '/api/votes',
    description: 'Registrar um voto',
  },
  {
    method: 'GET',
    path: '/api/elections/{id}/results',
    description: 'Obter resultados de uma eleição',
  },
];

const sdkExample = `// JavaScript/TypeScript
import { SafetyVoteAPI } from '@safetyvote/sdk';

const api = new SafetyVoteAPI({
  baseURL: 'https://api.safetyvote.com',
  token: 'seu-token-aqui'
});

// Criar eleição
const election = await api.elections.create({
  title: 'Eleição 2026',
  start_date: new Date(),
  end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
});

// Votar
const vote = await api.votes.cast({
  election_id: election.id,
  candidate_id: 'candidate-uuid'
});`;

export default function ApiPage() {
  return (
    <main className="min-h-screen bg-slate-950">
      {/* Hero */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">API Documentation</h1>
          <p className="text-xl text-slate-300 mb-8">
            Integre eleições digitais seguras na sua aplicação com nossa REST API completa.
          </p>
        </div>
      </section>

      {/* Quick Start */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6">Quick Start</h2>

          <div className="space-y-6">
            <div className="bg-slate-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-3">1. Autenticação</h3>
              <p className="text-slate-300 mb-4">Obtenha um token de API:</p>
              <pre className="bg-slate-950 p-4 rounded text-slate-300 text-sm overflow-x-auto">
{`curl -X POST https://api.safetyvote.com/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "seu-email@exemplo.com"}'`}
              </pre>
            </div>

            <div className="bg-slate-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-3">2. Criar Eleição</h3>
              <pre className="bg-slate-950 p-4 rounded text-slate-300 text-sm overflow-x-auto">
{`curl -X POST https://api.safetyvote.com/api/elections \\
  -H "Authorization: Bearer seu-token" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Eleição 2026",
    "start_date": "2026-04-01T00:00:00Z",
    "end_date": "2026-04-15T23:59:59Z"
  }'`}
              </pre>
            </div>

            <div className="bg-slate-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-3">3. Registrar Voto</h3>
              <pre className="bg-slate-950 p-4 rounded text-slate-300 text-sm overflow-x-auto">
{`curl -X POST https://api.safetyvote.com/api/votes \\
  -H "Authorization: Bearer seu-token" \\
  -H "Content-Type: application/json" \\
  -d '{
    "election_id": "elec-uuid",
    "candidate_id": "cand-uuid"
  }'`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Endpoints */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8">Principais Endpoints</h2>
          <div className="space-y-4">
            {endpoints.map((ep, idx) => (
              <div key={idx} className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1 rounded font-mono text-sm font-bold ${
                      ep.method === 'GET'
                        ? 'bg-blue-600 text-white'
                        : ep.method === 'POST'
                          ? 'bg-green-600 text-white'
                          : 'bg-yellow-600 text-white'
                    }`}
                  >
                    {ep.method}
                  </span>
                  <code className="text-slate-300 font-mono">{ep.path}</code>
                  <span className="text-slate-400 text-sm ml-auto">{ep.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SDK */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6">JavaScript/TypeScript SDK</h2>
          <p className="text-slate-300 mb-4">Instale nosso SDK:</p>
          <pre className="bg-slate-950 p-4 rounded text-slate-300 mb-6">npm install @safetyvote/sdk</pre>

          <h3 className="text-lg font-semibold text-white mb-3">Exemplo de Uso</h3>
          <pre className="bg-slate-950 p-4 rounded text-slate-300 text-sm overflow-x-auto whitespace-pre-wrap break-words">
            {sdkExample}
          </pre>
        </div>
      </section>

      {/* Rate Limiting */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6">Rate Limiting</h2>
          <div className="bg-slate-900 p-6 rounded-lg space-y-4">
            <div>
              <h3 className="font-semibold text-white mb-2">Limites</h3>
              <ul className="text-slate-300 space-y-2">
                <li>• 1000 requisições por hora por usuário</li>
                <li>• 100 requisições por minuto (burst)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Headers de Resposta</h3>
              <ul className="text-slate-300 space-y-2 font-mono text-sm">
                <li>X-RateLimit-Limit: 1000</li>
                <li>X-RateLimit-Remaining: 999</li>
                <li>X-RateLimit-Reset: 1704067200</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Support */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Precisa de Ajuda?</h2>
          <p className="text-blue-100 mb-8">Consulte a documentação completa ou entre em contato com nosso time de suporte.</p>
          <div className="flex gap-4 justify-center">
            <a
              href="/documentacao"
              className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-slate-100"
            >
              Documentação Completa
            </a>
            <a
              href="/contato"
              className="bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-800"
            >
              Contato
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
