
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Vote, ArrowLeft, Shield, Lock, Eye, Database } from 'lucide-react';

const PoliticaPrivacidade = () => {
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
            <CardTitle className="text-3xl flex items-center">
              <Shield className="w-8 h-8 mr-3 text-blue-600" />
              Política de Privacidade
            </CardTitle>
            <p className="text-gray-600">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <Eye className="w-6 h-6 mr-2 text-green-600" />
                  1. Informações que Coletamos
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">Dados da Empresa:</h3>
                    <ul className="list-disc pl-6 space-y-1 text-gray-700">
                      <li>Razão social, CNPJ, endereço</li>
                      <li>Dados de contato (telefone, e-mail)</li>
                      <li>Número de colaboradores</li>
                      <li>Setor de atividade</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold">Dados dos Usuários (RH/SESMT):</h3>
                    <ul className="list-disc pl-6 space-y-1 text-gray-700">
                      <li>Nome completo, CPF, e-mail</li>
                      <li>Cargo e função na empresa</li>
                      <li>Telefone para contato</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold">Dados dos Eleitores:</h3>
                    <ul className="list-disc pl-6 space-y-1 text-gray-700">
                      <li>Nome completo, CPF</li>
                      <li>E-mail e telefone para recebimento de chaves</li>
                      <li>Setor/departamento de trabalho</li>
                      <li>Status de elegibilidade para CIPA</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold">Dados dos Candidatos:</h3>
                    <ul className="list-disc pl-6 space-y-1 text-gray-700">
                      <li>Nome completo, CPF</li>
                      <li>Foto para identificação na urna</li>
                      <li>Biografia/propostas (opcional)</li>
                      <li>Declaração de aceite da candidatura</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <Database className="w-6 h-6 mr-2 text-blue-600" />
                  2. Como Usamos suas Informações
                </h2>
                <p className="text-gray-700 mb-4">
                  Utilizamos os dados coletados exclusivamente para as seguintes finalidades:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Execução do Processo Eleitoral:</strong> Organizar e conduzir eleições CIPA conforme NR-5</li>
                  <li><strong>Autenticação e Segurança:</strong> Verificar identidade e garantir integridade do voto</li>
                  <li><strong>Comunicação:</strong> Enviar chaves de votação, notificações e resultados</li>
                  <li><strong>Relatórios Legais:</strong> Gerar documentação exigida pela legislação trabalhista</li>
                  <li><strong>Suporte Técnico:</strong> Prestar assistência durante o processo eleitoral</li>
                  <li><strong>Melhoria do Serviço:</strong> Análises agregadas e anônimas para aprimoramento</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <Lock className="w-6 h-6 mr-2 text-purple-600" />
                  3. Base Legal para Tratamento (LGPD)
                </h2>
                <div className="space-y-3 text-gray-700">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p><strong>Execução de Contrato:</strong> Tratamento necessário para execução do contrato de prestação de serviços</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p><strong>Cumprimento de Obrigação Legal:</strong> Atendimento à NR-5 e legislação trabalhista</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p><strong>Consentimento:</strong> Para envio de comunicações não obrigatórias e melhorias do serviço</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">4. Segurança e Proteção dos Dados</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Criptografia:</h3>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• HTTPS/TLS em todas as comunicações</li>
                      <li>• Dados em repouso criptografados</li>
                      <li>• Hash irreversível para votos</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Controle de Acesso:</h3>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Autenticação multifator</li>
                      <li>• Tokens únicos e temporários</li>
                      <li>• Logs de auditoria completos</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Infraestrutura:</h3>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Servidores em data centers certificados</li>
                      <li>• Backup automático e redundância</li>
                      <li>• Monitoramento 24/7</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Anonimização:</h3>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Votos completamente anônimos</li>
                      <li>• Impossibilidade de rastreamento</li>
                      <li>• Chaves descartáveis pós-votação</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">5. Compartilhamento de Dados</h2>
                <p className="text-gray-700 mb-4">Não compartilhamos dados pessoais com terceiros, exceto:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Autoridades Competentes:</strong> Quando exigido por lei ou decisão judicial</li>
                  <li><strong>Prestadores de Serviço:</strong> Parceiros técnicos sob contrato de confidencialidade (ex: envio de e-mails)</li>
                  <li><strong>Transferência de Negócios:</strong> Em caso de fusão, aquisição ou venda de ativos (com notificação prévia)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">6. Retenção de Dados</h2>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <ul className="space-y-2 text-gray-700">
                    <li><strong>Dados da Eleição:</strong> Mantidos por 5 anos conforme legislação trabalhista</li>
                    <li><strong>Dados de Candidatos:</strong> Removidos após conclusão do mandato CIPA</li>
                    <li><strong>Chaves de Votação:</strong> Destruídas imediatamente após o encerramento da eleição</li>
                    <li><strong>Logs de Auditoria:</strong> Mantidos por período legal mínimo de 5 anos</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">7. Seus Direitos (LGPD)</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Direitos Disponíveis:</h3>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>✓ Confirmação de tratamento</li>
                      <li>✓ Acesso aos dados</li>
                      <li>✓ Correção de dados incompletos</li>
                      <li>✓ Anonimização ou exclusão</li>
                      <li>✓ Portabilidade</li>
                      <li>✓ Informações sobre compartilhamento</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Como Exercer:</h3>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>📧 E-mail: privacidade@safetypro.com.br</li>
                      <li>📞 Telefone: (11) 9999-9999</li>
                      <li>⏱️ Resposta em até 15 dias</li>
                      <li>🆔 Identificação necessária</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">8. Cookies e Tecnologias</h2>
                <p className="text-gray-700">
                  Utilizamos cookies técnicos essenciais para funcionamento da plataforma. 
                  Não utilizamos cookies de rastreamento ou publicidade. Você pode desabilitar cookies, 
                  mas isso pode afetar a funcionalidade do sistema.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">9. Alterações nesta Política</h2>
                <p className="text-gray-700">
                  Esta política pode ser atualizada periodicamente. Mudanças significativas serão comunicadas 
                  com antecedência mínima de 30 dias através dos canais de contato cadastrados.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">10. Contato e DPO</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 mb-2">
                    <strong>Encarregado de Proteção de Dados (DPO):</strong>
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>Nome: [Nome do DPO]</li>
                    <li>E-mail: dpo@safetypro.com.br</li>
                    <li>Telefone: (11) 9999-9999</li>
                    <li>Endereço: [Endereço da empresa]</li>
                  </ul>
                </div>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PoliticaPrivacidade;
