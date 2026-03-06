
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Vote, Shield, Clock, Check, AlertCircle, Key, Phone, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Candidate {
  id: number;
  name: string;
  role: string;
  votes: number;
  photo: string;
  biography: string;
}

interface Election {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  votingType: 'single' | 'multiple';
  candidates: Candidate[];
  status: 'active' | 'closed';
}

const Voting = () => {
  const [selectedCandidates, setSelectedCandidates] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [codigoAutorizacao, setCodigoAutorizacao] = useState('');
  const [codigoValidado, setCodigoValidado] = useState(false);
  const [votacaoFinalizada, setVotacaoFinalizada] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Dados da eleição - serão carregados da API
  const [election, setElection] = useState<Election | null>(null);
  
  useEffect(() => {
    // Carregar dados da eleição ativa
    const loadElection = async () => {
      try {
        // TODO: Implementar chamada para API real
        // const response = await electionService.getActiveElection();
        // setElection(response.data);
        
        // Por enquanto, não há eleição ativa
        setElection(null);
      } catch (error) {
        console.error('Erro ao carregar eleição:', error);
      }
    };
    
    loadElection();
  }, []);

  const votingType = election?.votingType || 'single';

  const validarCodigo = () => {
    if (!codigoAutorizacao) {
      toast({
        title: "Código obrigatório",
        description: "Por favor, digite o código de autorização enviado por WhatsApp",
        variant: "destructive"
      });
      return;
    }

    // Simular validação do código (aqui seria uma chamada para API)
    if (codigoAutorizacao.length < 8) {
      toast({
        title: "Código inválido",
        description: "O código de autorização deve ter pelo menos 8 caracteres",
        variant: "destructive"
      });
      return;
    }

    // Simular verificação se já votou
    const jaVotou = localStorage.getItem(`voted_${election.id}_${codigoAutorizacao}`);
    if (jaVotou) {
      toast({
        title: "Voto já registrado",
        description: "Este código já foi utilizado para votar nesta eleição",
        variant: "destructive"
      });
      return;
    }

    setCodigoValidado(true);
    toast({
      title: "Código validado",
      description: "Código de autorização válido! Agora você pode votar.",
    });
  };

  const handleCandidateSelect = (candidateId: number) => {
    if (votingType === 'single') {
      setSelectedCandidates([candidateId]);
    } else {
      if (selectedCandidates.includes(candidateId)) {
        setSelectedCandidates(selectedCandidates.filter(id => id !== candidateId));
      } else {
        setSelectedCandidates([...selectedCandidates, candidateId]);
      }
    }
  };

  const isCandidateSelected = (candidateId: number) => {
    return selectedCandidates.includes(candidateId);
  };

  const handleVote = () => {
    // Validate vote selection
    if (votingType === 'single' && selectedCandidates.length === 0) {
      toast({
        title: "Erro na votação",
        description: "Selecione um candidato para votar",
        variant: "destructive"
      });
      return;
    }

    if (votingType === 'multiple' && selectedCandidates.length === 0) {
      toast({
        title: "Erro na votação",
        description: "Selecione pelo menos um candidato para votar",
        variant: "destructive"
      });
      return;
    }

    // Marcar código como usado
    localStorage.setItem(`voted_${election.id}_${codigoAutorizacao}`, 'true');
    
    // Simular envio do voto
    setVotacaoFinalizada(true);
    setShowSuccessDialog(true);

    // Limpar seleções
    setSelectedCandidates([]);
    setCodigoAutorizacao('');
    setCodigoValidado(false);
  };

  const voltarAoInicio = () => {
    setShowSuccessDialog(false);
    navigate('/dashboard-eleitor');
  };

  const filteredCandidates = election.candidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!codigoValidado) {
    return (
      <div className="container mx-auto py-8">
        <Card className="w-full max-w-md mx-auto shadow-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold flex items-center justify-center space-x-2">
              <Shield className="w-6 h-6 text-blue-600" />
              <span>Autorização de Votação</span>
            </CardTitle>
            <CardDescription>
              Digite o código enviado por WhatsApp pelo RH
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 mb-1">Como funciona:</p>
                  <ul className="text-blue-800 space-y-1">
                    <li>• Você recebeu um código único por WhatsApp</li>
                    <li>• Este código é válido apenas para esta eleição</li>
                    <li>• Após votar, o código será invalidado</li>
                    <li>• Cada pessoa pode votar apenas uma vez</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="codigo">Código de Autorização:</Label>
              <Input
                id="codigo"
                type="text"
                placeholder="Digite seu código único"
                value={codigoAutorizacao}
                onChange={(e) => setCodigoAutorizacao(e.target.value)}
                className="text-center font-mono text-lg"
              />
            </div>

            <Button 
              onClick={validarCodigo} 
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              <Key className="w-5 h-5 mr-2" />
              Validar Código
            </Button>

            <div className="text-center text-sm text-gray-600">
              <p>Não recebeu o código? Contate o RH</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto py-8">
        <Card className="w-full max-w-4xl mx-auto shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">
              <Vote className="mr-2 h-5 w-5 inline-block" />
              {election.name}
            </CardTitle>
            <Badge variant="secondary">
              <Clock className="mr-2 h-4 w-4 inline-block" />
              {election.status === 'active' ? 'Votação Aberta' : 'Votação Encerrada'}
            </Badge>
          </CardHeader>
          <CardDescription className="px-4 text-gray-600">
            {election.description}
          </CardDescription>
          <CardContent className="grid gap-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">Código validado com sucesso!</span>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="search">Buscar Candidato:</Label>
              <Input
                type="search"
                id="search"
                placeholder="Nome ou cargo do candidato"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="grid gap-4">
              <h3 className="text-lg font-semibold">Candidatos Disponíveis:</h3>
              
              {votingType === 'single' ? (
                <RadioGroup 
                  value={selectedCandidates[0]?.toString()} 
                  onValueChange={(value) => handleCandidateSelect(parseInt(value))} 
                  className="grid gap-4"
                >
                  {filteredCandidates.map((candidate) => (
                    <div key={candidate.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value={candidate.id.toString()} id={`candidate-${candidate.id}`} className="mt-1" />
                      <img
                        src={candidate.photo}
                        alt={candidate.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <Label htmlFor={`candidate-${candidate.id}`} className="cursor-pointer">
                          <h4 className="font-semibold text-lg">{candidate.name}</h4>
                          <p className="text-gray-600 text-sm">{candidate.role}</p>
                          <p className="text-gray-700 text-sm mt-2">{candidate.biography}</p>
                        </Label>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <div className="grid gap-4">
                  {filteredCandidates.map((candidate) => (
                    <div key={candidate.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                      <Checkbox
                        id={`candidate-${candidate.id}`}
                        checked={isCandidateSelected(candidate.id)}
                        onCheckedChange={() => handleCandidateSelect(candidate.id)}
                        className="mt-1"
                      />
                      <img
                        src={candidate.photo}
                        alt={candidate.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <Label htmlFor={`candidate-${candidate.id}`} className="cursor-pointer">
                          <h4 className="font-semibold text-lg">{candidate.name}</h4>
                          <p className="text-gray-600 text-sm">{candidate.role}</p>
                          <p className="text-gray-700 text-sm mt-2">{candidate.biography}</p>
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-orange-900">Atenção:</p>
                  <p className="text-orange-800">
                    Após confirmar seu voto, não será possível alterá-lo. Certifique-se de suas escolhas antes de prosseguir.
                  </p>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleVote} 
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded text-lg"
              size="lg"
              disabled={selectedCandidates.length === 0}
            >
              Confirmar Voto
              <Check className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Sucesso */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <DialogTitle className="text-2xl font-bold text-green-900">
              Voto Registrado com Sucesso!
            </DialogTitle>
            <DialogDescription className="text-center space-y-3">
              <p>Seu voto foi computado e registrado com segurança.</p>
              <p className="text-sm text-gray-600">
                Obrigado por participar da eleição CIPA 2024!
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-3 mt-6">
            <Button 
              onClick={voltarAoInicio}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Voltar ao Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Voting;
