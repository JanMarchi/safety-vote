
import { toast } from "@/hooks/use-toast";

// Interface para dados do eleitor
interface Voter {
  id: number;
  name: string;
  email: string;
  cpf?: string;
  phone?: string;
}

// Interface para chave gerada
interface GeneratedKey {
  voterId: number;
  key: string;
  timestamp: string;
  expiresAt: string;
}

// Classe para geração de chaves seguras
class VotingKeyGenerator {
  private static instance: VotingKeyGenerator;
  private generatedKeys: Map<number, GeneratedKey> = new Map();

  static getInstance(): VotingKeyGenerator {
    if (!VotingKeyGenerator.instance) {
      VotingKeyGenerator.instance = new VotingKeyGenerator();
    }
    return VotingKeyGenerator.instance;
  }

  // Gera uma chave única e segura
  private generateSecureKey(): string {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removidos caracteres confusos
    const segments = [];
    
    // Gera 4 segmentos de 4 caracteres cada
    for (let i = 0; i < 4; i++) {
      let segment = '';
      for (let j = 0; j < 4; j++) {
        segment += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      segments.push(segment);
    }
    
    return segments.join('-');
  }

  // Gera chave para um eleitor específico com data de expiração customizada
  generateKeyForVoter(voter: Voter, electionEndDate?: string): GeneratedKey {
    const timestamp = new Date().toISOString();
    
    // Se não tiver data da eleição, usa 30 dias como fallback
    const expiresAt = electionEndDate 
      ? new Date(electionEndDate).toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const generatedKey: GeneratedKey = {
      voterId: voter.id,
      key: this.generateSecureKey(),
      timestamp,
      expiresAt
    };

    // Armazena a chave gerada
    this.generatedKeys.set(voter.id, generatedKey);
    
    // Salva no localStorage para persistência (em produção seria no backend)
    this.saveToStorage();
    
    return generatedKey;
  }

  // Gera chaves para múltiplos eleitores com data de expiração customizada
  generateKeysForVoters(voters: Voter[], electionEndDate?: string): GeneratedKey[] {
    const keys: GeneratedKey[] = [];
    
    voters.forEach(voter => {
      const key = this.generateKeyForVoter(voter, electionEndDate);
      keys.push(key);
    });
    
    return keys;
  }

  // Obtém chave de um eleitor
  getKeyForVoter(voterId: number): GeneratedKey | null {
    return this.generatedKeys.get(voterId) || null;
  }

  // Verifica se eleitor tem chave válida
  hasValidKey(voterId: number): boolean {
    const key = this.generatedKeys.get(voterId);
    if (!key) return false;
    
    const now = new Date();
    const expires = new Date(key.expiresAt);
    
    return now < expires;
  }

  // Salva chaves no localStorage
  private saveToStorage(): void {
    const keysArray = Array.from(this.generatedKeys.entries());
    localStorage.setItem('voting_keys', JSON.stringify(keysArray));
  }

  // Carrega chaves do localStorage
  loadFromStorage(): void {
    const stored = localStorage.getItem('voting_keys');
    if (stored) {
      const keysArray = JSON.parse(stored);
      this.generatedKeys = new Map(keysArray);
    }
  }

  // Envia chave por e-mail
  async sendKeyByEmail(voter: Voter, key: GeneratedKey, electionName?: string): Promise<boolean> {
    try {
      // Simula envio de e-mail (em produção seria uma API real)
      console.log(`Enviando e-mail para ${voter.email}:`);
      console.log(`Assunto: Sua chave de votação - ${electionName || 'Eleição CIPA'}`);
      console.log(`Chave: ${key.key}`);
      console.log(`Válida até: ${new Date(key.expiresAt).toLocaleDateString('pt-BR')}`);
      
      // Simula delay de envio
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      return false;
    }
  }

  // Envia chave por WhatsApp
  async sendKeyByWhatsApp(voter: Voter, key: GeneratedKey, electionName?: string): Promise<boolean> {
    try {
      const phone = voter.phone?.replace(/\D/g, ''); // Remove caracteres não numéricos
      if (!phone) {
        throw new Error('Telefone não informado');
      }

      const message = encodeURIComponent(
        `🗳️ *${electionName || 'Eleição CIPA 2024'}*\n\n` +
        `Olá ${voter.name}!\n\n` +
        `Sua chave de votação: *${key.key}*\n\n` +
        `⏰ Válida até: ${new Date(key.expiresAt).toLocaleDateString('pt-BR')}\n\n` +
        `🔗 Link para votar: ${window.location.origin}/voting\n\n` +
        `_Esta chave é pessoal e intransferível._`
      );

      // Abre WhatsApp Web/App com a mensagem
      const whatsappUrl = `https://wa.me/55${phone}?text=${message}`;
      window.open(whatsappUrl, '_blank');
      
      return true;
    } catch (error) {
      console.error('Erro ao enviar WhatsApp:', error);
      return false;
    }
  }

  // Envia chaves em massa
  async sendBulkKeys(voters: Voter[], method: 'email' | 'whatsapp' | 'both', electionName?: string): Promise<{success: number, failed: number}> {
    let success = 0;
    let failed = 0;

    for (const voter of voters) {
      const key = this.getKeyForVoter(voter.id);
      if (!key) continue;

      try {
        if (method === 'email' || method === 'both') {
          await this.sendKeyByEmail(voter, key, electionName);
        }
        
        if (method === 'whatsapp' || method === 'both') {
          await this.sendKeyByWhatsApp(voter, key, electionName);
          // Delay entre envios para não sobrecarregar
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        success++;
      } catch (error) {
        failed++;
        console.error(`Erro ao enviar para ${voter.name}:`, error);
      }
    }

    return { success, failed };
  }
}

export default VotingKeyGenerator;
