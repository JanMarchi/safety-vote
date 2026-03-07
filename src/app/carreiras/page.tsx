/**
 * Carreiras (Careers Page)
 * Story 5.7
 */

import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Carreiras - Safety Vote',
  description: 'Junte-se ao time Safety Vote e ajude a transformar eleições digitais.',
  openGraph: {
    title: 'Carreiras - Safety Vote',
  },
};

const jobs = [
  {
    title: 'Senior Backend Engineer',
    department: 'Engenharia',
    level: 'Sênior',
    type: 'Remoto',
    description: 'Procuramos um engenheiro experiente em Node.js e databases',
  },
  {
    title: 'Frontend Developer',
    department: 'Engenharia',
    level: 'Pleno',
    type: 'Híbrido',
    description: 'Desenvolva interfaces incríveis com React e TypeScript',
  },
  {
    title: 'Security Engineer',
    department: 'Segurança',
    level: 'Sênior',
    type: 'Remoto',
    description: 'Especialize-se em segurança de aplicações e infrastructure',
  },
  {
    title: 'Product Manager',
    department: 'Produto',
    level: 'Pleno',
    type: 'São Paulo',
    description: 'Direcione a estratégia de produto do Safety Vote',
  },
];

const benefits = [
  { icon: '💰', title: 'Salário Competitivo', desc: 'Remuneração de mercado' },
  { icon: '🏥', title: 'Saúde', desc: 'Plano de saúde integral' },
  { icon: '🏡', title: 'Trabalho Remoto', desc: 'Flexibilidade total' },
  { icon: '📚', title: 'Desenvolvimento', desc: 'Orçamento para cursos' },
  { icon: '🎓', title: 'Conferências', desc: 'Participe de eventos' },
  { icon: '⌚', title: 'Flexibilidade', desc: 'Horários flexíveis' },
];

const values = [
  'Somos uma equipe pequena e focada',
  'Valorizamos qualidade sobre quantidade',
  'Aprendizado contínuo é essencial',
  'Diversidade nos torna mais fortes',
  'Transparência em tudo o que fazemos',
];

export default function CarreirasPage() {
  return (
    <main className="min-h-screen bg-slate-950">
      {/* Hero */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">Junte-se ao Nosso Time</h1>
          <p className="text-xl text-slate-300 mb-8">
            Estamos procurando talento para transformar eleições e democracia.
          </p>
        </div>
      </section>

      {/* Culture */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Cultura & Valores</h2>
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Nosso Ambiente</h3>
              <p className="text-slate-300 mb-4">
                Em Safety Vote, você trabalha em um ambiente de inovação constante. Nossas equipes são
                pequenas, focadas e altamente colaborativas.
              </p>
              <p className="text-slate-300">
                Cada pessoa tem voz e contribui para decisões importantes da empresa.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">O Que Valorizamos</h3>
              <ul className="space-y-2 text-slate-300">
                {values.map((v, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-blue-400 mr-3">•</span>
                    {v}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Benefícios</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {benefits.map((b, idx) => (
              <div key={idx} className="bg-slate-900 p-6 rounded-lg text-center">
                <div className="text-4xl mb-3">{b.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{b.title}</h3>
                <p className="text-slate-400">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Posições Abertas</h2>
          <div className="space-y-4">
            {jobs.map((job, idx) => (
              <div key={idx} className="bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{job.title}</h3>
                    <p className="text-slate-400 text-sm">{job.department}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                      {job.level}
                    </span>
                    <span className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded">
                      {job.type}
                    </span>
                  </div>
                </div>
                <p className="text-slate-300 mb-4">{job.description}</p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm">
                  Ver Vaga
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hiring Process */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Processo de Contratação</h2>
          <div className="space-y-4">
            {[
              { step: '1', title: 'Aplicação', desc: 'Envie seu CV e portfólio' },
              { step: '2', title: 'Entrevista Inicial', desc: 'Conversa sobre experiência' },
              { step: '3', title: 'Teste Técnico', desc: 'Demonstre suas habilidades' },
              { step: '4', title: 'Entrevista Final', desc: 'Conheça o time' },
            ].map((p, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white font-bold">
                    {p.step}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{p.title}</h3>
                  <p className="text-slate-400">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Pronto para começar?</h2>
          <p className="text-blue-100 mb-8">
            Não encontrou exatamente o que procura? Ainda assim gostaríamos de conhecê-lo.
          </p>
          <a
            href="/contato"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-slate-100 inline-block"
          >
            Envie seu CV
          </a>
        </div>
      </section>
    </main>
  );
}
