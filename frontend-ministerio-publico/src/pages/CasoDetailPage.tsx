import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Breadcrumbs,
  Link,
  Chip,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Assignment as AssignIcon,
  Person as PersonIcon,
  Event as EventIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { 
  Caso, 
  EstadoCaso, 
  Fiscal 
} from '../types';
import { casoService } from '../services/casoService';
import { usePermisos } from '../hooks/usePermisos';
import { formatearFecha } from '../utils/fechas';

const CasoDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { permisos, isAuthenticated } = usePermisos();
  
  // Estados
  const [caso, setCaso] = useState<Caso | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estados, setEstados] = useState<EstadoCaso[]>([]);
  const [fiscales, setFiscales] = useState<Fiscal[]>([]);

  useEffect(() => {
    if (id) {
      cargarDatosCaso(parseInt(id));
      cargarDatosIniciales();
    }
  }, [id]);

  const cargarDatosCaso = async (casoId: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await casoService.obtenerCaso(casoId);

      if (response.success && response.data) {
        setCaso(response.data);
      } else {
        setError(response.message || 'Error al cargar el caso');
      }
    } catch (err: any) {
      setError('Error al cargar el caso: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const cargarDatosIniciales = async () => {
    try {
      const [estadosResponse, fiscalesResponse] = await Promise.all([
        casoService.obtenerEstados(),
        casoService.obtenerFiscales()
      ]);

      if (estadosResponse.success && estadosResponse.data) {
        setEstados(estadosResponse.data);
      }

      if (fiscalesResponse.success && fiscalesResponse.data) {
        setFiscales(fiscalesResponse.data);
      }
    } catch (err: any) {
      console.error('Error al cargar datos iniciales:', err);
    }
  };

  const handleVolver = () => {
    navigate('/casos-lista');
  };

  const handleEditar = () => {
    navigate(`/casos/editar/${id}`);
  };

  const obtenerNombreEstado = (idEstado: number): string => {
    const estado = estados.find(e => e.idEstado === idEstado);
    return estado?.nombreEstado || 'Estado desconocido';
  };

  const obtenerColorEstado = (idEstado: number) => {
    const colores: { [key: string]: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' } = {
      'Abierto': 'info',
      'En Investigación': 'primary',
      'En Proceso': 'warning',
      'Cerrado': 'success',
      'Archivado': 'default',
      'Pendiente': 'secondary'
    };
    
    const nombreEstado = obtenerNombreEstado(idEstado);
    return colores[nombreEstado] || 'default';
  };

  const obtenerNombreFiscal = (idFiscal: number | null | undefined): string => {
    if (!idFiscal) return 'Sin asignar';
    const fiscal = fiscales.find(f => f.idFiscal === idFiscal);
    return fiscal ? `${fiscal.nombres || fiscal.primerNombre} ${fiscal.apellidos || fiscal.primerApellido}` : 'Fiscal desconocido';
  };

  // Verificar permisos - modo más permisivo para desarrollo
  const puedeVerCaso = () => {
    // Si no está autenticado, no puede ver
    if (!isAuthenticated) {
      return false;
    }
    
    // Si tiene algún permiso de visualización, puede ver
    if (permisos.CASE_VIEW_ALL || permisos.CASE_VIEW || permisos.CASE_VIEW_OWN) {
      return true;
    }
    
    // En modo desarrollo, si está autenticado puede ver
    return true;
  };

  // Solo mostrar error si definitivamente no puede ver
  if (!isAuthenticated) {
    return (
      <Container maxWidth="md">
        <Alert severity="error">
          No tienes permisos para ver este caso.
        </Alert>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container maxWidth="md">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !caso) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Caso no encontrado'}
        </Alert>
        <Button startIcon={<BackIcon />} onClick={handleVolver}>
          Volver a Lista
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 3 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link 
            color="inherit" 
            href="#" 
            onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}
          >
            Dashboard
          </Link>
          <Link 
            color="inherit" 
            href="#" 
            onClick={(e) => { e.preventDefault(); navigate('/casos-lista'); }}
          >
            Lista de Casos
          </Link>
          <Typography color="text.primary">
            Detalle del Caso
          </Typography>
        </Breadcrumbs>

        {/* Título y acciones */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1">
            Caso #{caso.numeroCaso || caso.numeroExpediente}
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              startIcon={<BackIcon />}
              onClick={handleVolver}
              variant="outlined"
            >
              Volver
            </Button>
            {permisos.CASE_EDIT && (
              <Button
                startIcon={<EditIcon />}
                onClick={handleEditar}
                variant="contained"
              >
                Editar
              </Button>
            )}
          </Stack>
        </Stack>

        {/* Información principal del caso */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Información General
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <Box flex={1}>
                <Typography variant="body2" color="text.secondary">
                  ID del Caso
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {caso.idCaso || caso.id}
                </Typography>
              </Box>
              <Box flex={1}>
                <Typography variant="body2" color="text.secondary">
                  Estado
                </Typography>
                <Chip
                  label={obtenerNombreEstado(caso.idEstado)}
                  color={obtenerColorEstado(caso.idEstado)}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Box>
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <Box flex={1}>
                <Typography variant="body2" color="text.secondary">
                  Fecha de Creación
                </Typography>
                <Typography variant="body1">
                  {formatearFecha(caso.fechaCreacion)}
                </Typography>
              </Box>
              <Box flex={1}>
                <Typography variant="body2" color="text.secondary">
                  Fiscal Asignado
                </Typography>
                <Typography variant="body1">
                  {obtenerNombreFiscal(caso.idFiscalAsignado)}
                </Typography>
              </Box>
            </Stack>

            {caso.fechaAsignacion && (
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Fecha de Asignación
                </Typography>
                <Typography variant="body1">
                  {formatearFecha(caso.fechaAsignacion)}
                </Typography>
              </Box>
            )}
          </Stack>
        </Paper>

        {/* Descripción del caso */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <DescriptionIcon color="primary" />
              <Typography variant="h6">
                Descripción del Caso
              </Typography>
            </Stack>
            <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
              {caso.descripcion || caso.titulo || 'Sin descripción disponible'}
            </Typography>
          </CardContent>
        </Card>

        {/* Información adicional */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Información Adicional
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Usuario Creador"
                  secondary={caso.usuarioCreador?.primerNombre ? 
                    `${caso.usuarioCreador.primerNombre} ${caso.usuarioCreador.primerApellido}` : 
                    'Usuario del sistema'
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <EventIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Fecha de registro"
                  secondary={formatearFecha(caso.fechaCreacion)}
                />
              </ListItem>
              {caso.fechaAsignacion && (
                <ListItem>
                  <ListItemIcon>
                    <AssignIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Fecha de asignación"
                    secondary={formatearFecha(caso.fechaAsignacion)}
                  />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default CasoDetailPage;
