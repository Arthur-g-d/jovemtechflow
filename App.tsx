import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ProtectedRoute } from "@/routes/ProtectedRoute";

import HomePage from "@/pages/HomePage";
import AuthPage from "@/pages/AuthPage";
import Dashboard from "@/pages/Dashboard";
import ProjectLibraryPage from "@/pages/ProjectLibraryPage";
import ProjectDetailsPage from "@/pages/ProjectDetailsPage";
import ProjectStudyPage from "@/pages/ProjectStudyPage";
import EventsPage from "@/pages/EventsPage";
import EventDetailsPage from "@/pages/EventDetailsPage";
import ForumPage from "@/pages/ForumPage";
import EditProfilePage from "@/pages/EditProfilePage";
import AdminPage from "@/pages/AdminPage";
import NotFound from "@/pages/NotFound";

// Configuração padrão do TanStack Query.
// Defaults conservadores: 1 min de stale, sem refetch em foco (irritante em dev).
// Componentes podem sobrescrever caso a caso (M3).
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* BUG-03: Toasters precisam estar montados aqui ou todos os toast.* da
            app são silenciosos. Mantemos os dois enquanto a migração para um
            único provedor (Sonner) não estiver completa (H5). */}
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Públicas */}
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/projetos" element={<ProjectLibraryPage />} />
            <Route path="/projetos/:id" element={<ProjectDetailsPage />} />
            <Route path="/eventos" element={<EventsPage />} />
            <Route path="/eventos/:id" element={<EventDetailsPage />} />
            <Route path="/forum" element={<ForumPage />} />

            {/* Autenticadas */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projetos/:id/estudar"
              element={
                <ProtectedRoute>
                  <ProjectStudyPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/perfil"
              element={
                <ProtectedRoute>
                  <EditProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Admin */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminPage />
                </ProtectedRoute>
              }
            />

            {/* 404 — antes não existia rota `*`, qualquer URL inválida
                renderizava em branco (BUG do roteamento, parte do DT-11). */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
