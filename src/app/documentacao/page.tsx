/**
 * Documentação
 * Story 5.10
 */

import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Documentação - Safety Vote',
  description: 'Documentação técnica, guias de usuário e recursos do Safety Vote.',
  openGraph: {
    title: 'Documentação - Safety Vote',
  },
};

const docs = [
  {
    title: 'Guia do Usuário',
    desc: 'Instruções para eleitores e administradores',
    articles: ['Primeiros Passos', 'Como Votar', 'Criando Eleições'],
    difficulty: 'Iniciante',
  },
  {
    title: 'Documentação da API',
    desc: 'Referência técnica para desenvolvadores',
    articles: ['Autenticação', 'Endpoints', 'Tratamento de Erros'],
    difficulty: 'Avançado',
  },
  {
    title: 'Guia do Administrador',
    desc: 'Gerenciamento de usuários e configurações',
    articles: ['Usuários & Permissões', 'Auditoria', 'Backup'],
    difficulty: 'Intermediário',
  },
  {
    title: 'Segurança',
    desc: 'Práticas de segurança e boas práticas',
    articles: ['Criptografia', 'RLS', 'Auditoria'],
    difficulty: 'Avançado',
  },
  {
    title: 'Integrações',
    desc: 'Como integrar com sistemas externos',
    articles: ['REST API', 'Webhooks', 'SDKs'],
    difficulty: 'Avançado',
  },
  {
    title: 'Troubleshooting',
    desc: 'Solução de problemas comuns',
    articles: ['Problemas de Login', 'Erros de Votação', 'Performance'],
    difficulty: 'Intermediário',
  },
];

export default function DocumentacaoPage() {
  return (
    <main className="min-h-screen bg-slate-950">
      {/* Hero */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 text-center bg-slate-900">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">Documentação</h1>
          <p className="text-lg text-slate-300 mb-8">
            Tudo que você precisa para usar, administrar e integrar o Safety Vote.
          </p>
        </div>
      </section>

      {/* Quick Start */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8">Comece Rápido</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { num: '1', title: 'Criar Eleição', desc: '5 minutos' },
              { num: '2', title: 'Adicionar Eleitores', desc: '10 minutos' },
              { num: '3', title: 'Visualizar Resultados', desc: '2 minutos' },
            ].map((step, idx) => (
              <div key={idx} className="bg-slate-900 p-6 rounded-lg border border-slate-700 text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">{step.num}</div>
                <h3 className="font-semibold text-white mb-1">{step.title}</h3>
                <p className="text-slate-400 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Documentation Sections */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8">Seções de Documentação</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {docs.map((doc, idx) => (
              <div
                key={idx}
                className="bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-white flex-1">{doc.title}</h3>
                  <span
                    className={`text-xs px-2 py-1 rounded whitespace-nowrap ml-2 ${
                      doc.difficulty === 'Iniciante'
                        ? 'bg-green-600 text-green-100'
                        : doc.difficulty === 'Intermediário'
                          ? 'bg-yellow-600 text-yellow-100'
                          : 'bg-red-600 text-red-100'
                    }`}
                  >
                    {doc.difficulty}
                  </span>
                </div>
                <p className="text-slate-400 text-sm mb-4">{doc.desc}</p>
                <ul className="space-y-2">
                  {doc.articles.map((article, aidx) => (
                    <li key={aidx} className="text-slate-300 text-sm flex items-center">
                      <span className="mr-2">→</span>
                      {article}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Resources */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8">Recursos Destacados</h2>
          <div className="space-y-4">
            <a href="#" className="block bg-slate-900 p-6 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors">
              <h3 className="text-lg font-semibold text-white mb-2">📥 Baixar Guia em PDF</h3>
              <p className="text-slate-400">Guia completo de usuário em um único arquivo PDF</p>
            </a>
            <a href="/api-docs" className="block bg-slate-900 p-6 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors">
              <h3 className="text-lg font-semibold text-white mb-2">🔌 API Reference</h3>
              <p className="text-slate-400">Documentação técnica completa da REST API</p>
            </a>
            <a href="/blog" className="block bg-slate-900 p-6 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors">
              <h3 className="text-lg font-semibold text-white mb-2">📚 Blog & Tutoriais</h3>
              <p className="text-slate-400">Artigos detalhados e tutoriais passo a passo</p>
            </a>
          </div>
        </div>
      </section>

      {/* Support */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Não encontrou?</h2>
          <p className="text-blue-100 mb-6">Estamos aqui para ajudar. Entre em contato com nosso time.</p>
          <a
            href="/contato"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-slate-100 inline-block"
          >
            Enviar Pergunta
          </a>
        </div>
      </section>
    </main>
  );
}
