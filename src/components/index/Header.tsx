
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, ArrowLeft, Shield } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoBack = () => {
    // Se houver histórico, volta para a página anterior
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Se não houver histórico (primeira página), vai para home
      navigate('/');
    }
  };

  // Verifica se está em uma página interna (não é a home)
  const isInternalPage = location.pathname !== '/';

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo e Botão Voltar */}
          <div className="flex items-center space-x-4">
            {isInternalPage && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleGoBack}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">SafetyPro</h1>
                <p className="text-xs text-gray-600">Safety Vote</p>
              </div>
            </Link>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-gray-900 transition-colors">
              Início
            </Link>
            <Link to="/plans" className="text-gray-600 hover:text-gray-900 transition-colors">
              Planos
            </Link>
            <Link to="/termos" className="text-gray-600 hover:text-gray-900 transition-colors">
              Termos
            </Link>
            <Link to="/privacidade" className="text-gray-600 hover:text-gray-900 transition-colors">
              Privacidade
            </Link>
          </nav>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link to="/register">
              <Button>Cadastrar</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col space-y-4 mt-8">
                <Link
                  to="/"
                  className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Início
                </Link>
                <Link
                  to="/plans"
                  className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Planos
                </Link>
                <Link
                  to="/termos"
                  className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Termos
                </Link>
                <Link
                  to="/privacidade"
                  className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Privacidade
                </Link>
                <div className="pt-4 border-t">
                  <div className="flex flex-col space-y-2">
                    <Link to="/login" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        Entrar
                      </Button>
                    </Link>
                    <Link to="/register" onClick={() => setIsOpen(false)}>
                      <Button className="w-full">Cadastrar</Button>
                    </Link>
                  </div>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
