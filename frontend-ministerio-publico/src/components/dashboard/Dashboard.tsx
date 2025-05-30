import React, { useState, useEffect } from 'react';
import {
  Box,
  Stack,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Alert,
  Skeleton,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
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
  Assessment,
  Add,
  List as ListIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { informeService, DashboardData } from '../../services/informeService';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardDataBackend } from '../../types';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactElement;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, subtitle }) => (
  <Card>
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
  const navigate = useNavigate();
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
        // Adaptar la estructura de datos del backend a la estructura esperada por el frontend
        const backendData = response.data as DashboardDataBackend;
        const adaptedData: DashboardData = {
          totalCasos: backendData.estadisticasGenerales?.resumen?.totalCasos || 0,
          casosAbiertos: 0, // Calcular desde casosPorEstado
          casosCerrados: 0, // Calcular desde casosPorEstado
          casosAsignados: 0, // Calcular desde casosPorFiscal
          casosSinAsignar: 0, // Calcular
          fiscalesActivos: backendData.estadisticasGenerales?.resumen?.fiscalesActivos || 0,
          fiscaliasActivas: 0, // Por defecto
          casosHoy: 0, // Por defecto hasta implementar
          casosSemana: 0, // Por defecto hasta implementar
          casosMes: 0, // Por defecto hasta implementar
          casosPorEstado: {},
          casosPorFiscalia: {},
          tendenciaSemanal: []
        };

        // Procesar casos por estado
        if (backendData.estadisticasGenerales?.casosPorEstado) {
          const estadosMap: { [estado: string]: number } = {};
          let abiertos = 0;
          let cerrados = 0;

          backendData.estadisticasGenerales.casosPorEstado.forEach((item: any) => {
            const estado = item.EstadoCaso || item.estado || 'Sin Estado';
            const total = item.TotalCasos || item.total || 0;
            estadosMap[estado] = total;

            // Categorizar como abierto/cerrado
            if (estado.toLowerCase().includes('cerrado') || estado.toLowerCase().includes('resuelto')) {
              cerrados += total;
            } else {
              abiertos += total;
            }
          });

          adaptedData.casosPorEstado = estadosMap;
          adaptedData.casosAbiertos = abiertos;
          adaptedData.casosCerrados = cerrados;
        }

        // Procesar casos por fiscal/fiscalía
        if (backendData.estadisticasGenerales?.casosPorFiscal) {
          const fiscaliasMap: { [fiscalia: string]: number } = {};
          let asignados = 0;

          backendData.estadisticasGenerales.casosPorFiscal.forEach((item: any) => {
            const fiscalia = item.Fiscalia || item.fiscalia || 'Sin Fiscalía';
            const casos = item.CasosAsignados || item.casosAsignados || 0;
            
            if (fiscaliasMap[fiscalia]) {
              fiscaliasMap[fiscalia] += casos;
            } else {
              fiscaliasMap[fiscalia] = casos;
            }
            
            asignados += casos;
          });

          adaptedData.casosPorFiscalia = fiscaliasMap;
          adaptedData.casosAsignados = asignados;
          adaptedData.casosSinAsignar = adaptedData.totalCasos - asignados;
        }

        setDashboardData(adaptedData);
      } else {
        setError(response.message || 'Error al cargar dashboard');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getColorByEstado = (estado: string | undefined | null): 'primary' | 'success' | 'warning' | 'error' => {
    if (!estado || typeof estado !== 'string') {
      return 'primary';
    }
    
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
        <Stack spacing={3} direction="row" flexWrap="wrap">
          {[...Array(4)].map((_, index) => (
            <Box key={index} sx={{ minWidth: 200, flex: '1 1 auto' }}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" height={40} />
                  <Skeleton variant="text" width="80%" />
                </CardContent>
              </Card>
            </Box>
          ))}
        </Stack>
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

      {/* Navegación Rápida */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Acceso Rápido
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          <Button
            variant="contained"
            startIcon={<ListIcon />}
            onClick={() => navigate('/casos-lista')}
            sx={{ minWidth: 150 }}
          >
            Ver Casos
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/casos/nuevo')}
            color="success"
            sx={{ minWidth: 150 }}
          >
            Nuevo Caso
          </Button>
          <Button
            variant="outlined"
            startIcon={<Assessment />}
            onClick={() => navigate('/informes')}
            sx={{ minWidth: 150 }}
          >
            Reportes
          </Button>
        </Stack>
      </Box>

      {/* Estadísticas principales */}
      <Stack spacing={3} direction="row" flexWrap="wrap" sx={{ mb: 3 }}>
        <Box sx={{ minWidth: 200, flex: '1 1 auto' }}>
          <StatCard
            title="Total de Casos"
            value={dashboardData.totalCasos}
            icon={<Folder />}
            color="primary"
          />
        </Box>
        <Box sx={{ minWidth: 200, flex: '1 1 auto' }}>
          <StatCard
            title="Casos Abiertos"
            value={dashboardData.casosAbiertos}
            icon={<FolderOpen />}
            color="warning"
          />
        </Box>
        <Box sx={{ minWidth: 200, flex: '1 1 auto' }}>
          <StatCard
            title="Casos Cerrados"
            value={dashboardData.casosCerrados}
            icon={<CheckCircle />}
            color="success"
          />
        </Box>
        <Box sx={{ minWidth: 200, flex: '1 1 auto' }}>
          <StatCard
            title="Fiscales Activos"
            value={dashboardData.fiscalesActivos}
            icon={<People />}
            color="info"
          />
        </Box>
      </Stack>

      {/* Estadísticas adicionales */}
      <Stack spacing={3} direction="row" flexWrap="wrap" sx={{ mb: 3 }}>
        <Box sx={{ minWidth: 200, flex: '1 1 auto' }}>
          <StatCard
            title="Casos Asignados"
            value={dashboardData.casosAsignados}
            icon={<Assignment />}
            color="primary"
          />
        </Box>
        <Box sx={{ minWidth: 200, flex: '1 1 auto' }}>
          <StatCard
            title="Sin Asignar"
            value={dashboardData.casosSinAsignar}
            icon={<Schedule />}
            color="error"
          />
        </Box>
        <Box sx={{ minWidth: 200, flex: '1 1 auto' }}>
          <StatCard
            title="Casos Hoy"
            value={dashboardData.casosHoy}
            icon={<CalendarToday />}
            color="success"
            subtitle="Creados hoy"
          />
        </Box>
        <Box sx={{ minWidth: 200, flex: '1 1 auto' }}>
          <StatCard
            title="Esta Semana"
            value={dashboardData.casosSemana}
            icon={<TrendingUp />}
            color="info"
            subtitle="Casos nuevos"
          />
        </Box>
      </Stack>

    

      {/* Gráficos y detalles */}
      <Stack spacing={3} direction={{ xs: 'column', md: 'row' }}>
        {/* Casos por Estado */}
        <Box sx={{ flex: 1 }}>
          <Card>
            <CardHeader title="Casos por Estado" />
            <CardContent>
              <List dense>
                {dashboardData.casosPorEstado && Object.keys(dashboardData.casosPorEstado).length > 0 ? (
                  Object.entries(dashboardData.casosPorEstado).map(([estado, cantidad]) => {
                    const estadoSeguro = estado || 'Sin Estado';
                    const cantidadSegura = Number(cantidad) || 0;
                    const totalSeguro = dashboardData.totalCasos || 1;
                    
                    return (
                      <React.Fragment key={estado}>
                        <ListItem>
                          <ListItemIcon>
                            <Chip
                              size="small"
                              label={cantidadSegura}
                              color={getColorByEstado(estadoSeguro)}
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={estadoSeguro}
                            secondary={`${((cantidadSegura / totalSeguro) * 100).toFixed(1)}%`}
                          />
                        </ListItem>
                        <Divider component="li" />
                      </React.Fragment>
                    );
                  })
                ) : (
                  <ListItem>
                    <ListItemText primary="No hay datos disponibles" secondary="Sin información de casos por estado" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Box>

        {/* Casos por Fiscalía */}
        <Box sx={{ flex: 1 }}>
          <Card>
            <CardHeader title="Casos por Fiscalía" />
            <CardContent>
              <List dense>
                {dashboardData.casosPorFiscalia && Object.keys(dashboardData.casosPorFiscalia).length > 0 ? (
                  Object.entries(dashboardData.casosPorFiscalia).map(([fiscalia, cantidad]) => {
                    const fiscaliaSegura = fiscalia || 'Sin Fiscalía';
                    const cantidadSegura = Number(cantidad) || 0;
                    const totalSeguro = dashboardData.totalCasos || 1;
                    
                    return (
                      <React.Fragment key={fiscalia}>
                        <ListItem>
                          <ListItemIcon>
                            <Chip
                              size="small"
                              label={cantidadSegura}
                              color="primary"
                              variant="outlined"
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={fiscaliaSegura}
                            secondary={`${((cantidadSegura / totalSeguro) * 100).toFixed(1)}%`}
                          />
                        </ListItem>
                        <Divider component="li" />
                      </React.Fragment>
                    );
                  })
                ) : (
                  <ListItem>
                    <ListItemText primary="No hay datos disponibles" secondary="Sin información de casos por fiscalía" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Box>
      </Stack>
    </Box>
  );
};
