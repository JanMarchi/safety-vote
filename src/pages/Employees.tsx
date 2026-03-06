import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/DashboardLayout';
import { Upload, Plus, Download, Edit, Trash2, Search, Users, FileUp } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  admissionDate: string;
  status: 'Ativo' | 'Inativo';
}

const EmployeesPage = () => {
  const { toast } = useToast();
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Dados simulados de funcionários
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '1',
      name: 'João Silva',
      email: 'joao.silva@company.com',
      department: 'TI',
      position: 'Desenvolvedor',
      admissionDate: '2022-01-15',
      status: 'Ativo'
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria.santos@company.com',
      department: 'RH',
      position: 'Gerente RH',
      admissionDate: '2021-06-10',
      status: 'Ativo'
    },
    {
      id: '3',
      name: 'Pedro Oliveira',
      email: 'pedro.oliveira@company.com',
      department: 'Financeiro',
      position: 'Analista Financeiro',
      admissionDate: '2023-03-20',
      status: 'Ativo'
    }
  ]);

  // Form para cadastro manual
  const [manualForm, setManualForm] = useState({
    name: '',
    email: '',
    department: '',
    position: '',
    admissionDate: ''
  });

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleManualAdd = () => {
    if (!manualForm.name || !manualForm.email || !manualForm.department || !manualForm.position) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const newEmployee: Employee = {
      id: String(employees.length + 1),
      ...manualForm,
      status: 'Ativo'
    };

    setEmployees([...employees, newEmployee]);
    setManualForm({
      name: '',
      email: '',
      department: '',
      position: '',
      admissionDate: ''
    });
    setIsManualDialogOpen(false);

    toast({
      title: "Sucesso",
      description: `Funcionário ${newEmployee.name} cadastrado com sucesso.`,
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileType = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'txt'].includes(fileType || '')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo CSV ou TXT.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const fileContent = await file.text();
      const lines = fileContent.split('\n').filter(line => line.trim());

      // Pular cabeçalho se existir
      const dataLines = lines.slice(1);
      const importedCount = dataLines.length;

      if (importedCount === 0) {
        toast({
          title: "Aviso",
          description: "O arquivo não contém dados para importar.",
          variant: "destructive",
        });
        return;
      }

      // Simular importação (na prática, você processaria o CSV/TXT)
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Sucesso",
        description: `${importedCount} funcionário(s) importado(s) com sucesso.`,
      });

      // Limpar input
      event.target.value = '';
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao processar o arquivo. Verifique o formato.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const template = 'Nome;Email;Departamento;Cargo;Data de Admissão\n' +
      'João Silva;joao@company.com;TI;Desenvolvedor;2023-01-15\n' +
      'Maria Santos;maria@company.com;RH;Gerente;2023-06-10';

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(template));
    element.setAttribute('download', 'template_funcionarios.csv');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast({
      title: "Sucesso",
      description: "Template de importação baixado com sucesso.",
    });
  };

  const handleDeleteEmployee = () => {
    if (!selectedEmployee) return;

    setEmployees(employees.filter(emp => emp.id !== selectedEmployee.id));
    setIsDeleteDialogOpen(false);
    setSelectedEmployee(null);

    toast({
      title: "Sucesso",
      description: `Funcionário ${selectedEmployee.name} removido com sucesso.`,
    });
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setManualForm({
      name: employee.name,
      email: employee.email,
      department: employee.department,
      position: employee.position,
      admissionDate: employee.admissionDate
    });
    setIsManualDialogOpen(true);
  };

  return (
    <DashboardLayout userType="rh">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Funcionários</h1>
            <p className="text-gray-600">Gerencie os funcionários da sua empresa</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
            <Dialog open={isManualDialogOpen} onOpenChange={setIsManualDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    setSelectedEmployee(null);
                    setManualForm({
                      name: '',
                      email: '',
                      department: '',
                      position: '',
                      admissionDate: ''
                    });
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Cadastrar Manual
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>
                    {selectedEmployee ? 'Editar Funcionário' : 'Cadastrar Novo Funcionário'}
                  </DialogTitle>
                  <DialogDescription>
                    Preencha os dados do funcionário
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      value={manualForm.name}
                      onChange={(e) => setManualForm({...manualForm, name: e.target.value})}
                      placeholder="Nome completo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={manualForm.email}
                      onChange={(e) => setManualForm({...manualForm, email: e.target.value})}
                      placeholder="email@company.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Departamento *</Label>
                    <Input
                      id="department"
                      value={manualForm.department}
                      onChange={(e) => setManualForm({...manualForm, department: e.target.value})}
                      placeholder="ex: TI, RH, Financeiro"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Cargo *</Label>
                    <Input
                      id="position"
                      value={manualForm.position}
                      onChange={(e) => setManualForm({...manualForm, position: e.target.value})}
                      placeholder="ex: Desenvolvedor, Gerente"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admissionDate">Data de Admissão</Label>
                    <Input
                      id="admissionDate"
                      type="date"
                      value={manualForm.admissionDate}
                      onChange={(e) => setManualForm({...manualForm, admissionDate: e.target.value})}
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button onClick={handleManualAdd} className="flex-1 bg-blue-600 hover:bg-blue-700">
                      {selectedEmployee ? 'Atualizar' : 'Cadastrar'}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setIsManualDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <div className="relative">
              <label htmlFor="file-upload" className="cursor-pointer">
                <Button asChild className="bg-green-600 hover:bg-green-700 w-full">
                  <span>
                    <FileUp className="w-4 h-4 mr-2" />
                    Upload CSV/TXT
                  </span>
                </Button>
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                disabled={isLoading}
                className="hidden"
              />
            </div>

            <Button
              variant="outline"
              onClick={handleDownloadTemplate}
            >
              <Download className="w-4 h-4 mr-2" />
              Template
            </Button>
          </div>
        </div>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <Users className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Total de Funcionários: {employees.length}</p>
                <p className="text-sm text-blue-800 mt-1">
                  O arquivo CSV/TXT deve conter as colunas: Nome, Email, Departamento, Cargo, Data de Admissão (separadas por ponto-e-vírgula ou vírgula)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Pesquisar por nome, email ou departamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Employees Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Funcionários</CardTitle>
            <CardDescription>
              Todos os funcionários cadastrados na empresa
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredEmployees.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Nenhum funcionário encontrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Departamento</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead>Data Admissão</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">{employee.name}</TableCell>
                        <TableCell>{employee.email}</TableCell>
                        <TableCell>{employee.department}</TableCell>
                        <TableCell>{employee.position}</TableCell>
                        <TableCell>
                          {new Date(employee.admissionDate).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800">
                            {employee.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditEmployee(employee)}
                              title="Editar funcionário"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:bg-red-50"
                              onClick={() => {
                                setSelectedEmployee(employee);
                                setIsDeleteDialogOpen(true);
                              }}
                              title="Deletar funcionário"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja remover o funcionário "{selectedEmployee?.name}"? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-3">
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteEmployee}
                className="bg-red-600 hover:bg-red-700"
              >
                Deletar
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default EmployeesPage;
