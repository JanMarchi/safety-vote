export interface Company {
  id: string;
  name: string;
  cnpj: string;
  employees: number;
  status: 'active' | 'inactive';
  lastElection?: string;
  nextElection?: string;
}

export interface DashboardStats {
  totalCompanies: number;
  activeElections: number;
  totalVotes: number;
  completionRate: number;
}

class CompanyService {
  // Lista de empresas - em produção viria de uma API real
  private companies: Company[] = [];

  async getCompanies(): Promise<Company[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.companies;
  }

  async getCompanyById(id: string): Promise<Company | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.companies.find(company => company.id === id) || null;
  }

  async createCompany(company: Omit<Company, 'id'>): Promise<Company> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newCompany: Company = {
      ...company,
      id: Date.now().toString()
    };
    this.companies.push(newCompany);
    return newCompany;
  }

  async updateCompany(id: string, updates: Partial<Company>): Promise<Company | null> {
    await new Promise(resolve => setTimeout(resolve, 600));
    const index = this.companies.findIndex(company => company.id === id);
    if (index === -1) return null;
    
    this.companies[index] = { ...this.companies[index], ...updates };
    return this.companies[index];
  }

  async deleteCompany(id: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = this.companies.findIndex(company => company.id === id);
    if (index === -1) return false;
    
    this.companies.splice(index, 1);
    return true;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const totalCompanies = this.companies.length;
    const activeElections = this.companies.filter(c => c.status === 'active').length;
    const totalVotes = Math.floor(Math.random() * 5000) + 1000; // Simulated
    const completionRate = Math.floor(Math.random() * 30) + 70; // Simulated 70-100%
    
    return {
      totalCompanies,
      activeElections,
      totalVotes,
      completionRate
    };
  }

  async searchCompanies(query: string): Promise<Company[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const lowercaseQuery = query.toLowerCase();
    return this.companies.filter(company => 
      company.name.toLowerCase().includes(lowercaseQuery) ||
      company.cnpj.includes(query)
    );
  }
}

export const companyService = new CompanyService();