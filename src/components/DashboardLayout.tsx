
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Vote, Menu, LogOut, Settings, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import useMenuItems from '@/hooks/useMenuItems';
import useUserInfo from '@/hooks/useUserInfo';
import { authService } from '@/services/authService';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userType: 'admin-sistema' | 'rh' | 'eleitor';
}

const DashboardLayout = ({ children, userType }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  
  const menuItems = useMenuItems(userType);
  const userInfo = useUserInfo(userType);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full ${mobile ? 'w-full' : 'w-64 xl:w-72'} bg-white border-r border-gray-200`}>
      {/* Logo */}
      <div className="flex items-center px-4 sm:px-6 py-4 border-b border-gray-200">
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-8 h-8 xl:w-10 xl:h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
            <Vote className="w-5 h-5 xl:w-6 xl:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg xl:text-xl font-bold text-gray-900">CIPA</h1>
            <p className="text-xs xl:text-sm text-gray-600">Sistema Digital</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 sm:px-4 py-6 space-y-1">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className="flex items-center px-3 py-2.5 xl:py-3 text-sm xl:text-base text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
            onClick={() => mobile && setSidebarOpen(false)}
          >
            <span className="mr-3 flex-shrink-0">{item.icon}</span>
            <span className="truncate">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* User Info */}
      <div className="px-3 sm:px-4 py-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <Avatar className="w-8 h-8 xl:w-10 xl:h-10 flex-shrink-0">
            <AvatarFallback className="bg-blue-100 text-blue-600 text-sm xl:text-base font-medium">
              {userInfo.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm xl:text-base font-medium text-gray-900 truncate">{userInfo.name}</p>
            <p className="text-xs xl:text-sm text-gray-500 truncate">{userInfo.role}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-72 sm:w-80">
          <Sidebar mobile />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Mobile Menu Button */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="lg:hidden"
                      onClick={() => setSidebarOpen(true)}
                    >
                      <Menu className="w-5 h-5" />
                    </Button>
                  </SheetTrigger>
                </Sheet>
                
                <h2 className="text-lg sm:text-xl xl:text-2xl font-semibold text-gray-900">Dashboard</h2>
              </div>

              <div className="flex items-center space-x-2">
                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 px-3 py-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-medium">
                          {userInfo.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden md:block text-left">
                        <p className="text-sm font-medium text-gray-900">{userInfo.name}</p>
                        <p className="text-xs text-gray-500">{userInfo.role}</p>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="w-4 h-4 mr-2" />
                      Perfil
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="w-4 h-4 mr-2" />
                      Configurações
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
