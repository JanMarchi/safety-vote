import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Users, Vote, Shield, CheckCircle, AlertCircle, Calendar, Download, BookOpen, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';

const CipaCompliance = () => {
  const nr5Requirements = [
    {
      item: "5.6.1",
      title: "Processo Eleitoral",
      description: "O processo eleitoral deve ser democrático, com participação de todos os empregados.",
      status: "Conforme",
      implementation: "Sistema de votação digital com acesso garantido a todos os funcionários elegíveis."
    },
    {
      item: "5.6.2",
      title: "Sigilo do Voto",
      description: "O voto deve ser secreto e a apuração pública.",
      status: "Conforme",
      implementation: "Criptografia end-to-end garante o sigilo, com apuração transparente e pública."
    },
    {
      item: "5.6.3",
      title: "Candidatos",
      description: "Inscrição livre de candidatos entre os empregados interessados.",
      status: "Conforme",
      implementation: "Módulo de inscrição de candidatos com validação automática de elegibilidade."
    },
    {
      item: "5.6.4",
      title: "Comissão Eleitoral",
      description: "Constituição de comissão eleitoral para conduzir o processo.",
      status: "Conforme",
      implementation: "Sistema de gestão de comissão eleitoral com controles e permissões específicas."
    },
    {
      item: "5.6.5",
      title: "Documentação",
      description: "Manutenção de documentação completa do processo eleitoral.",
      status: "Conforme",
      implementation: "Geração automática de atas, relatórios e documentos oficiais."
    }
  ];

  const electionSteps = [
    {
      step: 1,
      title: "Convocação",
      description: "Publicação do edital de convocação para eleição da CIPA",
      duration: "60 dias antes",
      documents: ["Edital de Convocação", "Cronograma Eleitoral"]
    },
    {
      step: 2,
      title: "Inscrições",
      description: "Período para inscrição de candidatos",
      duration: "15 dias",
      documents: ["Ficha de Inscrição", "Lista de Candidatos"]
    },
    {
      step: 3,
      title: "Campanha",
      description: "Período de campanha eleitoral",
      duration: "15 dias",
      documents: ["Regras de Campanha", "Material de Divulgação"]
    },
    {
      step: 4,
      title: "Votação",
      description: "Realização da votação digital",
      duration: "1 dia",
      documents: ["Ata de Votação", "Relatório de Participação"]
    },
    {
      step: 5,
      title: "Apuração",
      description: "Apuração pública dos votos",
      duration: "Imediata",
      documents: ["Ata de Apuração", "Resultado Final"]
    },
    {
      step: 6,
      title: "Posse",
      description: "Posse dos eleitos e início do mandato",
      duration: "30 dias após",
      documents: ["Ata de Posse", "Termo de Compromisso"]
    }
  ];

  const legalFramework = [
    {
      law: "CLT - Art. 163 a 165",
      description: "Consolidação das Leis do Trabalho - Disposições sobre CIPA",
      scope: "Base legal para constituição da CIPA"
    },
    {
      law: "NR-5",
      description: "Norma Regulamentadora 5 - Comissão Interna de Prevenção de Acidentes",
      scope: "Regulamentação específica da CIPA"
    },
    {
      law: "Lei 6.514/77",
      description: "Altera o Capítulo V do Título II da CLT",
      scope: "Segurança e medicina do trabalho"
    },
    {
      law: "Portaria 3.214/78",
      description: "Aprova as Normas Regulamentadoras do Ministério do Trabalho",
      scope: "Normas de segurança e saúde no trabalho"
    }
  ];

  const complianceChecklist = [
    { item: "Dimensionamento correto da CIPA conforme quadro I da NR-5", status: true },
    { item: "Processo eleitoral democrático e transparente", status: true },
    { item: "Sigilo do voto garantido", status: true },
    { item: "Participação de todos os empregados elegíveis", status: true },
    { item: "Comissão eleitoral constituída", status: true },
    { item: "Documentação completa do processo", status: true },
    { item: "Apuração pública dos resultados", status: true },
    { item: "Atas e relatórios oficiais gerados", status: true },
    { item: "Backup e arquivamento seguro dos dados", status: true },
    { item: "Auditoria e rastreabilidade completa", status: true }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-800 rounded-lg flex items-center justify-center">
              <Scale className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Conformidade CIPA</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Atendimento integral à NR-5 e demais normas regulamentadoras para eleições da CIPA
          </p>
        </div>

        <Tabs defaultValue="nr5" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="nr5">NR-5</TabsTrigger>
            <TabsTrigger value="process">Processo</TabsTrigger>
            <TabsTrigger value="legal">Marco Legal</TabsTrigger>
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
          </TabsList>

          {/* NR-5 Compliance */}
          <TabsContent value="nr5" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-6 h-6 mr-3 text-green-600" />
                  Atendimento à NR-5
                </CardTitle>
                <CardDescription>
                  Conformidade com todos os requisitos da Norma Regulamentadora 5
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {nr5Requirements.map((req, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline">{req.item}</Badge>
                          <h3 className="font-semibold">{req.title}</h3>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          {req.status}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-3">{req.description}</p>
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-sm text-blue-800">
                          <strong>Implementação:</strong> {req.implementation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Election Process */}
          <TabsContent value="process" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Vote className="w-6 h-6 mr-3 text-blue-600" />
                  Processo Eleitoral
                </CardTitle>
                <CardDescription>
                  Etapas do processo eleitoral conforme NR-5
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {electionSteps.map((step, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-lg">{step.title}</h3>
                          <Badge variant="outline">{step.duration}</Badge>
                        </div>
                        <p className="text-gray-600 mb-3">{step.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {step.documents.map((doc, docIndex) => (
                            <Badge key={docIndex} variant="secondary">
                              <FileText className="w-3 h-3 mr-1" />
                              {doc}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Legal Framework */}
          <TabsContent value="legal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="w-6 h-6 mr-3 text-purple-600" />
                  Marco Legal
                </CardTitle>
                <CardDescription>
                  Legislação aplicável às eleições da CIPA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {legalFramework.map((law, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h3 className="font-semibold text-lg mb-2">{law.law}</h3>
                      <p className="text-gray-600 mb-3">{law.description}</p>
                      <Badge variant="outline">{law.scope}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Documentos de Referência</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button variant="outline" className="justify-start h-auto p-4">
                    <div className="text-left">
                      <div className="font-medium">NR-5 Atualizada</div>
                      <div className="text-sm text-gray-600">Texto completo da norma</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start h-auto p-4">
                    <div className="text-left">
                      <div className="font-medium">Manual da CIPA</div>
                      <div className="text-sm text-gray-600">Guia prático</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start h-auto p-4">
                    <div className="text-left">
                      <div className="font-medium">Modelos de Documentos</div>
                      <div className="text-sm text-gray-600">Atas e formulários</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compliance Checklist */}
          <TabsContent value="checklist" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="w-6 h-6 mr-3 text-green-600" />
                  Checklist de Conformidade
                </CardTitle>
                <CardDescription>
                  Verificação de todos os requisitos atendidos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {complianceChecklist.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-green-800">{item.item}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <Shield className="w-6 h-6 text-blue-600" />
                    <h3 className="font-semibold text-blue-900">Status de Conformidade</h3>
                  </div>
                  <p className="text-blue-800">
                    ✅ <strong>100% Conforme</strong> - Todos os requisitos da NR-5 são atendidos pelo sistema SafetyPro.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Certificação e Auditoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Auditoria Interna</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Verificação mensal de conformidade com todos os requisitos
                    </p>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Último Relatório
                    </Button>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Auditoria Externa</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Certificação anual por auditoria independente
                    </p>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Certificado
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Contact */}
        <Card className="mt-8 border-0 shadow-lg bg-green-50">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-green-900">
              Dúvidas sobre Conformidade?
            </CardTitle>
            <CardDescription className="text-green-700">
              Nossa equipe jurídica está disponível para esclarecer questões sobre conformidade
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-green-600 hover:bg-green-700">
                <Scale className="w-4 h-4 mr-2" />
                Contatar Equipe Jurídica
              </Button>
              <Button variant="outline" asChild>
                <Link to="/security">
                  <Shield className="w-4 h-4 mr-2" />
                  Ver Segurança
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CipaCompliance;