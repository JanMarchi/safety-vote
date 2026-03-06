import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import DashboardLayout from '@/components/DashboardLayout';
import { Upload, Download, Plus, Search, Edit, Trash2, Mail, Key, Users, MessageCircle, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import VotingKeyGenerator from '@/utils/keyGenerator';

interface Voter {
  id: number;
  name: string;
  email: string;
  cpf: string;
  sector: string;
  hasKey: boolean;
  keyGenerated: boolean;
  emailSent: boolean;
  hasVoted: boolean;
  phone: string;
  status: string;
  hasAccess: boolean;
  tokenSent: boolean;
}

const Voters = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isGeneratingKeys, setIsGeneratingKeys] = useState(false);
  const [isSendingEmails, setIsSendingEmails] = useState(false);
  const [keyGenerator] = useState(() => VotingKeyGenerator.getInstance());
  const [showKeyDialog, setShowKeyDialog] = useState(false);
  const [sendingProgress, setSendingProgress] = useState(0);

  // Eleição atual - será carregada da API
  const [currentElection, setCurrentElection] = useState(null);
  
  // Lista de eleitores - será carregada da API
  const [voters, setVoters] = useState<Voter[]>([]);
  
  useEffect(() => {
    // Carregar dados da eleição e eleitores
    const loadData = async () => {
      try {
        // TODO: Implementar chamadas para API real
        // const electionResponse = await electionService.getCurrentElection();
        // const votersResponse = await voterService.getVoters();
        // setCurrentElection(electionResponse.data);
        // setVoters(votersResponse.data);
        
        // Por enquanto, dados vazios
        setCurrentElection({
          name: "Nova Eleição CIPA",
          endDate: "",
          status: "Configurando"
        });
        setVoters([]);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };
    
    loadData();
  }, []);

  useEffect(() => {
    keyGenerator.loadFromStorage();
  }, [keyGenerator]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && 
          file.type !== 'application/vnd.ms-excel') {
        toast({
          title: "Formato inválido",
          description: "Apenas arquivos Excel (.xlsx, .xls) são aceitos",
          variant: "destructive"
        });
        return;
      }
      setSelectedFile(file);
      toast({
        title: "Arquivo selecionado",
        description: `${file.name} está pronto para upload`,
      });
    }
  };

  const handleUploadSubmit = () => {
    if (!selectedFile) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Selecione um arquivo antes de fazer o upload",
        variant: "destructive"
      });
      return;
    }

    // Simular processamento
    console.log('Processando arquivo:', selectedFile.name);
    
    toast({
      title: "Upload realizado",
      description: "Lista de eleitores importada com sucesso",
    });
    
    setSelectedFile(null);
  };

  const generateTokens = async () => {
    setIsGeneratingKeys(true);
    
    try {
      // Passa a data de término da eleição para o gerador de chaves
      const keys = keyGenerator.generateKeysForVoters(voters, currentElection.endDate);
      
      toast({
        title: "Chaves geradas com sucesso!",
        description: `${keys.length} chaves únicas foram geradas válidas até ${new Date(currentElection.endDate).toLocaleDateString('pt-BR')}`,
      });
      
      console.log('Chaves geradas:', keys);
    } catch (error) {
      toast({
        title: "Erro ao gerar chaves",
        description: "Ocorreu um erro durante a geração das chaves",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingKeys(false);
    }
  };

  const sendTokensByEmail = async () => {
    setIsSendingEmails(true);
    setSendingProgress(0);
    
    try {
      let processed = 0;
      const total = voters.length;
      
      for (const voter of voters) {
        const key = keyGenerator.getKeyForVoter(voter.id);
        if (key) {
          await keyGenerator.sendKeyByEmail(voter, key, currentElection.name);
        }
        processed++;
        setSendingProgress((processed / total) * 100);
        
        // Delay entre envios
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      toast({
        title: "E-mails enviados com sucesso!",
        description: `Chaves de votação enviadas para ${voters.length} eleitores`,
      });
    } catch (error) {
      toast({
        title: "Erro ao enviar e-mails",
        description: "Alguns e-mails podem não ter sido enviados",
        variant: "destructive"
      });
    } finally {
      setIsSendingEmails(false);
      setSendingProgress(0);
    }
  };

  const sendTokensByWhatsApp = async () => {
    try {
      const { success, failed } = await keyGenerator.sendBulkKeys(voters, 'whatsapp', currentElection.name);
      
      toast({
        title: "WhatsApp enviado!",
        description: `${success} mensagens enviadas, ${failed} falharam`,
      });
    } catch (error) {
      toast({
        title: "Erro ao enviar WhatsApp",
        description: "Verifique os números de telefone",
        variant: "destructive"
      });
    }
  };

  const sendIndividualWhatsApp = async (voter: Voter) => {
    const key = keyGenerator.getKeyForVoter(voter.id);
    if (!key) {
      toast({
        title: "Chave não encontrada",
        description: "Gere as chaves primeiro",
        variant: "destructive"
      });
      return;
    }

    try {
      await keyGenerator.sendKeyByWhatsApp(voter, key, currentElection.name);
      toast({
        title: "WhatsApp aberto!",
        description: `Mensagem preparada para ${voter.name}`,
      });
    } catch (error) {
      toast({
        title: "Erro ao abrir WhatsApp",
        description: "Verifique o número de telefone",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'Ativo' 
      ? <Badge className="bg-green-100 text-green-800">Ativo</Badge>
      : <Badge className="bg-red-100 text-red-800">Inativo</Badge>;
  };

  const getVoteBadge = (hasVoted: boolean) => {
    return hasVoted 
      ? <Badge className="bg-blue-100 text-blue-800">Votou</Badge>
      : <Badge className="bg-gray-100 text-gray-800">Pendente</Badge>;
  };

  const getKeyStatus = (voterId: number) => {
    const hasKey = keyGenerator.hasValidKey(voterId);
    return hasKey 
      ? <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Gerada</Badge>
      : <Badge className="bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" />Não gerada</Badge>;
  };

  const filteredVoters = voters.filter(voter =>
    voter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    voter.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    voter.cpf.includes(searchTerm)
  );

  return (
    <DashboardLayout userType="rh">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestão de Eleitores</h1>
            <p className="text-gray-600">Gerencie os eleitores e suas chaves de votação</p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={generateTokens}
              disabled={isGeneratingKeys}
            >
              <Key className="w-4 h-4 mr-2" />
              {isGeneratingKeys ? 'Gerando...' : 'Gerar Chaves'}
            </Button>
            
            <Dialog open={showKeyDialog} onOpenChange={setShowKeyDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Chaves
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Enviar Chaves de Votação</DialogTitle>
                  <DialogDescription>
                    Escolha como enviar as chaves para os eleitores
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {isSendingEmails && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Enviando e-mails...</span>
                        <span className="text-sm">{Math.round(sendingProgress)}%</span>
                      </div>
                      <Progress value={sendingProgress} className="h-2" />
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      onClick={sendTokensByEmail}
                      disabled={isSendingEmails}
                      className="flex items-center justify-center"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Por E-mail
                    </Button>
                    
                    <Button 
                      onClick={sendTokensByWhatsApp}
                      variant="outline"
                      className="flex items-center justify-center"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Por WhatsApp
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Eleitores</p>
                  <p className="text-2xl font-bold text-gray-900">{voters.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Votaram</p>
                  <p className="text-2xl font-bold text-green-600">
                    {voters.filter(v => v.hasVoted).length}
                  </p>
                </div>
                <Key className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pendentes</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {voters.filter(v => !v.hasVoted).length}
                  </p>
                </div>
                <Mail className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Quórum</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {Math.round((voters.filter(v => v.hasVoted).length / voters.length) * 100)}%
                  </p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upload em Massa */}
        <Card>
          <CardHeader>
            <CardTitle>Upload em Massa</CardTitle>
            <CardDescription>
              Importe eleitores via planilha Excel. 
              <a href="#" className="text-blue-600 hover:underline ml-2">
                Baixar modelo
              </a>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="cursor-pointer"
                  />
                </div>
                <Button onClick={handleUploadSubmit} disabled={!selectedFile}>
                  <Upload className="w-4 h-4 mr-2" />
                  Importar
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Modelo
                </Button>
              </div>
              
              {selectedFile && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Arquivo selecionado:</strong> {selectedFile.name}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lista de Eleitores */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Lista de Eleitores</CardTitle>
                <CardDescription>Visualize e gerencie todos os eleitores cadastrados</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar eleitores..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Nome</th>
                    <th className="text-left py-3 px-4 font-medium">CPF</th>
                    <th className="text-left py-3 px-4 font-medium">E-mail</th>
                    <th className="text-left py-3 px-4 font-medium">Telefone</th>
                    <th className="text-left py-3 px-4 font-medium">Setor</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Votação</th>
                    <th className="text-left py-3 px-4 font-medium">Token</th>
                    <th className="text-left py-3 px-4 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVoters.map((voter) => (
                    <tr key={voter.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{voter.name}</td>
                      <td className="py-3 px-4 text-sm">{voter.cpf}</td>
                      <td className="py-3 px-4 text-sm">{voter.email}</td>
                      <td className="py-3 px-4 text-sm">{voter.phone}</td>
                      <td className="py-3 px-4 text-sm">{voter.sector}</td>
                      <td className="py-3 px-4">{getStatusBadge(voter.status)}</td>
                      <td className="py-3 px-4">{getVoteBadge(voter.hasVoted)}</td>
                      <td className="py-3 px-4">
                        {voter.tokenSent ? (
                          <Badge className="bg-green-100 text-green-800">Enviado</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">Não enviado</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => sendIndividualWhatsApp(voter)}
                          >
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Voters;
