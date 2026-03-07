/**
 * Central de Ajuda (Help Center)
 * Story 5.9
 */

'use client';

import React, { useState } from 'react';

const faqItems = [
  {
    category: 'Começar',
    items: [
      {
        q: 'Como faço para criar uma eleição?',
        a: 'Acesse sua conta, clique em "Nova Eleição" e siga o passo a passo.',
      },
      {
        q: 'Qual é o limite de eleitores por eleição?',
        a: 'Depende do seu plano. Básico: 100, Profissional: 10.000, Enterprise: ilimitado.',
      },
      {
        q: 'Posso editar uma eleição após criá-la?',
        a: 'Sim, enquanto a eleição estiver em status "rascunho". Após iniciar, não é possível editar.',
      },
    ],
  },
  {
    category: 'Votação',
    items: [
      {
        q: 'Como funciona o processo de votação?',
        a: 'Eleitores recebem um link único, realizam login, e votam em candidatos. O sistema criptografa e armazena de forma segura.',
      },
      {
        q: 'É possível votar mais de uma vez?',
        a: 'Não. O sistema permite apenas um voto por eleitor na eleição.',
      },
      {
        q: 'O voto é realmente secreto?',
        a: 'Sim, 100%. Os votos são criptografados e nunca podem ser associados ao eleitor.',
      },
    ],
  },
  {
    category: 'Resultados',
    items: [
      {
        q: 'Quando posso ver os resultados?',
        a: 'Resultados ficam disponíveis assim que a eleição termina.',
      },
      {
        q: 'Como são calculados os votos?',
        a: 'Sistema realiza contagem e ranking automático. Relatorios detalhados estão disponíveis.',
      },
    ],
  },
];

export default function CentralDeAjudaPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const filtered = faqItems
    .map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) =>
          item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.a.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((cat) => cat.items.length > 0);

  return (
    <main className="min-h-screen bg-slate-950">
      {/* Hero */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 text-center bg-slate-900">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">Central de Ajuda</h1>
          <p className="text-lg text-slate-300 mb-8">
            Encontre respostas para suas perguntas e resolva problemas rapidamente.
          </p>

          {/* Search */}
          <input
            type="text"
            placeholder="Pesquise por uma pergunta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:border-blue-500 outline-none"
          />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {filtered.length > 0 ? (
            <div className="space-y-8">
              {filtered.map((category, catIdx) => (
                <div key={catIdx}>
                  <h2 className="text-2xl font-bold text-white mb-4">{category.category}</h2>
                  <div className="space-y-2">
                    {category.items.map((faq, faqIdx) => {
                      const id = `${catIdx}-${faqIdx}`;
                      const isExpanded = expandedFaq === id;

                      return (
                        <button
                          key={id}
                          onClick={() => setExpandedFaq(isExpanded ? null : id)}
                          className="w-full bg-slate-900 p-4 rounded-lg border border-slate-700 hover:border-blue-500 transition-all text-left"
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-white">{faq.q}</h3>
                            <span className="text-xl text-blue-400">
                              {isExpanded ? '−' : '+'}
                            </span>
                          </div>
                          {isExpanded && (
                            <p className="text-slate-300 mt-3 text-sm">{faq.a}</p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-400 mb-4">Nenhuma resposta encontrada</p>
              <p className="text-slate-500">Tente outra busca ou</p>
              <a href="/contato" className="text-blue-400 hover:text-blue-300">
                entre em contato conosco
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Articles */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8">Artigos Populares</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '🚀',
                title: 'Começando com Safety Vote',
                desc: 'Guia passo a passo para criar sua primeira eleição',
              },
              {
                icon: '🔐',
                title: 'Segurança & Privacidade',
                desc: 'Como garantir que seus dados estão seguros',
              },
              {
                icon: '⚙️',
                title: 'Integrações API',
                desc: 'Como integrar Safety Vote com seus sistemas',
              },
            ].map((article, idx) => (
              <a
                key={idx}
                href="#"
                className="bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors"
              >
                <div className="text-3xl mb-3">{article.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{article.title}</h3>
                <p className="text-slate-400 text-sm">{article.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Ainda precisa de ajuda?</h2>
          <p className="text-slate-300 mb-6">
            Não encontrou a resposta? Entre em contato com nosso time de suporte.
          </p>
          <a
            href="/contato"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 inline-block"
          >
            Contatar Suporte
          </a>
        </div>
      </section>
    </main>
  );
}
