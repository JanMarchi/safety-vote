
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Vote, ArrowLeft } from 'lucide-react';

const TermosServico = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
              <Vote className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">SafetyPro</h1>
              <p className="text-sm text-gray-600">Sistema Safety Vote</p>
            </div>
          </Link>
          
          <Button variant="outline" asChild className="mb-4">
            <Link to="/" className="flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Termos de Serviço</CardTitle>
            <p className="text-gray-600">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-bold mb-4">1. Aceitação dos Termos</h2>
                <p className="text-gray-700">
                  Ao acessar e usar o SafetyPro, você concorda em cumprir e estar vinculado a estes Termos de Serviço. 
                  Se você não concordar com qualquer parte destes termos, não deve usar nosso serviço.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">2. Descrição do Serviço</h2>
                <p className="text-gray-700">
                  O SafetyPro é uma plataforma digital para realização de eleições CIPA (Comissão Interna de Prevenção de Acidentes) 
                  em conformidade com a NR-5 e legislação trabalhista brasileira.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">3. Elegibilidade e Cadastro</h2>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Apenas empresas legalmente constituídas no Brasil podem usar o serviço</li>
                  <li>O usuário deve ter autoridade para representar a empresa</li>
                  <li>Informações de cadastro devem ser precisas e atualizadas</li>
                  <li>É responsabilidade da empresa manter a segurança das credenciais de acesso</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">4. Conformidade CIPA e NR-5</h2>
                <p className="text-gray-700">
                  O SafetyPro foi desenvolvido para atender aos requisitos da Norma Regulamentadora NR-5, incluindo:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Processo eleitoral democrático e transparente</li>
                  <li>Voto secreto e anônimo</li>
                  <li>Registro e auditoria completa do processo</li>
                  <li>Relatórios oficiais para apresentação ao Ministério do Trabalho</li>
                  <li>Conformidade com cronogramas estabelecidos pela legislação</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">5. Planos e Cobrança</h2>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Trial gratuito de 7 dias com funcionalidades completas</li>
                  <li>Upgrade automático após o período de trial</li>
                  <li>Preços baseados no número de colaboradores da empresa</li>
                  <li>Cobrança mensal recorrente via cartão de crédito</li>
                  <li>Cancelamento pode ser feito até o 6º dia do trial</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">6. Proteção de Dados (LGPD)</h2>
                <p className="text-gray-700">
                  Estamos comprometidos com a proteção de dados pessoais conforme a Lei Geral de Proteção de Dados (LGPD):
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Dados são coletados apenas para finalidades específicas da eleição CIPA</li>
                  <li>Consentimento explícito para tratamento de dados pessoais</li>
                  <li>Direito à portabilidade, correção e exclusão de dados</li>
                  <li>Criptografia e segurança de dados em trânsito e em repouso</li>
                  <li>Retenção de dados apenas pelo período necessário</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">7. Segurança e Integridade</h2>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Sistema de autenticação robusta com tokens únicos</li>
                  <li>Chaves de votação individuais e descartáveis</li>
                  <li>Hash criptográfico para garantia de integridade</li>
                  <li>Logs de auditoria para rastreabilidade</li>
                  <li>Backup automático e redundância de dados</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">8. Responsabilidades do Cliente</h2>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Fornecer informações precisas sobre colaboradores e candidatos</li>
                  <li>Cumprir cronogramas eleitorais conforme NR-5</li>
                  <li>Garantir que eleitores tenham acesso às chaves de votação</li>
                  <li>Manter confidencialidade das credenciais de acesso</li>
                  <li>Comunicar adequadamente o processo aos colaboradores</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">9. Limitações de Responsabilidade</h2>
                <p className="text-gray-700">
                  O SafetyPro não se responsabiliza por danos decorrentes de uso inadequado da plataforma, 
                  falhas na conexão de internet do cliente, ou descumprimento das orientações de uso.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">10. Modificações dos Termos</h2>
                <p className="text-gray-700">
                  Reservamo-nos o direito de modificar estes termos a qualquer momento. 
                  Clientes serão notificados sobre mudanças significativas com antecedência mínima de 30 dias.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">11. Contato</h2>
                <p className="text-gray-700">
                  Para dúvidas sobre estes termos, entre em contato através do nosso suporte técnico 
                  ou pelo e-mail: juridico@safetypro.com.br
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermosServico;
