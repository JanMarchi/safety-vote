
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardLayout from '@/components/DashboardLayout';
import { Calendar, Users, ArrowLeft, Save, FileText, Download, Building2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const NewElection = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    titularVacancies: '3',
    suplenteVacancies: '3',
    location: '',
    instructions: '',
    // Dados da empresa
    companyName: '',
    cnpj: '',
    cnae: '',
    totalEmployees: '',
    riskLevel: '2',
    // Dados da comissão eleitoral
    electoralCommission: '',
    responsibleRH: '',
    responsibleSESMT: '',
    // Prazos
    registrationStartDate: '',
    registrationEndDate: '',
    possessionDate: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Função para calcular dimensionamento CIPA baseado na NR-5
  const calculateCIPADimensioning = () => {
    const employees = parseInt(formData.totalEmployees) || 0;
    const risk = parseInt(formData.riskLevel) || 2;
    
    // Tabela simplificada baseada na NR-5
    let titulares = 1, suplentes = 1;
    
    if (employees >= 20 && employees <= 29) {
      titulares = risk >= 3 ? 2 : 1;
      suplentes = risk >= 3 ? 2 : 1;
    } else if (employees >= 30 && employees <= 50) {
      titulares = risk >= 3 ? 2 : 1;
      suplentes = risk >= 3 ? 2 : 1;
    } else if (employees >= 51 && employees <= 100) {
      titulares = risk >= 3 ? 3 : 2;
      suplentes = risk >= 3 ? 3 : 2;
    } else if (employees >= 101 && employees <= 250) {
      titulares = risk >= 3 ? 4 : 3;
      suplentes = risk >= 3 ? 4 : 3;
    } else if (employees >= 251 && employees <= 500) {
      titulares = risk >= 3 ? 5 : 4;
      suplentes = risk >= 3 ? 5 : 4;
    } else if (employees > 500) {
      titulares = Math.min(7, Math.ceil(employees / 100));
      suplentes = titulares;
    }
    
    return { titulares, suplentes };
  };

  // Função para gerar Edital de Convocação
  const generateEdital = () => {
    const editalContent = `
EDITAL DE CONVOCAÇÃO PARA ELEIÇÃO DA CIPA

${formData.companyName}
CNPJ: ${formData.cnpj}
CNAE: ${formData.cnae}

A ${formData.companyName}, em cumprimento à Norma Regulamentadora NR-5, convoca todos os empregados para participarem da eleição da Comissão Interna de Prevenção de Acidentes - CIPA.

DADOS DA ELEIÇÃO:
- Nome: ${formData.name}
- Local: ${formData.location}
- Período de Inscrições: ${formData.registrationStartDate} a ${formData.registrationEndDate}
- Período de Votação: ${formData.startDate} a ${formData.endDate}
- Posse da Nova CIPA: ${formData.possessionDate}

VAGAS DISPONÍVEIS:
- Titulares: ${formData.titularVacancies}
- Suplentes: ${formData.suplenteVacancies}

CRITÉRIOS DE ELEGIBILIDADE:
- Ser empregado da empresa há pelo menos 1 ano
- Ter mais de 18 anos
- Não ter sofrido condenação criminal com trânsito em julgado

FORMA DE VOTAÇÃO: Eletrônica através do sistema Safety Vote

Comissão Eleitoral: ${formData.electoralCommission}
Responsável RH: ${formData.responsibleRH}
Responsável SESMT: ${formData.responsibleSESMT}

Data: ${new Date().toLocaleDateString('pt-BR')}
    `;
    
    const blob = new Blob([editalContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Edital_CIPA_${formData.name.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Função para gerar Ata da Comissão Eleitoral
  const generateAtaComissao = () => {
    const ataContent = `
ATA DE CONSTITUIÇÃO DA COMISSÃO ELEITORAL

Empresa: ${formData.companyName}
CNPJ: ${formData.cnpj}
Data: ${new Date().toLocaleDateString('pt-BR')}

Em reunião realizada nesta data, foi constituída a Comissão Eleitoral para organizar a eleição da CIPA - Comissão Interna de Prevenção de Acidentes, conforme determina a NR-5.

COMPOSIÇÃO DA COMISSÃO ELEITORAL:
- Responsável RH: ${formData.responsibleRH}
- Responsável SESMT: ${formData.responsibleSESMT}
- Membros: ${formData.electoralCommission}

RESPONSABILIDADES:
- Organizar e conduzir o processo eleitoral
- Divulgar o edital de convocação
- Receber e validar inscrições de candidatos
- Coordenar a votação eletrônica
- Apurar os votos e proclamar os eleitos
- Lavrar ata de eleição

CRONOGRAMA:
- Publicação do Edital: ${new Date().toLocaleDateString('pt-BR')}
- Inscrições: ${formData.registrationStartDate} a ${formData.registrationEndDate}
- Votação: ${formData.startDate} a ${formData.endDate}
- Posse: ${formData.possessionDate}

Nada mais havendo a tratar, foi encerrada a reunião.

_________________________________
Comissão Eleitoral
    `;
    
    const blob = new Blob([ataContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ata_Comissao_Eleitoral_${formData.name.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Função para gerar Quadro de Dimensionamento
  const generateQuadroDimensionamento = () => {
    const dimensioning = calculateCIPADimensioning();
    const quadroContent = `
QUADRO DE DIMENSIONAMENTO DA CIPA
Conforme NR-5 - Norma Regulamentadora nº 5

Empresa: ${formData.companyName}
CNPJ: ${formData.cnpj}
CNAE: ${formData.cnae}
Total de Empregados: ${formData.totalEmployees}
Grau de Risco: ${formData.riskLevel}

DIMENSIONAMENTO CALCULADO:
- Representantes dos Empregados (Titulares): ${dimensioning.titulares}
- Representantes dos Empregados (Suplentes): ${dimensioning.suplentes}
- Representantes do Empregador (Titulares): ${dimensioning.titulares}
- Representantes do Empregador (Suplentes): ${dimensioning.suplentes}

VAGAS DEFINIDAS PARA ELEIÇÃO:
- Titulares dos Empregados: ${formData.titularVacancies}
- Suplentes dos Empregados: ${formData.suplenteVacancies}

OBSERVAÇÕES:
- Os representantes do empregador são indicados diretamente pela empresa
- Os representantes dos empregados são eleitos em escrutínio secreto
- Mandato: 1 ano, permitida uma reeleição

Base Legal: NR-5 - Portaria MTb nº 3.214/78
Data de Elaboração: ${new Date().toLocaleDateString('pt-BR')}
    `;
    
    const blob = new Blob([quadroContent], { type: 'text/plain;charset=utf-8' });
     const url = URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = `Quadro_Dimensionamento_CIPA_${formData.name.replace(/\s+/g, '_')}.txt`;
     a.click();
     URL.revokeObjectURL(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulação de criação
    setTimeout(() => {
      toast({
        title: "Eleição criada com sucesso!",
        description: `"${formData.name}" foi configurada e está pronta para ser preparada.`,
      });
      
      setIsLoading(false);
      navigate('/elections');
    }, 1500);
  };

  return (
    <DashboardLayout userType="rh">
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link to="/elections">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nova Eleição CIPA</h1>
            <p className="text-gray-600">Configure uma nova eleição para sua empresa</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span>Informações Básicas</span>
              </CardTitle>
              <CardDescription>
                Defina as informações principais da eleição
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Eleição *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                    placeholder="Ex: Eleição CIPA 2024 - Matriz"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Local/Unidade *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({...prev, location: e.target.value}))}
                    placeholder="Ex: Matriz - São Paulo"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                  placeholder="Descrição adicional sobre a eleição..."
                  rows={3}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Data de Início *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({...prev, startDate: e.target.value}))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Data de Término *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({...prev, endDate: e.target.value}))}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="titularVacancies">Vagas Titulares *</Label>
                  <Select value={formData.titularVacancies} onValueChange={(value) => setFormData(prev => ({...prev, titularVacancies: value}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6,7].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num} vaga{num > 1 ? 's' : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="suplenteVacancies">Vagas Suplentes *</Label>
                  <Select value={formData.suplenteVacancies} onValueChange={(value) => setFormData(prev => ({...prev, suplenteVacancies: value}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6,7].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num} vaga{num > 1 ? 's' : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Instruções para Eleitores</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => setFormData(prev => ({...prev, instructions: e.target.value}))}
                  placeholder="Instruções específicas que aparecerão na tela de votação..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Dados da Empresa */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-green-600" />
                <span>Dados da Empresa</span>
              </CardTitle>
              <CardDescription>
                Informações necessárias para os documentos obrigatórios da CIPA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Razão Social *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData(prev => ({...prev, companyName: e.target.value}))}
                    placeholder="Nome completo da empresa"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ *</Label>
                  <Input
                    id="cnpj"
                    value={formData.cnpj}
                    onChange={(e) => setFormData(prev => ({...prev, cnpj: e.target.value}))}
                    placeholder="00.000.000/0000-00"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cnae">CNAE *</Label>
                  <Input
                    id="cnae"
                    value={formData.cnae}
                    onChange={(e) => setFormData(prev => ({...prev, cnae: e.target.value}))}
                    placeholder="0000-0/00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalEmployees">Total de Funcionários *</Label>
                  <Input
                    id="totalEmployees"
                    type="number"
                    value={formData.totalEmployees}
                    onChange={(e) => setFormData(prev => ({...prev, totalEmployees: e.target.value}))}
                    placeholder="Ex: 150"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="riskLevel">Grau de Risco *</Label>
                  <Select value={formData.riskLevel} onValueChange={(value) => setFormData(prev => ({...prev, riskLevel: value}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Grau 1 - Baixo</SelectItem>
                      <SelectItem value="2">Grau 2 - Médio</SelectItem>
                      <SelectItem value="3">Grau 3 - Alto</SelectItem>
                      <SelectItem value="4">Grau 4 - Muito Alto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comissão Eleitoral */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-600" />
                <span>Comissão Eleitoral</span>
              </CardTitle>
              <CardDescription>
                Responsáveis pela organização e condução da eleição
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="responsibleRH">Responsável RH *</Label>
                  <Input
                    id="responsibleRH"
                    value={formData.responsibleRH}
                    onChange={(e) => setFormData(prev => ({...prev, responsibleRH: e.target.value}))}
                    placeholder="Nome do responsável pelo RH"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="responsibleSESMT">Responsável SESMT</Label>
                  <Input
                    id="responsibleSESMT"
                    value={formData.responsibleSESMT}
                    onChange={(e) => setFormData(prev => ({...prev, responsibleSESMT: e.target.value}))}
                    placeholder="Nome do responsável pelo SESMT"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="electoralCommission">Membros da Comissão Eleitoral</Label>
                <Textarea
                  id="electoralCommission"
                  value={formData.electoralCommission}
                  onChange={(e) => setFormData(prev => ({...prev, electoralCommission: e.target.value}))}
                  placeholder="Liste os nomes dos membros da comissão eleitoral..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Cronograma */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-orange-600" />
                <span>Cronograma da Eleição</span>
              </CardTitle>
              <CardDescription>
                Defina as datas importantes do processo eleitoral
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="registrationStartDate">Início das Inscrições *</Label>
                  <Input
                    id="registrationStartDate"
                    type="date"
                    value={formData.registrationStartDate}
                    onChange={(e) => setFormData(prev => ({...prev, registrationStartDate: e.target.value}))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registrationEndDate">Fim das Inscrições *</Label>
                  <Input
                    id="registrationEndDate"
                    type="date"
                    value={formData.registrationEndDate}
                    onChange={(e) => setFormData(prev => ({...prev, registrationEndDate: e.target.value}))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="possessionDate">Data de Posse da Nova CIPA *</Label>
                <Input
                  id="possessionDate"
                  type="date"
                  value={formData.possessionDate}
                  onChange={(e) => setFormData(prev => ({...prev, possessionDate: e.target.value}))}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Documentos Obrigatórios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-red-600" />
                <span>Documentos Obrigatórios</span>
              </CardTitle>
              <CardDescription>
                Gere os documentos necessários conforme NR-5
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateEdital}
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                >
                  <Download className="w-6 h-6 text-blue-600" />
                  <div className="text-center">
                    <div className="font-semibold">Edital de Convocação</div>
                    <div className="text-xs text-gray-500">Obrigatório - NR-5</div>
                  </div>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={generateAtaComissao}
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                >
                  <Download className="w-6 h-6 text-green-600" />
                  <div className="text-center">
                    <div className="font-semibold">Ata da Comissão</div>
                    <div className="text-xs text-gray-500">Obrigatório - NR-5</div>
                  </div>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={generateQuadroDimensionamento}
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                >
                  <Download className="w-6 h-6 text-purple-600" />
                  <div className="text-center">
                    <div className="font-semibold">Quadro de Dimensionamento</div>
                    <div className="text-xs text-gray-500">Obrigatório - NR-5</div>
                  </div>
                </Button>
              </div>

              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <FileText className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-semibold text-yellow-800">Importante:</div>
                    <div className="text-yellow-700">
                      Estes documentos são obrigatórios conforme NR-5 e devem ser gerados antes do início da eleição.
                      Recomenda-se publicar o edital com pelo menos 60 dias de antecedência da posse da nova CIPA.
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4 mt-6">
            <Link to="/elections">
              <Button variant="outline" type="button">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Criando...' : 'Criar Eleição'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default NewElection;
