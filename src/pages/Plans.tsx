
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { Vote, Check, Star, Crown, Zap, Calculator, Users, Clock, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Plans = () => {
  const { toast } = useToast();
  const [numColaboradores, setNumColaboradores] = useState(50);
  const [precoCalculado, setPrecoCalculado] = useState(99.90);

  const plans = [
    {
      name: "Básico",
      price: "R$ 99",
      period: "/mês",
      description: "Ideal para pequenas empresas",
      features: [
        "Até 100 funcionários",
        "1 eleição simultânea",
        "Relatórios básicos",
        "Suporte por email"
      ],
      popular: false
    },
    {
      name: "Profissional",
      price: "R$ 199",
      period: "/mês",
      description: "Para empresas em crescimento",
      features: [
        "Até 500 funcionários",
        "3 eleições simultâneas",
        "Relatórios avançados",
        "Suporte prioritário",
        "Integração com RH"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "Personalizado",
      period: "",
      description: "Para grandes corporações",
      features: [
        "Funcionários ilimitados",
        "Eleições ilimitadas",
        "Analytics completo",
        "Suporte dedicado",
        "Customizações",
        "API completa"
      ],
      popular: false
    }
  ];

  const handleUpgrade = (planName: string) => {
    toast({
      title: "Solicitação enviada!",
      description: `Sua solicitação para o plano ${planName} foi registrada. Entraremos em contato em breve.`,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
              <Vote className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-gray-900">SafetyPro</h1>
              <p className="text-sm text-gray-600">Sistema Digital</p>
            </div>
          </Link>
          
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Planos Flexíveis com Trial Gratuito
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Comece gratuitamente por 7 dias e pague apenas pelo que usar, 
            com preços justos baseados no seu número de colaboradores
          </p>

          {/* Calculadora de Preço */}
          <Card className="max-w-md mx-auto mb-8 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center justify-center">
                <Calculator className="w-5 h-5 mr-2" />
                Calcule seu Preço
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="colaboradores">Número de Colaboradores</Label>
                <Input
                  id="colaboradores"
                  type="number"
                  min="1"
                  max="10000"
                  value={numColaboradores}
                  onChange={(e) => setNumColaboradores(parseInt(e.target.value) || 50)}
                  className="text-center text-lg font-bold"
                />
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">
                  {formatPrice(precoCalculado)}
                </p>
                <p className="text-sm text-gray-600">por mês após o trial</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trial Info */}
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardContent className="py-6">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="flex items-center justify-center space-x-2">
                <Clock className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-bold text-green-800">7 Dias Grátis</p>
                  <p className="text-sm text-green-600">Trial completo</p>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Zap className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-bold text-blue-800">Upgrade Automático</p>
                  <p className="text-sm text-blue-600">Baseado nos colaboradores</p>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Shield className="w-6 h-6 text-purple-600" />
                <div>
                  <p className="font-bold text-purple-800">Cancelamento Livre</p>
                  <p className="text-sm text-purple-600">Até o 6º dia</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative ${plan.popular ? 'border-blue-500 shadow-xl scale-105' : 'border-gray-200'}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">Mais Popular</div>
                </div>
              )}
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-gray-600">{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-900 hover:bg-gray-800'}`}
                  onClick={() => handleUpgrade(plan.name)}
                >
                  {plan.name === 'Enterprise' ? 'Falar com Vendas' : 'Começar Agora'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pricing Logic Explanation */}
        <Card className="shadow-xl border-0 mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-center flex items-center justify-center">
              <Users className="w-6 h-6 mr-2" />
              Como Funciona o Preço Proporcional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-lg mb-3">Fórmula de Cálculo:</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-mono text-sm mb-2">
                    <strong>Até 50 colaboradores:</strong> R$ 99,90 fixo
                  </p>
                  <p className="font-mono text-sm">
                    <strong>Acima de 50:</strong> R$ 99,90 + (colaboradores - 50) × R$ 1,80
                  </p>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-3">Exemplos:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>30 colaboradores:</span>
                    <span className="font-bold">R$ 99,90</span>
                  </div>
                  <div className="flex justify-between">
                    <span>70 colaboradores:</span>
                    <span className="font-bold">R$ 135,90</span>
                  </div>
                  <div className="flex justify-between">
                    <span>150 colaboradores:</span>
                    <span className="font-bold">R$ 279,90</span>
                  </div>
                  <div className="flex justify-between">
                    <span>500 colaboradores:</span>
                    <span className="font-bold">R$ 909,90</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trial Process */}
        <Card className="shadow-xl border-0 mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Como Funciona o Trial</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4 text-center">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">1</span>
                </div>
                <h4 className="font-bold mb-1">Cadastro</h4>
                <p className="text-sm text-gray-600">Registre sua empresa gratuitamente</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">2</span>
                </div>
                <h4 className="font-bold mb-1">7 Dias Grátis</h4>
                <p className="text-sm text-gray-600">Use todas as funcionalidades</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">3</span>
                </div>
                <h4 className="font-bold mb-1">Aviso</h4>
                <p className="text-sm text-gray-600">Alerta nos dias 5º e 6º</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">4</span>
                </div>
                <h4 className="font-bold mb-1">Upgrade</h4>
                <p className="text-sm text-gray-600">Automático no 8º dia</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Dúvidas sobre o plano ideal? Entre em contato conosco.
          </p>
          <div className="space-x-4">
            <Link to="/login">
              <Button variant="outline">Fazer Login</Button>
            </Link>
            <Link to="/register">
              <Button className="bg-blue-600 hover:bg-blue-700">Começar Trial Gratuito</Button>
            </Link>
          </div>
          
          <div className="mt-8 text-xs text-gray-500 max-w-2xl mx-auto">
            <p className="mb-2">
              <strong>LGPD:</strong> Ao iniciar o trial, você consente com a cobrança automática após 7 dias. 
              Você pode cancelar a qualquer momento antes do fim do período de teste.
            </p>
            <p>
              O upgrade automático é baseado no número de colaboradores informado no cadastro. 
              Você pode alterar manualmente para o plano Premium a qualquer momento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plans;
