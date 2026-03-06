
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Vote, ArrowLeft, Shield, Lock, Key, Eye, Database, Server, CheckCircle } from 'lucide-react';

const Seguranca = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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

        {/* Hero Section */}
        <Card className="mb-8 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Segurança e Conformidade</h1>
            <p className="text-xl opacity-90">
              Tecnologia de ponta para garantir integridade, transparência e conformidade legal 
              em todas as eleições CIPA
            </p>
          </CardContent>
        </Card>

        {/* Security Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-green-200">
            <CardHeader>
              <Lock className="w-8 h-8 text-green-600 mb-2" />
              <CardTitle className="text-lg">Criptografia Avançada</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• HTTPS/TLS 1.3 em todas as comunicações</li>
                <li>• AES-256 para dados em repouso</li>
                <li>• Hash SHA-256 para integridade dos votos</li>
                <li>• Certificados SSL de alta segurança</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardHeader>
              <Key className="w-8 h-8 text-blue-600 mb-2" />
              <CardTitle className="text-lg">Chaves Únicas</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Chaves individuais por eleitor</li>
                <li>• Tokens descartáveis pós-votação</li>
                <li>• Validade restrita ao período eleitoral</li>
                <li>• Impossibilidade de reutilização</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-purple-200">
            <CardHeader>
              <Eye className="w-8 h-8 text-purple-600 mb-2" />
              <CardTitle className="text-lg">Anonimato Garantido</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Voto secreto e anônimo</li>
                <li>• Separação completa identidade/voto</li>
                <li>• Hash irreversível dos votos</li>
                <li>• Auditoria sem exposição do eleitor</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-orange-200">
            <CardHeader>
              <Database className="w-8 h-8 text-orange-600 mb-2" />
              <CardTitle className="text-lg">Backup e Redundância</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Backup automático em tempo real</li>
                <li>• Múltiplas cópias de segurança</li>
                <li>• Recuperação de desastres testada</li>
                <li>• Uptime garantido de 99.9%</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardHeader>
              <Server className="w-8 h-8 text-red-600 mb-2" />
              <CardTitle className="text-lg">Infraestrutura Segura</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Data centers certificados ISO 27001</li>
                <li>• Firewalls e sistemas de detecção</li>
                <li>• Monitoramento 24/7</li>
                <li>• Conformidade LGPD nativa</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-indigo-200">
            <CardHeader>
              <CheckCircle className="w-8 h-8 text-indigo-600 mb-2" />
              <CardTitle className="text-lg">Auditoria Completa</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Logs detalhados de todas as ações</li>
                <li>• Trilha de auditoria imutável</li>
                <li>• Relatórios de conformidade</li>
                <li>• Verificação independente possível</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Process Security */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Processo de Votação Seguro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold mb-2">Autenticação</h3>
                <p className="text-sm text-gray-600">Verificação de identidade com chave única enviada por e-mail/WhatsApp</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold mb-2">Votação</h3>
                <p className="text-sm text-gray-600">Voto criptografado e anonimizado antes do armazenamento</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold mb-2">Confirmação</h3>
                <p className="text-sm text-gray-600">Voto confirmado e chave invalidada permanentemente</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-orange-600 font-bold">4</span>
                </div>
                <h3 className="font-semibold mb-2">Auditoria</h3>
                <p className="text-sm text-gray-600">Log completo sem exposição da identidade do eleitor</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compliance */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Conformidade Legal e Normativa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">NR-5 (Norma Regulamentadora)</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>Processo eleitoral democrático e transparente</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>Voto direto e secreto</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>Documentação completa para fiscalização</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>Cronograma conforme legislação</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>Relatórios oficiais para o MTE</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">LGPD (Lei Geral de Proteção de Dados)</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>Consentimento explícito para tratamento de dados</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>Finalidade específica e limitada</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>Direitos do titular respeitados</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>Segurança técnica e administrativa</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>DPO (Data Protection Officer) designado</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Certifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Certificações e Padrões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="bg-blue-50 p-6 rounded-lg">
                <Shield className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">ISO 27001</h3>
                <p className="text-sm text-gray-600">Padrão internacional para gestão de segurança da informação</p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <Lock className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">LGPD Compliant</h3>
                <p className="text-sm text-gray-600">Total conformidade com a Lei Geral de Proteção de Dados</p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg">
                <CheckCircle className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">SOC 2 Type II</h3>
                <p className="text-sm text-gray-600">Auditoria independente de controles de segurança</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Seguranca;
