import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginComponent } from './components/auth/LoginComponent';
import RegisterComponent from './components/auth/RegisterComponent';
import { Dashboard } from './components/dashboard/DashboardSimple';
import CasosPage from './components/casos/CasosPage';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';

// Tema de Material-UI
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Componente para rutas protegidas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state } = useAuth();
  
  if (state.loading) {
    return <div>Loading...</div>;
  }
  
  if (!state.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Layout principal con sidebar
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          mt: 8, // Altura del navbar
          ml: { sm: sidebarOpen ? '240px' : 0 },
          transition: 'margin-left 0.3s'
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

// Componente principal de la app
const AppContent: React.FC = () => {
  const { state } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={
        state.isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginComponent />
      } />
      <Route path="/register" element={
        state.isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterComponent />
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <MainLayout>
            <Dashboard />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/casos" element={
        <ProtectedRoute>
          <MainLayout>
            <CasosPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
