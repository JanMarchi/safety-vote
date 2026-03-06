
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link, useNavigate } from 'react-router-dom';
import { Vote, Building, User, Shield, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';

const Register = () => {
  const [formData, setFormData] = useState({
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
    endereco: '',
    cep: '',
    responsavel: '',
    cargo: '',
    telefone: '',
    email: '',
    cnae: '',
    setor: '',
    grauRisco: '',
    numColaboradores: '50',
    senha: '',
    confirmarSenha: '',
    aceitaTermos: false,
    aceitaCobranca: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const calcularPreco = (colaboradores: number) => {
    if (colaboradores <= 50) {
      return 99.90;
    }
    const adicional = (colaboradores - 50) * 1.80;
    return 99.90 + adicional;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const precoCalculado = calcularPreco(parseInt(formData.numColaboradores) || 50);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCNPJ = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    return cleanValue.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const formatCEP = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    return cleanValue.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.senha !== formData.confirmarSenha) {
      toast({
        title: "Erro no cadastro",
        description: "As senhas não conferem",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    if (!formData.aceitaTermos) {
      toast({
        title: "Erro no cadastro", 
        description: "É necessário aceitar os termos e condições",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    if (!formData.aceitaCobranca) {
      toast({
        title: "Erro no cadastro",
        description: "É necessário consentir com a cobrança automática conforme LGPD",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    setTimeout(() => {
      toast({
        title: "Cadastro realizado com sucesso!",
        description: `Sua empresa foi cadastrada. Trial de 7 dias iniciado. Valor após trial: ${formatPrice(precoCalculado)}`,
      });

      const empresaData = {
        ...formData,
        dataTrialInicio: new Date().toISOString(),
        dataTrialFim: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        precoCalculado: precoCalculado,
        planoAtual: 'trial'
      };
      localStorage.setItem('empresa', JSON.stringify(empresaData));

      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
              <Vote className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-gray-900">CIPA</h1>
              <p className="text-sm text-gray-600">Sistema Digital</p>
            </div>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Cadastro de Empresa</h2>
          <p className="text-gray-600">Comece seu trial gratuito de 7 dias</p>
        </div>

        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="py-4">
            <div className="flex items-center justify-center space-x-4 text-center">
              <Clock className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-bold text-green-800">7 Dias Gratuitos</p>
                <p className="text-sm text-green-600">
                  Acesso completo • Depois: {formatPrice(calcularPreco(parseInt(formData.numColaboradores) || 50))}/mês
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Informações da Empresa</CardTitle>
            <CardDescription className="text-center">
              Preencha todos os dados para iniciar seu trial gratuito
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Building className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Dados da Empresa</h3>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="razaoSocial">Razão Social *</Label>
                    <Input
                      id="razaoSocial"
                      value={formData.razaoSocial}
                      onChange={(e) => handleChange('razaoSocial', e.target.value)}
                      placeholder="Empresa LTDA"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                    <Input
                      id="nomeFantasia"
                      value={formData.nomeFantasia}
                      onChange={(e) => handleChange('nomeFantasia', e.target.value)}
                      placeholder="Nome comercial"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ *</Label>
                    <Input
                      id="cnpj"
                      value={formData.cnpj}
                      onChange={(e) => handleChange('cnpj', formatCNPJ(e.target.value))}
                      placeholder="00.000.000/0000-00"
                      maxLength={18}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP *</Label>
                    <Input
                      id="cep"
                      value={formData.cep}
                      onChange={(e) => handleChange('cep', formatCEP(e.target.value))}
                      placeholder="00000-000"
                      maxLength={9}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço Completo *</Label>
                  <Input
                    id="endereco"
                    value={formData.endereco}
                    onChange={(e) => handleChange('endereco', e.target.value)}
                    placeholder="Rua, número, bairro, cidade, estado"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <User className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Responsável pelo Sistema</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="responsavel">Nome Completo *</Label>
                    <Input
                      id="responsavel"
                      value={formData.responsavel}
                      onChange={(e) => handleChange('responsavel', e.target.value)}
                      placeholder="João Silva"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cargo">Cargo *</Label>
                    <Input
                      id="cargo"
                      value={formData.cargo}
                      onChange={(e) => handleChange('cargo', e.target.value)}
                      placeholder="Gerente de RH"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone/WhatsApp *</Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => handleChange('telefone', e.target.value)}
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="joao@empresa.com"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Dados Operacionais</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cnae">CNAE Principal *</Label>
                    <Input
                      id="cnae"
                      value={formData.cnae}
                      onChange={(e) => handleChange('cnae', e.target.value)}
                      placeholder="1234-5/67"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="setor">Setor/Atividade *</Label>
                    <Input
                      id="setor"
                      value={formData.setor}
                      onChange={(e) => handleChange('setor', e.target.value)}
                      placeholder="Indústria, Comércio, Serviços"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="grauRisco">Grau de Risco *</Label>
                    <Select onValueChange={(value) => handleChange('grauRisco', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o grau" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Grau 1 (Baixo)</SelectItem>
                        <SelectItem value="2">Grau 2 (Médio-Baixo)</SelectItem>
                        <SelectItem value="3">Grau 3 (Médio)</SelectItem>
                        <SelectItem value="4">Grau 4 (Alto)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="numColaboradores">Número de Colaboradores *</Label>
                    <Select 
                      value={formData.numColaboradores}
                      onValueChange={(value) => handleChange('numColaboradores', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="20">20-30 colaboradores</SelectItem>
                        <SelectItem value="40">31-40 colaboradores</SelectItem>
                        <SelectItem value="50">41-50 colaboradores</SelectItem>
                        <SelectItem value="75">51-75 colaboradores</SelectItem>
                        <SelectItem value="100">76-100 colaboradores</SelectItem>
                        <SelectItem value="150">101-150 colaboradores</SelectItem>
                        <SelectItem value="200">151-200 colaboradores</SelectItem>
                        <SelectItem value="300">201-300 colaboradores</SelectItem>
                        <SelectItem value="500">301-500 colaboradores</SelectItem>
                        <SelectItem value="1000">501-1000 colaboradores</SelectItem>
                        <SelectItem value="2000">1000+ colaboradores</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600">Preço estimado após trial:</p>
                      <p className="text-2xl font-bold text-blue-800">{formatPrice(precoCalculado)}/mês</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-blue-600">Para {formData.numColaboradores} colaboradores</p>
                      <p className="text-xs text-blue-500">Trial gratuito por 7 dias</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Credenciais de Acesso</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="senha">Senha *</Label>
                    <Input
                      id="senha"
                      type="password"
                      value={formData.senha}
                      onChange={(e) => handleChange('senha', e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmarSenha">Confirmar Senha *</Label>
                    <Input
                      id="confirmarSenha"
                      type="password"
                      value={formData.confirmarSenha}
                      onChange={(e) => handleChange('confirmarSenha', e.target.value)}
                      placeholder="Repita a senha"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="aceitaTermos"
                    checked={formData.aceitaTermos}
                    onCheckedChange={(checked) => handleChange('aceitaTermos', checked)}
                  />
                  <Label htmlFor="aceitaTermos" className="text-sm">
                    Aceito os <Link to="#" className="text-blue-600 hover:underline">Termos e Condições</Link> e a <Link to="#" className="text-blue-600 hover:underline">Política de Privacidade</Link>
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="aceitaCobranca"
                    checked={formData.aceitaCobranca}
                    onCheckedChange={(checked) => handleChange('aceitaCobranca', checked)}
                  />
                  <Label htmlFor="aceitaCobranca" className="text-sm">
                    Consinto com a cobrança automática após o período de trial conforme LGPD (Lei 13.709/2018). Posso cancelar a qualquer momento antes do fim do trial.
                  </Label>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
                disabled={isLoading}
              >
                {isLoading ? 'Processando...' : 'Iniciar Trial Gratuito de 7 Dias'}
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Já tem uma conta? <Link to="/login" className="text-blue-600 hover:underline">Faça login</Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
