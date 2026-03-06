import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { CheckCircle, Users, Star, Crown, Zap } from 'lucide-react';

const PricingSection = () => {
  return (
    <section id="planos" className="py-16 sm:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Planos e Preços</h2>
          <p className="text-lg text-gray-600">
            Escolha o plano ideal para o porte da sua empresa. Comece gratuitamente por 7 dias e pague apenas pelo que usar.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {/* Plano Proporcional */}
          <Card className="relative shadow-xl border-2 border-blue-500 rounded-lg overflow-hidden">
            <div className="absolute top-0 right-0 m-3">
              <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                <Star className="w-3 h-3 mr-1" />
                Recomendado
              </div>
            </div>
            <CardHeader className="text-center pt-8 pb-6 bg-blue-50">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold">Plano Proporcional</CardTitle>
              <CardDescription className="text-gray-600">Preço justo baseado no seu tamanho</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900">A partir de R$ 99,90</span>
                <span className="text-gray-600 text-sm">/mês</span>
                <p className="text-sm text-blue-600 mt-1 font-medium">7 dias grátis • Upgrade automático</p>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm">Recursos inclusos:</h4>
                  <ul className="space-y-2">
                    {[ "Eleitores conforme colaboradores", "Eleições ilimitadas", "Suporte prioritário", "Relatórios avançados", "Backup automático", "Códigos WhatsApp", "Dashboard público" ].map(f => (
                      <li key={f} className="flex items-start"><CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" /><span className="text-sm text-gray-600">{f}</span></li>
                    ))}
                  </ul>
                </div>
              </div>
              <Button className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-base py-3" asChild>
                <Link to="/register">Começar Trial Gratuito</Link>
              </Button>
              <p className="text-xs text-gray-500 mt-3 text-center">Upgrade automático após 7 dias baseado no número de colaboradores.</p>
            </CardContent>
          </Card>

          {/* Plano Premium */}
          <Card className="shadow-xl border border-gray-200 rounded-lg overflow-hidden">
            <CardHeader className="text-center pt-8 pb-6 bg-gray-50">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold">Plano Premium</CardTitle>
              <CardDescription className="text-gray-600">Para grandes corporações e necessidades específicas</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900">Sob consulta</span>
                <p className="text-sm text-purple-600 mt-1 font-medium">Preço e recursos personalizados</p>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm">Recursos Premium:</h4>
                  <ul className="space-y-2">
                    {[ "Tudo do plano proporcional", "Suporte 24/7 dedicado", "Personalização completa da plataforma", "API completa para integrações", "Integração SSO (Single Sign-On)", "Treinamento e onboarding especializado", "Gerente de conta dedicado", "SLA (Service Level Agreement) garantido" ].map(f => (
                      <li key={f} className="flex items-start"><CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" /><span className="text-sm text-gray-600">{f}</span></li>
                    ))}
                  </ul>
                </div>
              </div>
              <Button className="w-full mt-8 border-blue-600 text-blue-600 hover:bg-blue-50 text-base py-3" variant="outline" asChild>
                <Link to="/contato">Solicitar Orçamento</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Explicação do Preço Proporcional */}
        <Card className="shadow-lg border-0 mb-8 max-w-4xl mx-auto bg-indigo-50 p-6 sm:p-8 rounded-lg">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-2xl sm:text-3xl text-center flex items-center justify-center font-semibold">
              <Users className="w-7 h-7 sm:w-8 sm:h-8 mr-2 text-blue-600" />
              Como Funciona o Preço Proporcional
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid md:grid-cols-2 gap-6 sm:gap-8 items-center">
              <div>
                <h4 className="font-semibold text-lg text-gray-800 mb-3">Fórmula de Cálculo Transparente:</h4>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="font-mono text-sm text-gray-700 mb-2"><strong>Até 50 colaboradores:</strong> R$ 99,90 (valor fixo)</p>
                  <p className="font-mono text-sm text-gray-700"><strong>Acima de 50:</strong> R$ 99,90 + (Nº de colaboradores - 50) × R$ 1,80</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-lg text-gray-800 mb-3">Exemplos Práticos:</h4>
                <div className="space-y-2 text-sm bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex justify-between text-gray-700"><span>Empresa com 30 colaboradores:</span><span className="font-bold text-blue-700">R$ 99,90</span></div>
                  <div className="flex justify-between text-gray-700"><span>Empresa com 70 colaboradores:</span><span className="font-bold text-blue-700">R$ 135,90</span></div>
                  <div className="flex justify-between text-gray-700"><span>Empresa com 150 colaboradores:</span><span className="font-bold text-blue-700">R$ 279,90</span></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default PricingSection;