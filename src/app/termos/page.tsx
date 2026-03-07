/**
 * Termos de Serviço
 * Story 5.12
 */

import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Termos de Serviço - Safety Vote',
  description: 'Termos e condições de uso da plataforma Safety Vote.',
  openGraph: {
    title: 'Termos de Serviço - Safety Vote',
  },
};

const tableOfContents = [
  { id: 'aceitacao', title: '1. Aceitação dos Termos' },
  { id: 'licenca', title: '2. Licença de Uso' },
  { id: 'disclaimer', title: '3. Aviso de Isenção de Responsabilidade' },
  { id: 'limitacoes', title: '4. Limitação de Responsabilidade' },
  { id: 'acuracia', title: '5. Precisão de Materiais' },
  { id: 'links', title: '6. Links' },
  { id: 'modificacoes', title: '7. Modificações' },
  { id: 'direito', title: '8. Direito Aplicável' },
  { id: 'responsabilidades', title: '9. Responsabilidades do Usuário' },
  { id: 'propriedade', title: '10. Direitos de Propriedade Intelectual' },
  { id: 'proibidas', title: '11. Atividades Proibidas' },
  { id: 'terminacao', title: '12. Rescisão' },
  { id: 'disputas', title: '13. Resolução de Disputas' },
];

export default function TermosPage() {
  return (
    <main className="min-h-screen bg-slate-950">
      {/* Hero */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 text-center bg-slate-900">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Termos de Serviço</h1>
          <p className="text-slate-400 text-sm">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
      </section>

      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-4 gap-8">
          {/* Table of Contents */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <h2 className="text-lg font-bold text-white mb-4">Índice</h2>
              <nav className="space-y-2">
                {tableOfContents.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="block text-blue-400 hover:text-blue-300 text-sm transition-colors"
                  >
                    {item.title}
                  </a>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3 text-slate-300 space-y-8">
            <section id="aceitacao">
              <h2 className="text-2xl font-bold text-white mb-4">1. Aceitação dos Termos</h2>
              <p>
                Ao acessar e utilizar a plataforma Safety Vote, você aceita ficar vinculado a estes Termos de
                Serviço. Se você não concorda com alguma parte destes termos, você não pode usar o serviço.
              </p>
            </section>

            <section id="licenca">
              <h2 className="text-2xl font-bold text-white mb-4">2. Licença de Uso</h2>
              <p>
                Safety Vote concede a você uma licença limitada, não exclusiva e revogável para usar a plataforma
                de acordo com estes Termos. Você não pode:
              </p>
              <ul className="list-disc list-inside mt-3 space-y-2">
                <li>Reproduzir ou copiar materiais sem autorização</li>
                <li>Transmitir ou vender informações obtidas pela plataforma</li>
                <li>Modificar ou alterar o código da plataforma</li>
                <li>Usar a plataforma para fins ilegais</li>
              </ul>
            </section>

            <section id="disclaimer">
              <h2 className="text-2xl font-bold text-white mb-4">3. Aviso de Isenção de Responsabilidade</h2>
              <p>
                A plataforma Safety Vote é fornecida "como está". Não fazemos garantias, expressas ou implícitas,
                quanto à precisão, confiabilidade ou disponibilidade ininterrupta do serviço.
              </p>
            </section>

            <section id="limitacoes">
              <h2 className="text-2xl font-bold text-white mb-4">4. Limitação de Responsabilidade</h2>
              <p>
                Em nenhuma circunstância Safety Vote será responsável por danos indiretos, incidentais, especiais
                ou consequentes resultantes do uso (ou incapacidade de uso) da plataforma.
              </p>
            </section>

            <section id="acuracia">
              <h2 className="text-2xl font-bold text-white mb-4">5. Precisão de Materiais</h2>
              <p>
                Embora façamos todos os esforços para garantir a precisão das informações, Safety Vote não é
                responsável por erros ou omissões. Você concorda em verificar as informações críticas antes de
                usar.
              </p>
            </section>

            <section id="links">
              <h2 className="text-2xl font-bold text-white mb-4">6. Links</h2>
              <p>
                Safety Vote pode conter links para sites terceirizados. Não somos responsáveis pelo conteúdo,
                precisão ou práticas de privacidade desses sites.
              </p>
            </section>

            <section id="modificacoes">
              <h2 className="text-2xl font-bold text-white mb-4">7. Modificações</h2>
              <p>
                Safety Vote reserva o direito de modificar estes Termos a qualquer momento. As modificações
                entrarão em vigor quando publicadas. Seu uso continuado da plataforma constitui aceitação das
                modificações.
              </p>
            </section>

            <section id="direito">
              <h2 className="text-2xl font-bold text-white mb-4">8. Direito Aplicável</h2>
              <p>
                Estes Termos são governados pelas leis da República Federativa do Brasil. Qualquer litígio será
                resolvido nos tribunais brasileiros competentes.
              </p>
            </section>

            <section id="responsabilidades">
              <h2 className="text-2xl font-bold text-white mb-4">9. Responsabilidades do Usuário</h2>
              <p>Você é responsável por:</p>
              <ul className="list-disc list-inside mt-3 space-y-2">
                <li>Manter a confidencialidade de suas credenciais de acesso</li>
                <li>Notificar-nos imediatamente de abusos ou acesso não autorizado</li>
                <li>Cumprir com todas as leis e regulamentações aplicáveis</li>
                <li>Não interferir no funcionamento da plataforma</li>
              </ul>
            </section>

            <section id="propriedade">
              <h2 className="text-2xl font-bold text-white mb-4">10. Direitos de Propriedade Intelectual</h2>
              <p>
                Safety Vote e seu conteúdo são propriedade de Safety Vote ou de seus provedores de conteúdo e
                protegidos por leis de propriedade intelectual aplicáveis.
              </p>
            </section>

            <section id="proibidas">
              <h2 className="text-2xl font-bold text-white mb-4">11. Atividades Proibidas</h2>
              <p>Você não pode usar a plataforma para:</p>
              <ul className="list-disc list-inside mt-3 space-y-2">
                <li>Atividades ilícitas ou ilegais</li>
                <li>Bullying, assédio ou ameaças</li>
                <li>Spam ou envio em massa de mensagens</li>
                <li>Disseminação de vírus ou código malicioso</li>
              </ul>
            </section>

            <section id="terminacao">
              <h2 className="text-2xl font-bold text-white mb-4">12. Rescisão</h2>
              <p>
                Safety Vote pode rescindir sua conta e acesso à plataforma a qualquer momento, sem aviso prévio,
                se você violar estes Termos.
              </p>
            </section>

            <section id="disputas">
              <h2 className="text-2xl font-bold text-white mb-4">13. Resolução de Disputas</h2>
              <p>
                Antes de iniciar qualquer ação legal, você concorda em tentar resolver disputas amigavelmente
                através de negociação direta com Safety Vote. Se a negociação falhar, o assunto será submetido
                aos tribunais brasileiros competentes.
              </p>
            </section>

            {/* Footer */}
            <section className="mt-12 pt-8 border-t border-slate-700">
              <p className="text-sm text-slate-500">
                Se você tiver dúvidas sobre estes Termos, entre em contato através de{' '}
                <a href="mailto:legal@safetyvote.com" className="text-blue-400 hover:text-blue-300">
                  legal@safetyvote.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>

      {/* CTA */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-900">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-slate-300 mb-4">
            Também oferecemos{' '}
            <a href="#" className="text-blue-400 hover:text-blue-300">
              Política de Privacidade
            </a>{' '}
            e{' '}
            <a href="#" className="text-blue-400 hover:text-blue-300">
              Política de Cookies
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
