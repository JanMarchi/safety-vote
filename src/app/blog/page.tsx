/**
 * Blog (Blog Listing)
 * Story 5.6
 */

import React, { useState } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog - Safety Vote',
  description: 'Artigos, tutoriais e notícias sobre eleições digitais, segurança e melhores práticas.',
  openGraph: {
    title: 'Blog - Safety Vote',
  },
};

const blogPosts = [
  {
    id: 1,
    title: 'Como Garantir a Segurança de Eleições Digitais',
    excerpt: 'Explicamos os princípios de segurança por trás do Safety Vote e como protegemos suas eleições.',
    date: '2026-03-01',
    author: 'João Silva',
    category: 'Segurança',
    readingTime: '8 min',
  },
  {
    id: 2,
    title: 'Melhores Práticas para Eleições Organizacionais',
    excerpt: 'Dicas e boas práticas para garantir que suas eleições internas sejam justas e transparentes.',
    date: '2026-02-28',
    author: 'Maria Santos',
    category: 'Tutorial',
    readingTime: '5 min',
  },
  {
    id: 3,
    title: 'LGPD e Proteção de Dados em Eleições',
    excerpt: 'Como o Safety Vote garante conformidade com a LGPD e protege dados pessoais dos eleitores.',
    date: '2026-02-25',
    author: 'Carlos Oliveira',
    category: 'Conformidade',
    readingTime: '10 min',
  },
  {
    id: 4,
    title: 'Acessibilidade em Eleições: Incluindo Todos',
    excerpt: 'Entenda como Safety Vote implementa WCAG 2.1 AA para eleições acessíveis a todos.',
    date: '2026-02-20',
    author: 'Ana Costa',
    category: 'Acessibilidade',
    readingTime: '7 min',
  },
  {
    id: 5,
    title: 'Case Study: Eleição em Startup com 500 Colaboradores',
    excerpt: 'Veja como uma startup usou Safety Vote para realizar eleição de conselho com 99.9% de participação.',
    date: '2026-02-15',
    author: 'Pedro Martins',
    category: 'Case Study',
    readingTime: '6 min',
  },
  {
    id: 6,
    title: 'Integração com Sistemas Existentes: Um Guia',
    excerpt: 'Saiba como integrar o Safety Vote com sua infraestrutura de RH e sistemas internos.',
    date: '2026-02-10',
    author: 'Lucas Ferreira',
    category: 'Tutorial',
    readingTime: '9 min',
  },
];

const categories = ['Todos', 'Segurança', 'Tutorial', 'Conformidade', 'Acessibilidade', 'Case Study'];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = blogPosts.filter((post) => {
    const categoryMatch = selectedCategory === 'Todos' || post.category === selectedCategory;
    const searchMatch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && searchMatch;
  });

  return (
    <main className="min-h-screen bg-slate-950">
      {/* Hero */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 text-center bg-slate-900">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">Blog</h1>
          <p className="text-lg text-slate-300 mb-8">
            Artigos, tutoriais e notícias sobre eleições digitais, segurança e melhores práticas.
          </p>

          {/* Search */}
          <input
            type="text"
            placeholder="Procurar artigos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-700 focus:border-blue-500 outline-none"
          />
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Posts Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {filtered.map((post) => (
              <article
                key={post.id}
                className="bg-slate-900 p-6 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                    {post.category}
                  </span>
                  <span className="text-slate-500 text-sm">{post.readingTime}</span>
                </div>

                <h2 className="text-xl font-bold text-white mb-3 hover:text-blue-400">{post.title}</h2>
                <p className="text-slate-400 mb-4">{post.excerpt}</p>

                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>{post.author}</span>
                  <span>{new Date(post.date).toLocaleDateString('pt-BR')}</span>
                </div>
              </article>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-400">Nenhum artigo encontrado.</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Receba Atualizações</h2>
          <p className="text-slate-300 mb-6">
            Inscreva-se na newsletter para receber os últimos artigos e notícias.
          </p>
          <form className="flex gap-2">
            <input
              type="email"
              placeholder="seu-email@exemplo.com"
              className="flex-1 px-4 py-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:border-blue-500 outline-none"
            />
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Inscrever
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
