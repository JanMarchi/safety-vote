/**
 * Preços (Pricing Page)
 * Story 5.2
 */

import React, { useState } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Preços - Safety Vote',
  description: 'Planos de preço transparentes para eleições digitais. Escolha o plano ideal para sua organização.',
  openGraph: {
    title: 'Preços - Safety Vote',
    description: 'Planos acessíveis e escaláveis',
  },
};

const pricingTiers = [
  {
    name: 'Básico',
    price: 'R$ 99',
    period: '/mês',
    description: 'Para pequenas organizações',
    features: ['Até 100 eleitores', 'Eleições ilimitadas', 'Suporte por email', 'Relatórios básicos'],
    cta: 'Começar',
    highlighted: false,
  },
  {
    name: 'Profissional',
    price: 'R$ 499',
    period: '/mês',
    description: 'Para médias empresas',
    features: [
      'Até 10.000 eleitores',
      'Eleições ilimitadas',
      'Suporte prioritário',
      'Relatórios avançados',
      'Integrações API',
      'SSO/SAML',
    ],
    cta: 'Começar',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Para grandes organizações',
    features: [
      'Eleitores ilimitados',
      'Eleições ilimitadas',
      'Suporte 24/7 dedicado',
      'Análise customizada',
      'Integrações avançadas',
      'SLA garantido 99.9%',
      'Treinamento incluído',
    ],
    cta: 'Contatar Vendas',
    highlighted: false,
  },
];

const comparison = [
  { feature: 'Eleições ilimitadas', basic: true, pro: true, enterprise: true },
  { feature: 'Criptografia AES-256', basic: true, pro: true, enterprise: true },
  { feature: 'Auditoria completa', basic: true, pro: true, enterprise: true },
  { feature: 'Suporte 24/7', basic: false, pro: false, enterprise: true },
  { feature: 'API REST', basic: false, pro: true, enterprise: true },
  { feature: 'SSO/SAML', basic: false, pro: true, enterprise: true },
  { feature: 'SLA 99.9%', basic: false, pro: false, enterprise: true },
];

export default function PrecosPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  return (
    <main className="min-h-screen bg-slate-950">
      {/* Hero */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">Preços Transparentes</h1>
        <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
          Escolha o plano ideal para sua organização. Sem surpresas, sem taxas ocultas.
        </p>

        {/* Billing Toggle */}
        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              billingCycle === 'annual'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Anual (20% desconto)
          </button>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, idx) => (
              <div
                key={idx}
                className={`rounded-lg p-8 transition-all ${
                  tier.highlighted
                    ? 'bg-blue-600 text-white border-2 border-blue-500 scale-105'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}
              >
                {tier.highlighted && (
                  <div className="bg-blue-500 text-blue-100 text-sm font-semibold py-1 px-3 rounded mb-4 inline-block">
                    Mais Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <p className="text-sm mb-6 opacity-90">{tier.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className="text-lg">{tier.period}</span>
                </div>
                <button
                  className={`w-full py-3 rounded-lg font-semibold mb-8 transition-colors ${
                    tier.highlighted
                      ? 'bg-white text-blue-600 hover:bg-slate-100'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {tier.cta}
                </button>
                <ul className="space-y-3">
                  {tier.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-center">
                      <span className="mr-3">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Comparação de Funcionalidades</h2>
          <div className="bg-slate-900 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-800">
                <tr>
                  <th className="p-4 text-left text-white font-semibold">Funcionalidade</th>
                  <th className="p-4 text-center text-white font-semibold">Básico</th>
                  <th className="p-4 text-center text-white font-semibold">Profissional</th>
                  <th className="p-4 text-center text-white font-semibold">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, idx) => (
                  <tr key={idx} className="border-t border-slate-700">
                    <td className="p-4 text-slate-300">{row.feature}</td>
                    <td className="p-4 text-center text-green-500">{row.basic ? '✓' : '—'}</td>
                    <td className="p-4 text-center text-green-500">{row.pro ? '✓' : '—'}</td>
                    <td className="p-4 text-center text-green-500">{row.enterprise ? '✓' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Perguntas Frequentes</h2>
          <div className="space-y-6">
            <div className="bg-slate-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">Posso testar antes de pagar?</h3>
              <p className="text-slate-400">Sim, oferecemos 14 dias de teste gratuito com acesso completo.</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">Existe contrato de longo prazo?</h3>
              <p className="text-slate-400">Não, você pode cancelar quando quiser. Sem compromissos.</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">E se precisar de funcionalidades customizadas?</h3>
              <p className="text-slate-400">Nosso plano Enterprise oferece customizações. Entre em contato com vendas.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
