
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PricingTable = () => {
  // Função para calcular o preço baseado no número de colaboradores
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

  const exemplosFaixas = [
    { faixa: "1-20", colaboradores: 20, preco: calcularPreco(20) },
    { faixa: "21-50", colaboradores: 50, preco: calcularPreco(50) },
    { faixa: "51-100", colaboradores: 100, preco: calcularPreco(100) },
    { faixa: "101-200", colaboradores: 200, preco: calcularPreco(200) },
    { faixa: "201-500", colaboradores: 500, preco: calcularPreco(500) },
    { faixa: "501-1000", colaboradores: 1000, preco: calcularPreco(1000) },
    { faixa: "1001+", colaboradores: 2000, preco: calcularPreco(2000) }
  ];

  return (
    <Card className="shadow-xl border-0">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Tabela de Preços por Faixa</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Faixa de Colaboradores</TableHead>
              <TableHead className="text-center">Exemplo (colaboradores)</TableHead>
              <TableHead className="text-right">Preço Mensal</TableHead>
              <TableHead className="text-right">Preço por Colaborador</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exemplosFaixas.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.faixa}</TableCell>
                <TableCell className="text-center">{item.colaboradores}</TableCell>
                <TableCell className="text-right font-bold text-blue-600">
                  {formatPrice(item.preco)}
                </TableCell>
                <TableCell className="text-right text-sm text-gray-600">
                  {formatPrice(item.preco / item.colaboradores)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> Preço fixo de R$ 99,90 até 50 colaboradores. 
            Acima de 50, adiciona-se R$ 1,80 por colaborador extra.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PricingTable;
