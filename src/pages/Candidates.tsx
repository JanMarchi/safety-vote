
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import DashboardLayout from '@/components/DashboardLayout';
import { Upload, Plus, Search, Edit, Trash2, Eye, UserCheck, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Candidate {
  id: string;
  name: string;
  cpf: string;
  email: string;
  sector: string;
  function: string;
  biography: string;
  photo?: string | File | null;
  status: string;
}

const Candidates = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    email: '',
    sector: '',
    function: '',
    biography: '',
    photo: null as File | null
  });

  // Lista de candidatos - será carregada da API
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  
  useEffect(() => {
    // Carregar candidatos reais
    const loadCandidates = async () => {
      try {
        // TODO: Implementar chamada para API real
        // const response = await candidateService.getCandidates();
        // setCandidates(response.data);
        
        // Por enquanto, inicializar com array vazio
        setCandidates([]);
      } catch (error) {
        console.error('Erro ao carregar candidatos:', error);
      }
    };
    
    loadCandidates();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Formato inválido",
          description: "Apenas arquivos de imagem são aceitos",
          variant: "destructive"
        });
        return;
      }
      setFormData(prev => ({ ...prev, photo: file }));
      toast({
        title: "Foto selecionada",
        description: "Imagem carregada com sucesso",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.cpf || !formData.email) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    if (formData.biography.length > 300) {
      toast({
        title: "Biografia muito longa",
        description: "A biografia deve ter no máximo 300 caracteres",
        variant: "destructive"
      });
      return;
    }

    console.log('Novo candidato:', formData);
    
    toast({
      title: "Candidato cadastrado",
      description: "Candidato adicionado com sucesso",
    });

    // Reset form
    setFormData({
      name: '',
      cpf: '',
      email: '',
      sector: '',
      function: '',
      biography: '',
      photo: null
    });
    setShowForm(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Aprovado':
        return <Badge className="bg-green-100 text-green-800">Aprovado</Badge>;
      case 'Pendente':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'Rejeitado':
        return <Badge className="bg-red-100 text-red-800">Rejeitado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredCandidates = candidates.filter((candidate: Candidate) =>
    candidate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.sector?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const approvedCandidates = candidates.filter((c: Candidate) => c.status === 'Aprovado');

  return (
    <DashboardLayout userType="rh">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestão de Candidatos</h1>
            <p className="text-gray-600">Gerencie os candidatos às eleições CIPA</p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            {showForm ? 'Cancelar' : 'Novo Candidato'}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Candidatos</p>
                  <p className="text-2xl font-bold text-gray-900">{candidates.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Aprovados</p>
                  <p className="text-2xl font-bold text-green-600">{approvedCandidates.length}</p>
                </div>
                <UserCheck className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pendentes</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {candidates.filter(c => c.status === 'Pendente').length}
                  </p>
                </div>
                <Eye className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Formulário de Cadastro */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Cadastrar Novo Candidato</CardTitle>
              <CardDescription>Preencha os dados do candidato</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Ex: João Silva"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cpf">CPF *</Label>
                    <Input
                      id="cpf"
                      value={formData.cpf}
                      onChange={(e) => handleInputChange('cpf', e.target.value)}
                      placeholder="000.000.000-00"
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
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
                  <div>
                    <Label htmlFor="sector">Setor</Label>
                    <Input
                      id="sector"
                      value={formData.sector}
                      onChange={(e) => handleInputChange('sector', e.target.value)}
                      placeholder="Ex: Produção"
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="function">Função</Label>
                    <Input
                      id="function"
                      value={formData.function}
                      onChange={(e) => handleInputChange('function', e.target.value)}
                      placeholder="Ex: Operador"
                    />
                  </div>
                  <div>
                    <Label htmlFor="photo">Foto</Label>
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="biography">Biografia (máx. 300 caracteres)</Label>
                  <Textarea
                    id="biography"
                    value={formData.biography}
                    onChange={(e) => handleInputChange('biography', e.target.value)}
                    placeholder="Descreva a experiência e qualificações do candidato..."
                    maxLength={300}
                    rows={4}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.biography.length}/300 caracteres
                  </p>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Cadastrar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Lista de Candidatos */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Lista de Candidatos</CardTitle>
                <CardDescription>Visualize e gerencie todos os candidatos</CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar candidatos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              {filteredCandidates.map((candidate) => (
                <div key={candidate.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={candidate.photo || ''} />
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-lg">
                        {candidate.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold">{candidate.name}</h3>
                          <p className="text-gray-600">{candidate.function} - {candidate.sector}</p>
                          <p className="text-sm text-gray-500">{candidate.email}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(candidate.status)}
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <p className="text-sm text-gray-700 leading-relaxed">{candidate.biography}</p>
                      </div>
                      
                      <div className="flex justify-end space-x-2 mt-4">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-2" />
                          Visualizar
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remover
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Candidates;
