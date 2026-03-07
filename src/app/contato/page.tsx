/**
 * Contato (Contact Page)
 * Story 5.8
 */

'use client';

import React, { useState } from 'react';

const departments = [
  { value: 'sales', label: 'Vendas & Parcerias' },
  { value: 'support', label: 'Suporte Técnico' },
  { value: 'partnerships', label: 'Parcerias & Integrações' },
  { value: 'press', label: 'Imprensa & Mídia' },
  { value: 'other', label: 'Outro' },
];

const contactInfo = [
  { label: 'Email Geral', value: 'contato@safetyvote.com' },
  { label: 'Suporte Técnico', value: 'suporte@safetyvote.com' },
  { label: 'Vendas', value: 'vendas@safetyvote.com' },
  { label: 'Segurança', value: 'security@safetyvote.com' },
];

const businessHours = [
  { day: 'Segunda - Sexta', hours: '09:00 - 18:00 (Brasília)' },
  { day: 'Sábado - Domingo', hours: 'Fechado' },
];

export default function ContatoPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'sales',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você implementaria a chamada à API POST /api/contact
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', department: 'sales', message: '' });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <main className="min-h-screen bg-slate-950">
      {/* Hero */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 text-center bg-slate-900">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">Entre em Contato</h1>
          <p className="text-xl text-slate-300">
            Estamos aqui para ajudar. Envie sua mensagem e responderemos em breve.
          </p>
        </div>
      </section>

      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="md:col-span-1">
            <h2 className="text-2xl font-bold text-white mb-8">Informações de Contato</h2>

            <div className="space-y-6 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Departamentos</h3>
                <div className="space-y-3">
                  {contactInfo.map((info, idx) => (
                    <div key={idx}>
                      <p className="text-slate-400 text-sm mb-1">{info.label}</p>
                      <a
                        href={`mailto:${info.value}`}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        {info.value}
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Horário de Funcionamento</h3>
                <div className="space-y-2">
                  {businessHours.map((bh, idx) => (
                    <div key={idx}>
                      <p className="text-slate-400 text-sm">{bh.day}</p>
                      <p className="text-white">{bh.hours}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-600 p-4 rounded-lg">
                <p className="text-white text-sm font-semibold mb-2">⚡ Resposta Rápida</p>
                <p className="text-blue-100 text-sm">
                  Respondemos a todos os emails em até 24 horas.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-8">Enviar Mensagem</h2>

            {submitted && (
              <div className="bg-green-600 text-white p-4 rounded-lg mb-6">
                ✓ Mensagem enviada com sucesso! Entraremos em contato em breve.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-white font-semibold mb-2">Nome</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:border-blue-500 outline-none"
                  placeholder="Seu nome completo"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-white font-semibold mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:border-blue-500 outline-none"
                  placeholder="seu-email@exemplo.com"
                />
              </div>

              {/* Department */}
              <div>
                <label className="block text-white font-semibold mb-2">Departamento</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:border-blue-500 outline-none"
                >
                  {departments.map((dept) => (
                    <option key={dept.value} value={dept.value}>
                      {dept.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-white font-semibold mb-2">Mensagem</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:border-blue-500 outline-none resize-none"
                  placeholder="Descreva sua mensagem..."
                />
              </div>

              {/* Privacy */}
              <p className="text-slate-400 text-sm">
                Ao enviar esta mensagem, você concorda com nossa{' '}
                <a href="/termos" className="text-blue-400 hover:text-blue-300">
                  Política de Privacidade
                </a>
                .
              </p>

              {/* Submit */}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Enviar Mensagem
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Support Options */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Outras Formas de Ajuda</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <a
              href="/central-de-ajuda"
              className="bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors text-center"
            >
              <div className="text-4xl mb-3">❓</div>
              <h3 className="text-lg font-semibold text-white mb-2">Central de Ajuda</h3>
              <p className="text-slate-400">Encontre respostas para perguntas frequentes</p>
            </a>
            <a
              href="/documentacao"
              className="bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors text-center"
            >
              <div className="text-4xl mb-3">📚</div>
              <h3 className="text-lg font-semibold text-white mb-2">Documentação</h3>
              <p className="text-slate-400">Explore nossa documentação técnica</p>
            </a>
            <a
              href="/status"
              className="bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors text-center"
            >
              <div className="text-4xl mb-3">🟢</div>
              <h3 className="text-lg font-semibold text-white mb-2">Status do Sistema</h3>
              <p className="text-slate-400">Verifique o status de nossos serviços</p>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
