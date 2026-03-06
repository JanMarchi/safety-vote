import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Lock, FileCheck, Users, AlertTriangle, CheckCircle, Eye, Download, Clock, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const Security = () => {
  const securityFeatures = [
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Criptografia End-to-End",
      description: "Todos os votos são criptografados com AES-256, garantindo total sigilo eleitoral.",
      status: "Ativo"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Auditoria Completa",
      description: "Logs detalhados de todas as ações para transparência e conformidade.",
      status: "Ativo"
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "Monitoramento em Tempo Real",
      description: "Acompanhamento contínuo da integridade do processo eleitoral.",
      status: "Ativo"
    },
    {
      icon: <FileCheck className="w-6 h-6" />,
      title: "Backup Automático",
      description: "Backups automáticos e redundantes para garantir a disponibilidade dos dados.",
      status: "Ativo"
    }
  ];

  const complianceItems = [
    {
      title: "NR-5 - CIPA",
      description: "Conformidade total com a Norma Regulamentadora 5 do Ministério do Trabalho",
      status: "Conforme",
      details: [
        "Processo eleitoral democrático",
        "Sigilo do voto garantido",
        "Transparência nos resultados",
        "Documentação completa"
      ]
    },
    {
      title: "LGPD",
      description: "Lei Geral de Proteção de Dados Pessoais",
      status: "Conforme",
      details: [
        "Consentimento explícito",
        "Minimização de dados",
        "Direito ao esquecimento",
        "Portabilidade de dados"
      ]
    },
    {
      title: "ISO 27001",
      description: "Padrão internacional de segurança da informação",
      status: "Certificado",
      details: [
        "Gestão de riscos",
        "Controles de segurança",
        "Melhoria contínua",
        "Auditoria independente"
      ]
    }
  ];

  const certifications = [
    {
      name: "ISO 27001:2013",
      issuer: "Bureau Veritas",
      validUntil: "2025-12-31",
      icon: <Award className="w-8 h-8 text-blue-600" />
    },
    {
      name: "SOC 2 Type II",
      issuer: "KPMG",
      validUntil: "2025-06-30",
      icon: <Shield className="w-8 h-8 text-green-600" />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Segurança e Conformidade</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Garantimos a máxima segurança e conformidade com todas as normas regulamentadoras e leis aplicáveis
          </p>
        </div>

        {/* Security Features */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recursos de Segurança</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {securityFeatures.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardHeader className="text-center pb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3 text-blue-600">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {feature.status}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm text-center">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Compliance */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Conformidade Regulatória</h2>
          <div className="grid lg:grid-cols-3 gap-6">
            {complianceItems.map((item, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {item.status}
                    </Badge>
                  </div>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {item.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Certifications */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Certificações</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {certifications.map((cert, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    {cert.icon}
                    <div>
                      <CardTitle className="text-xl">{cert.name}</CardTitle>
                      <CardDescription>Emitido por: {cert.issuer}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      Válido até: {new Date(cert.validUntil).toLocaleDateString('pt-BR')}
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Baixar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Security Policies */}
        <section className="mb-12">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <FileCheck className="w-6 h-6 mr-3 text-blue-600" />
                Políticas de Segurança
              </CardTitle>
              <CardDescription>
                Documentos e políticas que regem nossa operação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="text-left">
                    <div className="font-medium">Política de Privacidade</div>
                    <div className="text-sm text-gray-600">Como tratamos seus dados</div>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="text-left">
                    <div className="font-medium">Termos de Uso</div>
                    <div className="text-sm text-gray-600">Condições de utilização</div>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="text-left">
                    <div className="font-medium">Manual de Segurança</div>
                    <div className="text-sm text-gray-600">Procedimentos e controles</div>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="text-left">
                    <div className="font-medium">Plano de Contingência</div>
                    <div className="text-sm text-gray-600">Resposta a incidentes</div>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="text-left">
                    <div className="font-medium">Auditoria de Segurança</div>
                    <div className="text-sm text-gray-600">Relatórios de auditoria</div>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="text-left">
                    <div className="font-medium">Conformidade CIPA</div>
                    <div className="text-sm text-gray-600">Atendimento à NR-5</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Contact Security Team */}
        <section>
          <Card className="border-0 shadow-lg bg-blue-50">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-blue-900">
                Dúvidas sobre Segurança?
              </CardTitle>
              <CardDescription className="text-blue-700">
                Nossa equipe de segurança está disponível para esclarecer qualquer questão
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Shield className="w-4 h-4 mr-2" />
                  Contatar Equipe de Segurança
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/reports">
                    <FileCheck className="w-4 h-4 mr-2" />
                    Ver Relatórios de Auditoria
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Security;