// Configuração centralizada de candidatos
export interface Candidate {
  id: string;
  name: string;
  votes: number;
  department: string;
  image: string;
}

export const CANDIDATES: Candidate[] = [
  {
    id: '1',
    name: 'João Silva',
    votes: 72,
    department: 'TI',
    image: '/img/joão.jpg'
  },
  {
    id: '2',
    name: 'Maria Santos',
    votes: 65,
    department: 'Financeiro',
    image: '/img/maria.jpg'
  },
  {
    id: '3',
    name: 'Pedro Costa',
    votes: 58,
    department: 'RH',
    image: '/img/pedro.jpg'
  },
  {
    id: '4',
    name: 'Joana Lima',
    votes: 51,
    department: 'Vendas',
    image: '/img/joana.jpg'
  },
  {
    id: '5',
    name: 'Marcos Oliveira',
    votes: 44,
    department: 'Administrativo',
    image: '/img/marcos.jpg'
  },
  {
    id: '6',
    name: 'Antônio Rocha',
    votes: 37,
    department: 'Logística',
    image: '/img/antonio.jpg'
  },
  {
    id: '7',
    name: 'Isa Martins',
    votes: 60,
    department: 'Marketing',
    image: '/img/isa.avif'
  }
];

// Calcular total de votos
export const TOTAL_VOTES = CANDIDATES.reduce((sum, candidate) => sum + candidate.votes, 0);
