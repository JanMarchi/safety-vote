
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="py-12 sm:py-16 bg-gray-800 text-gray-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Pronto para Modernizar suas Eleições CIPA com SafetyPro?</h2>
        <p className="text-lg text-gray-400 mb-8 max-w-xl mx-auto">
          Junte-se a centenas de empresas que confiam no SafetyPro para eleições seguras, transparentes e eficientes.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-10">
          <Link to="/register">
            <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-base px-8 py-3">
              Começar Trial Gratuito Agora
            </Button>
          </Link>
          <Link to="/contato">
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-white border-gray-500 hover:bg-gray-700 hover:border-gray-400 text-base px-8 py-3">
              Falar com um Especialista
            </Button>
          </Link>
        </div>
        <div className="text-xs text-gray-500 border-t border-gray-700 pt-8">
          <p className="mb-2"><strong>Informações LGPD:</strong> Seus dados são protegidos. Ao iniciar o trial, você concorda com nossos <Link to="/termos" className="underline hover:text-gray-300">Termos de Serviço</Link> e <Link to="/privacidade" className="underline hover:text-gray-300">Política de Privacidade</Link>. A cobrança é automática após 7 dias, cancele a qualquer momento.</p>
          <p>&copy; {new Date().getFullYear()} SafetyPro. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
