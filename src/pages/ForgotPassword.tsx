
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Vote, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulação de envio de email
    setTimeout(() => {
      if (email) {
        setEmailSent(true);
        toast({
          title: "Email enviado!",
          description: "Verifique sua caixa de entrada para redefinir sua senha.",
        });
      } else {
        toast({
          title: "Erro",
          description: "Por favor, digite um email válido",
          variant: "destructive"
        });
      }
      setIsLoading(false);
    }, 2000);
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Email enviado!</h2>
            <p className="text-gray-600">
              Enviamos um link de recuperação para <strong>{email}</strong>
            </p>
          </div>
          
          <Card className="shadow-xl border-0">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Verifique sua caixa de entrada e clique no link para redefinir sua senha.
                  O link expira em 1 hora.
                </p>
                
                <div className="space-y-2">
                  <Button 
                    onClick={() => setEmailSent(false)}
                    variant="outline" 
                    className="w-full"
                  >
                    Enviar novamente
                  </Button>
                  
                  <Link to="/login" className="block">
                    <Button variant="ghost" className="w-full">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Voltar ao login
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
              <Vote className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-gray-900">CIPA</h1>
              <p className="text-sm text-gray-600">Sistema Digital</p>
            </div>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Esqueceu sua senha?</h2>
          <p className="text-gray-600">Digite seu email para receber um link de recuperação</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl text-center">Recuperar Senha</CardTitle>
            <CardDescription className="text-center">
              Enviaremos um link seguro para redefinir sua senha
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? "Enviando..." : "Enviar link de recuperação"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/login" className="text-sm text-blue-600 hover:text-blue-800 font-medium inline-flex items-center">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Voltar ao login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
