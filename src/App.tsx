
import './App.css';
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Plans from "./pages/Plans";
import Elections from "./pages/Elections";
import NewElection from "./pages/NewElection";
import PrepareElection from "./pages/PrepareElection";
import MonitorElection from "./pages/MonitorElection";
import ElectionResults from "./pages/ElectionResults";
import ElectionVoters from "./pages/ElectionVoters";
import Voting from "./pages/Voting";
import DashboardAdmin from "./pages/DashboardAdmin";
import DashboardRH from "./pages/DashboardRH";
import DashboardEleitor from "./pages/DashboardEleitor";
import CompanyRegister from "./pages/CompanyRegister";
import Voters from "./pages/Voters";
import Candidates from "./pages/Candidates";
import Users from "./pages/Users";
import Reports from "./pages/Reports";
import RHReports from "./pages/RHReports";
import Employees from "./pages/Employees";
import ElectionPresentation from "./pages/ElectionPresentation";
import Settings from "./pages/Settings";
import MinhasChaves from "./pages/MinhasChaves";
import Historico from "./pages/Historico";
import ResultadosPublicos from "./pages/ResultadosPublicos";
import Security from "./pages/Security";
import CipaCompliance from "./pages/CipaCompliance";
import Companies from "./pages/Companies";
import SystemUsers from "./pages/SystemUsers";
import SystemSettings from "./pages/SystemSettings";
import SystemReports from "./pages/SystemReports";
import RHSettings from "./pages/RHSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
      >
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/elections" element={<Elections />} />
          <Route path="/elections/new" element={<NewElection />} />
          <Route path="/elections/:id/edit" element={<PrepareElection />} />
          <Route path="/elections/:id/monitor" element={<MonitorElection />} />
          <Route path="/elections/:id/results" element={<ElectionResults />} />
          <Route path="/elections/:id/voters" element={<ElectionVoters />} />
          <Route path="/voting" element={<Voting />} />
          <Route path="/dashboard-admin" element={<DashboardAdmin />} />
          <Route path="/dashboard-rh" element={<DashboardRH />} />
          <Route path="/dashboard-eleitor" element={<DashboardEleitor />} />
          <Route path="/company-register" element={<CompanyRegister />} />
          <Route path="/voters" element={<Voters />} />
          <Route path="/candidates" element={<Candidates />} />
          <Route path="/users" element={<Users />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/rh-reports" element={<RHReports />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/election-presentation" element={<ElectionPresentation />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/minhas-chaves" element={<MinhasChaves />} />
          <Route path="/historico" element={<Historico />} />
          <Route path="/resultados-publicos" element={<ResultadosPublicos />} />
          <Route path="/security" element={<Security />} />
          <Route path="/cipa-compliance" element={<CipaCompliance />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/system-users" element={<SystemUsers />} />
          <Route path="/system-settings" element={<SystemSettings />} />
          <Route path="/system-reports" element={<SystemReports />} />
          <Route path="/rh-settings" element={<RHSettings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
