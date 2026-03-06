
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import DashboardLayout from '@/components/DashboardLayout';
import { Building2, Save, ArrowLeft, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { companyService } from '@/services/supabaseService';
import { useNavigate } from 'react-router-dom';

// Mapeamento de CNAE para grupos e graus de risco conforme normas CIPA
const cnaeMapping: Record<string, { grupo: string; grauRisco: string; setor: string; descricao: string }> = {
  // Comércio varejista - C-1
  '4711-3': { grupo: 'C-1', grauRisco: '1', setor: 'Comércio', descricao: 'Comércio varejista de mercadorias em geral' },
  '4712-1': { grupo: 'C-1', grauRisco: '1', setor: 'Comércio', descricao: 'Comércio varejista de mercadorias em lojas de conveniência' },
  '4713-0': { grupo: 'C-1', grauRisco: '1', setor: 'Comércio', descricao: 'Lojas de departamentos ou magazines' },
  
  // Escritórios - C-2
  '6201-5': { grupo: 'C-2', grauRisco: '1', setor: 'Serviços', descricao: 'Desenvolvimento de programas de computador sob encomenda' },
  '6202-3': { grupo: 'C-2', grauRisco: '1', setor: 'Serviços', descricao: 'Desenvolvimento e licenciamento de programas de computador customizáveis' },
  '6911-7': { grupo: 'C-2', grauRisco: '1', setor: 'Serviços', descricao: 'Atividades jurídicas' },
  '6920-6': { grupo: 'C-2', grauRisco: '1', setor: 'Serviços', descricao: 'Atividades de contabilidade' },
  
  // Hotéis e restaurantes - C-3
  '5510-8': { grupo: 'C-3', grauRisco: '2', setor: 'Hospitalidade', descricao: 'Hotéis e similares' },
  '5611-2': { grupo: 'C-3', grauRisco: '2', setor: 'Alimentação', descricao: 'Restaurantes e outros estabelecimentos de serviços de alimentação e bebidas' },
  '5612-1': { grupo: 'C-3', grauRisco: '2', setor: 'Alimentação', descricao: 'Serviços ambulantes de alimentação' },
  
  // Serviços médicos - C-4
  '8610-1': { grupo: 'C-4', grauRisco: '2', setor: 'Saúde', descricao: 'Atividades de atendimento hospitalar' },
  '8630-5': { grupo: 'C-4', grauRisco: '2', setor: 'Saúde', descricao: 'Atividade médica ambulatorial' },
  '8640-2': { grupo: 'C-4', grauRisco: '2', setor: 'Saúde', descricao: 'Atividades de serviços de complementação diagnóstica e terapêutica' },
  
  // Indústria têxtil - C-5
  '1311-1': { grupo: 'C-5', grauRisco: '3', setor: 'Indústria', descricao: 'Preparação e fiação de fibras de algodão' },
  '1312-0': { grupo: 'C-5', grauRisco: '3', setor: 'Indústria', descricao: 'Preparação e fiação de fibras têxteis naturais' },
  '1321-9': { grupo: 'C-5', grauRisco: '3', setor: 'Indústria', descricao: 'Tecelagem de fios de algodão' },
  
  // Indústria metalúrgica - C-6
  '2411-5': { grupo: 'C-6', grauRisco: '4', setor: 'Indústria', descricao: 'Produção de ferro-gusa' },
  '2412-3': { grupo: 'C-6', grauRisco: '4', setor: 'Indústria', descricao: 'Produção de ferroligas' },
  '2421-2': { grupo: 'C-6', grauRisco: '4', setor: 'Indústria', descricao: 'Produção de semi-acabados de aço' },
  
  // Construção civil - C-7
  '4120-4': { grupo: 'C-7', grauRisco: '3', setor: 'Construção', descricao: 'Construção de edifícios' },
  '4211-1': { grupo: 'C-7', grauRisco: '3', setor: 'Construção', descricao: 'Construção de rodovias e ferrovias' },
  '4212-0': { grupo: 'C-7', grauRisco: '3', setor: 'Construção', descricao: 'Construção de obras de arte especiais' },
};

const CompanyRegister = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    responsavel: '',
    cargo: '',
    telefone: '',
    email: '',
    cnae: '',
    grupo: '',
    setor: '',
    grauRisco: '',
    numeroColaboradores: '',
    plano: 'gratuito'
  });
  
  const [cnaeInfo, setCnaeInfo] = useState<{ grupo: string; grauRisco: string; setor: string; descricao: string } | null>(null);
  const [showCnaeInfo, setShowCnaeInfo] = useState(false);
  const [isLoadingCnpj, setIsLoadingCnpj] = useState(false);
  const [cnpjInfo, setCnpjInfo] = useState<any>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Função para buscar dados da empresa pelo CNPJ
  const fetchCompanyData = async (cnpj: string) => {
    const cnpjNumbers = cnpj.replace(/\D/g, '');
    
    console.log('🔍 Iniciando busca CNPJ:', cnpjNumbers);
    
    if (cnpjNumbers.length !== 14) {
      console.log('❌ CNPJ inválido - deve ter 14 dígitos:', cnpjNumbers.length);
      return;
    }

    setIsLoadingCnpj(true);
    
    try {
      // Usando API pública gratuita do CNPJá (5 consultas por minuto por IP)
      const apiUrl = `https://api.cnpja.com/office/${cnpjNumbers}`;
      console.log('🌐 Fazendo requisição para:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 Status da resposta:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro na resposta da API:', errorText);
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Dados recebidos da API:', data);
      setCnpjInfo(data);
      
      // Auto preenche os campos com os dados da empresa
        if (data) {
          const cnaeCode = data.mainActivity?.id || '';
          console.log('📋 Preparando dados para preenchimento:', {
            cnaeCode,
            companyName: data.company?.name,
            address: data.address,
            phones: data.phones,
            emails: data.emails
          });
          
          // Busca informações do CNAE no mapeamento para auto preenchimento
          const cnaeMapping_info = cnaeMapping[cnaeCode];
          console.log('🏢 Informações CNAE encontradas:', cnaeMapping_info);
          
          const newFormData = {
            ...formData,
            razaoSocial: data.company?.name || '',
            nomeFantasia: data.alias || data.company?.name || '',
            cnpj: cnpj,
            endereco: data.address?.street || '',
            numero: data.address?.number || '',
            complemento: data.address?.details || '',
            bairro: data.address?.district || '',
            cidade: data.address?.city || '',
            estado: data.address?.state || '',
            cep: data.address?.zip || '',
            telefone: data.phones?.[0]?.number || '',
            email: data.emails?.[0]?.address || '',
            cnae: cnaeCode,
            // Auto preenche dados CIPA se CNAE estiver mapeado
            grupo: cnaeMapping_info?.grupo || '',
            grauRisco: cnaeMapping_info?.grauRisco || '',
            setor: cnaeMapping_info?.setor || ''
          };
          
          console.log('💾 Aplicando novos dados ao formulário:', newFormData);
          setFormData(newFormData);
         
         // Atualiza informações do CNAE se encontrado no mapeamento
         if (cnaeMapping_info) {
           setCnaeInfo(cnaeMapping_info);
           setShowCnaeInfo(true);
         }
        
        let toastMessage = `Informações de ${data.company?.name || 'empresa'} preenchidas automaticamente`;
         if (cnaeMapping_info) {
           toastMessage += ` • Grupo CIPA ${cnaeMapping_info.grupo} e Grau de Risco ${cnaeMapping_info.grauRisco} identificados`;
         }
         
         toast({
           title: "Dados da empresa carregados",
           description: toastMessage,
         });
      }
    } catch (error) {
      console.error('Erro ao buscar dados do CNPJ:', error);
      toast({
        title: "Erro ao consultar CNPJ",
        description: "Não foi possível carregar os dados da empresa. Verifique o CNPJ e tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingCnpj(false);
    }
  };

  // Efeito para buscar dados quando CNPJ for completamente preenchido
  useEffect(() => {
    const cnpjNumbers = formData.cnpj.replace(/\D/g, '');
    console.log('🔄 useEffect CNPJ executado:', {
      cnpj: formData.cnpj,
      cnpjNumbers,
      length: cnpjNumbers.length,
      isLoadingCnpj
    });
    
    if (cnpjNumbers.length === 14 && !isLoadingCnpj) {
      console.log('⏰ Agendando busca de dados em 1 segundo...');
      const timeoutId = setTimeout(() => {
        console.log('🚀 Executando busca de dados do CNPJ');
        fetchCompanyData(formData.cnpj);
      }, 1000); // Delay de 1 segundo para evitar muitas requisições
      
      return () => {
        console.log('🗑️ Cancelando timeout anterior');
        clearTimeout(timeoutId);
      };
    }
  }, [formData.cnpj, isLoadingCnpj]);

  // Auto preenchimento baseado no CNAE
  useEffect(() => {
    if (formData.cnae) {
      const cnaeCode = formData.cnae.replace(/[^0-9]/g, ''); // Remove formatação
      const cnaeFormatted = cnaeCode.replace(/(\d{4})(\d{1})(\d{2})/, '$1-$2/$3'); // Formato padrão
      
      // Busca informações do CNAE no mapeamento
      const info = cnaeMapping[cnaeFormatted] || cnaeMapping[formData.cnae];
      
      if (info) {
        setCnaeInfo(info);
        setShowCnaeInfo(true);
        
        // Auto preenche os campos relacionados
        setFormData(prev => ({
          ...prev,
          grupo: info.grupo,
          grauRisco: info.grauRisco,
          setor: info.setor
        }));
        
        toast({
          title: "CNAE reconhecido",
          description: `Grupo ${info.grupo} e Grau de Risco ${info.grauRisco} preenchidos automaticamente`,
        });
      } else {
        setCnaeInfo(null);
        setShowCnaeInfo(false);
      }
    } else {
      setCnaeInfo(null);
      setShowCnaeInfo(false);
    }
  }, [formData.cnae, toast]);

  const formatCNAE = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{4})(\d{1})(\d{2})/, '$1-$2/$3');
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    const requiredFields = ['razaoSocial', 'cnpj', 'cnae', 'endereco', 'numero', 'bairro', 'cidade', 'estado', 'cep'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Verificar se empresa já existe
      const existingCompany = await companyService.getByCnpj(formData.cnpj);
      if (existingCompany) {
        toast({
          title: "Empresa já cadastrada",
          description: "Uma empresa com este CNPJ já está cadastrada no sistema.",
          variant: "destructive"
        });
        return;
      }
      
      // Preparar dados para salvar
      const companyData = {
        razao_social: formData.razaoSocial,
        nome_fantasia: formData.nomeFantasia || null,
        cnpj: formData.cnpj,
        cnae: formData.cnae,
        grupo: formData.grupo,
        grau_risco: formData.grauRisco,
        setor: formData.setor,
        endereco: formData.endereco,
        numero: formData.numero,
        complemento: formData.complemento || null,
        bairro: formData.bairro,
        cidade: formData.cidade,
        estado: formData.estado,
        cep: formData.cep,
        telefone: formData.telefone || null,
        email: formData.email || null
      };
      
      console.log('💾 Salvando empresa no Supabase:', companyData);
      
      // Salvar no Supabase
      const savedCompany = await companyService.create(companyData);
      
      console.log('✅ Empresa salva com sucesso:', savedCompany);
      
      toast({
        title: "Empresa cadastrada!",
        description: `${formData.razaoSocial} foi cadastrada com sucesso no sistema.`
      });
      
      // Redirecionar para a lista de empresas após 2 segundos
      setTimeout(() => {
        navigate('/companies');
      }, 2000);
      
    } catch (error) {
      console.error('❌ Erro ao salvar empresa:', error);
      toast({
        title: "Erro ao cadastrar empresa",
        description: "Ocorreu um erro ao salvar os dados. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <DashboardLayout userType="admin-sistema">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link to="/dashboard-admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cadastrar Nova Empresa</h1>
            <p className="text-gray-600">Registre uma nova empresa no sistema CIPA</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados da Empresa */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="w-5 h-5 mr-2" />
                Dados da Empresa
              </CardTitle>
              <CardDescription>Informações básicas da empresa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="razaoSocial">Razão Social *</Label>
                  <Input
                    id="razaoSocial"
                    value={formData.razaoSocial}
                    onChange={(e) => handleInputChange('razaoSocial', e.target.value)}
                    placeholder="Ex: Empresa ABC Ltda"
                  />
                </div>
                <div>
                  <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                  <Input
                    id="nomeFantasia"
                    value={formData.nomeFantasia}
                    onChange={(e) => handleInputChange('nomeFantasia', e.target.value)}
                    placeholder="Ex: ABC Tech"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cnpj">CNPJ *</Label>
                  <div className="relative">
                    <Input
                      id="cnpj"
                      value={formData.cnpj}
                      onChange={(e) => handleInputChange('cnpj', formatCNPJ(e.target.value))}
                      placeholder="00.000.000/0000-00"
                      maxLength={18}
                      disabled={isLoadingCnpj}
                    />
                    {isLoadingCnpj && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                  </div>
                  {cnpjInfo && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-start space-x-2">
                        <Info className="w-4 h-4 text-green-600 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-green-900">{cnpjInfo.company?.name}</p>
                          <div className="mt-1 space-y-1 text-green-700">
                            <p><strong>Situação:</strong> {cnpjInfo.status?.text || 'Ativa'}</p>
                            <p><strong>Atividade Principal:</strong> {cnpjInfo.mainActivity?.text}</p>
                            {cnpjInfo.address && (
                              <p><strong>Endereço:</strong> {cnpjInfo.address.street}, {cnpjInfo.address.number} - {cnpjInfo.address.city}/{cnpjInfo.address.state}</p>
                            )}
                          </div>
                          <p className="mt-2 text-xs text-green-600">
                            ✓ Dados preenchidos automaticamente da Receita Federal
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="cnae">CNAE Principal *</Label>
                  <Input
                    id="cnae"
                    value={formData.cnae}
                    onChange={(e) => handleInputChange('cnae', formatCNAE(e.target.value))}
                    placeholder="Ex: 6201-5/00"
                    maxLength={10}
                  />
                  {showCnaeInfo && cnaeInfo && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="flex items-start space-x-2">
                        <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-blue-900">{cnaeInfo.descricao}</p>
                          <div className="mt-1 space-y-1 text-blue-700">
                            <p><strong>Setor/Atividade:</strong> {cnaeInfo.setor}</p>
                            <p><strong>Grupo CIPA:</strong> {cnaeInfo.grupo}</p>
                            <p><strong>Grau de Risco:</strong> {cnaeInfo.grauRisco}</p>
                          </div>
                          <p className="mt-2 text-xs text-blue-600">
                            ✓ Campos preenchidos automaticamente conforme normas CIPA
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Endereço */}
          <Card>
            <CardHeader>
              <CardTitle>Endereço</CardTitle>
              <CardDescription>Localização da empresa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="endereco">Logradouro</Label>
                  <Input
                    id="endereco"
                    value={formData.endereco}
                    onChange={(e) => handleInputChange('endereco', e.target.value)}
                    placeholder="Ex: Rua das Flores"
                  />
                </div>
                <div>
                  <Label htmlFor="numero">Número</Label>
                  <Input
                    id="numero"
                    value={formData.numero}
                    onChange={(e) => handleInputChange('numero', e.target.value)}
                    placeholder="123"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="complemento">Complemento</Label>
                  <Input
                    id="complemento"
                    value={formData.complemento}
                    onChange={(e) => handleInputChange('complemento', e.target.value)}
                    placeholder="Sala 101"
                  />
                </div>
                <div>
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input
                    id="bairro"
                    value={formData.bairro}
                    onChange={(e) => handleInputChange('bairro', e.target.value)}
                    placeholder="Centro"
                  />
                </div>
                <div>
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={formData.cep}
                    onChange={(e) => handleInputChange('cep', formatCEP(e.target.value))}
                    placeholder="00000-000"
                    maxLength={9}
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={formData.cidade}
                    onChange={(e) => handleInputChange('cidade', e.target.value)}
                    placeholder="São Paulo"
                  />
                </div>
                <div>
                  <Label htmlFor="estado">Estado</Label>
                  <Select value={formData.estado} onValueChange={(value) => handleInputChange('estado', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SP">São Paulo</SelectItem>
                      <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                      <SelectItem value="MG">Minas Gerais</SelectItem>
                      <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                      <SelectItem value="PR">Paraná</SelectItem>
                      <SelectItem value="SC">Santa Catarina</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Responsável */}
          <Card>
            <CardHeader>
              <CardTitle>Responsável</CardTitle>
              <CardDescription>Dados do responsável pela empresa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="responsavel">Nome do Responsável *</Label>
                  <Input
                    id="responsavel"
                    value={formData.responsavel}
                    onChange={(e) => handleInputChange('responsavel', e.target.value)}
                    placeholder="Ex: João Silva"
                  />
                </div>
                <div>
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input
                    id="cargo"
                    value={formData.cargo}
                    onChange={(e) => handleInputChange('cargo', e.target.value)}
                    placeholder="Ex: Diretor de RH"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => handleInputChange('telefone', e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="joao@empresa.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dados CIPA */}
          <Card>
            <CardHeader>
              <CardTitle>Dados CIPA</CardTitle>
              <CardDescription>Informações específicas para eleições CIPA</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="grupo">Grupo CIPA</Label>
                  <Select value={formData.grupo} onValueChange={(value) => handleInputChange('grupo', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o grupo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="C-1">C-1 (Comércio varejista)</SelectItem>
                      <SelectItem value="C-2">C-2 (Escritórios e serviços)</SelectItem>
                      <SelectItem value="C-3">C-3 (Hotéis, restaurantes)</SelectItem>
                      <SelectItem value="C-4">C-4 (Serviços médicos)</SelectItem>
                      <SelectItem value="C-5">C-5 (Indústria têxtil)</SelectItem>
                      <SelectItem value="C-6">C-6 (Indústria metalúrgica)</SelectItem>
                      <SelectItem value="C-7">C-7 (Construção civil)</SelectItem>
                    </SelectContent>
                  </Select>
                  {formData.grupo && (
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.grupo === 'C-1' && 'Atividades comerciais de baixo risco'}
                      {formData.grupo === 'C-2' && 'Atividades administrativas e de serviços'}
                      {formData.grupo === 'C-3' && 'Atividades de hospitalidade e alimentação'}
                      {formData.grupo === 'C-4' && 'Atividades de saúde e assistência médica'}
                      {formData.grupo === 'C-5' && 'Atividades industriais têxteis'}
                      {formData.grupo === 'C-6' && 'Atividades industriais de alto risco'}
                      {formData.grupo === 'C-7' && 'Atividades de construção e obras'}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="grauRisco">Grau de Risco</Label>
                  <Select value={formData.grauRisco} onValueChange={(value) => handleInputChange('grauRisco', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o grau de risco" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Grau 1 (Baixo)</SelectItem>
                      <SelectItem value="2">Grau 2 (Médio)</SelectItem>
                      <SelectItem value="3">Grau 3 (Alto)</SelectItem>
                      <SelectItem value="4">Grau 4 (Muito Alto)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="numeroColaboradores">Número de Colaboradores</Label>
                  <Input
                    id="numeroColaboradores"
                    type="number"
                    value={formData.numeroColaboradores}
                    onChange={(e) => handleInputChange('numeroColaboradores', e.target.value)}
                    placeholder="Ex: 150"
                  />
                </div>
                <div>
                  <Label htmlFor="plano">Plano Contratado</Label>
                  <Select value={formData.plano} onValueChange={(value) => handleInputChange('plano', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gratuito">Gratuito</SelectItem>
                      <SelectItem value="basico">Básico</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Link to="/dashboard-admin">
              <Button variant="outline">Cancelar</Button>
            </Link>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              Cadastrar Empresa
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CompanyRegister;
