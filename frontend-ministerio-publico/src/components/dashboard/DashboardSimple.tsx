import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Folder,
  FolderOpen,
  Assignment,
  People,
  TrendingUp,
  CalendarToday,
  CheckCircle,
  Schedule,
} from '@mui/icons-material';
import { informeService, DashboardData } from '../../services/informeService';
import { useAuth } from '../../contexts/AuthContext';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactElement;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, subtitle }) => (
  <Card sx={{ mb: 2 }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography color="textSecondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4" component="h2" color={`${color}.main`}>
            {value.toLocaleString()}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="textSecondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            bgcolor: `${color}.light`,
            borderRadius: '50%',
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box sx={{ fontSize: 32, color: `${color}.main` }}>
            {icon}
          </Box>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export const Dashboard: React.FC = () => {
  const { state: authState } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await informeService.obtenerDashboard();
      
      if (response.success && response.data) {
        setDashboardData(response.data);
      } else {
        setError(response.message || 'Error al cargar dashboard');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getColorByEstado = (estado: string): 'primary' | 'success' | 'warning' | 'error' => {
    switch (estado.toLowerCase()) {
      case 'cerrado':
      case 'resuelto':
        return 'success';
      case 'en proceso':
      case 'asignado':
        return 'primary';
      case 'pendiente':
        return 'warning';
      case 'suspendido':
        return 'error';
      default:
        return 'primary';
    }
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Typography>Cargando datos del dashboard...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Alert severity="error" action={
          <button onClick={loadDashboardData}>Reintentar</button>
        }>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!dashboardData) {
    return null;
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Bienvenido, {authState.user?.primerNombre} {authState.user?.primerApellido}
        </Typography>
      </Box>

      {/* Estadísticas principales */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box sx={{ minWidth: 250, flex: 1 }}>
          <StatCard
            title="Total de Casos"
            value={dashboardData.totalCasos}
            icon={<Folder />}
            color="primary"
          />
        </Box>
        <Box sx={{ minWidth: 250, flex: 1 }}>
          <StatCard
            title="Casos Abiertos"
            value={dashboardData.casosAbiertos}
            icon={<FolderOpen />}
            color="warning"
          />
        </Box>
        <Box sx={{ minWidth: 250, flex: 1 }}>
          <StatCard
            title="Casos Cerrados"
            value={dashboardData.casosCerrados}
            icon={<CheckCircle />}
            color="success"
          />
        </Box>
        <Box sx={{ minWidth: 250, flex: 1 }}>
          <StatCard
            title="Fiscales Activos"
            value={dashboardData.fiscalesActivos}
            icon={<People />}
            color="info"
          />
        </Box>
      </Box>

      {/* Estadísticas adicionales */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box sx={{ minWidth: 250, flex: 1 }}>
          <StatCard
            title="Casos Asignados"
            value={dashboardData.casosAsignados}
            icon={<Assignment />}
            color="primary"
          />
        </Box>
        <Box sx={{ minWidth: 250, flex: 1 }}>
          <StatCard
            title="Sin Asignar"
            value={dashboardData.casosSinAsignar}
            icon={<Schedule />}
            color="error"
          />
        </Box>
        <Box sx={{ minWidth: 250, flex: 1 }}>
          <StatCard
            title="Casos Hoy"
            value={dashboardData.casosHoy}
            icon={<CalendarToday />}
            color="success"
            subtitle="Creados hoy"
          />
        </Box>
        <Box sx={{ minWidth: 250, flex: 1 }}>
          <StatCard
            title="Esta Semana"
            value={dashboardData.casosSemana}
            icon={<TrendingUp />}
            color="info"
            subtitle="Casos nuevos"
          />
        </Box>
      </Box>

      {/* Gráficos y detalles */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {/* Casos por Estado */}
        <Box sx={{ minWidth: 400, flex: 1 }}>
          <Card>
            <CardHeader title="Casos por Estado" />
            <CardContent>
              <List dense>
                {Object.entries(dashboardData.casosPorEstado).map(([estado, cantidad]) => (
                  <React.Fragment key={estado}>
                    <ListItem>
                      <ListItemIcon>
                        <Chip
                          size="small"
                          label={cantidad}
                          color={getColorByEstado(estado)}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={estado}
                        secondary={`${((cantidad / dashboardData.totalCasos) * 100).toFixed(1)}%`}
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>

        {/* Casos por Fiscalía */}
        <Box sx={{ minWidth: 400, flex: 1 }}>
          <Card>
            <CardHeader title="Casos por Fiscalía" />
            <CardContent>
              <List dense>
                {Object.entries(dashboardData.casosPorFiscalia).map(([fiscalia, cantidad]) => (
                  <React.Fragment key={fiscalia}>
                    <ListItem>
                      <ListItemIcon>
                        <Chip
                          size="small"
                          label={cantidad}
                          color="primary"
                          variant="outlined"
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={fiscalia}
                        secondary={`${((cantidad / dashboardData.totalCasos) * 100).toFixed(1)}%`}
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};
