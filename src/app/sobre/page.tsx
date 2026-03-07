/**
 * Sobre (About Us)
 * Story 5.5
 */

import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sobre Nós - Safety Vote',
  description: 'Conheça a Safety Vote, a plataforma líder em eleições digitais seguras.',
  openGraph: {
    title: 'Sobre Nós - Safety Vote',
  },
};

const values = [
  { title: 'Segurança', description: 'A segurança é nossa prioridade máxima' },
  { title: 'Transparência', description: 'Somos abertos sobre como funcionamos' },
  { title: 'Acessibilidade', description: 'Eleições para todos, sem exceções' },
  { title: 'Inovação', description: 'Sempre buscando melhorar a tecnologia' },
];

const milestones = [
  { year: '2023', event: 'Safety Vote foi fundada' },
  { year: '2024', event: 'Primeira eleição com 10.000 eleitores' },
  { year: '2025', event: 'Certificação LGPD obtida' },
  { year: '2026', event: 'Expansão para América Latina' },
];

export default function SobrePage() {
  return (
    <main className="min-h-screen bg-slate-950">
      {/* Hero */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">Sobre a Safety Vote</h1>
          <p className="text-xl text-slate-300">
            Transformando eleições através de tecnologia segura, transparente e acessível.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Nossa Missão</h2>
            <p className="text-slate-300">
              Fazer eleições digitais seguras, acessíveis e confiáveis para toda organização, de qualquer
              tamanho, em qualquer lugar do mundo.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Nossa Visão</h2>
            <p className="text-slate-300">
              Ser a plataforma global padrão para eleições digitais, permitindo que bilhões de pessoas
              participem de decisões democráticas de forma segura.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Nossos Valores</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, idx) => (
              <div key={idx} className="bg-slate-900 p-6 rounded-lg border border-slate-700">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">{value.title}</h3>
                <p className="text-slate-400">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Nossa História</h2>
          <div className="space-y-6">
            {milestones.map((milestone, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-600">
                    <span className="text-white font-bold">{idx + 1}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{milestone.year}</h3>
                  <p className="text-slate-400">{milestone.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Nosso Time</h2>
          <p className="text-slate-300 text-center mb-8 max-w-2xl mx-auto">
            Somos uma equipe apaixonada por segurança, democracia e inovação. Com experiência em criptografia,
            engenharia de software e gestão de projetos.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 bg-slate-800 rounded-full"></div>
                <h3 className="text-lg font-semibold text-white">Membro {i}</h3>
                <p className="text-slate-400 mb-2">Cargo</p>
                <p className="text-slate-500 text-sm">Bio do membro do time</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Nosso Impacto</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">500+</div>
              <p className="text-slate-300">Eleições realizadas</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">1M+</div>
              <p className="text-slate-300">Votos processados</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">50+</div>
              <p className="text-slate-300">Empresas usando</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Junte-se a nós</h2>
          <p className="text-slate-300 mb-8">
            Estamos sempre procurando talento para nos ajudar a transformar eleições.
          </p>
          <a
            href="/carreiras"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 inline-block"
          >
            Veja Nossas Vagas
          </a>
        </div>
      </section>
    </main>
  );
}
