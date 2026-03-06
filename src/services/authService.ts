export interface User {
  email: string;
  type: 'admin-sistema' | 'rh' | 'eleitor';
  loggedIn: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  redirectPath?: string;
  error?: string;
}

class AuthService {
  private readonly STORAGE_KEY = 'user';

  /**
   * Simula autenticação do usuário
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { email, password } = credentials;

    // Validação básica
    if (!email || !password) {
      return {
        success: false,
        error: 'Por favor, preencha todos os campos'
      };
    }

    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Determinar tipo de usuário baseado no email
    let userType: User['type'] = 'eleitor';
    let redirectPath = '/dashboard-eleitor';

    if (email.includes('admin@sistema')) {
      userType = 'admin-sistema';
      redirectPath = '/dashboard-admin';
    } else if (email.includes('rh@') || email.includes('gestor@')) {
      userType = 'rh';
      redirectPath = '/dashboard-rh';
    }

    const user: User = {
      email,
      type: userType,
      loggedIn: true
    };

    // Salvar no localStorage
    this.saveUser(user);

    return {
      success: true,
      user,
      redirectPath
    };
  }

  /**
   * Realiza logout do usuário
   */
  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Obtém usuário atual do localStorage
   */
  getCurrentUser(): User | null {
    try {
      const userData = localStorage.getItem(this.STORAGE_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  /**
   * Verifica se usuário está autenticado
   */
  isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    return user?.loggedIn === true;
  }

  /**
   * Salva dados do usuário no localStorage
   */
  private saveUser(user: User): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
  }

  /**
   * Obtém informações do usuário baseado no tipo
   */
  getUserInfo(userType: User['type']) {
    switch (userType) {
      case 'admin-sistema':
        return { name: 'Administrador', role: 'Administrador do Sistema', initials: 'AD' };
      case 'rh':
        return { name: 'Gestor RH', role: 'Recursos Humanos', initials: 'RH' };
      case 'eleitor':
        return { name: 'Eleitor', role: 'Funcionário', initials: 'EL' };
      default:
        return { name: 'Usuário', role: 'Usuário', initials: 'U' };
    }
  }
}

export const authService = new AuthService();